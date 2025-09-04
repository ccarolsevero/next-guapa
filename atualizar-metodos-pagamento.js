const { MongoClient } = require('mongodb');

async function atualizarMetodosPagamento() {
  const uri = "mongodb+srv://brunacanovas_db_user:amCzSzLUpD7P96gD@espacoguapa.npfnuuc.mongodb.net/?retryWrites=true&w=majority&appName=Espacoguapa";
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB Atlas');
    
    const db = client.db('guapa');
    
    // Atualizar comandas finalizadas sem método de pagamento
    console.log('\n🔍 Atualizando comandas sem método de pagamento...');
    
    const result = await db.collection('comandas').updateMany(
      { 
        status: 'finalizada',
        metodoPagamento: { $exists: false }
      },
      { 
        $set: { 
          metodoPagamento: 'dinheiro' // Método padrão
        }
      }
    );
    
    console.log(`✅ Comandas atualizadas: ${result.modifiedCount}`);
    
    // Verificar se funcionou
    const comandasAtualizadas = await db.collection('comandas').find({ 
      status: 'finalizada',
      metodoPagamento: { $exists: true }
    }).toArray();
    
    console.log(`\n📊 Comandas com método de pagamento: ${comandasAtualizadas.length}`);
    
    if (comandasAtualizadas.length > 0) {
      console.log('\n💳 Métodos de pagamento encontrados:');
      comandasAtualizadas.forEach((comanda, index) => {
        console.log(`  ${index + 1}. ID: ${comanda._id} - Método: ${comanda.metodoPagamento}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

atualizarMetodosPagamento();
