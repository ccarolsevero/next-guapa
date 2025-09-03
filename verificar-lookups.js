const { MongoClient } = require('mongodb');
require('dotenv').config();

async function verificarLookups() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db(process.env.DB_NAME || 'guapa');
    
    // Verificar se as coleções existem
    console.log('\n🔍 === VERIFICANDO COLEÇÕES ===');
    const collections = await db.listCollections().toArray();
    console.log('📊 Coleções disponíveis:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Verificar uma finalização específica
    console.log('\n🔍 === VERIFICANDO FINALIZAÇÃO ESPECÍFICA ===');
    const finalizacao = await db.collection('finalizacoes').findOne({});
    
    if (finalizacao) {
      console.log('📋 Finalização encontrada:');
      console.log(`   ID: ${finalizacao._id}`);
      console.log(`   Cliente ID: ${finalizacao.clienteId} (tipo: ${typeof finalizacao.clienteId})`);
      console.log(`   Comanda ID: ${finalizacao.comandaId} (tipo: ${typeof finalizacao.comandaId})`);
      
      // Verificar se o cliente existe
      console.log('\n👤 === VERIFICANDO CLIENTE ===');
      try {
        const cliente = await db.collection('clients').findOne({
          _id: new (require('mongodb')).ObjectId(finalizacao.clienteId)
        });
        
        if (cliente) {
          console.log(`✅ Cliente encontrado: ${cliente.name}`);
        } else {
          console.log('❌ Cliente não encontrado');
        }
      } catch (error) {
        console.log('❌ Erro ao buscar cliente:', error.message);
      }
      
      // Verificar se a comanda existe
      console.log('\n📋 === VERIFICANDO COMANDA ===');
      try {
        const comanda = await db.collection('comandas').findOne({
          _id: new (require('mongodb')).ObjectId(finalizacao.comandaId)
        });
        
        if (comanda) {
          console.log(`✅ Comanda encontrada: ${comanda._id}`);
          console.log(`   Serviços: ${comanda.servicos?.length || 0}`);
          if (comanda.servicos && comanda.servicos.length > 0) {
            console.log(`   Primeiro serviço: ${comanda.servicos[0].nome}`);
          }
        } else {
          console.log('❌ Comanda não encontrada');
        }
      } catch (error) {
        console.log('❌ Erro ao buscar comanda:', error.message);
      }
    }
    
    // Testar lookup simples
    console.log('\n🔍 === TESTANDO LOOKUP SIMPLES ===');
    const testLookup = await db.collection('finalizacoes').aggregate([
      { $limit: 1 },
      {
        $lookup: {
          from: 'clients',
          localField: 'clienteId',
          foreignField: '_id',
          as: 'cliente'
        }
      }
    ]).toArray();
    
    console.log('📊 Resultado do lookup:');
    console.log(`   Cliente encontrado: ${testLookup[0]?.cliente?.length || 0}`);
    if (testLookup[0]?.cliente?.length > 0) {
      console.log(`   Nome do cliente: ${testLookup[0].cliente[0].name}`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

verificarLookups();
