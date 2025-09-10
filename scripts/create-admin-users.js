const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createAdminUsers() {
  let client;
  try {
    console.log('👥 Criando usuários de administração...');
    
    // Conectar ao MongoDB
    client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa');
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    const usersCollection = db.collection('users');
    
    // Verificar se a coleção users existe, se não, criar
    const collections = await db.listCollections().toArray();
    const hasUsersCollection = collections.some(col => col.name === 'users');
    
    if (!hasUsersCollection) {
      console.log('📋 Criando coleção users...');
      await db.createCollection('users');
    }
    
    // Criar usuário de teste para admin
    const testUser = {
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
    };
    
    // Verificar se já existe
    const existingUser = await usersCollection.findOne({ username: 'teste' });
    if (existingUser) {
      console.log('👤 Usuário teste já existe, atualizando...');
      await usersCollection.updateOne(
        { username: 'teste' },
        { 
          $set: {
            ...testUser,
            updatedAt: new Date()
          }
        }
      );
    } else {
      console.log('👤 Criando usuário teste...');
      await usersCollection.insertOne(testUser);
    }
    
    // Criar usuário admin principal
    const adminUser = {
      name: 'Bruna Admin',
      username: 'bruna',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin',
      canAccessFinancial: true,
      canAccessSiteEdit: true,
      canAccessGoals: true,
      canAccessReports: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Verificar se já existe
    const existingAdmin = await usersCollection.findOne({ username: 'bruna' });
    if (existingAdmin) {
      console.log('👤 Admin Bruna já existe, atualizando...');
      await usersCollection.updateOne(
        { username: 'bruna' },
        { 
          $set: {
            ...adminUser,
            updatedAt: new Date()
          }
        }
      );
    } else {
      console.log('👤 Criando admin Bruna...');
      await usersCollection.insertOne(adminUser);
    }
    
    // Listar usuários criados
    const users = await usersCollection.find({}).project({ password: 0 }).toArray();
    console.log('\n📊 Usuários de administração:');
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.username}) - ${user.role} - ${user.isActive ? 'Ativo' : 'Inativo'}`);
    });
    
    console.log('\n🎉 Usuários de administração configurados!');
    console.log('\n📋 Credenciais de teste:');
    console.log('   - Username: teste');
    console.log('   - Senha: teste123');
    console.log('   - Role: professional');
    
    console.log('\n📋 Credenciais admin:');
    console.log('   - Username: bruna');
    console.log('   - Senha: admin123');
    console.log('   - Role: admin');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Desconectado do MongoDB');
    }
  }
}

createAdminUsers();
