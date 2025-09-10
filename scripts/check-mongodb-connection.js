const { MongoClient } = require('mongodb');

async function checkMongoDBConnection() {
  let client;
  try {
    console.log('🔍 Verificando conexão MongoDB...');
    
    // Usar a mesma URI que a API usa
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa';
    console.log('🔗 MongoDB URI configurada:', mongoUri ? 'Sim' : 'Não');
    console.log('🔗 MongoDB URI (primeiros 20 chars):', mongoUri?.substring(0, 20) + '...');
    
    client = new MongoClient(mongoUri);
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    const usersCollection = db.collection('users');
    
    // Verificar se a coleção users existe e tem dados
    const userCount = await usersCollection.countDocuments();
    console.log('📊 Total de usuários na coleção users:', userCount);
    
    if (userCount > 0) {
      const users = await usersCollection.find({}).toArray();
      console.log('👥 Usuários encontrados:');
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.username}) - ${user.role} - Ativo: ${user.isActive}`);
      });
      
      // Testar busca específica
      console.log('\n🔍 Testando busca específica:');
      const brunaUser = await usersCollection.findOne({ 
        username: 'bruna',
        isActive: true 
      });
      console.log('   - Bruna encontrada:', brunaUser ? 'Sim' : 'Não');
      
      const testeUser = await usersCollection.findOne({ 
        username: 'teste',
        isActive: true 
      });
      console.log('   - Teste encontrado:', testeUser ? 'Sim' : 'Não');
    } else {
      console.log('❌ Nenhum usuário encontrado na coleção users');
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão MongoDB:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Desconectado do MongoDB');
    }
  }
}

checkMongoDBConnection();
