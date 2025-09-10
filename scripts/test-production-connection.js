const { MongoClient } = require('mongodb');

async function testProductionConnection() {
  let client;
  try {
    console.log('🔍 Testando conexão com produção...');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa';
    console.log('🔗 MongoDB URI:', mongoUri);
    
    client = new MongoClient(mongoUri);
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    const usersCollection = db.collection('users');
    
    // Verificar se a coleção users existe
    const collections = await db.listCollections().toArray();
    console.log('📁 Coleções disponíveis:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Verificar usuários
    const userCount = await usersCollection.countDocuments();
    console.log(`\n👥 Total de usuários na coleção users: ${userCount}`);
    
    if (userCount > 0) {
      const users = await usersCollection.find({}).toArray();
      console.log('📋 Usuários encontrados:');
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.username}) - ${user.role} - Ativo: ${user.isActive}`);
      });
      
      // Verificar especificamente o usuário bruna
      const brunaUser = await usersCollection.findOne({ username: 'bruna' });
      if (brunaUser) {
        console.log('\n✅ Usuário Bruna encontrado:');
        console.log(`   - Nome: ${brunaUser.name}`);
        console.log(`   - Username: ${brunaUser.username}`);
        console.log(`   - Role: ${brunaUser.role}`);
        console.log(`   - Ativo: ${brunaUser.isActive}`);
        console.log(`   - Hash da senha: ${brunaUser.password?.substring(0, 20)}...`);
      } else {
        console.log('\n❌ Usuário Bruna NÃO encontrado');
      }
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

testProductionConnection();
