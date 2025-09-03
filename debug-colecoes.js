const { MongoClient } = require('mongodb');

async function debugColecoes() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    
    // Listar todas as coleções
    const colecoes = await db.listCollections().toArray();
    
    console.log(`\n📚 Coleções encontradas: ${colecoes.length}`);
    
    for (const colecao of colecoes) {
      const nome = colecao.name;
      const count = await db.collection(nome).countDocuments();
      console.log(`\n📊 ${nome}: ${count} documentos`);
      
      if (count > 0) {
        // Mostrar estrutura do primeiro documento
        const primeiro = await db.collection(nome).findOne();
        console.log(`   Estrutura: ${Object.keys(primeiro).join(', ')}`);
        
        // Se for comandas ou algo relacionado, mostrar mais detalhes
        if (nome.includes('comanda') || nome.includes('order') || nome.includes('finalizacao')) {
          console.log(`   Primeiro documento:`);
          console.log(JSON.stringify(primeiro, null, 2));
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

debugColecoes();
