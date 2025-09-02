require('dotenv').config();
const { MongoClient } = require('mongodb');

async function clearTestComandas() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    console.log('🔌 Conectando ao MongoDB...');
    await client.connect();

    const db = client.db(process.env.DB_NAME || 'guapa');
    
    console.log('📊 === VERIFICAÇÃO E LIMPEZA DE COMANDAS ===\n');

    const comandasCollection = db.collection('comandas');
    
    // Verificar comandas existentes
    const comandasCount = await comandasCollection.countDocuments();
    console.log(`Total de comandas antes da limpeza: ${comandasCount}`);
    
    if (comandasCount > 0) {
      const comandas = await comandasCollection.find({}).toArray();
      console.log('\nComandas existentes:');
      comandas.forEach((comanda, index) => {
        console.log(`  ${index + 1}. ID: ${comanda._id}`);
        console.log(`     Cliente: ${comanda.clientId}`);
        console.log(`     Profissional: ${comanda.professionalId}`);
        console.log(`     Status: ${comanda.status}`);
        console.log(`     Criada em: ${comanda.createdAt}`);
        console.log(`     Valor: R$ ${comanda.valorTotal}`);
        console.log('');
      });
    }

    // Perguntar se deve limpar
    console.log('⚠️  ATENÇÃO: Este script irá REMOVER TODAS as comandas do banco!');
    console.log('💡 Use apenas se tiver certeza de que quer limpar dados de teste.');
    console.log('');
    
    // Para segurança, comentar a linha de limpeza por padrão
    // Descomente a linha abaixo se quiser realmente limpar as comandas
    
    // await comandasCollection.deleteMany({});
    // console.log('✅ Todas as comandas foram removidas!');
    
    console.log('🔄 Nenhuma comanda foi removida (script em modo seguro)');
    console.log('💡 Para limpar, edite o script e descomente a linha de limpeza');

    // Verificar estado final
    const finalCount = await comandasCollection.countDocuments();
    console.log(`\nTotal de comandas após operação: ${finalCount}`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Conexão fechada.');
  }
}

// Executar limpeza
clearTestComandas();
