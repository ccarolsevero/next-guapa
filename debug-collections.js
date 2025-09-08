const { MongoClient } = require('mongodb');

async function debugCollections() {
  const client = new MongoClient(
    'mongodb+srv://brunacanovas_db_user:amCzSzLUpD7P96gD@espacoguapa.npfnuuc.mongodb.net/?retryWrites=true&w=majority&appName=Espacoguapa',
  );

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db();

    // Listar todas as collections
    const collections = await db.listCollections().toArray();
    console.log('📋 Collections disponíveis:');
    collections.forEach((col, i) => {
      console.log(`${i + 1}. ${col.name}`);
    });

    // Verificar contagem de documentos em cada collection
    console.log('\n📊 Contagem de documentos por collection:');
    for (const col of collections) {
      try {
        const count = await db.collection(col.name).countDocuments();
        console.log(`${col.name}: ${count} documentos`);

        // Se há documentos, mostrar um exemplo
        if (count > 0) {
          const sample = await db.collection(col.name).findOne({});
          console.log(
            `  Exemplo de ${col.name}:`,
            JSON.stringify(sample, null, 2),
          );
        }
      } catch (error) {
        console.log(`${col.name}: Erro ao contar - ${error.message}`);
      }
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

debugCollections();
