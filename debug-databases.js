const { MongoClient } = require('mongodb');

async function debugDatabases() {
  const client = new MongoClient(
    'mongodb+srv://brunacanovas_db_user:amCzSzLUpD7P96gD@espacoguapa.npfnuuc.mongodb.net/?retryWrites=true&w=majority&appName=Espacoguapa',
  );

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    // Listar todos os bancos de dados
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();
    
    console.log('📋 Bancos de dados disponíveis:');
    databases.databases.forEach((db, i) => {
      console.log(`${i + 1}. ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });

    // Verificar qual banco estamos usando atualmente
    const currentDb = client.db();
    console.log(`\n🎯 Banco atual: ${currentDb.databaseName}`);

    // Verificar se há dados em outros bancos
    console.log('\n🔍 Verificando collections em outros bancos...');
    
    for (const dbInfo of databases.databases) {
      if (dbInfo.name !== 'admin' && dbInfo.name !== 'local') {
        const db = client.db(dbInfo.name);
        const collections = await db.listCollections().toArray();
        
        console.log(`\n📊 Banco: ${dbInfo.name}`);
        for (const col of collections) {
          const count = await db.collection(col.name).countDocuments();
          console.log(`  - ${col.name}: ${count} documentos`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

debugDatabases();
