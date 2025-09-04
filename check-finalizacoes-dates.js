const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

async function checkFinalizacoesDates() {
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db('guapa')
    
    console.log('🔍 Verificando datas das finalizações...\n')

    // Buscar todas as finalizações
    const finalizacoes = await db.collection('finalizacoes').find({}).toArray()
    
    console.log(`📊 Total de finalizações: ${finalizacoes.length}`)
    
    finalizacoes.forEach((finalizacao, index) => {
      console.log(`\n--- Finalização ${index + 1} ---`)
      console.log('Data Criação:', finalizacao.dataCriacao)
      console.log('Valor Final:', finalizacao.valorFinal)
      console.log('Cliente:', finalizacao.clienteNome)
    })

    // Verificar o filtro de 6 meses
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
    
    console.log('\n📅 Filtros de data:')
    console.log('Data atual:', now)
    console.log('6 meses atrás:', sixMonthsAgo)
    
    const recentCount = await db.collection('finalizacoes').countDocuments({
      dataCriacao: { $gte: sixMonthsAgo, $lte: now }
    })
    console.log(`\n📈 Finalizações nos últimos 6 meses: ${recentCount}`)

    // Verificar se há dados em qualquer período
    const anyCount = await db.collection('finalizacoes').countDocuments({})
    console.log(`📊 Total de finalizações (sem filtro): ${anyCount}`)

  } catch (error) {
    console.error('❌ Erro:', error.message)
  } finally {
    await client.close()
  }
}

checkFinalizacoesDates()
