const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function checkTestUser() {
  let client;
  try {
    console.log('🔍 Verificando usuário de teste...');
    
    // Conectar ao MongoDB
    client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa');
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    const collection = db.collection('professionals');
    
    // Buscar usuário teste
    const testUser = await collection.findOne({ 
      username: 'teste',
      isActive: true 
    });
    
    if (!testUser) {
      console.log('❌ Usuário teste não encontrado ou inativo');
      return;
    }
    
    console.log('👤 Usuário teste encontrado:');
    console.log('   - ID:', testUser._id);
    console.log('   - Username:', testUser.username);
    console.log('   - Name:', testUser.name);
    console.log('   - Role:', testUser.role);
    console.log('   - IsActive:', testUser.isActive);
    console.log('   - Password Hash:', testUser.password?.substring(0, 20) + '...');
    
    // Testar senha
    const testPassword = 'teste123';
    console.log('\n🔑 Testando senha...');
    console.log('   - Senha de teste:', testPassword);
    
    const isPasswordValid = await bcrypt.compare(testPassword, testUser.password);
    console.log('   - Senha válida:', isPasswordValid);
    
    if (isPasswordValid) {
      console.log('✅ Usuário de teste está funcionando corretamente!');
    } else {
      console.log('❌ Problema com a senha do usuário de teste');
      
      // Vamos recriar a senha
      console.log('\n🔧 Recriando senha...');
      const newPasswordHash = await bcrypt.hash(testPassword, 10);
      
      await collection.updateOne(
        { _id: testUser._id },
        { $set: { password: newPasswordHash } }
      );
      
      console.log('✅ Senha recriada com sucesso!');
      
      // Testar novamente
      const isNewPasswordValid = await bcrypt.compare(testPassword, newPasswordHash);
      console.log('   - Nova senha válida:', isNewPasswordValid);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Desconectado do MongoDB');
    }
  }
}

checkTestUser();
