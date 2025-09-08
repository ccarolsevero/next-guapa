const { MongoClient } = require('mongodb');

async function testSimpleAPI() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa');
  
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    
    // Testar agregação simples
    console.log('🧪 Testando agregação simples...');
    
    const result = await db.collection('finalizacoes').aggregate([
      {
        $match: {
          dataCriacao: { $gte: new Date('2024-01-01'), $lte: new Date() }
        }
      },
      {
        $unwind: '$produtos'
      }
    ]).toArray();
    
    console.log('✅ Agregação executada com sucesso');
    console.log('📊 Resultados:', result.length);
    
  } catch (error) {
    console.error('❌ Erro na agregação:', error);
  } finally {
    await client.close();
    console.log('🔌 Desconectado do MongoDB');
  }
}

testSimpleAPI();
