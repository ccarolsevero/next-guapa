const { MongoClient } = require('mongodb');

async function debugEspacoGuapa() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    // Conectar ao banco 'espaco-guapa'
    console.log('\n🔍 Conectando ao banco "espaco-guapa"...');
    const db = client.db('espaco-guapa');
    
    // Listar coleções
    const colecoes = await db.listCollections().toArray();
    console.log(`\n📚 Coleções em "espaco-guapa": ${colecoes.length}`);
    
    if (colecoes.length > 0) {
      colecoes.forEach(colecao => {
        console.log(`  - ${colecao.name}`);
      });
      
      // Verificar se há comandas
      if (colecoes.some(c => c.name === 'comandas')) {
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
        }
      }
      
      // Verificar outras coleções relacionadas
      const colecoesRelacionadas = ['orders', 'finalizacoes', 'faturamento', 'comissoes'];
      for (const nome of colecoesRelacionadas) {
        if (colecoes.some(c => c.name === nome)) {
          const count = await db.collection(nome).countDocuments();
          console.log(`\n📊 ${nome}: ${count} documentos`);
        }
      }
      
    } else {
      console.log('❌ Nenhuma coleção encontrada no banco "espaco-guapa"');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

debugEspacoGuapa();
