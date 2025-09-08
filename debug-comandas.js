const { MongoClient } = require('mongodb');

async function debugComandas() {
  const client = new MongoClient(
    'mongodb+srv://brunacanovas_db_user:amCzSzLUpD7P96gD@espacoguapa.npfnuuc.mongodb.net/?retryWrites=true&w=majority&appName=Espacoguapa',
  );

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db();

    // Verificar comandas
    const comandas = await db
      .collection('comandas')
      .find({})
      .limit(3)
      .toArray();
    console.log('📋 Comandas encontradas:', comandas.length);
    comandas.forEach((c, i) => {
      console.log(`\n--- Comanda ${i + 1} ---`);
      console.log(JSON.stringify(c, null, 2));
    });

    // Verificar appointments
    const appointments = await db
      .collection('appointments')
      .find({})
      .limit(3)
      .toArray();
    console.log('\n📅 Appointments encontrados:', appointments.length);
    appointments.forEach((a, i) => {
      console.log(`\n--- Appointment ${i + 1} ---`);
      console.log(JSON.stringify(a, null, 2));
    });

    // Verificar se há alguma collection com dados de serviços realizados
    const collections = await db.listCollections().toArray();
    console.log('\n🔍 Verificando outras collections...');

    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      if (count > 0) {
        const sample = await db.collection(col.name).findOne({});
        console.log(`\n${col.name} (${count} docs):`);
        console.log(JSON.stringify(sample, null, 2));
      }
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

debugComandas();
