const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'guapa';

async function checkFinalizacoesStructure() {
  if (!uri) {
    console.error('MONGODB_URI não está definida no .env.local');
    return;
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db(dbName);
    
    // Buscar todas as finalizações para ver a estrutura
    const finalizacoes = await db.collection('finalizacoes').find({}).toArray();
    console.log('📊 Total de finalizações encontradas:', finalizacoes.length);
    
    if (finalizacoes.length > 0) {
      console.log('📋 Estrutura da primeira finalização:');
      console.log(JSON.stringify(finalizacoes[0], null, 2));
      
      console.log('\n📋 Estrutura da segunda finalização (se existir):');
      if (finalizacoes[1]) {
        console.log(JSON.stringify(finalizacoes[1], null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error);
  } finally {
    await client.close();
  }
}

checkFinalizacoesStructure();
