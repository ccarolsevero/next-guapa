const { MongoClient } = require('mongodb');

async function debugConexao() {
  console.log('🔍 Verificando variáveis de ambiente...');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'EXISTE' : 'NÃO EXISTE');
  
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  console.log('URI a ser usada:', uri);
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    // Listar todos os bancos
    const adminDb = client.db('admin');
    const bancos = await adminDb.admin().listDatabases();
    
    console.log('\n🗄️ Bancos disponíveis:');
    bancos.databases.forEach(db => {
      console.log(`  - ${db.name} (${db.sizeOnDisk} bytes)`);
    });
    
    // Tentar conectar ao banco 'guapa' especificamente
    console.log('\n🔍 Tentando conectar ao banco "guapa"...');
    const db = client.db('guapa');
    
    // Listar coleções
    const colecoes = await db.listCollections().toArray();
    console.log(`\n📚 Coleções em "guapa": ${colecoes.length}`);
    
    if (colecoes.length > 0) {
      colecoes.forEach(colecao => {
        console.log(`  - ${colecao.name}`);
      });
    } else {
      console.log('❌ Nenhuma coleção encontrada no banco "guapa"');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

debugConexao();
