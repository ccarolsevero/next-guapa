const { MongoClient } = require('mongodb');

async function checkProfessionals() {
  let client;
  try {
    console.log('🔍 Verificando profissionais na coleção professionals...');
    
    // Conectar ao MongoDB
    client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa');
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    const professionalsCollection = db.collection('professionals');
    
    // Buscar todos os profissionais
    const professionals = await professionalsCollection.find({}).toArray();
    console.log(`\n👥 Total de profissionais: ${professionals.length}`);
    
    professionals.forEach((prof, index) => {
      console.log(`\n${index + 1}. ${prof.name}`);
      console.log(`   - Username: ${prof.username}`);
      console.log(`   - Título: ${prof.title || 'N/A'}`);
      console.log(`   - Email: ${prof.email || 'N/A'}`);
      console.log(`   - Ativo: ${prof.isActive}`);
      console.log(`   - Destaque: ${prof.isFeatured || false}`);
      console.log(`   - ID: ${prof._id}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Desconectado do MongoDB');
    }
  }
}

checkProfessionals();
