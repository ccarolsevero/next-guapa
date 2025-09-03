const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testarComandaEspecifica() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db(process.env.DB_NAME || 'guapa');
    
    // Testar comanda específica
    const comandaId = '68b8658589a933c14c3fd3c0'; // Comanda da Cicera com produtos da Ellen
    
    console.log(`\n🔍 === TESTANDO COMANDA #${comandaId} ===`);
    
    // 1. Buscar comanda
    const comanda = await db.collection('comandas').findOne({
      _id: new (require('mongodb')).ObjectId(comandaId)
    });
    
    if (!comanda) {
      console.log('❌ Comanda não encontrada');
      return;
    }
    
    console.log('📋 Comanda encontrada:');
    console.log(`   ID: ${comanda._id}`);
    console.log(`   Profissional ID: ${comanda.professionalId}`);
    console.log(`   Status: ${comanda.status}`);
    console.log(`   Produtos: ${comanda.produtos?.length || 0}`);
    console.log(`   Serviços: ${comanda.servicos?.length || 0}`);
    
    // 2. Verificar produtos
    if (comanda.produtos && comanda.produtos.length > 0) {
      console.log('\n📦 Produtos na comanda:');
      comanda.produtos.forEach((produto, index) => {
        console.log(`   ${index + 1}. ${produto.nome}`);
        console.log(`      Preço: R$ ${produto.preco}`);
        console.log(`      Quantidade: ${produto.quantidade}`);
        console.log(`      Vendido por: ${produto.vendidoPor || 'N/A'}`);
        console.log(`      Vendido por ID: ${produto.vendidoPorId || 'N/A'}`);
      });
    }
    
    // 3. Verificar serviços
    if (comanda.servicos && comanda.servicos.length > 0) {
      console.log('\n🧑‍⚕️ Serviços na comanda:');
      comanda.servicos.forEach((servico, index) => {
        console.log(`   ${index + 1}. ${servico.nome}`);
        console.log(`      Preço: R$ ${servico.preco}`);
        console.log(`      Quantidade: ${servico.quantidade}`);
      });
    }
    
    // 4. Simular o que a API de finalização receberia
    console.log('\n🔄 === SIMULANDO DADOS PARA FINALIZAÇÃO ===');
    
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
    
    console.log('💰 Detalhes de comissão simulados:');
    detalhesComissao.forEach((detalhe, index) => {
      console.log(`   ${index + 1}. ${detalhe.tipo}: ${detalhe.item}`);
      console.log(`      Valor: R$ ${detalhe.valor}`);
      console.log(`      Comissão: R$ ${detalhe.comissao}`);
      if (detalhe.vendidoPor) {
        console.log(`      Vendido por: ${detalhe.vendidoPor}`);
      }
    });
    
    // 5. Verificar se os profissionais existem
    console.log('\n👩‍💼 === VERIFICANDO PROFISSIONAIS ===');
    
    const profissionais = await db.collection('professionals').find({
      name: { $in: ['Ellen Souza', 'Cicera Canovas'] }
    }).toArray();
    
    console.log('📊 Profissionais encontrados:');
    profissionais.forEach(prof => {
      console.log(`   - ${prof.name} (ID: ${prof._id})`);
    });
    
    // 6. Simular o processo de atribuição de comissões
    console.log('\n🔄 === SIMULANDO ATRIBUIÇÃO DE COMISSÕES ===');
    
    for (const detalhe of detalhesComissao) {
      let profissionalId;
      
      if (detalhe.tipo === 'Produto' && detalhe.vendidoPor && detalhe.vendidoPor !== 'Não definido') {
        // Para produtos, buscar o profissional pelo nome
        const profissional = await db.collection('professionals').findOne({ 
          name: detalhe.vendidoPor 
        });
        
        if (profissional) {
          profissionalId = profissional._id;
          console.log(`✅ Produto ${detalhe.item} - Comissão para: ${detalhe.vendidoPor} (ID: ${profissionalId})`);
        } else {
          console.log(`❌ Profissional não encontrado: ${detalhe.vendidoPor}`);
        }
      } else {
        // Para serviços, usar o profissional da comanda
        profissionalId = comanda.professionalId;
        console.log(`✅ Serviço ${detalhe.item} - Comissão para profissional da comanda: ${profissionalId}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

testarComandaEspecifica();
