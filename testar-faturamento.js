import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function testarFaturamento() {
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

    // Simular os dados que deveriam vir da finalização
    const valorFinal = 231;
    const totalComissao = 23.1;

    console.log('🧪 === TESTANDO CRIAÇÃO DE FATURAMENTO ===');
    console.log(`💰 Valor Final: ${valorFinal}`);
    console.log(`💸 Total Comissão: ${totalComissao}`);

    // Calcular datas como na API
    const hoje = new Date();
    const dataInicio = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
    );
    const dataFimFaturamento = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
      23,
      59,
      59,
    );

    console.log('📅 Data início:', dataInicio.toISOString());
    console.log('📅 Data fim:', dataFimFaturamento.toISOString());

    // 1. Verificar se já existe faturamento para hoje
    const faturamentoExistente = await db.collection('faturamento').findOne({
      data: {
        $gte: dataInicio,
        $lte: dataFimFaturamento,
      },
    });

    if (faturamentoExistente) {
      console.log('⚠️ Já existe faturamento para hoje:');
      console.log(`   - ID: ${faturamentoExistente._id}`);
      console.log(`   - Data: ${faturamentoExistente.data}`);
      console.log(`   - Valor Total: ${faturamentoExistente.valorTotal}`);
      console.log(
        `   - Total Comissões: ${faturamentoExistente.totalComissoes}`,
      );
      console.log(
        `   - Quantidade Comandas: ${faturamentoExistente.quantidadeComandas}`,
      );

      // Atualizar o existente
      console.log('🔄 Atualizando faturamento existente...');
      const updateResult = await db.collection('faturamento').updateOne(
        { _id: faturamentoExistente._id },
        {
          $inc: {
            valorTotal: valorFinal,
            totalComissoes: totalComissao,
            quantidadeComandas: 1,
          },
        },
      );

      console.log('✅ Resultado da atualização:', updateResult);
    } else {
      console.log('🆕 Criando novo registro de faturamento...');

      // Criar novo registro
      const insertResult = await db.collection('faturamento').insertOne({
        data: dataInicio,
        valorTotal: valorFinal,
        totalComissoes: totalComissao,
        quantidadeComandas: 1,
        dataCriacao: new Date(),
      });

      console.log('✅ Resultado da criação:', insertResult);
    }

    // 2. Verificar o resultado final
    const faturamentoFinal = await db.collection('faturamento').findOne({
      data: {
        $gte: dataInicio,
        $lte: dataFimFaturamento,
      },
    });

    if (faturamentoFinal) {
      console.log('🎯 FATURAMENTO FINAL:');
      console.log(`   - ID: ${faturamentoFinal._id}`);
      console.log(`   - Data: ${faturamentoFinal.data}`);
      console.log(`   - Valor Total: ${faturamentoFinal.valorTotal}`);
      console.log(`   - Total Comissões: ${faturamentoFinal.totalComissoes}`);
      console.log(
        `   - Quantidade Comandas: ${faturamentoFinal.quantidadeComandas}`,
      );
    } else {
      console.log('❌ Faturamento ainda não encontrado');
    }
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Conexão com MongoDB fechada');
    }
  }
}

// Executar o script
testarFaturamento()
  .then(() => {
    console.log('✅ Teste concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
