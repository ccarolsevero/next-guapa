const { MongoClient } = require('mongodb');
require('dotenv').config();

async function verificarCategoriaTesteee() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    const servicesCollection = db.collection('services');
    
    // Buscar todos os serviços com categoria "testeee"
    const servicesWithCategory = await servicesCollection.find({ 
      category: 'testeee' 
    }).toArray();
    
    console.log('📋 Serviços com categoria "testeee":', servicesWithCategory);
    
    // Verificar se há serviços ativos
    const activeServices = await servicesCollection.find({ 
      category: 'testeee',
      isActive: true 
    }).toArray();
    
    console.log('📋 Serviços ativos com categoria "testeee":', activeServices);
    
    // Verificar se há serviços inativos
    const inactiveServices = await servicesCollection.find({ 
      category: 'testeee',
      isActive: false 
    }).toArray();
    
    console.log('📋 Serviços inativos com categoria "testeee":', inactiveServices);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

verificarCategoriaTesteee();
