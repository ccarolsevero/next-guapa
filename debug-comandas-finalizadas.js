const { MongoClient } = require('mongodb');

async function debugComandasFinalizadas() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('guapa');
    
    // Buscar todas as comandas finalizadas
    const comandasFinalizadas = await db.collection('comandas').find({
      status: 'finalizada'
    }).toArray();
    
    console.log(`\n📊 Total de comandas finalizadas: ${comandasFinalizadas.length}`);
    
    if (comandasFinalizadas.length > 0) {
      console.log('\n🔍 ESTRUTURA DA PRIMEIRA COMANDA:');
      const primeira = comandasFinalizadas[0];
      console.log(JSON.stringify(primeira, null, 2));
      
      console.log('\n📋 RESUMO DE TODAS AS COMANDAS:');
      comandasFinalizadas.forEach((comanda, index) => {
        console.log(`\n--- Comanda ${index + 1} ---`);
        console.log(`ID: ${comanda._id}`);
        console.log(`Status: ${comanda.status}`);
        console.log(`Valor Total: ${comanda.valorTotal}`);
        console.log(`Método Pagamento: ${comanda.metodoPagamento || 'NÃO DEFINIDO'}`);
        console.log(`Data Finalização: ${comanda.dataFinalizacao || 'NÃO DEFINIDA'}`);
        console.log(`Updated At: ${comanda.updatedAt || 'NÃO DEFINIDO'}`);
        
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
      
      // Verificar métodos de pagamento únicos
      const metodosUnicos = [...new Set(comandasFinalizadas.map(c => c.metodoPagamento).filter(Boolean))];
      console.log(`\n💳 Métodos de pagamento encontrados: ${metodosUnicos.join(', ')}`);
      
      // Verificar profissionais únicos
      const profissionaisUnicos = new Set();
      comandasFinalizadas.forEach(comanda => {
        if (comanda.servicos) {
          comanda.servicos.forEach(servico => {
            if (servico.profissionalId?.name) {
              profissionaisUnicos.add(servico.profissionalId.name);
            }
          });
        }
        if (comanda.produtos) {
          comanda.produtos.forEach(produto => {
            if (produto.vendidoPor) {
              profissionaisUnicos.add(produto.vendidoPor);
            }
          });
        }
      });
      console.log(`\n👥 Profissionais únicos encontrados: ${Array.from(profissionaisUnicos).join(', ')}`);
      
    } else {
      console.log('❌ Nenhuma comanda finalizada encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

debugComandasFinalizadas();
