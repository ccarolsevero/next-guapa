const { MongoClient } = require('mongodb')

async function checkAllCollections() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa')
  
  try {
    await client.connect()
    const db = client.db('guapa')
    
    console.log('🔍 Verificando todas as coleções...\n')

    // Listar todas as coleções
    const collections = await db.listCollections().toArray()
    console.log('📚 Coleções encontradas:')
    collections.forEach(col => {
      console.log(`  - ${col.name}`)
    })

    console.log('\n📊 Contagem de documentos por coleção:')
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments()
      console.log(`  ${col.name}: ${count} documentos`)
      
      if (count > 0 && count < 10) {
        const sample = await db.collection(col.name).findOne({})
        console.log(`    Amostra:`, Object.keys(sample))
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error.message)
  } finally {
    await client.close()
  }
}

checkAllCollections()
