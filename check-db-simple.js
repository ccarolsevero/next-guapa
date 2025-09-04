const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

async function checkDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db('guapa')
    
    console.log('🔍 Verificando dados no banco...\n')

    // Verificar finalizações
    const finalizacoesCount = await db.collection('finalizacoes').countDocuments()
    console.log(`📊 Total de finalizações: ${finalizacoesCount}`)

    if (finalizacoesCount > 0) {
      const sample = await db.collection('finalizacoes').findOne({})
      console.log('\n📋 Amostra de finalização:')
      console.log('Campos:', Object.keys(sample))
      console.log('Data Criação:', sample.dataCriacao)
      console.log('Valor Final:', sample.valorFinal)
      console.log('Cliente ID:', sample.clienteId)
      console.log('Profissional ID:', sample.profissionalId)
    }

    // Verificar clientes
    const clientesCount = await db.collection('clients').countDocuments()
    console.log(`\n👥 Total de clientes: ${clientesCount}`)

    // Verificar profissionais
    const profissionaisCount = await db.collection('professionals').countDocuments()
    console.log(`👨‍⚕️ Total de profissionais: ${profissionaisCount}`)

    // Verificar serviços
    const servicosCount = await db.collection('services').countDocuments()
    console.log(`🔧 Total de serviços: ${servicosCount}`)

    // Verificar produtos
    const produtosCount = await db.collection('products').countDocuments()
    console.log(`📦 Total de produtos: ${produtosCount}`)

  } catch (error) {
    console.error('❌ Erro:', error.message)
  } finally {
    await client.close()
  }
}

checkDatabase()
