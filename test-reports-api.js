const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'guapa';

async function testReportsAPI() {
  if (!uri) {
    console.error('MONGODB_URI não está definida no .env.local');
    return;
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db(dbName);
    
    // Testar se as coleções existem
    const collections = await db.listCollections().toArray();
    console.log('📁 Coleções disponíveis:', collections.map(c => c.name));
    
    // Testar se há dados nas coleções principais
    const finalizacoesCount = await db.collection('finalizacoes').countDocuments();
    console.log('📊 Total de finalizações:', finalizacoesCount);
    
    const clientsCount = await db.collection('clients').countDocuments();
    console.log('👥 Total de clientes:', clientsCount);
    
    const professionalsCount = await db.collection('professionals').countDocuments();
    console.log('👨‍⚕️ Total de profissionais:', professionalsCount);
    
    const servicesCount = await db.collection('services').countDocuments();
    console.log('✂️ Total de serviços:', servicesCount);
    
    // Testar uma consulta simples
    if (finalizacoesCount > 0) {
      const sampleFinalizacao = await db.collection('finalizacoes').findOne();
      console.log('📋 Exemplo de finalização:', {
        id: sampleFinalizacao._id,
        clienteNome: sampleFinalizacao.clienteNome,
        valorTotal: sampleFinalizacao.valorTotal,
        dataFinalizacao: sampleFinalizacao.dataFinalizacao
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error);
  } finally {
    await client.close();
  }
}

testReportsAPI();
