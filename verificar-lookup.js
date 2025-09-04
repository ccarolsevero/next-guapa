const { MongoClient } = require('mongodb');

async function verificarLookup() {
  const uri = "mongodb+srv://brunacanovas_db_user:amCzSzLUpD7P96gD@espacoguapa.npfnuuc.mongodb.net/?retryWrites=true&w=majority&appName=Espacoguapa";
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB Atlas');
    
    const db = client.db('guapa');
    
    // Verificar coleção clients
    console.log('\n🔍 Verificando coleção "clients"...');
    const clients = await db.collection('clients').find({}).toArray();
    
    console.log(`Total de clients: ${clients.length}`);
    
    if (clients.length > 0) {
      console.log('\n🔍 ESTRUTURA DO PRIMEIRO CLIENT:');
      const primeiro = clients[0];
      console.log(JSON.stringify(primeiro, null, 2));
      
      // Verificar IDs dos clients
      console.log('\n👥 IDs DOS CLIENTS:');
      clients.slice(0, 5).forEach((client, index) => {
        console.log(`${index + 1}. ID: ${client._id} - Nome: ${client.name || 'N/A'}`);
      });
    }
    
    // Verificar finalizações
    console.log('\n🔍 Verificando finalizações...');
    const finalizacoes = await db.collection('finalizacoes').find({}).toArray();
    
    console.log(`Total de finalizações: ${finalizacoes.length}`);
    
    if (finalizacoes.length > 0) {
      console.log('\n🔍 IDs DOS CLIENTES NAS FINALIZAÇÕES:');
      finalizacoes.forEach((finalizacao, index) => {
        console.log(`${index + 1}. Cliente ID: ${finalizacao.clienteId} - Tipo: ${typeof finalizacao.clienteId}`);
      });
      
      // Verificar se os IDs existem na coleção clients
      console.log('\n🔍 VERIFICANDO EXISTÊNCIA DOS IDs...');
      for (const finalizacao of finalizacoes) {
        const cliente = await db.collection('clients').findOne({ _id: finalizacao.clienteId });
        if (cliente) {
          console.log(`✅ Cliente ID ${finalizacao.clienteId} encontrado: ${cliente.name}`);
        } else {
          console.log(`❌ Cliente ID ${finalizacao.clienteId} NÃO encontrado`);
        }
      }
    }
    
    // Testar lookup manual
    console.log('\n🔍 TESTANDO LOOKUP MANUAL...');
    const finalizacao = finalizacoes[0];
    if (finalizacao) {
      console.log(`Testando com finalização ID: ${finalizacao._id}`);
      console.log(`Cliente ID: ${finalizacao.clienteId}`);
      
      const cliente = await db.collection('clients').findOne({ _id: finalizacao.clienteId });
      console.log(`Cliente encontrado:`, cliente);
      
      if (cliente) {
        console.log('✅ Lookup funcionaria para esta finalização');
      } else {
        console.log('❌ Lookup falharia para esta finalização');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

verificarLookup();
