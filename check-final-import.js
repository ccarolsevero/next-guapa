require('dotenv').config();
const { MongoClient } = require('mongodb');

async function checkFinalImport() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    console.log('🔌 Conectando ao MongoDB...');
    await client.connect();

    const db = client.db(process.env.DB_NAME || 'guapa');
    const collection = db.collection(process.env.COLLECTION_NAME || 'clients');

    console.log('📊 === VERIFICAÇÃO FINAL DA IMPORTAÇÃO ===\n');

    // 1. Contar total de clientes
    const totalClients = await collection.countDocuments();
    console.log(`📈 Total de clientes no banco: ${totalClients}`);

    if (totalClients === 0) {
      console.log('⚠️  Nenhum cliente encontrado no banco!');
      return;
    }

    // 2. Verificar se há duplicados por nome
    console.log('\n🔍 Verificando duplicados por NOME...');
    const duplicatesByName = await collection
      .aggregate([
        {
          $group: {
            _id: { $toLower: '$name' },
            count: { $sum: 1 },
            clients: {
              $push: {
                _id: '$_id',
                name: '$name',
                phone: '$phone',
                email: '$email',
              },
            },
          },
        },
        {
          $match: { count: { $gt: 1 } },
        },
        {
          $sort: { count: -1 },
        },
      ])
      .toArray();

    if (duplicatesByName.length === 0) {
      console.log('✅ Nenhum duplicado por nome encontrado!');
    } else {
      console.log(
        `❌ Encontrados ${duplicatesByName.length} nomes duplicados:`,
      );
      duplicatesByName.forEach((dup, index) => {
        console.log(
          `\n${index + 1}. Nome: "${dup._id}" (${dup.count} ocorrências)`,
        );
        dup.clients.forEach((client, clientIndex) => {
          console.log(
            `   - Cliente ${clientIndex + 1}: ID: ${client._id}, Telefone: ${
              client.phone
            }, Email: ${client.email}`,
          );
        });
      });
    }

    // 3. Verificar se há duplicados por telefone
    console.log('\n🔍 Verificando duplicados por TELEFONE...');
    const duplicatesByPhone = await collection
      .aggregate([
        {
          $group: {
            _id: '$phone',
            count: { $sum: 1 },
            clients: {
              $push: {
                _id: '$_id',
                name: '$name',
                phone: '$phone',
                email: '$email',
              },
            },
          },
        },
        {
          $match: { count: { $gt: 1 } },
        },
        {
          $sort: { count: -1 },
        },
      ])
      .toArray();

    if (duplicatesByPhone.length === 0) {
      console.log('✅ Nenhum duplicado por telefone encontrado!');
    } else {
      console.log(
        `❌ Encontrados ${duplicatesByPhone.length} telefones duplicados:`,
      );
      duplicatesByPhone.forEach((dup, index) => {
        console.log(
          `\n${index + 1}. Telefone: "${dup._id}" (${dup.count} ocorrências)`,
        );
        dup.clients.forEach((client, clientIndex) => {
          console.log(
            `   - Cliente ${clientIndex + 1}: ID: ${client._id}, Nome: ${
              client.name
            }, Email: ${client.email}`,
          );
        });
      });
    }

    // 4. Verificar se há duplicados por email
    console.log('\n🔍 Verificando duplicados por EMAIL...');
    const duplicatesByEmail = await collection
      .aggregate([
        {
          $match: { email: { $exists: true, $ne: '' } },
        },
        {
          $group: {
            _id: { $toLower: '$email' },
            count: { $sum: 1 },
            clients: {
              $push: {
                _id: '$_id',
                name: '$name',
                phone: '$phone',
                email: '$email',
              },
            },
          },
        },
        {
          $match: { count: { $gt: 1 } },
        },
        {
          $sort: { count: -1 },
        },
      ])
      .toArray();

    if (duplicatesByEmail.length === 0) {
      console.log('✅ Nenhum duplicado por email encontrado!');
    } else {
      console.log(
        `❌ Encontrados ${duplicatesByEmail.length} emails duplicados:`,
      );
      duplicatesByEmail.forEach((dup, index) => {
        console.log(
          `\n${index + 1}. Email: "${dup._id}" (${dup.count} ocorrências)`,
        );
        dup.clients.forEach((client, clientIndex) => {
          console.log(
            `   - Cliente ${clientIndex + 1}: ID: ${client._id}, Nome: ${
              client.name
            }, Telefone: ${client.phone}`,
          );
        });
      });
    }

    // 5. Resumo final
    console.log('\n📋 === RESUMO FINAL ===');
    console.log(`📊 Total de clientes: ${totalClients}`);
    console.log(`🔍 Duplicados por nome: ${duplicatesByName.length}`);
    console.log(`🔍 Duplicados por telefone: ${duplicatesByPhone.length}`);
    console.log(`🔍 Duplicados por email: ${duplicatesByEmail.length}`);

    const totalDuplicates =
      duplicatesByName.length +
      duplicatesByPhone.length +
      duplicatesByEmail.length;
    if (totalDuplicates === 0) {
      console.log('🎉 PERFEITO! Nenhum duplicado encontrado!');
    } else {
      console.log(
        `⚠️  ATENÇÃO: ${totalDuplicates} tipos de duplicados encontrados!`,
      );
    }

    // 6. Verificar se chegou perto dos 2000 clientes esperados
    const expectedClients = 2000;
    const percentage = ((totalClients / expectedClients) * 100).toFixed(1);
    console.log(`\n🎯 Progresso da importação:`);
    console.log(`   - Esperado: ${expectedClients} clientes`);
    console.log(`   - Atual: ${totalClients} clientes`);
    console.log(`   - Progresso: ${percentage}%`);

    if (totalClients >= expectedClients * 0.95) {
      console.log('✅ Importação praticamente completa! (95%+)');
    } else if (totalClients >= expectedClients * 0.8) {
      console.log('🟡 Importação bem avançada! (80%+)');
    } else if (totalClients >= expectedClients * 0.5) {
      console.log('🟠 Importação na metade! (50%+)');
    } else {
      console.log('🔴 Importação ainda no início! (<50%)');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar importação:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Conexão fechada.');
  }
}

// Executar verificação
checkFinalImport();
