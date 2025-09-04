const { MongoClient } = require('mongodb');

async function verificarPagamentosRecentes() {
  const uri = "mongodb+srv://brunacanovas_db_user:amCzSzLUpD7P96gD@espacoguapa.npfnuuc.mongodb.net/?retryWrites=true&w=majority&appName=Espacoguapa";
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB Atlas');
    
    const db = client.db('guapa');
    
    // Verificar finalizações
    console.log('\n🔍 Verificando coleção "finalizacoes"...');
    const finalizacoes = await db.collection('finalizacoes').find({}).toArray();
    
    console.log(`Total de finalizações: ${finalizacoes.length}`);
    
    if (finalizacoes.length > 0) {
      console.log('\n🔍 ESTRUTURA DA PRIMEIRA FINALIZAÇÃO:');
      const primeira = finalizacoes[0];
      console.log(JSON.stringify(primeira, null, 2));
      
      // Verificar campos específicos para pagamentos recentes
      console.log('\n💳 CAMPOS PARA PAGAMENTOS RECENTES:');
      finalizacoes.forEach((finalizacao, index) => {
        console.log(`\n--- Finalização ${index + 1} ---`);
        console.log(`ID: ${finalizacao._id}`);
        console.log(`Comanda ID: ${finalizacao.comandaId}`);
        console.log(`Cliente ID: ${finalizacao.clienteId}`);
        console.log(`Valor Final: ${finalizacao.valorFinal}`);
        console.log(`Método Pagamento: ${finalizacao.metodoPagamento}`);
        console.log(`Data Criação: ${finalizacao.dataCriacao}`);
        
        // Verificar se tem servicos
        if (finalizacao.servicos && finalizacao.servicos.length > 0) {
          console.log(`Serviços: ${finalizacao.servicos.length}`);
          finalizacao.servicos.forEach((servico, i) => {
            console.log(`  ${i + 1}. ${servico.nome} - R$ ${servico.preco}`);
          });
        }
        
        // Verificar se tem produtos
        if (finalizacao.produtos && finalizacao.produtos.length > 0) {
          console.log(`Produtos: ${finalizacao.produtos.length}`);
          finalizacao.produtos.forEach((produto, i) => {
            console.log(`  ${i + 1}. ${produto.nome} - R$ ${produto.preco}`);
          });
        }
      });
      
      // Testar a agregação que a API está usando
      console.log('\n🔍 TESTANDO AGREGAÇÃO DA API...');
      const hoje = new Date();
      const dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate());
      
      console.log('📅 Período:', { 
        dataInicio: dataInicio.toISOString(), 
        hoje: hoje.toISOString() 
      });
      
      const pagamentosRecentes = await db.collection('finalizacoes').aggregate([
        {
          $match: {
            status: 'ativo',
            dataCriacao: { $gte: dataInicio, $lte: hoje }
          }
        },
        {
          $lookup: {
            from: 'clients',
            localField: 'clienteId',
            foreignField: '_id',
            as: 'cliente'
          }
        },
        {
          $unwind: '$cliente'
        },
        {
          $project: {
            _id: 1,
            clientName: '$cliente.name',
            service: { $arrayElemAt: ['$servicos.nome', 0] },
            amount: '$valorFinal',
            method: '$metodoPagamento',
            date: '$dataCriacao',
            status: 'PAID'
          }
        },
        {
          $sort: { date: -1 }
        },
        {
          $limit: 10
        }
      ]).toArray()
      
      console.log('📊 Resultado da agregação:', pagamentosRecentes.length);
      if (pagamentosRecentes.length > 0) {
        pagamentosRecentes.forEach((pagamento, index) => {
          console.log(`\n--- Pagamento ${index + 1} ---`);
          console.log(JSON.stringify(pagamento, null, 2));
        });
      } else {
        console.log('❌ Nenhum pagamento encontrado na agregação');
        
        // Verificar se o problema é no lookup
        console.log('\n🔍 VERIFICANDO LOOKUP...');
        const finalizacoesSemLookup = await db.collection('finalizacoes').aggregate([
          {
            $match: {
              status: 'ativo',
              dataCriacao: { $gte: dataInicio, $lte: hoje }
            }
          }
        ]).toArray()
        
        console.log('📊 Finalizações no período (sem lookup):', finalizacoesSemLookup.length);
        if (finalizacoesSemLookup.length > 0) {
          console.log('🔍 Primeira finalização:', JSON.stringify(finalizacoesSemLookup[0], null, 2));
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

verificarPagamentosRecentes();
