const { MongoClient } = require('mongodb');
require('dotenv').config();

async function verificarFinalizacaoDados() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db(process.env.DB_NAME || 'guapa');
    
    // Verificar finalizações
    console.log('\n🔍 === FINALIZAÇÕES ===');
    const finalizacoes = await db.collection('finalizacoes').find({}).toArray();
    
    console.log(`📊 Total de finalizações: ${finalizacoes.length}`);
    
    for (const finalizacao of finalizacoes) {
      console.log(`\n📋 Finalização #${finalizacao._id}`);
      console.log(`   Comanda ID: ${finalizacao.comandaId}`);
      console.log(`   Profissional ID: ${finalizacao.profissionalId}`);
      console.log(`   Valor Total: R$ ${finalizacao.valorTotal}`);
      
      if (finalizacao.detalhesComissao) {
        console.log(`   💰 Detalhes de Comissão (${finalizacao.detalhesComissao.length}):`);
        finalizacao.detalhesComissao.forEach((detalhe, index) => {
          console.log(`      ${index + 1}. ${detalhe.tipo}: ${detalhe.item}`);
          console.log(`         Valor: R$ ${detalhe.valor}`);
          console.log(`         Comissão: R$ ${detalhe.comissao}`);
          console.log(`         Vendido por: ${detalhe.vendidoPor || 'N/A'}`);
        });
      } else {
        console.log(`   ⚠️ Nenhum detalhe de comissão encontrado`);
      }
    }
    
    // Verificar comissões
    console.log('\n🔍 === COMISSÕES ===');
    const comissoes = await db.collection('comissoes').find({}).toArray();
    
    console.log(`📊 Total de comissões: ${comissoes.length}`);
    
    for (const comissao of comissoes) {
      console.log(`\n💰 Comissão #${comissao._id}`);
      console.log(`   Comanda ID: ${comissao.comandaId}`);
      console.log(`   Profissional ID: ${comissao.profissionalId}`);
      console.log(`   Tipo: ${comissao.tipo}`);
      console.log(`   Item: ${comissao.item}`);
      console.log(`   Valor: R$ ${comissao.valor}`);
      console.log(`   Comissão: R$ ${comissao.comissao}`);
      console.log(`   Vendido por: ${comissao.vendidoPor || 'N/A'}`);
      
      // Verificar se o profissional existe
      if (comissao.profissionalId) {
        const profissional = await db.collection('professionals').findOne({
          _id: new (require('mongodb')).ObjectId(comissao.profissionalId)
        });
        
        if (profissional) {
          console.log(`   👩‍💼 Profissional: ${profissional.name}`);
        } else {
          console.log(`   ❌ Profissional não encontrado`);
        }
      }
    }
    
    // Verificar uma comanda específica
    console.log('\n🔍 === VERIFICANDO COMANDA ESPECÍFICA ===');
    const comandaId = '68b8658589a933c14c3fd3c0';
    const comanda = await db.collection('comandas').findOne({
      _id: new (require('mongodb')).ObjectId(comandaId)
    });
    
    if (comanda) {
      console.log(`📋 Comanda #${comanda._id}`);
      console.log(`   Profissional ID: ${comanda.professionalId}`);
      console.log(`   Status: ${comanda.status}`);
      
      if (comanda.produtos && comanda.produtos.length > 0) {
        console.log(`   📦 Produtos:`);
        comanda.produtos.forEach(produto => {
          console.log(`      - ${produto.nome}: vendido por ${produto.vendidoPor} (ID: ${produto.vendidoPorId})`);
        });
      }
      
      // Verificar se tem finalização
      const finalizacao = await db.collection('finalizacoes').findOne({
        comandaId: comanda._id
      });
      
      if (finalizacao) {
        console.log(`   ✅ Tem finalização: #${finalizacao._id}`);
        if (finalizacao.detalhesComissao) {
          console.log(`   💰 Detalhes de comissão na finalização:`);
          finalizacao.detalhesComissao.forEach(detalhe => {
            console.log(`      - ${detalhe.tipo}: ${detalhe.item} - Vendido por: ${detalhe.vendidoPor || 'N/A'}`);
          });
        }
      } else {
        console.log(`   ❌ Não tem finalização`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

verificarFinalizacaoDados();
