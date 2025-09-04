const { MongoClient } = require('mongodb');

async function verificarFinalizacoes() {
  const uri = "mongodb+srv://brunacanovas_db_user:amCzSzLUpD7P96gD@espacoguapa.npfnuuc.mongodb.net/?retryWrites=true&w=majority&appName=Espacoguapa";
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB Atlas');
    
    const db = client.db('guapa');
    
    // Verificar coleção finalizacoes
    console.log('\n🔍 Verificando coleção "finalizacoes"...');
    const finalizacoes = await db.collection('finalizacoes').find({}).toArray();
    
    console.log(`Total de finalizações: ${finalizacoes.length}`);
    
    if (finalizacoes.length > 0) {
      console.log('\n🔍 TODOS OS CAMPOS DA PRIMEIRA FINALIZAÇÃO:');
      const primeira = finalizacoes[0];
      console.log(JSON.stringify(primeira, null, 2));
      
      // Verificar campos relacionados a pagamento
      console.log('\n💳 CAMPOS RELACIONADOS A PAGAMENTO:');
      finalizacoes.forEach((finalizacao, index) => {
        console.log(`\n--- Finalização ${index + 1} ---`);
        console.log(`ID: ${finalizacao._id}`);
        console.log(`Comanda ID: ${finalizacao.comandaId}`);
        
        // Verificar todos os campos que podem conter método de pagamento
        const camposPagamento = [
          'metodoPagamento',
          'paymentMethod',
          'metodo_pagamento',
          'formaPagamento',
          'forma_pagamento',
          'tipoPagamento',
          'tipo_pagamento'
        ];
        
        camposPagamento.forEach(campo => {
          if (finalizacao[campo] !== undefined) {
            console.log(`✅ ${campo}: ${finalizacao[campo]}`);
          } else {
            console.log(`❌ ${campo}: não existe`);
          }
        });
        
        // Verificar outros campos importantes
        console.log(`💰 valorFinal: ${finalizacao.valorFinal}`);
        console.log(`📊 status: ${finalizacao.status}`);
        console.log(`📅 dataCriacao: ${finalizacao.dataCriacao}`);
      });
    }
    
    // Verificar outras coleções que podem ter dados de pagamento
    console.log('\n🔍 Verificando outras coleções...');
    
    const colecoes = ['orders', 'faturamento', 'comissoes'];
    for (const nome of colecoes) {
      try {
        const count = await db.collection(nome).countDocuments();
        console.log(`\n📊 ${nome}: ${count} documentos`);
        
        if (count > 0) {
          const primeiro = await db.collection(nome).findOne();
          console.log(`   Campos: ${Object.keys(primeiro).join(', ')}`);
          
          // Se for orders, verificar se tem dados de pagamento
          if (nome === 'orders') {
            const orders = await db.collection(nome).find({}).toArray();
            orders.forEach((order, index) => {
              console.log(`\n   --- Order ${index + 1} ---`);
              console.log(`   ID: ${order._id}`);
              console.log(`   Status: ${order.status}`);
              console.log(`   Payment Method: ${order.paymentMethod || 'NÃO DEFINIDO'}`);
              console.log(`   Total: ${order.total || 'NÃO DEFINIDO'}`);
            });
          }
        }
      } catch (error) {
        console.log(`❌ Erro ao verificar ${nome}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

verificarFinalizacoes();
