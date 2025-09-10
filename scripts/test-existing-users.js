const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function testExistingUsers() {
  let client;
  try {
    console.log('🧪 Testando usuários existentes no banco...');
    
    // Conectar ao MongoDB
    client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa');
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    const usersCollection = db.collection('users');
    
    // Buscar todos os usuários
    const users = await usersCollection.find({}).toArray();
    console.log('👥 Usuários encontrados:');
    
    for (const user of users) {
      console.log(`\n📋 ${user.name} (${user.username})`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Ativo: ${user.isActive}`);
      console.log(`   - Hash da senha: ${user.password?.substring(0, 20)}...`);
      
      // Testar senhas comuns
      const commonPasswords = [
        '123456',
        'password',
        'admin',
        'admin123',
        'bruna123',
        'teste123',
        user.username,
        user.username + '123',
        user.name.toLowerCase(),
        user.name.toLowerCase() + '123'
      ];
      
      console.log('   🔑 Testando senhas comuns:');
      for (const password of commonPasswords) {
        try {
          const isValid = await bcrypt.compare(password, user.password);
          if (isValid) {
            console.log(`   ✅ Senha válida: "${password}"`);
            break;
          }
        } catch (error) {
          // Ignorar erros de comparação
        }
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

testExistingUsers();
