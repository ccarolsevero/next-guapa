require('dotenv').config();
const { MongoClient } = require('mongodb');

async function clearAllClients() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    console.log('🔌 Conectando ao MongoDB...');
    await client.connect();

    const db = client.db(process.env.DB_NAME || 'guapa');
    const collection = db.collection(process.env.COLLECTION_NAME || 'clients');

    console.log('📊 Verificando quantidade atual de clientes...');
    const currentCount = await collection.countDocuments();
    console.log(`📈 Clientes atuais no banco: ${currentCount}`);

    if (currentCount === 0) {
      console.log('✅ Banco já está vazio!');
      return;
    }

    console.log('⚠️  ATENÇÃO: Isso vai EXCLUIR TODOS os clientes do banco!');
    console.log('⚠️  Confirme digitando "LIMPAR" para continuar:');

    // Aguardar confirmação do usuário
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Digite "LIMPAR" para confirmar: ', async (answer) => {
      if (answer === 'LIMPAR') {
        console.log('🗑️  Excluindo todos os clientes...');

        const result = await collection.deleteMany({});

        console.log(`✅ Exclusão concluída!`);
        console.log(`📊 Clientes removidos: ${result.deletedCount}`);

        // Verificar se realmente foi limpo
        const newCount = await collection.countDocuments();
        console.log(`📈 Clientes restantes no banco: ${newCount}`);

        if (newCount === 0) {
          console.log(
            '🎯 Banco limpo com sucesso! Agora pode fazer o novo import.',
          );
        } else {
          console.log(
            '⚠️  Ainda há clientes no banco. Verifique se há algum problema.',
          );
        }
      } else {
        console.log('❌ Operação cancelada pelo usuário.');
      }

      rl.close();
      await client.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Erro ao limpar banco:', error);
    await client.close();
    process.exit(1);
  }
}

// Executar script
clearAllClients();
