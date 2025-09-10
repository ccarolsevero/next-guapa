const mongoose = require('mongoose');

// Conectar ao MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://brunacanovas_db_user:amCzSzLUpD7P96gD@espacoguapa.npfnuuc.mongodb.net/?retryWrites=true&w=majority&appName=Espacoguapa';

async function checkIsActive() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado ao MongoDB com sucesso!');

    const db = mongoose.connection.db;
    const servicesCollection = db.collection('services');
    
    // Verificar todos os serviços
    const allServices = await servicesCollection.find({}).toArray();
    console.log(`\n📊 Total de serviços: ${allServices.length}`);
    
    // Verificar serviços com isActive = true
    const activeServices = await servicesCollection.find({ isActive: true }).toArray();
    console.log(`📊 Serviços com isActive: true: ${activeServices.length}`);
    
    // Verificar serviços com isActive = false
    const inactiveServices = await servicesCollection.find({ isActive: false }).toArray();
    console.log(`📊 Serviços com isActive: false: ${inactiveServices.length}`);
    
    // Verificar serviços sem campo isActive
    const servicesWithoutIsActive = await servicesCollection.find({ isActive: { $exists: false } }).toArray();
    console.log(`📊 Serviços sem campo isActive: ${servicesWithoutIsActive.length}`);
    
    // Mostrar alguns exemplos
    console.log('\n📋 Exemplos de serviços:');
    allServices.slice(0, 3).forEach((service, index) => {
      console.log(`${index + 1}. ${service.name} - isActive: ${service.isActive} (tipo: ${typeof service.isActive})`);
    });
    
    // Verificar tipos de dados
    const isActiveTypes = await servicesCollection.aggregate([
      { $group: { _id: { isActive: "$isActive", type: { $type: "$isActive" } }, count: { $sum: 1 } } }
    ]).toArray();
    
    console.log('\n📊 Tipos de dados para isActive:');
    isActiveTypes.forEach(item => {
      console.log(`- Valor: ${item._id.isActive}, Tipo: ${item._id.type}, Quantidade: ${item.count}`);
    });

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDesconectado do MongoDB');
  }
}

// Executar a verificação
checkIsActive();
