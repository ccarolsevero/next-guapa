const { MongoClient } = require('mongodb')

async function debugComandas() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017')
  
  try {
    await client.connect()
    const db = client.db(process.env.DB_NAME || 'guapa')
    
    console.log('🔍 Verificando comandas finalizadas...')
    
    // Buscar algumas comandas recentes
    const comandas = await db.collection('finalizacoes').find({
      status: 'ativo'
    }).limit(5).toArray()
    
    console.log(`📊 Encontradas ${comandas.length} comandas`)
    
    comandas.forEach((comanda, index) => {
      console.log(`\n--- Comanda ${index + 1} ---`)
      console.log('ID:', comanda._id)
      console.log('Profissional ID:', comanda.profissionalId)
      console.log('Profissional Nome:', comanda.profissionalNome)
      console.log('Data:', comanda.dataCriacao)
      console.log('Valor Final:', comanda.valorFinal)
      
      if (comanda.servicos && comanda.servicos.length > 0) {
        console.log('\n📋 Serviços:')
        comanda.servicos.forEach((servico, sIndex) => {
          console.log(`  ${sIndex + 1}. ${servico.nome} - R$ ${servico.preco}`)
        })
      }
      
      if (comanda.produtos && comanda.produtos.length > 0) {
        console.log('\n📦 Produtos:')
        comanda.produtos.forEach((produto, pIndex) => {
          console.log(`  ${pIndex + 1}. ${produto.nome} - R$ ${produto.preco}`)
          console.log(`     Vendido por ID: ${produto.vendidoPorId}`)
          console.log(`     Vendido por: ${produto.vendidoPor}`)
        })
      }
    })
    
    // Verificar profissionais
    console.log('\n👥 Verificando profissionais...')
    const profissionais = await db.collection('professionals').find({}).toArray()
    console.log(`📊 Encontrados ${profissionais.length} profissionais`)
    
    profissionais.forEach(prof => {
      console.log(`- ${prof.name} (ID: ${prof._id})`)
    })
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await client.close()
  }
}

// Carregar variáveis de ambiente
require('dotenv').config()

debugComandas()
