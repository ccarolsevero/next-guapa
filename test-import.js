const { MongoClient } = require('mongodb');
require('dotenv').config();

// Configuração do MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa';
const DB_NAME = process.env.MONGODB_DB || 'guapa';
const COLLECTION_NAME = 'clients';

async function testImport() {
  let client;

  try {
    console.log('🔌 Conectando ao MongoDB...');
    console.log(`   URI: ${MONGODB_URI}`);
    console.log(`   Database: ${DB_NAME}`);

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log('✅ Conectado ao MongoDB com sucesso!');

    // Verificar se a coleção existe
    const collections = await db.listCollections().toArray();
    const clientsCollection = collections.find(
      (col) => col.name === COLLECTION_NAME,
    );

    if (!clientsCollection) {
      console.log('❌ Coleção "clients" não encontrada!');
      console.log(
        '   Coleções disponíveis:',
        collections.map((col) => col.name),
      );
      return;
    }

    console.log('✅ Coleção "clients" encontrada!');

    // Contar total de clientes
    const totalClients = await collection.countDocuments();
    console.log(`📊 Total de clientes no banco: ${totalClients}`);

    // Verificar estrutura dos clientes
    if (totalClients > 0) {
      const sampleClient = await collection.findOne({});
      console.log('\n📋 Estrutura de um cliente exemplo:');
      console.log('   Campos disponíveis:', Object.keys(sampleClient));
      console.log('   Exemplo de dados:', {
        _id: sampleClient._id,
        name: sampleClient.name,
        email: sampleClient.email,
        phone: sampleClient.phone,
        createdAt: sampleClient.createdAt,
        updatedAt: sampleClient.updatedAt,
      });
    }

    // Verificar se há clientes duplicados
    console.log('\n🔍 Verificando duplicatas...');

    // Por nome
    const duplicatesByName = await collection
      .aggregate([
        {
          $group: {
            _id: { $toLower: '$name' },
            count: { $sum: 1 },
            clients: { $push: { _id: '$_id', name: '$name', email: '$email' } },
          },
        },
        {
          $match: { count: { $gt: 1 } },
        },
      ])
      .toArray();

    console.log(`   🔴 Duplicatas por nome: ${duplicatesByName.length} grupos`);

    // Por email
    const duplicatesByEmail = await collection
      .aggregate([
        {
          $group: {
            _id: { $toLower: '$email' },
            count: { $sum: 1 },
            clients: { $push: { _id: '$_id', name: '$name', email: '$email' } },
          },
        },
        {
          $match: { count: { $gt: 1 } },
        },
      ])
      .toArray();

    console.log(
      `   🔴 Duplicatas por email: ${duplicatesByEmail.length} grupos`,
    );

    // Por telefone
    const duplicatesByPhone = await collection
      .aggregate([
        {
          $group: {
            _id: {
              $replaceAll: { input: '$phone', find: '\\D', replacement: '' },
            },
            count: { $sum: 1 },
            clients: { $push: { _id: '$_id', name: '$name', phone: '$phone' } },
          },
        },
        {
          $match: { count: { $gt: 1 } },
        },
      ])
      .toArray();

    console.log(
      `   🔴 Duplicatas por telefone: ${duplicatesByPhone.length} grupos`,
    );

    // Mostrar exemplos de duplicatas
    if (duplicatesByName.length > 0) {
      console.log('\n📋 Exemplos de duplicatas por nome:');
      duplicatesByName.slice(0, 3).forEach((group) => {
        console.log(`   "${group._id}": ${group.count} registros`);
        group.clients.slice(0, 2).forEach((client) => {
          console.log(`     - ${client.email} | ${client._id}`);
        });
      });
    }

    // Verificar clientes recentes (últimos 10)
    console.log('\n📅 Últimos clientes adicionados:');
    const recentClients = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    recentClients.forEach((client, index) => {
      const date = client.createdAt
        ? new Date(client.createdAt).toLocaleDateString('pt-BR')
        : 'Data não informada';
      console.log(
        `   ${index + 1}. ${client.name} (${client.email}) - ${date}`,
      );
    });

    console.log('\n✅ Teste concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Conexão com MongoDB fechada.');
    }
  }
}

// Executar teste
testImport();
