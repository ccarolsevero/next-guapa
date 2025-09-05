const { MongoClient } = require('mongodb');
require('dotenv').config();

async function verificarCategoriaTeste() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    const servicesCollection = db.collection('services');
    
    // Buscar serviço temporário da categoria teste
    const tempService = await servicesCollection.findOne({ 
      name: { $regex: /\[CATEGORIA\] Categoria Teste/i }
    });
    
    if (tempService) {
      console.log('✅ Serviço temporário encontrado:', tempService);
    } else {
      console.log('❌ Serviço temporário não encontrado');
    }
    
    // Buscar todos os serviços com categoria "Categoria Teste"
    const servicesWithCategory = await servicesCollection.find({ 
      category: 'Categoria Teste' 
    }).toArray();
    
    console.log('📋 Serviços com categoria "Categoria Teste":', servicesWithCategory);
    
    // Buscar todas as categorias únicas
    const allServices = await servicesCollection.find({}).toArray();
    const uniqueCategories = [...new Set(allServices.map(service => service.category).filter(Boolean))];
    console.log('📋 Todas as categorias únicas:', uniqueCategories);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

verificarCategoriaTeste();
