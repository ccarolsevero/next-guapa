import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function limparComandasTesteEstoque() {
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

    // 1. Buscar comandas de teste (status 'finalizada' ou 'em atendimento')
    console.log('🔍 Buscando comandas de teste...');
    const comandas = await db
      .collection('comandas')
      .find({
        $or: [{ status: 'finalizada' }, { status: 'em atendimento' }],
      })
      .toArray();

    console.log(`📊 Encontradas ${comandas.length} comandas para limpar`);

    if (comandas.length === 0) {
      console.log('ℹ️ Nenhuma comanda de teste encontrada');
      return;
    }

    // 2. Coletar produtos vendidos para retornar ao estoque
    const produtosParaEstoque = [];
    let totalProdutos = 0;

    for (const comanda of comandas) {
      if (comanda.produtos && Array.isArray(comanda.produtos)) {
        for (const produto of comanda.produtos) {
          const produtoExistente = produtosParaEstoque.find(
            (p) => p.produtoId === produto.produtoId,
          );

          if (produtoExistente) {
            produtoExistente.quantidade += produto.quantidade;
          } else {
            produtosParaEstoque.push({
              produtoId: produto.produtoId,
              quantidade: produto.quantidade,
              nome: produto.nome,
            });
          }
          totalProdutos += produto.quantidade;
        }
      }
    }

    console.log(
      `📦 ${produtosParaEstoque.length} produtos diferentes para retornar ao estoque`,
    );
    console.log(`📊 Total de itens: ${totalProdutos}`);

    // 3. Retornar produtos ao estoque
    if (produtosParaEstoque.length > 0) {
      console.log('🔄 Retornando produtos ao estoque...');

      for (const produto of produtosParaEstoque) {
        try {
          const result = await db
            .collection('produtos')
            .updateOne(
              { _id: produto.produtoId },
              { $inc: { estoque: produto.quantidade } },
            );

          if (result.matchedCount > 0) {
            console.log(
              `✅ ${produto.nome}: +${produto.quantidade} unidades retornadas ao estoque`,
            );
          } else {
            console.log(`⚠️ Produto ${produto.nome} não encontrado no banco`);
          }
        } catch (error) {
          console.error(
            `❌ Erro ao retornar ${produto.nome} ao estoque:`,
            error.message,
          );
        }
      }
    }

    // 4. Excluir comandas de teste
    console.log('🗑️ Excluindo comandas de teste...');
    const deleteResult = await db.collection('comandas').deleteMany({
      $or: [{ status: 'finalizada' }, { status: 'em atendimento' }],
    });

    console.log(`✅ ${deleteResult.deletedCount} comandas excluídas`);

    // 5. Excluir finalizações relacionadas
    console.log('🗑️ Excluindo finalizações relacionadas...');
    const finalizacoesDeleteResult = await db
      .collection('finalizacoes')
      .deleteMany({});
    console.log(
      `✅ ${finalizacoesDeleteResult.deletedCount} finalizações excluídas`,
    );

    // 6. Excluir comissões relacionadas
    console.log('🗑️ Excluindo comissões relacionadas...');
    const comissoesDeleteResult = await db
      .collection('comissoes')
      .deleteMany({});
    console.log(`✅ ${comissoesDeleteResult.deletedCount} comissões excluídas`);

    // 7. Limpar faturamento do dia
    console.log('🗑️ Limpando faturamento do dia...');
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

    const faturamentoDeleteResult = await db
      .collection('faturamento')
      .deleteMany({
        data: {
          $gte: dataInicio,
          $lte: dataFim,
        },
      });
    console.log(
      `✅ ${faturamentoDeleteResult.deletedCount} registros de faturamento excluídos`,
    );

    // 8. Limpar histórico dos clientes
    console.log('🗑️ Limpando histórico dos clientes...');
    const clientesUpdateResult = await db.collection('clientes').updateMany(
      {},
      {
        $unset: { historico: '' },
        $set: { totalGasto: 0, quantidadeVisitas: 0 },
      },
    );
    console.log(
      `✅ Histórico de ${clientesUpdateResult.modifiedCount} clientes limpo`,
    );

    console.log('\n🎉 Limpeza concluída com sucesso!');
    console.log(`📊 Resumo:`);
    console.log(`   - Comandas excluídas: ${deleteResult.deletedCount}`);
    console.log(
      `   - Finalizações excluídas: ${finalizacoesDeleteResult.deletedCount}`,
    );
    console.log(
      `   - Comissões excluídas: ${comissoesDeleteResult.deletedCount}`,
    );
    console.log(
      `   - Faturamento limpo: ${faturamentoDeleteResult.deletedCount}`,
    );
    console.log(
      `   - Produtos retornados ao estoque: ${produtosParaEstoque.length}`,
    );
    console.log(`   - Total de itens retornados: ${totalProdutos}`);
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
limparComandasTesteEstoque()
  .then(() => {
    console.log('✅ Script concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
