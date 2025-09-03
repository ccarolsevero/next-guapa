const { MongoClient } = require('mongodb');
require('dotenv').config();

async function debugComandaCicera() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db(process.env.DB_NAME || 'guapa');
    
    // 1. Verificar todas as comandas da Cicera
    console.log('\n🔍 === COMANDAS DA CICERA ===');
    const comandasCicera = await db.collection('comandas').find({
      'profissionalId': { $exists: true }
    }).toArray();
    
    console.log(`📊 Total de comandas encontradas: ${comandasCicera.length}`);
    
    for (const comanda of comandasCicera) {
      console.log(`\n📋 Comanda #${comanda._id}`);
      console.log(`   Profissional ID: ${comanda.profissionalId}`);
      console.log(`   Status: ${comanda.status}`);
      console.log(`   Data: ${comanda.dataInicio}`);
      
      // Verificar se tem produtos
      if (comanda.produtos && comanda.produtos.length > 0) {
        console.log(`   📦 Produtos (${comanda.produtos.length}):`);
        comanda.produtos.forEach(produto => {
          console.log(`      - ${produto.nome} (R$ ${produto.preco}) - Vendido por: ${produto.vendidoPor || 'N/A'}`);
        });
      }
      
      // Verificar se tem serviços
      if (comanda.servicos && comanda.servicos.length > 0) {
        console.log(`   🧑‍⚕️ Serviços (${comanda.servicos.length}):`);
        comanda.servicos.forEach(servico => {
          console.log(`      - ${servico.nome} (R$ ${servico.preco})`);
        });
      }
    }
    
    // 2. Verificar finalizações da Cicera
    console.log('\n🔍 === FINALIZAÇÕES DA CICERA ===');
    const finalizacoesCicera = await db.collection('finalizacoes').find({
      'profissionalId': { $exists: true }
    }).toArray();
    
    console.log(`📊 Total de finalizações encontradas: ${finalizacoesCicera.length}`);
    
    for (const finalizacao of finalizacoesCicera) {
      console.log(`\n📋 Finalização #${finalizacao._id}`);
      console.log(`   Profissional ID: ${finalizacao.profissionalId}`);
      console.log(`   Comanda ID: ${finalizacao.comandaId}`);
      console.log(`   Valor Total: R$ ${finalizacao.valorTotal}`);
      
      if (finalizacao.detalhesComissao) {
        console.log(`   💰 Detalhes de Comissão:`);
        finalizacao.detalhesComissao.forEach(detalhe => {
          console.log(`      - ${detalhe.tipo}: ${detalhe.nome} - R$ ${detalhe.valor} - Vendido por: ${detalhe.vendidoPor || 'N/A'}`);
        });
      }
    }
    
    // 3. Verificar comissões da Cicera
    console.log('\n🔍 === COMISSÕES DA CICERA ===');
    const comissoesCicera = await db.collection('comissoes').find({
      'profissionalId': { $exists: true }
    }).toArray();
    
    console.log(`📊 Total de comissões encontradas: ${comissoesCicera.length}`);
    
    for (const comissao of comissoesCicera) {
      console.log(`\n💰 Comissão #${comissao._id}`);
      console.log(`   Profissional ID: ${comissao.profissionalId}`);
      console.log(`   Tipo: ${comissao.tipo}`);
      console.log(`   Valor: R$ ${comissao.valor}`);
      console.log(`   Comanda ID: ${comissao.comandaId}`);
      console.log(`   Vendido por: ${comissao.vendidoPor || 'N/A'}`);
    }
    
    // 4. Verificar se Ellen existe na coleção de profissionais
    console.log('\n🔍 === VERIFICANDO PROFISSIONAIS ===');
    const profissionais = await db.collection('professionals').find({}).toArray();
    
    console.log(`📊 Total de profissionais: ${profissionais.length}`);
    profissionais.forEach(prof => {
      console.log(`   - ${prof.name} (ID: ${prof._id})`);
    });
    
    // 5. Verificar se há produtos vendidos por Ellen
    console.log('\n🔍 === PRODUTOS VENDIDOS POR ELLEN ===');
    const produtosEllen = await db.collection('comandas').find({
      'produtos.vendidoPor': { $regex: /ellen/i }
    }).toArray();
    
    console.log(`📊 Comandas com produtos vendidos por Ellen: ${produtosEllen.length}`);
    for (const comanda of produtosEllen) {
      console.log(`\n📋 Comanda #${comanda._id}`);
      comanda.produtos.forEach(produto => {
        if (produto.vendidoPor && produto.vendidoPor.toLowerCase().includes('ellen')) {
          console.log(`   📦 ${produto.nome} - Vendido por: ${produto.vendidoPor}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

debugComandaCicera();
