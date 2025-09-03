import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function debugComissoes() {
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

    console.log('\n🔍 === DEBUG COMISSÕES E FINALIZAÇÕES ===');
    
    // 1. Verificar comissões
    const comissoes = await db.collection('comissoes').find({}).toArray();
    console.log(`💰 Comissões encontradas: ${comissoes.length}`);
    if (comissoes.length > 0) {
      comissoes.forEach((c, i) => {
        console.log(`   ${i + 1}. ID: ${c._id}`);
        console.log(`      Item: ${c.item}`);
        console.log(`      Valor: ${c.valor}`);
        console.log(`      Comissão: ${c.comissao}`);
        console.log(`      Profissional: ${c.profissionalId}`);
        console.log(`      Data: ${c.data}`);
        console.log(`      Status: ${c.status}`);
        console.log('');
      });
    }
    
    // 2. Verificar finalizações
    const finalizacoes = await db.collection('finalizacoes').find({}).toArray();
    console.log(`📋 Finalizações encontradas: ${finalizacoes.length}`);
    if (finalizacoes.length > 0) {
      finalizacoes.forEach((f, i) => {
        console.log(`   ${i + 1}. ID: ${f._id}`);
        console.log(`      Valor: ${f.valorFinal}`);
        console.log(`      Método: ${f.metodoPagamento}`);
        console.log(`      Data: ${f.dataCriacao}`);
        console.log(`      Cliente: ${f.clienteId}`);
        console.log(`      Comanda: ${f.comandaId}`);
        console.log('');
      });
    }
    
    // 3. Verificar profissionais
    const profissionais = await db.collection('profissionais').find({}).toArray();
    console.log(`👥 Profissionais encontrados: ${profissionais.length}`);
    if (profissionais.length > 0) {
      profissionais.forEach((p, i) => {
        console.log(`   ${i + 1}. ID: ${p._id}`);
        console.log(`      Nome: ${p.nome}`);
        console.log('');
      });
    }
    
    // 4. Verificar clientes
    const clientes = await db.collection('clientes').find({}).limit(3).toArray();
    console.log(`👤 Clientes (primeiros 3): ${clientes.length}`);
    if (clientes.length > 0) {
      clientes.forEach((c, i) => {
        console.log(`   ${i + 1}. ID: ${c._id}`);
        console.log(`      Nome: ${c.nome}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Erro durante o debug:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Conexão com MongoDB fechada');
    }
  }
}

// Executar o script
debugComissoes()
  .then(() => {
    console.log('✅ Debug concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
