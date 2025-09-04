const { MongoClient } = require('mongodb');

async function testFinanceiro() {
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
      comandas.forEach((comanda, index) => {
        console.log(`\n--- Comanda ${index + 1} ---`);
        console.log(`ID: ${comanda._id}`);
        console.log(`Status: ${comanda.status}`);
        console.log(`Valor Total: ${comanda.valorTotal}`);
        console.log(`Método Pagamento: ${comanda.metodoPagamento || 'NÃO DEFINIDO'}`);
        console.log(`Data Fim: ${comanda.dataFim || 'NÃO DEFINIDA'}`);
        console.log(`Updated At: ${comanda.updatedAt || 'NÃO DEFINIDO'}`);
        console.log(`Data Finalização: ${comanda.dataFinalizacao || 'NÃO DEFINIDA'}`);
      });
      
      // Verificar métodos de pagamento únicos
      const metodos = [...new Set(comandas.map(c => c.metodoPagamento).filter(Boolean))];
      console.log(`\n💳 Métodos de pagamento encontrados: ${metodos.join(', ')}`);
      
      // Verificar se há comandas com dataFim no período
      const hoje = new Date();
      const dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate());
      
      const comandasPeriodo = comandas.filter(c => {
        const dataFim = c.dataFim || c.updatedAt;
        return dataFim && dataFim >= dataInicio && dataFim <= hoje;
      });
      
      console.log(`\n📅 Comandas no período (último mês): ${comandasPeriodo.length}`);
      
      if (comandasPeriodo.length > 0) {
        console.log('\n🔍 Métodos de pagamento no período:');
        const metodosPeriodo = [...new Set(comandasPeriodo.map(c => c.metodoPagamento).filter(Boolean))];
        console.log(metodosPeriodo.join(', '));
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

testFinanceiro();
