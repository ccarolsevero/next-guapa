const { MongoClient } = require('mongodb');
require('dotenv').config();

// Usar as mesmas configurações do projeto
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa';
const DB_NAME = process.env.MONGODB_DB || 'guapa';
const COLLECTION_NAME = 'clients';

async function removeDuplicateClients() {
  let client;

  try {
    console.log('🔌 Conectando ao MongoDB...');
    console.log(`   URI: ${MONGODB_URI}`);
    console.log(`   Database: ${DB_NAME}`);
    console.log(`   Collection: ${COLLECTION_NAME}`);

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log('📊 Analisando clientes no banco...');

    // Buscar todos os clientes
    const allClients = await collection.find({}).toArray();
    console.log(`📋 Total de clientes encontrados: ${allClients.length}`);

    if (allClients.length === 0) {
      console.log('✅ Nenhum cliente encontrado no banco.');
      return;
    }

    // Estratégia 1: Agrupar por nome (case insensitive)
    console.log('\n🔍 Estratégia 1: Agrupando por nome...');
    const groupedByName = {};
    allClients.forEach((client) => {
      const normalizedName = client.name?.toLowerCase().trim() || '';
      if (!groupedByName[normalizedName]) {
        groupedByName[normalizedName] = [];
      }
      groupedByName[normalizedName].push(client);
    });

    // Estratégia 2: Agrupar por telefone
    console.log('🔍 Estratégia 2: Agrupando por telefone...');
    const groupedByPhone = {};
    allClients.forEach((client) => {
      const normalizedPhone = client.phone?.replace(/\D/g, '') || '';
      if (normalizedPhone && normalizedPhone.length >= 8) {
        if (!groupedByPhone[normalizedPhone]) {
          groupedByPhone[normalizedPhone] = [];
        }
        groupedByPhone[normalizedPhone].push(client);
      }
    });

    // Estratégia 3: Agrupar por email
    console.log('🔍 Estratégia 3: Agrupando por email...');
    const groupedByEmail = {};
    allClients.forEach((client) => {
      const normalizedEmail = client.email?.toLowerCase().trim() || '';
      if (normalizedEmail) {
        if (!groupedByEmail[normalizedEmail]) {
          groupedByEmail[normalizedEmail] = [];
        }
        groupedByEmail[normalizedEmail].push(client);
      }
    });

    // Identificar duplicatas por nome
    const duplicatesByName = {};
    Object.keys(groupedByName).forEach((name) => {
      if (groupedByName[name].length > 1) {
        duplicatesByName[name] = groupedByName[name];
      }
    });

    // Identificar duplicatas por telefone
    const duplicatesByPhone = {};
    Object.keys(groupedByPhone).forEach((phone) => {
      if (groupedByPhone[phone].length > 1) {
        duplicatesByPhone[phone] = groupedByPhone[phone];
      }
    });

    // Identificar duplicatas por email
    const duplicatesByEmail = {};
    Object.keys(groupedByEmail).forEach((email) => {
      if (groupedByEmail[email].length > 1) {
        duplicatesByEmail[email] = groupedByEmail[email];
      }
    });

    console.log(`\n📊 RESUMO DAS DUPLICATAS:`);
    console.log(
      `   🔴 Por nome: ${Object.keys(duplicatesByName).length} grupos`,
    );
    console.log(
      `   🔴 Por telefone: ${Object.keys(duplicatesByPhone).length} grupos`,
    );
    console.log(
      `   🔴 Por email: ${Object.keys(duplicatesByEmail).length} grupos`,
    );

    // Calcular total de duplicatas
    let totalDuplicatesByName = 0;
    let totalDuplicatesByPhone = 0;
    let totalDuplicatesByEmail = 0;

    Object.values(duplicatesByName).forEach((clients) => {
      totalDuplicatesByName += clients.length - 1;
    });

    Object.values(duplicatesByPhone).forEach((clients) => {
      totalDuplicatesByPhone += clients.length - 1;
    });

    Object.values(duplicatesByEmail).forEach((clients) => {
      totalDuplicatesByEmail += clients.length - 1;
    });

    console.log(`\n📈 TOTAL DE REGISTROS DUPLICADOS:`);
    console.log(`   🗑️  Por nome: ${totalDuplicatesByName} registros`);
    console.log(`   🗑️  Por telefone: ${totalDuplicatesByPhone} registros`);
    console.log(`   🗑️  Por email: ${totalDuplicatesByEmail} registros`);
    console.log(
      `   🗑️  TOTAL GERAL: ${
        totalDuplicatesByName + totalDuplicatesByPhone + totalDuplicatesByEmail
      } registros`,
    );

    if (
      totalDuplicatesByName +
        totalDuplicatesByPhone +
        totalDuplicatesByEmail ===
      0
    ) {
      console.log('\n✅ Nenhuma duplicata encontrada!');
      return;
    }

    // Mostrar exemplos de duplicatas
    if (Object.keys(duplicatesByName).length > 0) {
      console.log(`\n📋 EXEMPLOS DE DUPLICATAS POR NOME:`);
      Object.entries(duplicatesByName)
        .slice(0, 5)
        .forEach(([name, clients]) => {
          console.log(`   "${name}": ${clients.length} registros`);
          clients.slice(0, 3).forEach((client) => {
            console.log(
              `     - ${client.phone || 'Sem telefone'} | ${
                client.email || 'Sem email'
              } | ${client._id}`,
            );
          });
        });
    }

    // Perguntar confirmação
    console.log(
      '\n⚠️  ATENÇÃO: Esta operação irá REMOVER permanentemente os clientes duplicados!',
    );
    console.log(
      '   Para continuar, execute: node remove-duplicate-clients.js --confirm',
    );

    if (!process.argv.includes('--confirm')) {
      console.log('\n❌ Operação cancelada. Use --confirm para executar.');
      return;
    }

    console.log('\n🗑️  Iniciando remoção de duplicatas...');

    let removedCount = 0;

    // Remover duplicatas por nome (prioridade 1)
    console.log('\n🔴 Removendo duplicatas por nome...');
    for (const [name, clients] of Object.entries(duplicatesByName)) {
      // Ordenar por data de criação (mais antigo primeiro) ou por _id
      const sortedClients = clients.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        return a._id.toString().localeCompare(b._id.toString());
      });

      // Manter o primeiro (mais antigo) e remover os outros
      const toRemove = sortedClients.slice(1);

      for (const clientToRemove of toRemove) {
        try {
          await collection.deleteOne({ _id: clientToRemove._id });
          console.log(
            `   ✅ Removido por nome: "${clientToRemove.name}" (${clientToRemove._id})`,
          );
          removedCount++;
        } catch (error) {
          console.error(
            `   ❌ Erro ao remover ${clientToRemove.name}:`,
            error.message,
          );
        }
      }
    }

    // Remover duplicatas por telefone (prioridade 2)
    console.log('\n🔴 Removendo duplicatas por telefone...');
    for (const [phone, clients] of Object.entries(duplicatesByPhone)) {
      // Filtrar apenas clientes que ainda existem (não foram removidos por nome)
      const existingClients = clients.filter(
        (client) =>
          !clients.some(
            (otherClient) =>
              otherClient._id.toString() !== client._id.toString() &&
              otherClient.name?.toLowerCase() === client.name?.toLowerCase(),
          ),
      );

      if (existingClients.length > 1) {
        const sortedClients = existingClients.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(a.createdAt) - new Date(b.createdAt);
          }
          return a._id.toString().localeCompare(b._id.toString());
        });

        const toRemove = sortedClients.slice(1);

        for (const clientToRemove of toRemove) {
          try {
            await collection.deleteOne({ _id: clientToRemove._id });
            console.log(
              `   ✅ Removido por telefone: "${clientToRemove.name}" (${clientToRemove.phone})`,
            );
            removedCount++;
          } catch (error) {
            console.error(
              `   ❌ Erro ao remover ${clientToRemove.name}:`,
              error.message,
            );
          }
        }
      }
    }

    // Remover duplicatas por email (prioridade 3)
    console.log('\n🔴 Removendo duplicatas por email...');
    for (const [email, clients] of Object.entries(duplicatesByEmail)) {
      // Filtrar apenas clientes que ainda existem
      const existingClients = clients.filter(
        (client) =>
          !clients.some(
            (otherClient) =>
              otherClient._id.toString() !== client._id.toString() &&
              (otherClient.name?.toLowerCase() === client.name?.toLowerCase() ||
                otherClient.phone?.replace(/\D/g, '') ===
                  client.phone?.replace(/\D/g, '')),
          ),
      );

      if (existingClients.length > 1) {
        const sortedClients = existingClients.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(a.createdAt) - new Date(b.createdAt);
          }
          return a._id.toString().localeCompare(b._id.toString());
        });

        const toRemove = sortedClients.slice(1);

        for (const clientToRemove of toRemove) {
          try {
            await collection.deleteOne({ _id: clientToRemove._id });
            console.log(
              `   ✅ Removido por email: "${clientToRemove.name}" (${clientToRemove.email})`,
            );
            removedCount++;
          } catch (error) {
            console.error(
              `   ❌ Erro ao remover ${clientToRemove.name}:`,
              error.message,
            );
          }
        }
      }
    }

    console.log(`\n🎉 Operação concluída!`);
    console.log(`   ✅ Total de duplicatas removidas: ${removedCount}`);

    // Verificar resultado final
    const finalCount = await collection.countDocuments();
    console.log(`   📊 Total de clientes restantes: ${finalCount}`);
  } catch (error) {
    console.error('❌ Erro durante a operação:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Conexão com MongoDB fechada.');
    }
  }
}

