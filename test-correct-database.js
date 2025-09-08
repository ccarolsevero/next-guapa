const { MongoClient } = require('mongodb');

async function testCorrectDatabase() {
  // String de conexão corrigida com o banco 'guapa'
  const client = new MongoClient(
    'mongodb+srv://brunacanovas_db_user:amCzSzLUpD7P96gD@espacoguapa.npfnuuc.mongodb.net/guapa?retryWrites=true&w=majority&appName=Espacoguapa',
  );

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db('guapa');
    console.log(`🎯 Banco atual: ${db.databaseName}`);

    // Verificar finalizações
    const finalizacoes = await db.collection('finalizacoes').find({}).limit(3).toArray();
    console.log(`\n📋 Finalizações encontradas: ${finalizacoes.length}`);
    finalizacoes.forEach((f, i) => {
      console.log(`\n--- Finalização ${i + 1} ---`);
      console.log('Cliente ID:', f.clienteId);
      console.log('Data:', f.dataCriacao);
      console.log('Serviços:', JSON.stringify(f.servicos, null, 2));
    });

    // Verificar comandas
    const comandas = await db.collection('comandas').find({}).limit(3).toArray();
    console.log(`\n📋 Comandas encontradas: ${comandas.length}`);
    comandas.forEach((c, i) => {
      console.log(`\n--- Comanda ${i + 1} ---`);
      console.log('Cliente ID:', c.clienteId);
      console.log('Data:', c.dataCriacao);
      console.log('Serviços:', JSON.stringify(c.servicos, null, 2));
    });

    // Verificar appointments
    const appointments = await db.collection('appointments').find({}).limit(3).toArray();
    console.log(`\n📅 Appointments encontrados: ${appointments.length}`);
    appointments.forEach((a, i) => {
      console.log(`\n--- Appointment ${i + 1} ---`);
      console.log('Cliente ID:', a.clienteId);
      console.log('Data:', a.data);
      console.log('Status:', a.status);
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

testCorrectDatabase();
