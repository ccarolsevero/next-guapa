const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function testLoginDirect() {
  let client;
  try {
    console.log('🧪 Testando login direto no banco...');
    
    // Conectar ao MongoDB
    client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa');
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    const usersCollection = db.collection('users');
    
    // Testar login do Bruna
    console.log('\n🔐 Testando login do Bruna...');
    const brunaUser = await usersCollection.findOne({ 
      username: 'bruna',
      isActive: true 
    });
    
    if (brunaUser) {
      console.log('✅ Usuário Bruna encontrado');
      console.log('   - Nome:', brunaUser.name);
      console.log('   - Username:', brunaUser.username);
      console.log('   - Role:', brunaUser.role);
      console.log('   - Ativo:', brunaUser.isActive);
      console.log('   - Hash da senha:', brunaUser.password?.substring(0, 20) + '...');
      
      // Testar senha
      const isPasswordValid = await bcrypt.compare('bruna123', brunaUser.password);
      console.log('   - Senha bruna123 válida:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('   - Testando senha admin123...');
        const isPasswordValid2 = await bcrypt.compare('admin123', brunaUser.password);
        console.log('   - Senha admin123 válida:', isPasswordValid2);
      }
    } else {
      console.log('❌ Usuário Bruna não encontrado');
    }
    
    // Testar login do Teste
    console.log('\n🔐 Testando login do Teste...');
    const testeUser = await usersCollection.findOne({ 
      username: 'teste',
      isActive: true 
    });
    
    if (testeUser) {
      console.log('✅ Usuário Teste encontrado');
      console.log('   - Nome:', testeUser.name);
      console.log('   - Username:', testeUser.username);
      console.log('   - Role:', testeUser.role);
      console.log('   - Ativo:', testeUser.isActive);
      console.log('   - Hash da senha:', testeUser.password?.substring(0, 20) + '...');
      
      // Testar senha
      const isPasswordValid = await bcrypt.compare('teste123', testeUser.password);
      console.log('   - Senha teste123 válida:', isPasswordValid);
    } else {
      console.log('❌ Usuário Teste não encontrado');
    }
    
    // Listar todos os usuários para debug
    console.log('\n📋 Todos os usuários na coleção users:');
    const allUsers = await usersCollection.find({}).toArray();
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.username}) - ${user.role} - Ativo: ${user.isActive}`);
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

testLoginDirect();
