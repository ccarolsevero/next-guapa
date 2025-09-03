import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function zerarFaturamento() {
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

    console.log('\n🗑️ === LIMPEZA DO SISTEMA ===');

    // 1. Limpar faturamento
    console.log('📊 Limpando faturamento...');
    const faturamentoDeleteResult = await db.collection('faturamento').deleteMany({});
    console.log(`✅ ${faturamentoDeleteResult.deletedCount} registros de faturamento excluídos`);

    // 2. Limpar comissões
    console.log('💰 Limpando comissões...');
    const comissoesDeleteResult = await db.collection('comissoes').deleteMany({});
    console.log(`✅ ${comissoesDeleteResult.deletedCount} comissões excluídas`);

    // 3. Limpar finalizações
    console.log('📋 Limpando finalizações...');
    const finalizacoesDeleteResult = await db.collection('finalizacoes').deleteMany({});
    console.log(`✅ ${finalizacoesDeleteResult.deletedCount} finalizações excluídas`);

    // 4. Limpar comandas
    console.log('📝 Limpando comandas...');
    const comandasDeleteResult = await db.collection('comandas').deleteMany({});
    console.log(`✅ ${comandasDeleteResult.deletedCount} comandas excluídas`);

    // 5. Limpar histórico dos clientes
    console.log('👥 Limpando histórico dos clientes...');
    const clientesUpdateResult = await db.collection('clientes').updateMany(
      {},
      {
        $unset: { historico: '' },
        $set: { totalGasto: 0, quantidadeVisitas: 0 },
      },
    );
    console.log(`✅ Histórico de ${clientesUpdateResult.modifiedCount} clientes limpo`);

    console.log('\n🎉 Limpeza concluída com sucesso!');
    console.log(`📊 Resumo:`);
    console.log(`   - Faturamento limpo: ${faturamentoDeleteResult.deletedCount}`);
    console.log(`   - Comissões excluídas: ${comissoesDeleteResult.deletedCount}`);
    console.log(`   - Finalizações excluídas: ${finalizacoesDeleteResult.deletedCount}`);
    console.log(`   - Comandas excluídas: ${comandasDeleteResult.deletedCount}`);
    console.log(`   - Histórico de clientes limpo: ${clientesUpdateResult.modifiedCount}`);

  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Conexão com MongoDB fechada');
    }
  }
}

// Executar o script
zerarFaturamento()
  .then(() => {
    console.log('✅ Script concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
