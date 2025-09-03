const { MongoClient } = require('mongodb');
require('dotenv').config();

async function verificarComandasEllen() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db(process.env.DB_NAME || 'guapa');
    
    // 1. Verificar comandas com produtos vendidos por Ellen
    console.log('\n🔍 === COMANDA COM PRODUTOS DA ELLEN ===');
    const comandaId = '68b8658589a933c14c3fd3c0';
    
    const comanda = await db.collection('comandas').findOne({
      _id: new (require('mongodb')).ObjectId(comandaId)
    });
    
    if (comanda) {
      console.log(`📋 Comanda #${comanda._id}`);
      console.log(`   Status: ${comanda.status}`);
      console.log(`   Profissional da comanda: ${comanda.professionalId}`);
      
      if (comanda.produtos && comanda.produtos.length > 0) {
        console.log(`\n📦 Produtos:`);
        comanda.produtos.forEach(produto => {
          console.log(`   - ${produto.nome}: vendido por ${produto.vendidoPor} (ID: ${produto.vendidoPorId})`);
        });
      }
    }
    
    // 2. Verificar se tem finalização
    console.log('\n🔍 === VERIFICANDO FINALIZAÇÃO ===');
    const finalizacao = await db.collection('finalizacoes').findOne({
      comandaId: comanda._id
    });
    
    if (finalizacao) {
      console.log(`✅ Finalização encontrada: #${finalizacao._id}`);
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
    } else {
      console.log(`❌ Não tem finalização`);
    }
    
    // 3. Verificar comissões relacionadas a esta comanda
    console.log('\n🔍 === VERIFICANDO COMISSÕES DA COMANDA ===');
    const comissoes = await db.collection('comissoes').find({
      comandaId: comanda._id
    }).toArray();
    
    console.log(`📊 Total de comissões: ${comissoes.length}`);
    
    for (const comissao of comissoes) {
      console.log(`\n💰 Comissão #${comissao._id}`);
      console.log(`   Tipo: ${comissao.tipo}`);
      console.log(`   Item: ${comissao.item}`);
      console.log(`   Valor: R$ ${comissao.valor}`);
      console.log(`   Comissão: R$ ${comissao.comissao}`);
      console.log(`   Profissional ID: ${comissao.profissionalId}`);
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
    
    // 4. Simular o que deveria ter sido enviado para a API de finalização
    console.log('\n🔄 === SIMULANDO DADOS CORRETOS ===');
    
    const detalhesComissao = [];
    
    // Simular detalhes de comissão para serviços
    if (comanda.servicos && comanda.servicos.length > 0) {
      comanda.servicos.forEach(servico => {
        const comissao = servico.preco * servico.quantidade * 0.10;
        detalhesComissao.push({
          tipo: 'Serviço',
          item: servico.nome,
          valor: servico.preco * servico.quantidade,
          comissao: comissao
        });
      });
    }
    
    // Simular detalhes de comissão para produtos
    if (comanda.produtos && comanda.produtos.length > 0) {
      comanda.produtos.forEach(produto => {
        const comissao = produto.preco * produto.quantidade * 0.15;
        detalhesComissao.push({
          tipo: 'Produto',
          item: produto.nome,
          valor: produto.preco * produto.quantidade,
          comissao: comissao,
          vendidoPor: produto.vendidoPor || 'Não definido'
        });
      });
    }
    
    console.log('💰 Detalhes de comissão que deveriam ter sido enviados:');
    detalhesComissao.forEach((detalhe, index) => {
      console.log(`   ${index + 1}. ${detalhe.tipo}: ${detalhe.item}`);
      console.log(`      Valor: R$ ${detalhe.valor}`);
      console.log(`      Comissão: R$ ${detalhe.comissao}`);
      if (detalhe.vendidoPor) {
        console.log(`      Vendido por: ${detalhe.vendidoPor}`);
      }
    });
    
    // 5. Verificar se há algum problema com a data das comissões
    console.log('\n🔍 === VERIFICANDO DATAS DAS COMISSÕES ===');
    const comissoesComData = await db.collection('comissoes').find({
      comandaId: comanda._id
    }).toArray();
    
    comissoesComData.forEach(comissao => {
      console.log(`   ${comissao.tipo}: ${comissao.item} - Data: ${comissao.data}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

verificarComandasEllen();
