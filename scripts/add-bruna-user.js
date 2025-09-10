const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function addBrunaUser() {
  let client;
  try {
    console.log('👤 Adicionando usuário Bruna na coleção users...');
    
    // Conectar ao MongoDB
    client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa');
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    const usersCollection = db.collection('users');
    
    // Criar usuário Bruna
    const brunaUser = {
      name: 'Bruna',
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
    };
    
    // Verificar se já existe
    const existingUser = await usersCollection.findOne({ username: 'bruna' });
    if (existingUser) {
      console.log('👤 Usuário Bruna já existe, atualizando senha...');
      await usersCollection.updateOne(
        { username: 'bruna' },
        { 
          $set: {
            password: brunaUser.password,
            updatedAt: new Date()
          }
        }
      );
      console.log('✅ Senha do usuário Bruna atualizada para "bruna123"');
    } else {
      console.log('👤 Criando usuário Bruna...');
      await usersCollection.insertOne(brunaUser);
      console.log('✅ Usuário Bruna criado com sucesso!');
    }
    
    // Verificar se foi criado/atualizado
    const bruna = await usersCollection.findOne({ username: 'bruna' }, { projection: { password: 0 } });
    if (bruna) {
      console.log('\n📋 Dados do usuário Bruna:');
      console.log(`   - Nome: ${bruna.name}`);
      console.log(`   - Username: ${bruna.username}`);
      console.log(`   - Role: ${bruna.role}`);
      console.log(`   - Ativo: ${bruna.isActive ? 'Sim' : 'Não'}`);
      console.log(`   - Financeiro: ${bruna.canAccessFinancial ? 'Sim' : 'Não'}`);
      console.log(`   - Editar Site: ${bruna.canAccessSiteEdit ? 'Sim' : 'Não'}`);
      console.log(`   - Metas: ${bruna.canAccessGoals ? 'Sim' : 'Não'}`);
      console.log(`   - Relatórios: ${bruna.canAccessReports ? 'Sim' : 'Não'}`);
    }
    
    console.log('\n🎉 Usuário Bruna configurado!');
    console.log('📋 Credenciais:');
    console.log('   - Username: bruna');
    console.log('   - Senha: bruna123');
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

addBrunaUser();
