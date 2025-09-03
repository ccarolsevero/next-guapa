const { MongoClient, ObjectId } = require('mongodb')
require('dotenv').config()

async function testarAPIFinanceiro() {
  let client
  
  try {
    console.log('🧪 Testando API Financeiro...')
    
    const uri = process.env.MONGODB_URI
    client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.DB_NAME || 'guapa')
    
    // Simular a mesma lógica da API
    const hoje = new Date()
    const dataInicioComissoes = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    console.log('\n📅 Datas de busca:')
    console.log('   Hoje:', hoje.toISOString())
    console.log('   Data início (30 dias atrás):', dataInicioComissoes.toISOString())
    
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
          clientName: '$cliente.name',
          service: { $arrayElemAt: ['$comanda.servicos.nome', 0] },
          amount: '$valorFinal',
          method: '$metodoPagamento',
          date: '$dataCriacao'
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
    
    // Verificar se as comissões têm data válida
    console.log('\n🔍 Verificando datas das comissões...')
    const todasComissoes = await db.collection('comissoes').find({}).toArray()
    todasComissoes.forEach((comissao, index) => {
      console.log(`   ${index + 1}. ${comissao.tipo}: ${comissao.item} - Data: ${comissao.data} - Profissional: ${comissao.profissionalId}`)
    })
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

testarAPIFinanceiro()
