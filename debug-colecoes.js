import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function debugColecoes() {
  let client;

  try {
    console.log('🔄 Conectando ao MongoDB...');

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI não encontrada no .env');
    }

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db(process.env.DB_NAME || 'guapa');
    console.log('✅ Conectado ao MongoDB');

    console.log('\n🔍 === VERIFICANDO TODAS AS COLEÇÕES ===');
    
    // Listar todas as coleções
    const colecoes = await db.listCollections().toArray();
    console.log(`📚 Total de coleções: ${colecoes.length}`);
    
    colecoes.forEach((colecao, i) => {
      console.log(`   ${i + 1}. ${colecao.name}`);
    });
    
    console.log('\n📊 === CONTAGEM DE DOCUMENTOS ===');
    
    // Contar documentos em cada coleção
    for (const colecao of colecoes) {
      try {
        const count = await db.collection(colecao.name).countDocuments();
        console.log(`   ${colecao.name}: ${count} documentos`);
      } catch (error) {
        console.log(`   ${colecao.name}: ERRO ao contar`);
      }
    }

  } catch (error) {
    console.error('❌ Erro durante o debug:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Conexão com MongoDB fechada');
    }
  }
}

// Executar o script
debugColecoes()
  .then(() => {
    console.log('✅ Debug concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
