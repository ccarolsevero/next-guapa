require('dotenv').config();
const { MongoClient } = require('mongodb');

async function checkServicesDB() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    console.log('🔌 Conectando ao MongoDB...');
    await client.connect();

    const db = client.db(process.env.DB_NAME || 'guapa');
    const servicesCollection = db.collection('services');

    console.log('📊 === VERIFICAÇÃO DE SERVIÇOS NO BANCO ===\n');

    // 1. Contar total de serviços
    const totalServices = await servicesCollection.countDocuments();
    console.log(`📈 Total de serviços no banco: ${totalServices}`);

    if (totalServices === 0) {
      console.log('⚠️  Nenhum serviço encontrado no banco!');
      console.log('💡 Você precisa cadastrar serviços primeiro.');
      return;
    }

    // 2. Verificar serviços ativos
    const activeServices = await servicesCollection.countDocuments({
      isActive: true,
    });
    console.log(`✅ Serviços ativos: ${activeServices}`);

    // 3. Verificar serviços inativos
    const inactiveServices = await servicesCollection.countDocuments({
      isActive: false,
    });
    console.log(`❌ Serviços inativos: ${inactiveServices}`);

    // 4. Listar todos os serviços
    console.log('\n📋 === LISTA DE TODOS OS SERVIÇOS ===');
    const allServices = await servicesCollection.find({}).toArray();

    allServices.forEach((service, index) => {
      console.log(`${index + 1}. ${service.name}`);
      console.log(`   - Categoria: ${service.category || 'Não definida'}`);
      console.log(`   - Preço: R$ ${service.price || 'Não definido'}`);
      console.log(`   - Ativo: ${service.isActive ? '✅ Sim' : '❌ Não'}`);
      console.log(`   - ID: ${service._id}`);
      console.log('');
    });

    // 5. Verificar estrutura dos documentos
    if (allServices.length > 0) {
      const firstService = allServices[0];
      console.log('🔍 === ESTRUTURA DO PRIMEIRO SERVIÇO ===');
      console.log(JSON.stringify(firstService, null, 2));
    }
  } catch (error) {
    console.error('❌ Erro ao verificar serviços:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Conexão fechada.');
  }
}

// Executar verificação
checkServicesDB();
