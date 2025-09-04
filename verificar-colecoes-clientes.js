const { MongoClient } = require('mongodb');

async function verificarColecoesClientes() {
  const uri = "mongodb+srv://brunacanovas_db_user:amCzSzLUpD7P96gD@espacoguapa.npfnuuc.mongodb.net/?retryWrites=true&w=majority&appName=Espacoguapa";
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB Atlas');
    
    const db = client.db('guapa');
    
    // Listar todas as coleções
    console.log('\n🔍 Listando todas as coleções...');
    const collections = await db.listCollections().toArray();
    
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Verificar coleções que podem conter clientes
    const colecoesClientes = ['clients', 'clientes', 'users', 'usuarios'];
    
    console.log('\n🔍 VERIFICANDO COLETIONS DE CLIENTES...');
    for (const nome of colecoesClientes) {
      try {
        const count = await db.collection(nome).countDocuments();
        console.log(`\n📊 ${nome}: ${count} documentos`);
        
        if (count > 0) {
          const primeiro = await db.collection(nome).findOne();
          console.log(`   Campos: ${Object.keys(primeiro).join(', ')}`);
          
          // Verificar se tem os IDs que estamos procurando
          const idsProcurados = ['68b7706576f2048aa96ecf6c', '68b7706576f2048aa96ecf69'];
          for (const id of idsProcurados) {
            const encontrado = await db.collection(nome).findOne({ _id: id });
            if (encontrado) {
              console.log(`   ✅ ID ${id} encontrado: ${encontrado.name || encontrado.nome || 'N/A'}`);
            } else {
              console.log(`   ❌ ID ${id} NÃO encontrado`);
            }
          }
        }
      } catch (error) {
        console.log(`❌ Erro ao verificar ${nome}:`, error.message);
      }
    }
    
    // Verificar se há alguma coleção com os IDs que estamos procurando
    console.log('\n🔍 BUSCANDO IDs EM TODAS AS COLETIONS...');
    const idsProcurados = ['68b7706576f2048aa96ecf6c', '68b7706576f2048aa96ecf69'];
    
    for (const collection of collections) {
      try {
        for (const id of idsProcurados) {
          const encontrado = await db.collection(collection.name).findOne({ _id: id });
          if (encontrado) {
            console.log(`✅ ID ${id} encontrado na coleção ${collection.name}`);
            console.log(`   Dados:`, JSON.stringify(encontrado, null, 2));
          }
        }
      } catch (error) {
        // Ignorar erros de coleções que não podem ser consultadas
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

verificarColecoesClientes();
