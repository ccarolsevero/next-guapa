const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function testProductionUsers() {
  let client;
  try {
    console.log('🧪 Testando usuários de produção...');
    
    // Conectar ao MongoDB
    client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa');
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    const usersCollection = db.collection('users');
    
    // Buscar os usuários de produção
    const productionUsers = ['ellenzona', 'vitoriona', 'cicera', 'felipe'];
    
    for (const username of productionUsers) {
      const user = await usersCollection.findOne({ username });
      if (user) {
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
          user.username,
          user.username + '123',
          user.name.toLowerCase(),
          user.name.toLowerCase() + '123',
          'senha123',
          '123'
        ];
        
        console.log('   🔑 Testando senhas comuns:');
        let foundPassword = false;
        for (const password of commonPasswords) {
          try {
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid) {
              console.log(`   ✅ Senha válida: "${password}"`);
              foundPassword = true;
              break;
            }
          } catch (error) {
            // Ignorar erros de comparação
          }
        }
        
        if (!foundPassword) {
          console.log('   ❌ Nenhuma senha comum funcionou');
        }
      } else {
        console.log(`❌ Usuário ${username} não encontrado`);
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

testProductionUsers();
