const { MongoClient } = require('mongodb');

async function checkDatabaseInfo() {
  let client;
  try {
    console.log('🔍 Verificando informações do banco...');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa';
    console.log('🔗 MongoDB URI:', mongoUri);
    
    client = new MongoClient(mongoUri);
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    
    // Verificar informações do banco
    const adminDb = client.db().admin();
    const serverInfo = await adminDb.serverStatus();
    console.log('📊 Informações do servidor:');
    console.log('   - Host:', serverInfo.host);
    console.log('   - Version:', serverInfo.version);
    console.log('   - Uptime:', Math.floor(serverInfo.uptime / 3600), 'horas');
    
    // Listar todas as coleções
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Coleções no banco "guapa":');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Verificar usuários na coleção users
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`\n👥 Total de usuários na coleção "users": ${userCount}`);
    
    if (userCount > 0) {
      const users = await usersCollection.find({}).toArray();
      console.log('📋 Usuários:');
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.username}) - ${user.role} - Ativo: ${user.isActive}`);
      });
    }
    
    // Verificar se há outras coleções com usuários
    const professionalsCollection = db.collection('professionals');
    const professionalCount = await professionalsCollection.countDocuments();
    console.log(`\n👨‍💼 Total de profissionais na coleção "professionals": ${professionalCount}`);
    
    if (professionalCount > 0) {
      const professionals = await professionalsCollection.find({}).toArray();
      console.log('📋 Profissionais:');
      professionals.forEach((prof, index) => {
        console.log(`   ${index + 1}. ${prof.name} (${prof.username}) - ${prof.role} - Ativo: ${prof.isActive}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Desconectado do MongoDB');
    }
  }
}

checkDatabaseInfo();
