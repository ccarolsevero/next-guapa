const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

async function testCorrectedQuery() {
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db('guapa')
    
    console.log('🔍 Testando query corrigida...\n')

    // Simular o cálculo de datas da API
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
    const endDate = now

    console.log('📅 Período:', startDate, 'até', endDate)

    // Testar query de clientes atendidos corrigida
    console.log('\n🧪 Testando: clientes-atendidos (corrigida)')
    const clientesAtendidos = await db.collection('finalizacoes').aggregate([
      {
        $match: {
          dataCriacao: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $addFields: {
          clienteObjectId: { $toObjectId: '$clienteId' }
        }
      },
      {
        $group: {
          _id: '$clienteObjectId',
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

    console.log('✅ Resultado clientes atendidos:', clientesAtendidos.length)
    if (clientesAtendidos.length > 0) {
      console.log('Primeiro resultado:', clientesAtendidos[0])
    }

    // Testar query de faturamento profissional corrigida
    console.log('\n🧪 Testando: faturamento-profissional (corrigida)')
    const faturamentoProfissional = await db.collection('finalizacoes').aggregate([
      {
        $match: {
          dataCriacao: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $addFields: {
          profissionalObjectId: { $toObjectId: '$profissionalId' }
        }
      },
      {
        $group: {
          _id: '$profissionalObjectId',
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

    console.log('✅ Resultado faturamento profissional:', faturamentoProfissional.length)
    if (faturamentoProfissional.length > 0) {
      console.log('Primeiro resultado:', faturamentoProfissional[0])
    }

  } catch (error) {
    console.error('❌ Erro:', error.message)
  } finally {
    await client.close()
  }
}

testCorrectedQuery()
