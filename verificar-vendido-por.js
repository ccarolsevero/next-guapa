const { MongoClient, ObjectId } = require('mongodb')
require('dotenv').config()

async function verificarVendidoPor() {
  let client
  
  try {
    console.log('🔍 Verificando campo vendidoPor das comissões...')
    
    const uri = process.env.MONGODB_URI
    client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.DB_NAME || 'guapa')
    
    // Verificar comissões de produtos
    console.log('\n🛍️ Comissões de PRODUTOS:')
    const comissoesProdutos = await db.collection('comissoes').find({
      tipo: 'Produto'
    }).toArray()
    
    comissoesProdutos.forEach((comissao, index) => {
      console.log(`   ${index + 1}. ${comissao.item}`)
      console.log(`      Profissional ID: ${comissao.profissionalId}`)
      console.log(`      Vendido Por: ${comissao.vendidoPor}`)
      console.log(`      Valor: R$ ${comissao.valor}`)
      console.log(`      Comissão: R$ ${comissao.comissao}`)
      console.log('')
    })
    
    // Verificar comissões de serviços
    console.log('\n✂️ Comissões de SERVIÇOS:')
    const comissoesServicos = await db.collection('comissoes').find({
      tipo: 'Serviço'
    }).toArray()
    
    comissoesServicos.forEach((comissao, index) => {
      console.log(`   ${index + 1}. ${comissao.item}`)
      console.log(`      Profissional ID: ${comissao.profissionalId}`)
      console.log(`      Vendido Por: ${comissao.vendidoPor}`)
      console.log(`      Valor: R$ ${comissao.valor}`)
      console.log(`      Comissão: R$ ${comissao.comissao}`)
      console.log('')
    })
    
    // Verificar comanda específica
    console.log('\n📋 Verificando comanda específica:')
    const comanda = await db.collection('comandas').findOne({
      valorTotal: 830.02
    })
    
    if (comanda) {
      console.log(`   Comanda ID: ${comanda._id}`)
      console.log(`   Status: ${comanda.status}`)
      console.log(`   Valor Total: R$ ${comanda.valorTotal}`)
      console.log(`   Profissional ID: ${comanda.professionalId}`)
      
      console.log('\n   Produtos:')
      if (comanda.produtos && comanda.produtos.length > 0) {
        comanda.produtos.forEach((produto, index) => {
          console.log(`     ${index + 1}. ${produto.nome}`)
          console.log(`        Preço: R$ ${produto.preco}`)
          console.log(`        Quantidade: ${produto.quantidade}`)
          console.log(`        Vendido Por: ${produto.vendidoPor}`)
          console.log('')
        })
      }
      
      console.log('   Serviços:')
      if (comanda.servicos && comanda.servicos.length > 0) {
        comanda.servicos.forEach((servico, index) => {
          console.log(`     ${index + 1}. ${servico.nome}`)
          console.log(`        Preço: R$ ${servico.preco}`)
          console.log(`        Quantidade: ${servico.quantidade}`)
          console.log('')
        })
      }
    }
    
    // Verificar finalização
    console.log('\n✅ Verificando finalização:')
    const finalizacao = await db.collection('finalizacoes').findOne({
      valorFinal: 830.02
    })
    
    if (finalizacao) {
      console.log(`   Finalização ID: ${finalizacao._id}`)
      console.log(`   Valor Final: R$ ${finalizacao.valorFinal}`)
      console.log(`   Data Criação: ${finalizacao.dataCriacao}`)
      console.log(`   Método Pagamento: ${finalizacao.metodoPagamento}`)
      
      if (finalizacao.detalhesComissao) {
        console.log('\n   Detalhes da Comissão:')
        finalizacao.detalhesComissao.forEach((detalhe, index) => {
          console.log(`     ${index + 1}. ${detalhe.tipo}: ${detalhe.item}`)
          console.log(`        Valor: R$ ${detalhe.valor}`)
          console.log(`        Comissão: R$ ${detalhe.comissao}`)
          console.log(`        Vendido Por: ${detalhe.vendidoPor}`)
          console.log('')
        })
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

verificarVendidoPor()
