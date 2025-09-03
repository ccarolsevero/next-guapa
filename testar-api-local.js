const { MongoClient, ObjectId } = require('mongodb')
require('dotenv').config()

async function testarAPILocal() {
  let client
  
  try {
    console.log('🧪 Testando API Financeiro LOCALMENTE...')
    
    const uri = process.env.MONGODB_URI
    client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.DB_NAME || 'guapa')
    
    // Simular exatamente a lógica da API
    const hoje = new Date()
    const dataInicioComissoes = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    console.log('\n📅 Datas:')
    console.log('   Hoje:', hoje.toISOString())
    console.log('   Data início comissões (30 dias):', dataInicioComissoes.toISOString())
    
    // Testar busca de comissões
    console.log('\n🔍 Buscando comissões dos últimos 30 dias...')
    const comissoes = await db.collection('comissoes').aggregate([
      {
        $match: {
          data: { $gte: dataInicioComissoes, $lte: hoje }
        }
      },
      {
        $lookup: {
          from: 'professionals',
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
          nome: { $first: '$profissional.name' },
          totalComissao: { $sum: '$comissao' },
          quantidadeItens: { $sum: 1 },
          detalhes: {
            $push: {
              tipo: '$tipo',
              item: '$item',
              valor: '$valor',
              comissao: '$comissao',
              data: '$data',
              profissionalId: '$profissionalId'
            }
          }
        }
      },
      {
        $sort: { totalComissao: -1 }
      }
    ]).toArray()
    
    console.log('   Comissões encontradas:', comissoes.length)
    comissoes.forEach((comissao, index) => {
      console.log(`   ${index + 1}. ${comissao.nome}: R$ ${comissao.totalComissao.toFixed(2)} (${comissao.quantidadeItens} itens)`)
      comissao.detalhes.forEach(d => {
        console.log(`      - ${d.tipo}: ${d.item} - R$ ${d.valor} (Comissão: R$ ${d.comissao})`)
      })
    })
    
    // Testar busca de pagamentos recentes
    console.log('\n🔍 Buscando pagamentos recentes dos últimos 30 dias...')
    const pagamentosRecentes = await db.collection('finalizacoes').aggregate([
      {
        $match: {
          dataCriacao: { $gte: dataInicioComissoes, $lte: hoje }
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
        $lookup: {
          from: 'comandas',
          localField: 'comandaId',
          foreignField: '_id',
          as: 'comanda'
        }
      },
      {
        $unwind: '$cliente'
      },
      {
        $unwind: '$comanda'
      },
      {
        $project: {
          _id: 1,
          clientName: '$cliente.name',
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
    
    console.log('   Pagamentos encontrados:', pagamentosRecentes.length)
    pagamentosRecentes.forEach((pagamento, index) => {
      console.log(`   ${index + 1}. ${pagamento.clientName} - ${pagamento.service} - R$ ${pagamento.amount} (${pagamento.method})`)
    })
    
    // Testar busca de métodos de pagamento
    console.log('\n🔍 Buscando métodos de pagamento dos últimos 30 dias...')
    const metodosPagamento = await db.collection('finalizacoes').aggregate([
      {
        $match: {
          dataCriacao: { $gte: dataInicioComissoes, $lte: hoje }
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
    
    console.log('   Métodos encontrados:', metodosPagamento.length)
    metodosPagamento.forEach((method, index) => {
      console.log(`   ${index + 1}. ${method._id}: ${method.count} transações - R$ ${method.amount.toFixed(2)}`)
    })
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

testarAPILocal()
