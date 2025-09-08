const { MongoClient } = require('mongodb');

async function debugFinalizacoes() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/nextjs-guapa');
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db();
    
    // Verificar se existem finalizações
    const finalizacoes = await db.collection('finalizacoes').find({}).limit(5).toArray();
    console.log('📊 Total de finalizações:', await db.collection('finalizacoes').countDocuments());
    console.log('📋 Primeiras 5 finalizações:', JSON.stringify(finalizacoes, null, 2));
    
    // Verificar se existem agendamentos
    const agendamentos = await db.collection('agendamentos').find({}).limit(5).toArray();
    console.log('📅 Total de agendamentos:', await db.collection('agendamentos').countDocuments());
    console.log('📋 Primeiros 5 agendamentos:', JSON.stringify(agendamentos, null, 2));
    
    // Verificar se existem clientes
    const clientes = await db.collection('clients').find({}).limit(5).toArray();
    console.log('👥 Total de clientes:', await db.collection('clients').countDocuments());
    console.log('📋 Primeiros 5 clientes:', JSON.stringify(clientes, null, 2));
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

debugFinalizacoes();
