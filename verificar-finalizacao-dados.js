const { MongoClient, ObjectId } = require('mongodb')
require('dotenv').config()

async function verificarFinalizacaoDados() {
  let client
  
  try {
    console.log('🔍 Verificando dados da finalização...')
    
    const uri = process.env.MONGODB_URI
    client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.DB_NAME || 'guapa')
    
    // Verificar finalização específica
    console.log('\n✅ Verificando finalização R$ 830.02:')
    const finalizacao = await db.collection('finalizacoes').findOne({
      valorFinal: 830.02
    })
    
    if (finalizacao) {
      console.log(`   ID: ${finalizacao._id}`)
      console.log(`   Comanda ID: ${finalizacao.comandaId}`)
      console.log(`   Cliente ID: ${finalizacao.clienteId}`)
      console.log(`   Profissional ID: ${finalizacao.profissionalId}`)
      console.log(`   Valor Final: R$ ${finalizacao.valorFinal}`)
      console.log(`   Data Criação: ${finalizacao.dataCriacao}`)
      
      if (finalizacao.detalhesComissao) {
        console.log('\n   📊 Detalhes da Comissão:')
        finalizacao.detalhesComissao.forEach((detalhe, index) => {
          console.log(`     ${index + 1}. ${detalhe.tipo}: ${detalhe.item}`)
          console.log(`        Valor: R$ ${detalhe.valor}`)
          console.log(`        Comissão: R$ ${detalhe.comissao}`)
          console.log(`        Vendido Por: ${detalhe.vendidoPor}`)
          console.log(`        Tipo vendidoPor: ${typeof detalhe.vendidoPor}`)
          console.log(`        É string válida: ${typeof detalhe.vendidoPor === 'string'}`)
          console.log(`        É ObjectId válido: ${ObjectId.isValid(detalhe.vendidoPor)}`)
          console.log('')
        })
      }
      
      // Verificar comanda relacionada
      console.log('\n📋 Verificando comanda relacionada:')
      const comanda = await db.collection('comandas').findOne({
        _id: new ObjectId(finalizacao.comandaId)
      })
      
      if (comanda) {
        console.log(`   Comanda ID: ${comanda._id}`)
        console.log(`   Status: ${comanda.status}`)
        console.log(`   Valor Total: R$ ${comanda.valorTotal}`)
        console.log(`   Profissional ID: ${comanda.professionalId}`)
        
        if (comanda.produtos && comanda.produtos.length > 0) {
          console.log('\n   🛍️ Produtos na comanda:')
          comanda.produtos.forEach((produto, index) => {
            console.log(`     ${index + 1}. ${produto.nome}`)
            console.log(`        Preço: R$ ${produto.preco}`)
            console.log(`        Quantidade: ${produto.quantidade}`)
            console.log(`        Vendido Por: ${produto.vendidoPor}`)
            console.log(`        Tipo vendidoPor: ${typeof produto.vendidoPor}`)
            console.log('')
          })
        }
        
        if (comanda.servicos && comanda.servicos.length > 0) {
          console.log('\n   ✂️ Serviços na comanda:')
          comanda.servicos.forEach((servico, index) => {
            console.log(`     ${index + 1}. ${servico.nome}`)
            console.log(`        Preço: R$ ${servico.preco}`)
            console.log(`        Quantidade: ${servico.quantidade}`)
            console.log('')
          })
        }
      }
    }
    
    // Verificar comissões relacionadas
    console.log('\n💰 Verificando comissões relacionadas:')
    const comissoes = await db.collection('comissoes').find({
      comandaId: new ObjectId(finalizacao.comandaId)
    }).toArray()
    
    comissoes.forEach((comissao, index) => {
      console.log(`   ${index + 1}. ${comissao.tipo}: ${comissao.item}`)
      console.log(`      Profissional ID: ${comissao.profissionalId}`)
      console.log(`      Vendido Por: ${comissao.vendidoPor}`)
      console.log(`      Valor: R$ ${comissao.valor}`)
      console.log(`      Comissão: R$ ${comissao.comissao}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

verificarFinalizacaoDados()
