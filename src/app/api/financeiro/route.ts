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
  dataFim: Date
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
    
    const comandasFinalizadas = await db.collection('comandas').find({
      status: 'finalizada'
    }).toArray()
    
    console.log('📊 Total de comandas finalizadas:', comandasFinalizadas.length)
    
    // Calcular faturamento total
    const totalFaturamento = comandasFinalizadas.reduce((sum: number, comanda: Document) => {
      return sum + (comanda.valorTotal || 0)
    }, 0)
    
    // 2. Calcular comissões por profissional
    console.log('👥 Buscando comissões por profissional...')
    
    const comissoesPorProfissional: any[] = []
    const comissoesPorProf = new Map()
    
    comandasFinalizadas.forEach((comanda: Document) => {
      // Comissões de serviços (10%)
      if (comanda.servicos && Array.isArray(comanda.servicos)) {
        comanda.servicos.forEach((servico: Document) => {
          const servicoData = servico as any
          const comandaData = comanda as any
          const profissionalId = comandaData.profissionalId || 'profissional'
          const profissionalNome = comandaData.profissionalNome || 'Profissional não definido'
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
            data: comandaData.dataFim || comandaData.createdAt
          })
        })
      }
      
      // Comissões de produtos (15%)
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
            data: comandaData.dataFim || comandaData.createdAt
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
    
    // 3. Buscar métodos de pagamento das finalizações
    let metodosPagamento = await db.collection('finalizacoes').aggregate([
      {
        $match: {
          status: 'ativo',
          dataCriacao: { $gte: dataInicio, $lte: hoje }
        }
      },
      {
        $group: {
          _id: '$metodoPagamento',
          count: { $sum: 1 },
          amount: { $sum: '$valorFinal' }
        }
      },
      {
        $sort: { amount: -1 }
      }
    ]).toArray()

    console.log('💳 Métodos de pagamento encontrados:', metodosPagamento.length)
    if (metodosPagamento.length > 0) {
      metodosPagamento.forEach((metodo, index) => {
        console.log(`   ${index + 1}. ${metodo._id}: ${metodo.count} pagamentos, R$ ${metodo.amount.toFixed(2)}`)
      })
    }

    // 4. Buscar pagamentos recentes das finalizações
    console.log('🔍 Buscando pagamentos recentes...')
    console.log('📅 Período:', { dataInicio, hoje })
    
    const pagamentosRecentes = await db.collection('finalizacoes').aggregate([
      {
        $match: {
          status: 'ativo',
          dataCriacao: { $gte: dataInicio, $lte: hoje }
        }
      },
      {
        $project: {
          _id: 1,
          clientName: '$clienteNome',
          service: { $arrayElemAt: ['$servicos.nome', 0] },
          amount: '$valorFinal',
          method: '$metodoPagamento',
          date: '$dataCriacao',
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

    console.log('📋 Pagamentos recentes encontrados:', pagamentosRecentes.length)
    pagamentosRecentes.forEach((pagamento, index) => {
      console.log(`   ${index + 1}. Cliente: "${pagamento.clientName}", Serviço: "${pagamento.service}", Valor: R$ ${pagamento.amount}`)
    })

    // 5. Calcular totais
    const totalComandas = comandasFinalizadas.length
    const totalComissoes = comissoesPorProfissional.reduce((sum, comissao) => sum + comissao.totalComissao, 0)
    
    // 6. Calcular total de despesas
    const despesas = await db.collection('despesas').find({
      data: { $gte: dataInicio, $lte: hoje }
    }).toArray()
    
    const totalDespesas = despesas.reduce((sum: number, despesa: Document) => sum + (despesa.valor || 0), 0)
    
    // 7. Formatar dados para o frontend
    const revenue = comandasFinalizadas.map((comanda: Document) => {
      const comandaData = comanda as Comanda
      return {
        month: new Date(comandaData.dataFim || comandaData.createdAt).toLocaleDateString('pt-BR', { month: 'short' }),
        amount: comandaData.valorTotal || 0
      }
    })
    
    const expenses = comandasFinalizadas.map((comanda: Document) => {
      const comandaData = comanda as Comanda
      return {
        month: new Date(comandaData.dataFim || comandaData.createdAt).toLocaleDateString('pt-BR', { month: 'short' }),
        amount: comandaData.valorTotal || 0
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
