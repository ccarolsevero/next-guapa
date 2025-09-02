require('dotenv').config();
const { MongoClient } = require('mongodb');

async function checkExistingData() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    console.log('🔌 Conectando ao MongoDB...');
    await client.connect();

    const db = client.db(process.env.DB_NAME || 'guapa');
    
    console.log('📊 === VERIFICAÇÃO DE DADOS EXISTENTES ===\n');

    // 1. Verificar Profissionais
    console.log('👩‍💼 === PROFISSIONAIS ===');
    const professionalsCollection = db.collection('professionals');
    const professionalsCount = await professionalsCollection.countDocuments();
    console.log(`Total: ${professionalsCount}`);
    
    if (professionalsCount > 0) {
      const professionals = await professionalsCollection.find({}).limit(3).toArray();
      professionals.forEach((prof, index) => {
        console.log(`  ${index + 1}. ${prof.name} (${prof.title || 'Sem título'})`);
      });
    }

    // 2. Verificar Serviços
    console.log('\n✂️ === SERVIÇOS ===');
    const servicesCollection = db.collection('services');
    const servicesCount = await servicesCollection.countDocuments();
    console.log(`Total: ${servicesCount}`);
    
    if (servicesCount > 0) {
      const services = await servicesCollection.find({}).limit(3).toArray();
      services.forEach((service, index) => {
        console.log(`  ${index + 1}. ${service.name} - R$ ${service.price || 'Sem preço'}`);
      });
    }

    // 3. Verificar Produtos
    console.log('\n🛍️ === PRODUTOS ===');
    const productsCollection = db.collection('products');
    const productsCount = await productsCollection.countDocuments();
    console.log(`Total: ${productsCount}`);
    
    if (productsCount > 0) {
      const products = await productsCollection.find({}).limit(3).toArray();
      products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - R$ ${product.price || 'Sem preço'} (Estoque: ${product.stock || 'N/A'})`);
      });
    }

    // 4. Resumo
    console.log('\n📋 === RESUMO ===');
    console.log(`👩‍💼 Profissionais: ${professionalsCount}`);
    console.log(`✂️ Serviços: ${servicesCount}`);
    console.log(`🛍️ Produtos: ${productsCount}`);
    
    if (professionalsCount > 0 && servicesCount > 0 && productsCount > 0) {
      console.log('\n✅ Banco de dados tem todos os dados necessários!');
      console.log('💡 O sistema deve funcionar perfeitamente online.');
    } else {
      console.log('\n⚠️  Alguns dados estão faltando no banco.');
      console.log('💡 Verifique se os dados foram importados corretamente.');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Conexão fechada.');
  }
}

// Executar verificação
checkExistingData();
