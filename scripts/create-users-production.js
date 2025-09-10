const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createUsersProduction() {
  let client;
  try {
    console.log('🚀 Criando usuários na produção...');
    
    // Conectar ao MongoDB
    client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa');
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    const usersCollection = db.collection('users');
    
    // Limpar usuários existentes
    console.log('🧹 Limpando usuários existentes...');
    await usersCollection.deleteMany({});
    
    // Criar usuários
    const users = [
      {
        name: 'Bruna Admin',
        username: 'bruna',
        password: await bcrypt.hash('bruna123', 12),
        role: 'admin',
        canAccessFinancial: true,
        canAccessSiteEdit: true,
        canAccessGoals: true,
        canAccessReports: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Usuário Teste Admin',
        username: 'teste',
        password: await bcrypt.hash('teste123', 12),
        role: 'professional',
        canAccessFinancial: false,
        canAccessSiteEdit: false,
        canAccessGoals: false,
        canAccessReports: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    console.log('👥 Criando usuários...');
    const result = await usersCollection.insertMany(users);
    console.log('✅ Usuários criados:', result.insertedIds);
    
    // Verificar se foram criados
    const createdUsers = await usersCollection.find({}).toArray();
    console.log('📋 Usuários criados:');
    createdUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.username}) - ${user.role} - Ativo: ${user.isActive}`);
    });
    
    // Testar login
    console.log('\n🧪 Testando login...');
    const brunaUser = await usersCollection.findOne({ username: 'bruna' });
    const isPasswordValid = await bcrypt.compare('bruna123', brunaUser.password);
    console.log('   - Bruna login válido:', isPasswordValid);
    
    const testeUser = await usersCollection.findOne({ username: 'teste' });
    const isPasswordValid2 = await bcrypt.compare('teste123', testeUser.password);
    console.log('   - Teste login válido:', isPasswordValid2);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Desconectado do MongoDB');
    }
  }
}

createUsersProduction();
