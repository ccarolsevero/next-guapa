const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testarCriacaoCategoria() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    const servicesCollection = db.collection('services');
    
    // Verificar se categoria já existe
    const existingService = await servicesCollection.findOne({ 
      category: { $regex: new RegExp(`^Teste Categoria$`, 'i') } 
    });
    
    if (existingService) {
      console.log('❌ Categoria já existe:', existingService);
      return;
    }
    
    // Tentar criar serviço temporário
    const tempService = {
      name: '[CATEGORIA] Teste Categoria',
      description: 'Categoria: Teste Categoria',
      price: 0,
      category: 'Teste Categoria',
      duration: 60,
      isActive: false,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('📝 Tentando criar serviço temporário:', tempService);
    
    const result = await servicesCollection.insertOne(tempService);
    console.log('✅ Serviço criado com sucesso:', result.insertedId);
    
    // Verificar se foi criado
    const createdService = await servicesCollection.findOne({ _id: result.insertedId });
    console.log('📋 Serviço criado:', createdService);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

testarCriacaoCategoria();
