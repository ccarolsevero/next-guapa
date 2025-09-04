const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'guapa';

async function testReportsDebug() {
  if (!uri) {
    console.error('MONGODB_URI não está definida no .env.local');
    return;
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db(dbName);
    
    // Testar relatório de clientes aniversariantes
    console.log('\n📊 Testando relatório: clientes-aniversariantes');
    
    const aniversariantes = await db.collection('clients').find({
      birthDate: { $exists: true, $ne: null }
    }).toArray();
    
    console.log('Total de clientes com data de nascimento:', aniversariantes.length);
    
    if (aniversariantes.length > 0) {
      console.log('Primeiro cliente:', {
        name: aniversariantes[0].name,
        birthDate: aniversariantes[0].birthDate
      });
      
      // Função para verificar aniversário
      const isBirthdayThisMonth = (birthDate) => {
        const today = new Date();
        return birthDate.getMonth() === today.getMonth();
      };
      
      const aniversariantesEsteMes = aniversariantes.filter(client => 
        isBirthdayThisMonth(new Date(client.birthDate))
      );
      
      console.log('Aniversariantes este mês:', aniversariantesEsteMes.length);
      
      if (aniversariantesEsteMes.length > 0) {
        console.log('Primeiro aniversariante:', {
          name: aniversariantesEsteMes[0].name,
          birthDate: aniversariantesEsteMes[0].birthDate
        });
      }
    }
    
    // Testar relatório de clientes atendidos
    console.log('\n📊 Testando relatório: clientes-atendidos');
    
    const finalizacoes = await db.collection('finalizacoes').find({}).toArray();
    console.log('Total de finalizações:', finalizacoes.length);
    
    if (finalizacoes.length > 0) {
      console.log('Primeira finalização:', {
        clienteNome: finalizacoes[0].clienteNome,
        valorFinal: finalizacoes[0].valorFinal,
        dataCriacao: finalizacoes[0].dataCriacao
      });
    }
    
    // Testar relatório de lista de clientes
    console.log('\n📊 Testando relatório: lista-clientes');
    
    const todosClientes = await db.collection('clients').find({}).toArray();
    console.log('Total de clientes:', todosClientes.length);
    
    if (todosClientes.length > 0) {
      console.log('Primeiro cliente:', {
        name: todosClientes[0].name,
        email: todosClientes[0].email,
        phone: todosClientes[0].phone
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar relatórios:', error);
  } finally {
    await client.close();
  }
}

testReportsDebug();
