const { MongoClient } = require('mongodb');

async function testUsersAPI() {
  let client;
  try {
    console.log('🧪 Testando API de usuários...');
    
    // Conectar ao MongoDB
    client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa');
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    const usersCollection = db.collection('users');
    
    // Simular o que a API /api/users faz
    console.log('\n📋 Testando GET /api/users...');
    const users = await usersCollection.find({}).project({ password: 0 }).toArray();
    
    console.log(`✅ Encontrados ${users.length} usuários:`);
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name} (${user.username})`);
      console.log(`   - ID: ${user._id}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Ativo: ${user.isActive ? 'Sim' : 'Não'}`);
      console.log(`   - Financeiro: ${user.canAccessFinancial ? 'Sim' : 'Não'}`);
      console.log(`   - Editar Site: ${user.canAccessSiteEdit ? 'Sim' : 'Não'}`);
      console.log(`   - Metas: ${user.canAccessGoals ? 'Sim' : 'Não'}`);
      console.log(`   - Relatórios: ${user.canAccessReports ? 'Sim' : 'Não'}`);
      console.log(`   - Criado em: ${user.createdAt ? new Date(user.createdAt).toLocaleString('pt-BR') : 'N/A'}`);
      console.log(`   - Último login: ${user.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR') : 'Nunca'}`);
    });
    
    // Testar criação de novo usuário
    console.log('\n🧪 Testando criação de usuário...');
    const testUser = {
      name: 'Usuário Teste API',
      username: 'testeapi',
      password: 'teste123',
      role: 'professional',
      canAccessFinancial: false,
      canAccessSiteEdit: false,
      canAccessGoals: false,
      canAccessReports: false,
      isActive: true
    };
    
    // Verificar se já existe
    const existingUser = await usersCollection.findOne({ username: 'testeapi' });
    if (existingUser) {
      console.log('   - Usuário testeapi já existe, removendo...');
      await usersCollection.deleteOne({ username: 'testeapi' });
    }
    
    // Simular o que a API POST /api/users faz
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(testUser.password, 12);
    
    const newUser = {
      ...testUser,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await usersCollection.insertOne(newUser);
    console.log(`   - Usuário criado com ID: ${result.insertedId}`);
    
    // Verificar se foi criado
    const createdUser = await usersCollection.findOne({ _id: result.insertedId }, { projection: { password: 0 } });
    if (createdUser) {
      console.log(`   - ✅ Usuário criado com sucesso: ${createdUser.name}`);
    }
    
    // Listar todos os usuários novamente
    console.log('\n📋 Usuários após criação:');
    const allUsers = await usersCollection.find({}).project({ password: 0 }).toArray();
    console.log(`   - Total: ${allUsers.length} usuários`);
    allUsers.forEach(user => {
      console.log(`     * ${user.name} (${user.username}) - ${user.role}`);
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

testUsersAPI();
