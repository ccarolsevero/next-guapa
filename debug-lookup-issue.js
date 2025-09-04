const { MongoClient, ObjectId } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

async function debugLookupIssue() {
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db('guapa')
    
    console.log('🔍 Investigando problema de lookup...\n')

    // Pegar uma finalização
    const finalizacao = await db.collection('finalizacoes').findOne({})
    console.log('📋 Finalização encontrada:')
    console.log('Cliente ID:', finalizacao.clienteId)
    console.log('Profissional ID:', finalizacao.profissionalId)
    console.log('Tipo Cliente ID:', typeof finalizacao.clienteId)
    console.log('Tipo Profissional ID:', typeof finalizacao.profissionalId)

    // Tentar buscar cliente com string
    console.log('\n🔍 Buscando cliente com string:')
    const clienteString = await db.collection('clients').findOne({ _id: finalizacao.clienteId })
    console.log('Cliente encontrado (string):', !!clienteString)

    // Tentar buscar cliente com ObjectId
    console.log('\n🔍 Buscando cliente com ObjectId:')
    const clienteObjectId = await db.collection('clients').findOne({ _id: new ObjectId(finalizacao.clienteId) })
    console.log('Cliente encontrado (ObjectId):', !!clienteObjectId)

    // Verificar estrutura dos IDs nas coleções
    console.log('\n📊 Verificando estrutura dos IDs:')
    
    // Verificar um cliente
    const clienteSample = await db.collection('clients').findOne({})
    if (clienteSample) {
      console.log('Cliente sample ID:', clienteSample._id)
      console.log('Cliente sample ID tipo:', typeof clienteSample._id)
    }

    // Verificar um profissional
    const profissionalSample = await db.collection('professionals').findOne({})
    if (profissionalSample) {
      console.log('Profissional sample ID:', profissionalSample._id)
      console.log('Profissional sample ID tipo:', typeof profissionalSample._id)
    }

    // Testar lookup manual
    console.log('\n🧪 Testando lookup manual:')
    const testLookup = await db.collection('finalizacoes').aggregate([
      {
        $match: { _id: finalizacao._id }
      },
      {
        $lookup: {
          from: 'clients',
          localField: 'clienteId',
          foreignField: '_id',
          as: 'client'
        }
      }
    ]).toArray()

    console.log('Resultado lookup:', testLookup[0]?.client?.length || 0, 'clientes encontrados')

    // Testar com conversão de ObjectId
    console.log('\n🧪 Testando lookup com ObjectId:')
    const testLookupObjectId = await db.collection('finalizacoes').aggregate([
      {
        $match: { _id: finalizacao._id }
      },
      {
        $addFields: {
          clienteObjectId: { $toObjectId: '$clienteId' }
        }
      },
      {
        $lookup: {
          from: 'clients',
          localField: 'clienteObjectId',
          foreignField: '_id',
          as: 'client'
        }
      }
    ]).toArray()

    console.log('Resultado lookup com ObjectId:', testLookupObjectId[0]?.client?.length || 0, 'clientes encontrados')

  } catch (error) {
    console.error('❌ Erro:', error.message)
  } finally {
    await client.close()
  }
}

debugLookupIssue()
