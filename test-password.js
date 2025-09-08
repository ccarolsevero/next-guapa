const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function testPassword() {
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
      
      // Testar senha
      console.log('\n🔐 Testando senha...');
      const isPasswordValid = await bcrypt.compare('bruna123', bruna.password);
      console.log('✅ Senha válida:', isPasswordValid);
      
      // Testar outras senhas
      const testPasswords = ['bruna', '123456', 'admin', 'password'];
      for (const testPassword of testPasswords) {
        const isValid = await bcrypt.compare(testPassword, bruna.password);
        console.log(`   "${testPassword}": ${isValid ? '✅' : '❌'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
    console.log('🔌 Desconectado do MongoDB');
  }
}

testPassword();
