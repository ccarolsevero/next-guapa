const { MongoClient } = require('mongodb');

async function checkBrunaProduction() {
  let client;
  try {
    console.log('🔍 Verificando usuário Bruna em produção...');
    
    // Conectar ao MongoDB
    client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa');
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    const usersCollection = db.collection('users');
    
    // Buscar especificamente o usuário bruna
    console.log('🔍 Buscando usuário "bruna"...');
    const brunaUser = await usersCollection.findOne({ username: 'bruna' });
    
    if (brunaUser) {
      console.log('✅ Usuário Bruna encontrado!');
      console.log('📋 Dados do usuário:');
      console.log(`   - Nome: ${brunaUser.name}`);
      console.log(`   - Username: ${brunaUser.username}`);
      console.log(`   - Role: ${brunaUser.role}`);
      console.log(`   - Ativo: ${brunaUser.isActive}`);
      console.log(`   - Hash da senha: ${brunaUser.password?.substring(0, 20)}...`);
      console.log(`   - Criado em: ${brunaUser.createdAt}`);
      console.log(`   - Atualizado em: ${brunaUser.updatedAt}`);
    } else {
      console.log('❌ Usuário Bruna NÃO encontrado na coleção users');
    }
    
    // Listar todos os usuários para comparação
    console.log('\n📋 Todos os usuários na coleção users:');
    const allUsers = await usersCollection.find({}).toArray();
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.username}) - ${user.role} - Ativo: ${user.isActive}`);
    });
    
    // Verificar se existe na coleção professionals
    console.log('\n🔍 Verificando na coleção professionals...');
    const professionalsCollection = db.collection('professionals');
    const brunaProfessional = await professionalsCollection.findOne({ username: 'bruna' });
    
    if (brunaProfessional) {
      console.log('✅ Bruna encontrada na coleção professionals!');
      console.log('📋 Dados do profissional:');
      console.log(`   - Nome: ${brunaProfessional.name}`);
      console.log(`   - Username: ${brunaProfessional.username}`);
      console.log(`   - Role: ${brunaProfessional.role}`);
      console.log(`   - Ativo: ${brunaProfessional.isActive}`);
    } else {
      console.log('❌ Bruna NÃO encontrada na coleção professionals');
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

checkBrunaProduction();
