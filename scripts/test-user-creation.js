const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function testUserCreation() {
  let client;
  try {
    console.log('🧪 Testando criação de usuários...');
    
    // Conectar ao MongoDB
    client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa');
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    const usersCollection = db.collection('users');
    const professionalsCollection = db.collection('professionals');
    
    // Verificar se existe a coleção users
    const collections = await db.listCollections().toArray();
    const hasUsersCollection = collections.some(col => col.name === 'users');
    const hasProfessionalsCollection = collections.some(col => col.name === 'professionals');
    
    console.log('📋 Coleções encontradas:');
    console.log('   - users:', hasUsersCollection ? 'Sim' : 'Não');
    console.log('   - professionals:', hasProfessionalsCollection ? 'Sim' : 'Não');
    
    // Testar criação de usuário na coleção users
    if (hasUsersCollection) {
      console.log('\n👤 Testando criação na coleção users...');
      
      const testUser = {
        name: 'Usuário Teste API',
        username: 'testeapi',
        password: await bcrypt.hash('teste123', 12),
        role: 'professional',
        canAccessFinancial: false,
        canAccessSiteEdit: false,
        canAccessGoals: false,
        canAccessReports: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Verificar se já existe
      const existingUser = await usersCollection.findOne({ username: 'testeapi' });
      if (existingUser) {
        console.log('   - Usuário testeapi já existe, removendo...');
        await usersCollection.deleteOne({ username: 'testeapi' });
      }
      
      // Criar novo usuário
      const result = await usersCollection.insertOne(testUser);
      console.log('   - Usuário criado com ID:', result.insertedId);
      
      // Verificar se foi criado
      const createdUser = await usersCollection.findOne({ _id: result.insertedId });
      console.log('   - Usuário encontrado:', createdUser ? 'Sim' : 'Não');
      if (createdUser) {
        console.log('   - Nome:', createdUser.name);
        console.log('   - Username:', createdUser.username);
        console.log('   - Role:', createdUser.role);
        console.log('   - IsActive:', createdUser.isActive);
      }
    }
    
    // Verificar usuários existentes
    console.log('\n📊 Usuários existentes:');
    
    if (hasUsersCollection) {
      const users = await usersCollection.find({}).toArray();
      console.log('   - Coleção users:', users.length, 'usuários');
      users.forEach(user => {
        console.log(`     * ${user.name} (${user.username}) - ${user.role} - ${user.isActive ? 'Ativo' : 'Inativo'}`);
      });
    }
    
    if (hasProfessionalsCollection) {
      const professionals = await professionalsCollection.find({}).toArray();
      console.log('   - Coleção professionals:', professionals.length, 'profissionais');
      professionals.forEach(prof => {
        console.log(`     * ${prof.name} (${prof.username}) - ${prof.role} - ${prof.isActive ? 'Ativo' : 'Inativo'}`);
      });
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

testUserCreation();
