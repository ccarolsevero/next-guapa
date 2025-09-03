const { MongoClient } = require('mongodb')
require('dotenv').config()

async function verificarEstadoAtual() {
  let client
  
  try {
    console.log('🔍 Verificando estado atual do banco...')
    
    const uri = process.env.MONGODB_URI
    client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.DB_NAME || 'guapa')
    
    // Verificar todas as coleções
    const collections = await db.listCollections().toArray()
    console.log('\n📚 Coleções encontradas:', collections.map(c => c.name))
    
    // Verificar comandas
    const comandas = await db.collection('comandas').find({}).toArray()
    console.log('\n📋 Comandas:', comandas.length)
    if (comandas.length > 0) {
      console.log('   Última comanda:', {
        id: comandas[0]._id,
        status: comandas[0].status,
        valorTotal: comandas[0].valorTotal,
        dataInicio: comandas[0].dataInicio
      })
    }
    
    // Verificar finalizações
    const finalizacoes = await db.collection('finalizacoes').find({}).toArray()
    console.log('\n✅ Finalizações:', finalizacoes.length)
    if (finalizacoes.length > 0) {
      console.log('   Última finalização:', {
        id: finalizacoes[0]._id,
        valorFinal: finalizacoes[0].valorFinal,
        dataCriacao: finalizacoes[0].dataCriacao
      })
    }
    
    // Verificar comissões
    const comissoes = await db.collection('comissoes').find({}).toArray()
    console.log('\n💰 Comissões:', comissoes.length)
    if (comissoes.length > 0) {
      console.log('   Última comissão:', {
        id: comissoes[0]._id,
        profissionalId: comissoes[0].profissionalId,
        tipo: comissoes[0].tipo,
        valor: comissoes[0].valor,
        comissao: comissoes[0].comissao
      })
    }
    
    // Verificar faturamento
    const faturamento = await db.collection('faturamento').find({}).toArray()
    console.log('\n📊 Faturamento:', faturamento.length)
    if (faturamento.length > 0) {
      console.log('   Último faturamento:', {
        id: faturamento[0]._id,
        valorTotal: faturamento[0].valorTotal,
        data: faturamento[0].data
      })
    }
    
    // Verificar clientes
    const clientes = await db.collection('clients').find({}).toArray()
    console.log('\n👥 Clientes:', clientes.length)
    
    // Verificar profissionais
    const profissionais = await db.collection('professionals').find({}).toArray()
    console.log('\n👩‍💼 Profissionais:', profissionais.length)
    if (profissionais.length > 0) {
      console.log('   Profissionais:', profissionais.map(p => p.name))
    }
    
    // Verificar produtos
    const produtos = await db.collection('products').find({}).toArray()
    console.log('\n🛍️ Produtos:', produtos.length)
    
    // Verificar serviços
    const servicos = await db.collection('services').find({}).toArray()
    console.log('\n✂️ Serviços:', servicos.length)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

verificarEstadoAtual()
