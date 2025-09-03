const { MongoClient } = require('mongodb');
require('dotenv').config();

async function debugApiFinanceiro() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db(process.env.DB_NAME || 'guapa');
    
    // Simular a query da API de financeiro
    console.log('\n🔍 === SIMULANDO API DE FINANCEIRO ===');
    
    const hoje = new Date();
    const dataInicioComissoes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    console.log(`📅 Período: ${dataInicioComissoes.toLocaleDateString()} a ${hoje.toLocaleDateString()}`);
    
    // 1. Métodos de pagamento
    console.log('\n💳 === MÉTODOS DE PAGAMENTO ===');
    const metodosPagamento = await db.collection('finalizacoes').aggregate([
      {
        $match: {
          dataCriacao: { $gte: dataInicioComissoes, $lte: hoje }
        }
      },
      {
        $group: {
          _id: '$metodoPagamento',
          count: { $sum: 1 },
          amount: { $sum: '$valorFinal' }
        }
      },
      {
        $sort: { amount: -1 }
      }
    ]).toArray();
    
    console.log(`📊 Métodos encontrados: ${metodosPagamento.length}`);
    metodosPagamento.forEach(method => {
      console.log(`   - ${method._id}: ${method.count} transações, R$ ${method.amount}`);
    });
    
    // 2. Pagamentos recentes
    console.log('\n📋 === PAGAMENTOS RECENTES ===');
    const pagamentosRecentes = await db.collection('finalizacoes').aggregate([
      {
        $match: {
          dataCriacao: { $gte: dataInicioComissoes, $lte: hoje }
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
        $lookup: {
          from: 'comandas',
          localField: 'comandaId',
          foreignField: '_id',
          as: 'comanda'
        }
      },
      {
        $unwind: '$comanda'
      },
      {
        $project: {
          _id: 1,
          clientName: '$cliente.name',
          service: { $arrayElemAt: ['$comanda.servicos.nome', 0] },
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
    ]).toArray();
    
    console.log(`📊 Pagamentos encontrados: ${pagamentosRecentes.length}`);
    pagamentosRecentes.forEach((payment, index) => {
      console.log(`   ${index + 1}. ${payment.clientName} - ${payment.service} - R$ ${payment.amount} - ${payment.method}`);
    });
    
    // 3. Verificar se há problemas com as datas
    console.log('\n🔍 === VERIFICANDO DATAS ===');
    const finalizacoes = await db.collection('finalizacoes').find({}).toArray();
    
    console.log(`📊 Total de finalizações: ${finalizacoes.length}`);
    finalizacoes.forEach((fin, index) => {
      console.log(`   ${index + 1}. ID: ${fin._id}`);
      console.log(`      Data Criação: ${fin.dataCriacao}`);
      console.log(`      Valor Final: ${fin.valorFinal}`);
      console.log(`      Método: ${fin.metodoPagamento}`);
      console.log(`      Cliente ID: ${fin.clienteId}`);
      console.log(`      Comanda ID: ${fin.comandaId}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

debugApiFinanceiro();
