const { MongoClient } = require('mongodb');
require('dotenv').config();

async function verificarCamposFinalizacao() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db(process.env.DB_NAME || 'guapa');

    // Verificar uma finalização para ver os campos
    console.log('\n🔍 === VERIFICANDO CAMPOS DA FINALIZAÇÃO ===');
    const finalizacao = await db.collection('finalizacoes').findOne({});

    if (finalizacao) {
      console.log('📋 Campos encontrados na finalização:');
      Object.keys(finalizacao).forEach((campo) => {
        console.log(
          `   - ${campo}: ${finalizacao[campo]} (tipo: ${typeof finalizacao[
            campo
          ]})`,
        );
      });

      // Verificar campos específicos que a API está buscando
      console.log('\n🔍 === CAMPOS ESPECÍFICOS ===');
      console.log(
        `   paymentMethod: ${finalizacao.paymentMethod || 'NÃO ENCONTRADO'}`,
      );
      console.log(
        `   metodoPagamento: ${
          finalizacao.metodoPagamento || 'NÃO ENCONTRADO'
        }`,
      );
      console.log(
        `   valorFinal: ${finalizacao.valorFinal || 'NÃO ENCONTRADO'}`,
      );
      console.log(
        `   dataCriacao: ${finalizacao.dataCriacao || 'NÃO ENCONTRADO'}`,
      );
      console.log(`   createdAt: ${finalizacao.createdAt || 'NÃO ENCONTRADO'}`);
      console.log(`   data: ${finalizacao.data || 'NÃO ENCONTRADO'}`);
    } else {
      console.log('❌ Nenhuma finalização encontrada');
    }

    // Verificar todas as finalizações para ver os métodos de pagamento
    console.log('\n🔍 === MÉTODOS DE PAGAMENTO EXISTENTES ===');
    const finalizacoes = await db.collection('finalizacoes').find({}).toArray();

    console.log(`📊 Total de finalizações: ${finalizacoes.length}`);

    const metodosUnicos = new Set();
    finalizacoes.forEach((fin) => {
      if (fin.paymentMethod) metodosUnicos.add(fin.paymentMethod);
      if (fin.metodoPagamento) metodosUnicos.add(fin.metodoPagamento);
    });

    console.log('💳 Métodos de pagamento encontrados:');
    metodosUnicos.forEach((metodo) => {
      if (metodo) {
        console.log(`   - ${metodo}`);
      }
    });

    // Verificar valores
    console.log('\n🔍 === VALORES DAS FINALIZAÇÕES ===');
    finalizacoes.forEach((fin, index) => {
      console.log(`\n${index + 1}. Finalização #${fin._id}`);
      console.log(
        `   Valor Final: ${fin.valorFinal || fin.valorTotal || 'N/A'}`,
      );
      console.log(
        `   Método: ${fin.paymentMethod || fin.metodoPagamento || 'N/A'}`,
      );
      console.log(
        `   Data: ${fin.dataCriacao || fin.createdAt || fin.data || 'N/A'}`,
      );
    });
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

verificarCamposFinalizacao();
