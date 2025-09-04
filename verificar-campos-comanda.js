const { MongoClient } = require('mongodb');

async function verificarCamposComanda() {
  const uri = "mongodb+srv://brunacanovas_db_user:amCzSzLUpD7P96gD@espacoguapa.npfnuuc.mongodb.net/?retryWrites=true&w=majority&appName=Espacoguapa";
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB Atlas');
    
    const db = client.db('guapa');
    
    // Verificar comandas finalizadas
    console.log('\n🔍 Verificando comandas finalizadas...');
    const comandas = await db.collection('comandas').find({ status: 'finalizada' }).toArray();
    
    console.log(`Total de comandas finalizadas: ${comandas.length}`);
    
    if (comandas.length > 0) {
      // Mostrar TODOS os campos da primeira comanda
      console.log('\n🔍 TODOS OS CAMPOS DA PRIMEIRA COMANDA:');
      const primeira = comandas[0];
      console.log(JSON.stringify(primeira, null, 2));
      
      // Verificar campos relacionados a pagamento
      console.log('\n💳 CAMPOS RELACIONADOS A PAGAMENTO:');
      comandas.forEach((comanda, index) => {
        console.log(`\n--- Comanda ${index + 1} ---`);
        console.log(`ID: ${comanda._id}`);
        
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
          if (comanda[campo] !== undefined) {
            console.log(`✅ ${campo}: ${comanda[campo]}`);
          } else {
            console.log(`❌ ${campo}: não existe`);
          }
        });
        
        // Verificar campos relacionados a data
        console.log(`📅 dataFim: ${comanda.dataFim || 'NÃO DEFINIDA'}`);
        console.log(`📅 dataFinalizacao: ${comanda.dataFinalizacao || 'NÃO DEFINIDA'}`);
        console.log(`📅 updatedAt: ${comanda.updatedAt || 'NÃO DEFINIDO'}`);
        
        // Verificar outros campos importantes
        console.log(`💰 valorTotal: ${comanda.valorTotal}`);
        console.log(`💰 valorFinal: ${comanda.valorFinal}`);
        console.log(`📊 status: ${comanda.status}`);
      });
      
      // Verificar se há comandas com outros nomes de campos
      console.log('\n🔍 BUSCANDO CAMPOS ALTERNATIVOS...');
      const todasComandas = await db.collection('comandas').find({}).toArray();
      
      if (todasComandas.length > 0) {
        const primeira = todasComandas[0];
        console.log('\n📋 TODOS OS CAMPOS DE UMA COMANDA (qualquer status):');
        console.log(Object.keys(primeira));
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

verificarCamposComanda();
