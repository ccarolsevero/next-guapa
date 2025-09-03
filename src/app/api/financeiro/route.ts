import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, Document } from 'mongodb'

interface FaturamentoId {
  year: number
  month: number
}

export async function GET(request: NextRequest) {
  let client: MongoClient | null = null
  
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '6months'
    
    console.log('🔄 API Financeiro chamada - Período:', period)
    
    // Conectar ao MongoDB
    const uri = process.env.MONGODB_URI!
    client = new MongoClient(uri)
    await client.connect()
    const db = client.db(process.env.DB_NAME || 'guapa')
    
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
    
    // 1. Buscar faturamento por mês
    const faturamentoPorMes = await db.collection('faturamento').aggregate([
      {
        $match: {
          data: { $gte: dataInicio, $lte: hoje }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$data' },
            month: { $month: '$data' }
          },
          valorTotal: { $sum: '$valorTotal' },
          totalComissoes: { $sum: '$totalComissoes' },
          quantidadeComandas: { $sum: '$quantidadeComandas' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]).toArray()
    
    // 2. Buscar comissões por profissional
    const comissoesPorProfissional = await db.collection('comissoes').aggregate([
      {
        $match: {
          data: { $gte: dataInicio, $lte: hoje },
          status: 'pendente'
        }
      },
      {
        $lookup: {
          from: 'profissionais',
          localField: 'profissionalId',
          foreignField: '_id',
          as: 'profissional'
        }
      },
      {
        $unwind: '$profissional'
      },
      {
        $group: {
          _id: '$profissionalId',
          nome: { $first: '$profissional.nome' },
          totalComissao: { $sum: '$comissao' },
          quantidadeItens: { $sum: 1 },
          detalhes: {
            $push: {
              tipo: '$tipo',
              item: '$item',
              valor: '$valor',
              comissao: '$comissao',
              data: '$data'
            }
          }
        }
      },
      {
        $sort: { totalComissao: -1 }
      }
    ]).toArray()
    
    // 3. Buscar métodos de pagamento
    const metodosPagamento = await db.collection('finalizacoes').aggregate([
      {
        $match: {
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
    
    // 4. Buscar pagamentos recentes
    const pagamentosRecentes = await db.collection('finalizacoes').aggregate([
      {
        $match: {
          dataCriacao: { $gte: dataInicio, $lte: hoje }
        }
      },
      {
        $lookup: {
          from: 'clientes',
          localField: 'clienteId',
          foreignField: '_id',
          as: 'cliente'
        }
      },
      {
        $unwind: '$cliente'
      },
      {
        $lookup: {
          from: 'comandas',
          localField: 'comandaId',
          foreignField: '_id',
          as: 'comanda'
        }
      },
      {
        $unwind: '$comanda'
      },
      {
        $project: {
          _id: 1,
          clientName: '$cliente.nome',
          service: { $arrayElemAt: ['$comanda.servicos.nome', 0] },
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
    
    // 5. Calcular totais
    const totalFaturamento = faturamentoPorMes.reduce((sum: number, item: Document) => sum + (item.valorTotal || 0), 0)
    const totalComissoes = faturamentoPorMes.reduce((sum: number, item: Document) => sum + (item.totalComissoes || 0), 0)
    const totalComandas = faturamentoPorMes.reduce((sum: number, item: Document) => sum + (item.quantidadeComandas || 0), 0)
    
    // 6. Formatar dados para o frontend
    const revenue = faturamentoPorMes.map((item: Document) => ({
      month: new Date((item._id as FaturamentoId).year, (item._id as FaturamentoId).month - 1).toLocaleDateString('pt-BR', { month: 'short' }),
      amount: item.valorTotal || 0
    }))
    
    const expenses = faturamentoPorMes.map((item: Document) => ({
      month: new Date((item._id as FaturamentoId).year, (item._id as FaturamentoId).month - 1).toLocaleDateString('pt-BR', { month: 'short' }),
      amount: item.totalComissoes || 0
    }))
    
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
    
    console.log('✅ Dados financeiros carregados com sucesso')
    console.log('💰 Total faturamento:', totalFaturamento)
    console.log('💸 Total comissões:', totalComissoes)
    console.log('📊 Total comandas:', totalComandas)
    
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
        }
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
