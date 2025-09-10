const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createBrunaProductionDirect() {
  let client;
  try {
    console.log('🚀 Criando usuário Bruna diretamente em produção...');

    // URI real de produção
    const PRODUCTION_URI =
      'mongodb+srv://brunacanovas_db_user:amCzSzLUpD7P96gD@espacoguapa.npfnuuc.mongodb.net/guapa?retryWrites=true&w=majority&appName=Espacoguapa';

    console.log('🔗 Conectando ao MongoDB de produção...');
    client = new MongoClient(PRODUCTION_URI);
    await client.connect();
    console.log('✅ Conectado ao MongoDB de produção');

    const db = client.db('guapa');
    const usersCollection = db.collection('users');

    // Verificar usuários existentes
    console.log('\n📋 Usuários existentes em produção:');
    const existingUsers = await usersCollection.find({}).toArray();
    existingUsers.forEach((user, index) => {
      console.log(
        `   ${index + 1}. ${user.name} (${user.username}) - ${
          user.role
        } - Ativo: ${user.isActive}`,
      );
    });

    // Verificar se o usuário bruna já existe
    const existingBruna = await usersCollection.findOne({ username: 'bruna' });
    if (existingBruna) {
      console.log('\n⚠️ Usuário Bruna já existe. Atualizando senha...');

      // Atualizar senha para bruna123
      const hashedPassword = await bcrypt.hash('bruna123', 12);
      await usersCollection.updateOne(
        { username: 'bruna' },
        {
          $set: {
            password: hashedPassword,
            updatedAt: new Date(),
          },
        },
      );
      console.log('✅ Senha do usuário Bruna atualizada para "bruna123"');
    } else {
      console.log('\n👤 Criando novo usuário Bruna...');

      // Criar usuário Bruna
      const brunaUser = {
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
        updatedAt: new Date(),
      };

      const result = await usersCollection.insertOne(brunaUser);
      console.log('✅ Usuário Bruna criado com ID:', result.insertedId);
    }

    // Verificar se foi criado/atualizado corretamente
    const brunaUser = await usersCollection.findOne({ username: 'bruna' });
    if (brunaUser) {
      console.log('\n📋 Usuário Bruna verificado:');
      console.log(`   - Nome: ${brunaUser.name}`);
      console.log(`   - Username: ${brunaUser.username}`);
      console.log(`   - Role: ${brunaUser.role}`);
      console.log(`   - Ativo: ${brunaUser.isActive}`);

      // Testar senha
      const isPasswordValid = await bcrypt.compare(
        'bruna123',
        brunaUser.password,
      );
      console.log(
        `   - Senha "bruna123" válida: ${
          isPasswordValid ? '✅ Sim' : '❌ Não'
        }`,
      );
    }

    // Listar todos os usuários após a operação
    console.log('\n📋 Todos os usuários na coleção users após operação:');
    const allUsers = await usersCollection.find({}).toArray();
    allUsers.forEach((user, index) => {
      console.log(
        `   ${index + 1}. ${user.name} (${user.username}) - ${
          user.role
        } - Ativo: ${user.isActive}`,
      );
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

createBrunaProductionDirect();
