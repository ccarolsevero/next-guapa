const mongoose = require('mongoose');

// Conectar ao MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://brunacanovas_db_user:amCzSzLUpD7P96gD@espacoguapa.npfnuuc.mongodb.net/?retryWrites=true&w=majority&appName=Espacoguapa';

async function checkCollections() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado ao MongoDB com sucesso!');

    const db = mongoose.connection.db;
    
    // Listar todas as coleções
    const collections = await db.listCollections().toArray();
    console.log('\n📂 Coleções encontradas:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Verificar especificamente a coleção 'services'
    const servicesCollection = db.collection('services');
    const serviceCount = await servicesCollection.countDocuments();
    console.log(`\n📊 Documentos na coleção 'services': ${serviceCount}`);

    if (serviceCount > 0) {
      const sampleService = await servicesCollection.findOne();
      console.log('\n📋 Exemplo de serviço:');
      console.log(JSON.stringify(sampleService, null, 2));
    }

    // Verificar se há diferença entre 'services' e 'Services' (case sensitive)
    const ServicesCollection = db.collection('Services');
    const ServicesCount = await ServicesCollection.countDocuments();
    console.log(`\n📊 Documentos na coleção 'Services': ${ServicesCount}`);

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDesconectado do MongoDB');
  }
}

// Executar a verificação
checkCollections();
