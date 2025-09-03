const { MongoClient } = require('mongodb');

async function debugAtlas() {
  const uri = "mongodb+srv://brunacanovas_db_user:amCzSzLUpD7P96gD@espacoguapa.npfnuuc.mongodb.net/?retryWrites=true&w=majority&appName=Espacoguapa";
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB Atlas');
    
    // Listar todos os bancos
    const adminDb = client.db('admin');
    const bancos = await adminDb.admin().listDatabases();
    
    console.log('\n🗄️ Bancos disponíveis:');
    bancos.databases.forEach(db => {
      console.log(`  - ${db.name} (${db.sizeOnDisk} bytes)`);
    });
    
    // Tentar conectar ao banco 'guapa' (que pode não existir)
    console.log('\n🔍 Tentando conectar ao banco "guapa"...');
    try {
      const dbGuapa = client.db('guapa');
      const colecoesGuapa = await dbGuapa.listCollections().toArray();
      console.log(`Coleções em "guapa": ${colecoesGuapa.length}`);
      
      if (colecoesGuapa.length > 0) {
        colecoesGuapa.forEach(colecao => {
          console.log(`  - ${colecao.name}`);
        });
      }
    } catch (error) {
      console.log('❌ Erro ao conectar no banco "guapa":', error.message);
    }
    
    // Tentar conectar ao banco 'espacoguapa'
    console.log('\n🔍 Tentando conectar ao banco "espacoguapa"...');
    try {
      const dbEspaco = client.db('espacoguapa');
      const colecoesEspaco = await dbEspaco.listCollections().toArray();
      console.log(`Coleções em "espacoguapa": ${colecoesEspaco.length}`);
      
      if (colecoesEspaco.length > 0) {
        colecoesEspaco.forEach(colecao => {
          console.log(`  - ${colecao.name}`);
        });
        
        // Se encontrar comandas, verificar
        if (colecoesEspaco.some(c => c.name === 'comandas')) {
          console.log('\n🔍 Verificando comandas em "espacoguapa"...');
          const comandas = await dbEspaco.collection('comandas').find({}).toArray();
          console.log(`Total de comandas: ${comandas.length}`);
          
          if (comandas.length > 0) {
            console.log('\n📋 STATUS DAS COMANDAS:');
            const statusCount = {};
            comandas.forEach(comanda => {
              const status = comanda.status || 'SEM STATUS';
              statusCount[status] = (statusCount[status] || 0) + 1;
            });
            
            Object.entries(statusCount).forEach(([status, count]) => {
              console.log(`${status}: ${count}`);
            });
          }
        }
      }
    } catch (error) {
      console.log('❌ Erro ao conectar no banco "espacoguapa":', error.message);
    }
    
    // Tentar conectar ao banco padrão (sem especificar nome)
    console.log('\n🔍 Tentando conectar ao banco padrão...');
    try {
      const dbDefault = client.db();
      const colecoesDefault = await dbDefault.listCollections().toArray();
      console.log(`Coleções no banco padrão: ${colecoesDefault.length}`);
      
      if (colecoesDefault.length > 0) {
        colecoesDefault.forEach(colecao => {
          console.log(`  - ${colecao.name}`);
        });
      }
    } catch (error) {
      console.log('❌ Erro ao conectar no banco padrão:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

debugAtlas();
