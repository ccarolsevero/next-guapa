import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, Document } from 'mongodb'

interface FaturamentoId {
  year: number
  month: number
}

interface Servico {
  nome: string
  valor: number
  profissionalId: string
  profissionalNome: string
}

interface Produto {
  nome: string
  valor: number
  profissionalId: string
  profissionalNome: string
}

interface Comanda {
  _id: string
  valorTotal: number
  dataFinalizacao: Date
  createdAt: Date
  servicos: Servico[]
  produtos: Produto[]
  clienteId: string
  metodoPagamento: string
}

export async function GET(request: NextRequest) {
  let client: MongoClient | null = null
  
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '6months'
    
    console.log('🔄 API Financeiro chamada - Período:', period)
    console.log('🔑 MONGODB_URI existe:', !!process.env.MONGODB_URI)
    console.log('🔑 DB_NAME:', process.env.DB_NAME || 'guapa')
    
    // Conectar ao MongoDB
    const uri = process.env.MONGODB_URI!
    if (!uri) {
      console.error('❌ MONGODB_URI não configurada')
      return NextResponse.json({ error: 'Configuração do banco não encontrada' }, { status: 500 })
    }
    
    client = new MongoClient(uri)
    console.log('🔌 Tentando conectar ao MongoDB...')
    await client.connect()
    console.log('✅ Conectado ao MongoDB com sucesso')
    
    const db = client.db(process.env.DB_NAME || 'guapa')
    console.log('🗄️ Banco selecionado:', db.databaseName)
    
    // Verificar se as coleções existem
    const collections = await db.listCollections().toArray()
    console.log('📚 Coleções disponíveis:', collections.map(c => c.name))
    
    // Calcular datas baseado no período
    const hoje = new Date()
    let dataInicio: Date
    
    switch (period) {
      case '1month':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate())
        break
      case '3months':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 3, hoje.getDate())
        break
      case '1year':
        dataInicio = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate())
        break
      default: // 6months
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 6, hoje.getDate())
    }
    
    console.log('📅 Período:', { dataInicio: dataInicio.toISOString(), hoje: hoje.toISOString() })
    
    // 1. Buscar comandas finalizadas para calcular faturamento
    console.log('💰 Buscando comandas finalizadas...')
    
    // Primeiro, vamos ver todas as comandas para entender a estrutura
    const todasComandas = await db.collection('comandas').find({}).toArray()
    console.log('📊 Total de comandas no banco:', todasComandas.length)
    
    // Verificar status das comandas
    const statusComandas = await db.collection('comandas').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray()
    console.log('📊 Status das comandas:', statusComandas)
    
    // Buscar comandas finalizadas
    const comandasFinalizadas = await db.collection('comandas').find({
      status: 'finalizada'
    }).toArray()
    
    console.log('📊 Comandas finalizadas encontradas:', comandasFinalizadas.length)
    
    // Se não encontrar comandas finalizadas, buscar por outros critérios
    if (comandasFinalizadas.length === 0) {
      console.log('🔍 Tentando buscar comandas com outros critérios...')
      
      // Buscar comandas com dataFinalizacao
      const comandasComData = await db.collection('comandas').find({
        dataFinalizacao: { $exists: true }
      }).toArray()
      console.log('📊 Comandas com dataFinalizacao:', comandasComData.length)
      
      // Buscar comandas com valorTotal
      const comandasComValor = await db.collection('comandas').find({
        valorTotal: { $exists: true, $gt: 0 }
      }).toArray()
      console.log('📊 Comandas com valorTotal:', comandasComValor.length)
      
      // Usar comandas com valorTotal se não encontrar finalizadas
      if (comandasComValor.length > 0) {
        console.log('✅ Usando comandas com valorTotal para cálculos')
        comandasFinalizadas.push(...comandasComValor)
      }
    }
    
    // Calcular faturamento total das comandas
    const totalFaturamento = comandasFinalizadas.reduce((sum: number, comanda: Document) => {
      return sum + (comanda.valorTotal || 0)
    }, 0)
    
    // Calcular comissões totais das comandas
    const totalComissoes = comandasFinalizadas.reduce((sum: number, comanda: Document) => {
      let comissaoTotal = 0
      
      // Comissões de serviços (10%)
      if (comanda.servicos && Array.isArray(comanda.servicos)) {
        comanda.servicos.forEach((servico: Document) => {
          comissaoTotal += (servico.preco || 0) * 0.10
        })
      }
      
      // Comissões de produtos (15%)
      if (comanda.produtos && Array.isArray(comanda.produtos)) {
        comanda.produtos.forEach((produto: Document) => {
          comissaoTotal += (produto.preco || 0) * 0.15
        })
      }
      
      return sum + comissaoTotal
    }, 0)
    
    // 2. Buscar comissões por profissional das comandas
    console.log('👥 Buscando comissões por profissional...')
    const comissoesPorProfissional = []
    
    // Agrupar comissões por profissional
    const comissoesPorProf = new Map()
    
    comandasFinalizadas.forEach((comanda: Document) => {
      // Comissões de serviços
      if (comanda.servicos && Array.isArray(comanda.servicos)) {
        comanda.servicos.forEach((servico: Document) => {
          const servicoData = servico as any
          const comandaData = comanda as any
          const profissionalId = comandaData.professionalId?._id || comandaData._id
          const profissionalNome = comandaData.professionalId?.name || 'Profissional não definido'
          const comissao = (servicoData.preco || 0) * 0.10
          
          if (!comissoesPorProf.has(profissionalId)) {
            comissoesPorProf.set(profissionalId, {
              profissional: profissionalNome,
              totalComissao: 0,
              quantidadeItens: 0,
              detalhes: []
            })
          }
          
          const prof = comissoesPorProf.get(profissionalId)
          prof.totalComissao += comissao
          prof.quantidadeItens += 1
          prof.detalhes.push({
            tipo: 'servico',
            item: servicoData.nome || 'Serviço',
            valor: servicoData.preco || 0,
            comissao: comissao,
            data: comandaData.dataFinalizacao || comandaData.createdAt
          })
        })
      }
      
      // Comissões de produtos
      if (comanda.produtos && Array.isArray(comanda.produtos)) {
        comanda.produtos.forEach((produto: Document) => {
          const produtoData = produto as any
          const comandaData = comanda as any
          const profissionalId = produtoData.vendidoPorId || 'vendedor'
          const profissionalNome = produtoData.vendidoPor || 'Vendedor'
          const comissao = (produtoData.preco || 0) * 0.15
          
          if (!comissoesPorProf.has(profissionalId)) {
            comissoesPorProf.set(profissionalId, {
              profissional: profissionalNome,
              totalComissao: 0,
              quantidadeItens: 0,
              detalhes: []
            })
          }
          
          const prof = comissoesPorProf.get(profissionalId)
          prof.totalComissao += comissao
          prof.quantidadeItens += 1
          prof.detalhes.push({
            tipo: 'produto',
            item: produtoData.nome || 'Produto',
            valor: produtoData.preco || 0,
            comissao: comissao,
            data: comandaData.dataFinalizacao || comandaData.createdAt
          })
        })
      }
    })
    
    // Converter Map para array
    comissoesPorProfissional.push(...Array.from(comissoesPorProf.values()))
    
    // Ordenar por total de comissão
    comissoesPorProfissional.sort((a, b) => b.totalComissao - a.totalComissao)
    
    console.log('💰 Comissões por profissional encontradas:', comissoesPorProfissional.length)
    comissoesPorProfissional.forEach((comissao, index) => {
      console.log(`   ${index + 1}. ${comissao.profissional}: R$ ${comissao.totalComissao.toFixed(2)}`)
    })
    
    // 3. Buscar métodos de pagamento das comandas
    let metodosPagamento = await db.collection('comandas').aggregate([
      {
        $match: {
          status: 'finalizada',
          $or: [
            { dataFinalizacao: { $gte: dataInicio, $lte: hoje } },
            { updatedAt: { $gte: dataInicio, $lte: hoje } }
          ]
        }
      },
      {
        $group: {
          _id: '$metodoPagamento',
          count: { $sum: 1 },
          amount: { $sum: '$valorTotal' }
        }
      },
      {
        $sort: { amount: -1 }
      }
    ]).toArray()

    // Se não encontrar métodos de pagamento, criar baseado nos pagamentos recentes
    if (metodosPagamento.length === 0) {
      console.log('🔍 Buscando métodos de pagamento alternativos...')
      
      // Buscar todas as comandas finalizadas do período
      const comandasPeriodo = await db.collection('comandas').find({
        status: 'finalizada',
        $or: [
          { dataFinalizacao: { $gte: dataInicio, $lte: hoje } },
          { updatedAt: { $gte: dataInicio, $lte: hoje } }
        ]
      }).toArray()

      console.log('📊 Comandas do período encontradas:', comandasPeriodo.length)

      // Agrupar por método de pagamento
      const metodosMap = new Map()
      
      comandasPeriodo.forEach((comanda) => {
        const metodo = comanda.metodoPagamento || 'dinheiro'
        const valor = comanda.valorTotal || 0
        
        if (!metodosMap.has(metodo)) {
          metodosMap.set(metodo, { count: 0, amount: 0 })
        }
        
        const atual = metodosMap.get(metodo)
        atual.count += 1
        atual.amount += valor
      })

      // Converter para o formato esperado
      metodosPagamento = Array.from(metodosMap.entries()).map(([metodo, dados]) => ({
        _id: metodo,
        count: dados.count,
        amount: dados.amount
      }))

      console.log('💳 Métodos de pagamento criados:', metodosPagamento)
    }



    // Debug: verificar o que está sendo retornado
    console.log('💳 Métodos de pagamento encontrados:', metodosPagamento)
    console.log('💳 Estrutura dos métodos:', JSON.stringify(metodosPagamento, null, 2))
    
    // 4. Buscar pagamentos recentes das comandas
    const pagamentosRecentes = await db.collection('comandas').aggregate([
      {
        $match: {
          status: 'finalizada',
          $or: [
            { dataFinalizacao: { $gte: dataInicio, $lte: hoje } },
            { updatedAt: { $gte: dataInicio, $lte: hoje } }
          ]
        }
      },
      {
        $lookup: {
          from: 'clients',
          localField: 'clienteId',
          foreignField: '_id',
          as: 'cliente'
        }
      },
      {
        $unwind: '$cliente'
      },
      {
        $project: {
          _id: 1,
          clientName: '$cliente.name',
          service: { $arrayElemAt: ['$servicos.nome', 0] },
          amount: '$valorTotal',
          method: '$metodoPagamento',
          date: '$dataFinalizacao',
          status: 'PAID'
        }
      },
      {
        $sort: { date: -1 }
      },
      {
        $limit: 10
      }
    ]).toArray()


    
    // 5. Calcular totais
    const totalComandas = comandasFinalizadas.length
    
    // 6. Calcular total de despesas
    const despesas = await db.collection('despesas').find({
      data: { $gte: dataInicio, $lte: hoje }
    }).toArray()
    
    const totalDespesas = despesas.reduce((sum: number, despesa: Document) => sum + (despesa.valor || 0), 0)
    
    // 7. Formatar dados para o frontend
    const revenue = comandasFinalizadas.map((comanda: Document) => {
      const comandaData = comanda as Comanda
      return {
        month: new Date(comandaData.dataFinalizacao || comandaData.createdAt).toLocaleDateString('pt-BR', { month: 'short' }),
        amount: comandaData.valorTotal || 0
      }
    })
    
    const expenses = comandasFinalizadas.map((comanda: Document) => {
      const comandaData = comanda as Comanda
      return {
        month: new Date(comandaData.dataFinalizacao || comandaData.createdAt).toLocaleDateString('pt-BR', { month: 'short' }),
        amount: comandaData.valorTotal || 0 // Assuming valorTotal is the total amount for expenses
      }
    })
    
    // Formatar métodos de pagamento
    const paymentMethods = metodosPagamento.map((item: Document) => ({
      method: item._id || 'Não definido',
      count: item.count || 0,
      amount: item.amount || 0
    }))
    
    // Formatar pagamentos recentes
    const recentPayments = pagamentosRecentes.map((item: Document, index: number) => ({
      id: index + 1,
      clientName: item.clientName || 'Cliente não encontrado',
      service: item.service || 'Serviço não especificado',
      amount: item.amount || 0,
      method: item.method || 'Não definido',
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : 'Data não definida',
      status: 'PAID'
    }))
    
    // Formatar comissões por profissional
    const commissionsByProfessional = comissoesPorProfissional.map((item: Document) => ({
      profissional: item.profissional || 'Profissional não encontrado',
      totalComissao: item.totalComissao || 0,
      quantidadeItens: item.quantidadeItens || 0,
      detalhes: item.detalhes || []
    }))
    
    console.log('✅ Dados financeiros carregados com sucesso')
    console.log('💰 Total faturamento:', totalFaturamento)
    console.log('💸 Total comissões:', totalComissoes)
    console.log('📊 Total comandas:', totalComandas)
    console.log('💸 Total despesas:', totalDespesas)
    console.log('💳 Métodos de pagamento:', paymentMethods.length)
    console.log('👥 Comissões por profissional:', commissionsByProfessional.length)
    console.log('📋 Pagamentos recentes:', recentPayments.length)
    
    return NextResponse.json({
      success: true,
      data: {
        revenue,
        expenses,
        recentPayments,
        paymentMethods,
        comissoesPorProfissional,
        totals: {
          revenue: totalFaturamento,
          expenses: totalComissoes,
          profit: totalFaturamento - totalComissoes,
          comandas: totalComandas
        },
        totalExpenses: totalDespesas,
        totalComissoes: totalComissoes
      }
    })
    
  } catch (error) {
    console.error('❌ Erro ao carregar dados financeiros:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor ao carregar dados financeiros',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  } finally {
    if (client) {
      try {
        await client.close()
      } catch (closeError) {
        console.error('❌ Erro ao fechar conexão:', closeError)
      }
    }
  }
}
