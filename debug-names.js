const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

async function debugNames() {
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db('guapa')
    
    console.log('🔍 Verificando estrutura dos dados...\n')

    // Verificar estrutura de profissionais
    console.log('👨‍⚕️ Estrutura de profissionais:')
    const profissional = await db.collection('professionals').findOne({})
    if (profissional) {
      console.log('Campos disponíveis:', Object.keys(profissional))
      console.log('Nome:', profissional.nome)
      console.log('Name:', profissional.name)
    }

    // Verificar estrutura de produtos
    console.log('\n📦 Estrutura de produtos:')
    const produto = await db.collection('products').findOne({})
    if (produto) {
      console.log('Campos disponíveis:', Object.keys(produto))
      console.log('Nome:', produto.nome)
      console.log('Name:', produto.name)
    }

    // Verificar estrutura de serviços
    console.log('\n🔧 Estrutura de serviços:')
    const servico = await db.collection('services').findOne({})
    if (servico) {
      console.log('Campos disponíveis:', Object.keys(servico))
      console.log('Nome:', servico.nome)
      console.log('Name:', servico.name)
    }

    // Testar query de faturamento profissional
    console.log('\n🧪 Testando faturamento profissional:')
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
    const endDate = now

    const faturamento = await db.collection('finalizacoes').aggregate([
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
          totalComandas: { $sum: 1 }
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
          totalComandas: 1
        }
      }
    ]).toArray()

    console.log('Resultado faturamento:', faturamento)

  } catch (error) {
    console.error('❌ Erro:', error.message)
  } finally {
    await client.close()
  }
}

debugNames()
