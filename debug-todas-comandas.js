const { MongoClient } = require('mongodb');

async function debugTodasComandas() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    
    // Buscar TODAS as comandas
    const todasComandas = await db.collection('comandas').find({}).toArray();
    
    console.log(`\n📊 Total de comandas no banco: ${todasComandas.length}`);
    
    if (todasComandas.length > 0) {
      console.log('\n📋 STATUS DE TODAS AS COMANDAS:');
      const statusCount = {};
      todasComandas.forEach(comanda => {
        const status = comanda.status || 'SEM STATUS';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`${status}: ${count}`);
      });
      
      console.log('\n🔍 ESTRUTURA DA PRIMEIRA COMANDA:');
      const primeira = todasComandas[0];
      console.log(JSON.stringify(primeira, null, 2));
      
      console.log('\n📋 RESUMO DAS COMANDAS:');
      todasComandas.forEach((comanda, index) => {
        console.log(`\n--- Comanda ${index + 1} ---`);
        console.log(`ID: ${comanda._id}`);
        console.log(`Status: ${comanda.status || 'NÃO DEFINIDO'}`);
        console.log(`Valor Total: ${comanda.valorTotal}`);
        console.log(`Método Pagamento: ${comanda.metodoPagamento || 'NÃO DEFINIDO'}`);
        console.log(`Data Finalização: ${comanda.dataFinalizacao || 'NÃO DEFINIDA'}`);
        console.log(`Updated At: ${comanda.updatedAt || 'NÃO DEFINIDO'}`);
        console.log(`Data Fim: ${comanda.dataFim || 'NÃO DEFINIDA'}`);
        console.log(`Valor Final: ${comanda.valorFinal || 'NÃO DEFINIDO'}`);
        
        if (comanda.servicos && comanda.servicos.length > 0) {
          console.log(`Serviços (${comanda.servicos.length}):`);
          comanda.servicos.forEach((servico, i) => {
            console.log(`  ${i + 1}. ${servico.nome} - R$ ${servico.preco} - Prof: ${servico.profissionalId?.name || 'NÃO DEFINIDO'}`);
          });
        }
        
        if (comanda.produtos && comanda.produtos.length > 0) {
          console.log(`Produtos (${comanda.produtos.length}):`);
          comanda.produtos.forEach((produto, i) => {
            console.log(`  ${i + 1}. ${produto.nome} - R$ ${produto.preco} - Vendedor: ${produto.vendidoPor || 'NÃO DEFINIDO'}`);
          });
        }
      });
      
      // Verificar se há comandas com outros campos de status
      const comandasComDataFim = todasComandas.filter(c => c.dataFim || c.valorFinal);
      console.log(`\n📅 Comandas com dataFim ou valorFinal: ${comandasComDataFim.length}`);
      
      if (comandasComDataFim.length > 0) {
        console.log('\n🔍 PRIMEIRA COMANDA COM DATA FIM:');
        console.log(JSON.stringify(comandasComDataFim[0], null, 2));
      }
      
    } else {
      console.log('❌ Nenhuma comanda encontrada no banco');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

debugTodasComandas();
