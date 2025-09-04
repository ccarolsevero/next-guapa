const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

async function debugAPIQueries() {
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db('guapa')
    
    console.log('🔍 Testando queries da API...\n')

    // Simular o cálculo de datas da API
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
    const endDate = now

    console.log('📅 Período de filtro:')
    console.log('Start Date:', startDate)
    console.log('End Date:', endDate)

    // Testar query de clientes atendidos
    console.log('\n🧪 Testando: clientes-atendidos')
    const clientesAtendidos = await db.collection('finalizacoes').aggregate([
      {
        $match: {
          dataCriacao: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$clienteId',
          totalVisits: { $sum: 1 },
          totalSpent: { $sum: '$valorFinal' },
          lastVisit: { $max: '$dataCriacao' }
        }
      },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'client'
        }
      },
      {
        $unwind: '$client'
      },
      {
        $project: {
          name: '$client.name',
          email: '$client.email',
          phone: '$client.phone',
          totalVisits: 1,
          totalSpent: 1,
          lastVisit: 1
        }
      },
      {
        $sort: { lastVisit: -1 }
      }
    ]).toArray()

    console.log('Resultado clientes atendidos:', clientesAtendidos.length)
    if (clientesAtendidos.length > 0) {
      console.log('Primeiro resultado:', clientesAtendidos[0])
    }

    // Testar query de faturamento profissional
    console.log('\n🧪 Testando: faturamento-profissional')
    const faturamentoProfissional = await db.collection('finalizacoes').aggregate([
      {
        $match: {
          dataCriacao: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$profissionalId',
          totalRevenue: { $sum: '$valorFinal' },
          totalComandas: { $sum: 1 },
          totalCommissions: { $sum: '$totalComissao' }
        }
      },
      {
        $lookup: {
          from: 'professionals',
          localField: '_id',
          foreignField: '_id',
          as: 'professional'
        }
      },
      {
        $unwind: '$professional'
      },
      {
        $project: {
          name: '$professional.nome',
          totalRevenue: 1,
          totalComandas: 1,
          totalCommissions: 1,
          averageTicket: {
            $round: [{ $divide: ['$totalRevenue', '$totalComandas'] }, 2]
          }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]).toArray()

    console.log('Resultado faturamento profissional:', faturamentoProfissional.length)
    if (faturamentoProfissional.length > 0) {
      console.log('Primeiro resultado:', faturamentoProfissional[0])
    }

    // Verificar se há problemas com ObjectId
    console.log('\n🔍 Verificando ObjectIds...')
    const finalizacao = await db.collection('finalizacoes').findOne({})
    console.log('Cliente ID (tipo):', typeof finalizacao.clienteId)
    console.log('Profissional ID (tipo):', typeof finalizacao.profissionalId)
    console.log('Cliente ID:', finalizacao.clienteId)
    console.log('Profissional ID:', finalizacao.profissionalId)

    // Verificar se os IDs existem nas outras coleções
    const cliente = await db.collection('clients').findOne({ _id: finalizacao.clienteId })
    const profissional = await db.collection('professionals').findOne({ _id: finalizacao.profissionalId })
    
    console.log('Cliente encontrado:', !!cliente)
    console.log('Profissional encontrado:', !!profissional)

  } catch (error) {
    console.error('❌ Erro:', error.message)
  } finally {
    await client.close()
  }
}

debugAPIQueries()
