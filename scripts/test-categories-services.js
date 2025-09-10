const { MongoClient } = require('mongodb');

async function testCategoriesAndServices() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db('guapa');

    // Testar categorias
    console.log('\n📋 Testando categorias...');
    const serviceCategoriesCollection = db.collection('servicecategories');
    const categories = await serviceCategoriesCollection.find({}).toArray();
    console.log(`📊 Total de categorias: ${categories.length}`);

    if (categories.length > 0) {
      console.log('📋 Categorias encontradas:');
      categories.forEach((cat) => {
        console.log(`  - ${cat.name} (${cat.isActive ? 'Ativa' : 'Inativa'})`);
      });
    }

    // Testar serviços
    console.log('\n🔧 Testando serviços...');
    const servicesCollection = db.collection('services');
    const services = await servicesCollection.find({}).toArray();
    console.log(`📊 Total de serviços: ${services.length}`);

    const activeServices = await servicesCollection
      .find({ isActive: true })
      .toArray();
    console.log(`📊 Serviços ativos: ${activeServices.length}`);

    if (activeServices.length > 0) {
      console.log('📋 Serviços ativos encontrados:');
      activeServices.forEach((service) => {
        console.log(
          `  - ${service.name} (${service.category}) - R$ ${service.price}`,
        );
      });
    }

    // Verificar categorias únicas dos serviços
    const uniqueCategories = [
      ...new Set(services.map((s) => s.category).filter(Boolean)),
    ];
    console.log(
      `\n📋 Categorias únicas dos serviços: ${uniqueCategories.length}`,
    );
    uniqueCategories.forEach((cat) => {
      console.log(`  - ${cat}`);
    });
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Conexão fechada');
  }
}

// Executar teste
testCategoriesAndServices();
