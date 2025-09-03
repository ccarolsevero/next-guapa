import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'guapa';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI não encontrada no .env');
  process.exit(1);
}

async function limparComandasTeste() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔄 Conectando ao MongoDB...');
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db(DB_NAME);

    // 1. Contar comandas existentes
    const totalComandas = await db.collection('comandas').countDocuments();
    console.log(`📊 Total de comandas no banco: ${totalComandas}`);

    if (totalComandas === 0) {
      console.log('✅ Nenhuma comanda para limpar');
      return;
    }

    // 2. Mostrar algumas comandas para confirmação
    const comandas = await db
      .collection('comandas')
      .find({})
      .limit(5)
      .toArray();
    console.log('\n📋 Primeiras comandas encontradas:');
    comandas.forEach((comanda, index) => {
      console.log(`  ${index + 1}. ID: ${comanda._id}`);
      console.log(`     Cliente: ${comanda.clientId || 'N/A'}`);
      console.log(`     Status: ${comanda.status || 'N/A'}`);
      console.log(
        `     Data: ${comanda.dataInicio || comanda.createdAt || 'N/A'}`,
      );
      console.log('');
    });

    // 3. Perguntar confirmação
    console.log('⚠️  ATENÇÃO: Isso vai DELETAR TODAS as comandas do banco!');
    console.log(
      '💡 Para confirmar, execute: node limpar-comandas-teste.js --confirm',
    );

    if (process.argv.includes('--confirm')) {
      console.log('🗑️  Confirmado! Deletando todas as comandas...');

      // 4. Deletar todas as comandas
      const result = await db.collection('comandas').deleteMany({});
      console.log(`✅ ${result.deletedCount} comandas deletadas`);

      // 5. Deletar finalizações relacionadas
      const finalizacoes = await db.collection('finalizacoes').deleteMany({});
      console.log(`✅ ${finalizacoes.deletedCount} finalizações deletadas`);

      // 6. Deletar comissões relacionadas
      const comissoes = await db.collection('comissoes').deleteMany({});
      console.log(`✅ ${comissoes.deletedCount} comissões deletadas`);

      // 7. Resetar faturamento do dia
      const hoje = new Date();
      const dataInicio = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate(),
      );
      const dataFim = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate(),
        23,
        59,
        59,
      );

      await db.collection('faturamento').deleteMany({
        data: {
          $gte: dataInicio,
          $lte: dataFim,
        },
      });
      console.log('✅ Faturamento do dia resetado');

      // 8. Verificar resultado
      const comandasRestantes = await db
        .collection('comandas')
        .countDocuments();
      console.log(`📊 Comandas restantes: ${comandasRestantes}`);

      if (comandasRestantes === 0) {
        console.log('🎉 Banco limpo com sucesso! Pode começar do zero.');
      }
    } else {
      console.log('❌ Operação cancelada. Use --confirm para executar.');
    }
  } catch (error) {
    console.error('❌ Erro ao limpar comandas:', error);
  } finally {
    await client.close();
    console.log('🔌 Conexão fechada');
  }
}

// Executar função
limparComandasTeste();
