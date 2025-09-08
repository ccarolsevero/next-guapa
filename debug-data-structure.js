const { MongoClient } = require('mongodb');

async function debugDataStructure() {
  const client = new MongoClient(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/nextjs-guapa',
  );

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db();

    // Verificar estrutura das finalizações
    const finalizacao = await db.collection('finalizacoes').findOne({});
    console.log('📋 Estrutura de uma finalização:');
    console.log(JSON.stringify(finalizacao, null, 2));

    // Verificar se há finalizações com servicos
    const finalizacoesComServicos = await db
      .collection('finalizacoes')
      .find({
        'servicos.0': { $exists: true },
      })
      .limit(3)
      .toArray();

    console.log('\n📊 Finalizações com serviços:');
    finalizacoesComServicos.forEach((f, i) => {
      console.log(`\n--- Finalização ${i + 1} ---`);
      console.log('Cliente ID:', f.clienteId);
      console.log('Data:', f.dataCriacao);
      console.log('Serviços:', JSON.stringify(f.servicos, null, 2));
    });

    // Verificar se há finalizações no período
    const now = new Date();
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - 6,
      now.getDate(),
    );

    const finalizacoesNoPeriodo = await db
      .collection('finalizacoes')
      .find({
        dataCriacao: { $gte: startDate, $lte: now },
      })
      .count();

    console.log(
      `\n📅 Finalizações no período (últimos 6 meses): ${finalizacoesNoPeriodo}`,
    );
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

debugDataStructure();
