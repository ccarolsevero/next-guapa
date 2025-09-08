const { MongoClient } = require('mongodb');

async function checkBrunaDirect() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa');
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    const collection = db.collection('professionals');
    
    // Buscar a Bruna
    const bruna = await collection.findOne({ name: /bruna/i });
    console.log('👤 Bruna encontrada:', bruna ? 'Sim' : 'Não');
    
    if (bruna) {
      console.log('📋 Dados da Bruna:');
      console.log('   Nome:', bruna.name);
      console.log('   Username:', bruna.username);
      console.log('   Role:', bruna.role);
      console.log('   isActive:', bruna.isActive);
      console.log('   Tem senha:', !!bruna.password);
      console.log('   Senha hash:', bruna.password ? bruna.password.substring(0, 20) + '...' : 'N/A');
    }
    
    // Listar todos os profissionais
    const allProfessionals = await collection.find({}).toArray();
    console.log('\n📋 Todos os profissionais:');
    allProfessionals.forEach(prof => {
      console.log(`   - ${prof.name} (${prof.username}) - ${prof.role} - Ativo: ${prof.isActive} - Senha: ${!!prof.password}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
    console.log('🔌 Desconectado do MongoDB');
  }
}

checkBrunaDirect();
