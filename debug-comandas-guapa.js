const { MongoClient } = require('mongodb');

async function debugComandasGuapa() {
  const uri = "mongodb+srv://brunacanovas_db_user:amCzSzLUpD7P96gD@espacoguapa.npfnuuc.mongodb.net/?retryWrites=true&w=majority&appName=Espacoguapa";
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB Atlas');
    
    const db = client.db('guapa');
    
    // Verificar comandas
    console.log('\n🔍 Verificando coleção "comandas"...');
    const comandas = await db.collection('comandas').find({}).toArray();
    console.log(`Total de comandas: ${comandas.length}`);
    
    if (comandas.length > 0) {
      console.log('\n📋 STATUS DAS COMANDAS:');
      const statusCount = {};
      comandas.forEach(comanda => {
        const status = comanda.status || 'SEM STATUS';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`${status}: ${count}`);
      });
      
      // Mostrar estrutura da primeira comanda
      console.log('\n🔍 ESTRUTURA DA PRIMEIRA COMANDA:');
      console.log(JSON.stringify(comandas[0], null, 2));
      
      // Verificar comandas finalizadas especificamente
      const comandasFinalizadas = comandas.filter(c => c.status === 'finalizada');
      console.log(`\n✅ Comandas com status 'finalizada': ${comandasFinalizadas.length}`);
      
      if (comandasFinalizadas.length > 0) {
        console.log('\n📋 RESUMO DAS COMANDAS FINALIZADAS:');
        comandasFinalizadas.forEach((comanda, index) => {
          console.log(`\n--- Comanda ${index + 1} ---`);
          console.log(`ID: ${comanda._id}`);
          console.log(`Status: ${comanda.status}`);
          console.log(`Valor Total: ${comanda.valorTotal}`);
          console.log(`Método Pagamento: ${comanda.metodoPagamento || 'NÃO DEFINIDO'}`);
          console.log(`Data Finalização: ${comanda.dataFinalizacao || 'NÃO DEFINIDA'}`);
          console.log(`Updated At: ${comanda.updatedAt || 'NÃO DEFINIDO'}`);
          console.log(`Data Fim: ${comanda.dataFim || 'NÃO DEFINIDA'}`);
          console.log(`Valor Final: ${comanda.valorFinal || 'NÃO DEFINIDO'}`);
          
          if (comanda.servicos && comanda.servicos.length > 0) {
            console.log(`Serviços (${comanda.servicos.length}):`);
            comanda.servicos.forEach((servico, i) => {
              console.log(`  ${i + 1}. ${servico.nome} - R$ ${servico.preco} - Prof: ${servico.profissionalId?.name || 'NÃO DEFINIDO'}`);
            });
          }
          
          if (comanda.produtos && comanda.produtos.length > 0) {
            console.log(`Produtos (${comanda.produtos.length}):`);
            comanda.produtos.forEach((produto, i) => {
              console.log(`  ${i + 1}. ${produto.nome} - R$ ${produto.preco} - Vendedor: ${produto.vendidoPor || 'NÃO DEFINIDO'}`);
            });
          }
        });
        
        // Verificar métodos de pagamento únicos
        const metodosUnicos = [...new Set(comandasFinalizadas.map(c => c.metodoPagamento).filter(Boolean))];
        console.log(`\n💳 Métodos de pagamento encontrados: ${metodosUnicos.join(', ')}`);
        
        // Verificar profissionais únicos
        const profissionaisUnicos = new Set();
        comandasFinalizadas.forEach(comanda => {
          if (comanda.servicos) {
            comanda.servicos.forEach(servico => {
              if (servico.profissionalId?.name) {
                profissionaisUnicos.add(servico.profissionalId.name);
              }
            });
          }
          if (comanda.produtos) {
            comanda.produtos.forEach(produto => {
              if (produto.vendidoPor) {
                profissionaisUnicos.add(produto.vendidoPor);
              }
            });
          }
        });
        console.log(`\n👥 Profissionais únicos encontrados: ${Array.from(profissionaisUnicos).join(', ')}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

debugComandasGuapa();
