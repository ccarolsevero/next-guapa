const { MongoClient } = require('mongodb');

async function listAllUsers() {
  let client;
  try {
    console.log('📋 Listando todos os usuários do banco...');
    
    // Conectar ao MongoDB
    client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa');
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    
    // Listar coleções
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Coleções encontradas:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Verificar usuários de administração (coleção users)
    console.log('\n👥 USUÁRIOS DE ADMINISTRAÇÃO (coleção users):');
    try {
      const usersCollection = db.collection('users');
      const users = await usersCollection.find({}).project({ password: 0 }).toArray();
      
      if (users.length === 0) {
        console.log('   ❌ Nenhum usuário encontrado na coleção users');
      } else {
        users.forEach(user => {
          console.log(`   ✅ ${user.name} (${user.username})`);
          console.log(`      - Role: ${user.role}`);
          console.log(`      - Ativo: ${user.isActive ? 'Sim' : 'Não'}`);
          console.log(`      - Financeiro: ${user.canAccessFinancial ? 'Sim' : 'Não'}`);
          console.log(`      - Editar Site: ${user.canAccessSiteEdit ? 'Sim' : 'Não'}`);
          console.log(`      - Metas: ${user.canAccessGoals ? 'Sim' : 'Não'}`);
          console.log(`      - Relatórios: ${user.canAccessReports ? 'Sim' : 'Não'}`);
          console.log(`      - Criado em: ${user.createdAt ? new Date(user.createdAt).toLocaleString('pt-BR') : 'N/A'}`);
          console.log(`      - Último login: ${user.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR') : 'Nunca'}`);
          console.log('');
        });
      }
    } catch (error) {
      console.log('   ❌ Erro ao acessar coleção users:', error.message);
    }
    
    // Verificar profissionais do site (coleção professionals)
    console.log('\n👨‍💼 PROFISSIONAIS DO SITE (coleção professionals):');
    try {
      const professionalsCollection = db.collection('professionals');
      const professionals = await professionalsCollection.find({}).project({ password: 0 }).toArray();
      
      if (professionals.length === 0) {
        console.log('   ❌ Nenhum profissional encontrado na coleção professionals');
      } else {
        professionals.forEach(prof => {
          console.log(`   ✅ ${prof.name} (${prof.username})`);
          console.log(`      - Role: ${prof.role}`);
          console.log(`      - Ativo: ${prof.isActive ? 'Sim' : 'Não'}`);
          console.log(`      - Título: ${prof.title || 'N/A'}`);
          console.log(`      - Criado em: ${prof.createdAt ? new Date(prof.createdAt).toLocaleString('pt-BR') : 'N/A'}`);
          console.log(`      - Último login: ${prof.lastLogin ? new Date(prof.lastLogin).toLocaleString('pt-BR') : 'Nunca'}`);
          console.log('');
        });
      }
    } catch (error) {
      console.log('   ❌ Erro ao acessar coleção professionals:', error.message);
    }
    
    // Resumo
    console.log('\n📊 RESUMO:');
    try {
      const usersCount = await db.collection('users').countDocuments();
      const professionalsCount = await db.collection('professionals').countDocuments();
      
      console.log(`   - Usuários de administração: ${usersCount}`);
      console.log(`   - Profissionais do site: ${professionalsCount}`);
      console.log(`   - Total: ${usersCount + professionalsCount}`);
    } catch (error) {
      console.log('   ❌ Erro ao contar documentos:', error.message);
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

listAllUsers();
