const { MongoClient } = require('mongodb');
require('dotenv').config();

// Configuração do MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa';
const DB_NAME = process.env.MONGODB_DB || 'guapa';
const COLLECTION_NAME = 'clients';

async function testLargeImport() {
  let client;
  
  try {
    console.log('🔌 Conectando ao MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    console.log('✅ Conectado ao MongoDB com sucesso!');
    
    // Simular dados de teste para verificar performance
    console.log('\n🧪 Testando performance de inserção...');
    
    const testClients = [];
    const startTime = Date.now();
    
    // Criar 100 clientes de teste
    for (let i = 0; i < 100; i++) {
      testClients.push({
        name: `Cliente Teste ${i + 1}`,
        email: `cliente.teste.${i + 1}@guapa.com`,
        phone: `(19) 99999-${String(i + 1).padStart(4, '0')}`,
        address: 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP',
        notes: `Cliente de teste ${i + 1}`,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    console.log(`   📝 Criando ${testClients.length} clientes de teste...`);
    
    // Inserir em lotes para testar performance
    const batchSize = 10;
    let insertedCount = 0;
    
    for (let i = 0; i < testClients.length; i += batchSize) {
      const batch = testClients.slice(i, i + batchSize);
      
      try {
        // Verificar se já existem antes de inserir
        const existingEmails = batch.map(client => client.email);
        const existingClients = await collection.find({ email: { $in: existingEmails } }).toArray();
        const existingEmailsSet = new Set(existingClients.map(client => client.email));
        
        const newClients = batch.filter(client => !existingEmailsSet.has(client.email));
        
        if (newClients.length > 0) {
          const result = await collection.insertMany(newClients);
          insertedCount += result.insertedCount;
          console.log(`   ✅ Lote ${Math.floor(i / batchSize) + 1}: ${newClients.length} clientes inseridos`);
        } else {
          console.log(`   ⚠️  Lote ${Math.floor(i / batchSize) + 1}: Todos os clientes já existem`);
        }
      } catch (error) {
        console.error(`   ❌ Erro no lote ${Math.floor(i / batchSize) + 1}:`, error.message);
      }
    }
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`\n📊 RESULTADO DO TESTE:`);
    console.log(`   ⏱️  Tempo total: ${duration.toFixed(2)} segundos`);
    console.log(`   📝 Clientes inseridos: ${insertedCount}`);
    console.log(`   🚀 Taxa: ${(insertedCount / duration).toFixed(2)} clientes/segundo`);
    
    // Verificar total de clientes no banco
    const totalClients = await collection.countDocuments();
    console.log(`   📋 Total de clientes no banco: ${totalClients}`);
    
    // Verificar se há problemas de timeout
    console.log('\n🔍 Verificando configurações de timeout...');
    
    // Testar conexão com timeout
    const timeoutTest = async () => {
      try {
        const start = Date.now();
        await collection.findOne({});
        const duration = Date.now() - start;
        console.log(`   ✅ Query simples: ${duration}ms`);
      } catch (error) {
        console.error(`   ❌ Erro na query:`, error.message);
      }
    };
    
    await timeoutTest();
    
    // Verificar se há índices que podem estar causando lentidão
    console.log('\n🔍 Verificando índices...');
    try {
      const indexes = await collection.indexes();
      console.log(`   📊 Total de índices: ${indexes.length}`);
      indexes.forEach((index, i) => {
        console.log(`     ${i + 1}. ${JSON.stringify(index.key)}`);
      });
    } catch (error) {
      console.error(`   ❌ Erro ao verificar índices:`, error.message);
    }
    
    // Verificar se há problemas de memória ou conexão
    console.log('\n🔍 Verificando status da conexão...');
    try {
      const stats = await db.stats();
      console.log(`   💾 Tamanho da coleção: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   📊 Documentos: ${stats.count}`);
      console.log(`   🔍 Índices: ${stats.nindexes}`);
    } catch (error) {
      console.error(`   ❌ Erro ao verificar estatísticas:`, error.message);
    }
    
    console.log('\n✅ Teste de performance concluído!');
    
    // Recomendações
    console.log('\n💡 RECOMENDAÇÕES PARA IMPORTAÇÃO GRANDE:');
    console.log('   1. Use arquivos Excel com no máximo 1000 linhas por vez');
    console.log('   2. Divida arquivos grandes em partes menores');
    console.log('   3. Verifique se o arquivo Excel não tem linhas vazias');
    console.log('   4. Certifique-se de que as colunas estão no formato correto');
    console.log('   5. Use o modo de preview antes de importar');
    
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
testLargeImport();