// Função para apenas analisar (sem remover)
async function analyzeDuplicates() {
  let client;

  try {
    console.log('🔌 Conectando ao MongoDB...');
    console.log(`   URI: ${MONGODB_URI}`);
    console.log(`   Database: ${DB_NAME}`);

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log('📊 Analisando clientes no banco...');

    const allClients = await collection.find({}).toArray();
    console.log(`📋 Total de clientes encontrados: ${allClients.length}`);

    if (allClients.length === 0) {
      console.log('✅ Nenhum cliente encontrado no banco.');
      return;
    }

    // Agrupar por nome
    const groupedByName = {};
    allClients.forEach((client) => {
      const normalizedName = client.name?.toLowerCase().trim() || '';
      if (!groupedByName[normalizedName]) {
        groupedByName[normalizedName] = [];
      }
      groupedByName[normalizedName].push(client);
    });

    // Mostrar estatísticas
    const duplicates = {};
    let totalDuplicates = 0;

    Object.keys(groupedByName).forEach((name) => {
      if (groupedByName[name].length > 1) {
        duplicates[name] = groupedByName[name];
        totalDuplicates += groupedByName[name].length - 1;
      }
    });

    console.log(`\n🔍 ANÁLISE COMPLETA:`);
    console.log(
      `   📊 Total de nomes únicos: ${Object.keys(groupedByName).length}`,
    );
    console.log(
      `   🔴 Nomes com duplicatas: ${Object.keys(duplicates).length}`,
    );
    console.log(`   🗑️  Total de registros duplicados: ${totalDuplicates}`);
    console.log(
      `   💾 Espaço que pode ser liberado: ~${totalDuplicates} registros`,
    );

    if (Object.keys(duplicates).length > 0) {
      console.log(`\n📋 DETALHES DAS DUPLICATAS:`);
      Object.keys(duplicates)
        .slice(0, 10)
        .forEach((name) => {
          const count = duplicates[name].length;
          console.log(`   "${name}": ${count} registros`);
        });

      if (Object.keys(duplicates).length > 10) {
        console.log(
          `   ... e mais ${
            Object.keys(duplicates).length - 10
          } nomes com duplicatas`,
        );
      }
    }
  } catch (error) {
    console.error('❌ Erro durante a análise:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Conexão com MongoDB fechada.');
    }
  }
}

// Executar baseado nos argumentos
const args = process.argv.slice(2);

if (args.includes('--analyze') || args.length === 0) {
  console.log('🔍 MODO ANÁLISE - Apenas analisando duplicatas (sem remover)');
  analyzeDuplicates();
} else if (args.includes('--confirm')) {
  console.log('🗑️  MODO REMOÇÃO - Removendo duplicatas confirmado');
  removeDuplicateClients();
} else {
  console.log('📖 USO:');
  console.log(
    '   node remove-duplicate-clients.js --analyze  # Apenas analisar',
  );
  console.log(
    '   node remove-duplicate-clients.js --confirm # Remover duplicatas',
  );
}
