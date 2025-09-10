// Script para testar a interface de serviços
const fetch = require('node-fetch');

async function testServicesInterface() {
  try {
    console.log('🔍 Testando interface de serviços...');
    
    // Testar API de serviços
    console.log('\n📡 Testando GET /api/services...');
    const servicesResponse = await fetch('http://localhost:3000/api/services');
    const services = await servicesResponse.json();
    console.log(`✅ Serviços encontrados: ${services.length}`);
    services.forEach(service => {
      console.log(`  - ${service.name} (${service.category}) - R$ ${service.price}`);
    });
    
    // Testar API de categorias
    console.log('\n📡 Testando GET /api/service-categories...');
    const categoriesResponse = await fetch('http://localhost:3000/api/service-categories');
    const categories = await categoriesResponse.json();
    console.log(`✅ Categorias encontradas: ${categories.length}`);
    categories.forEach(category => {
      console.log(`  - ${category.name} (${category.isActive ? 'Ativa' : 'Inativa'})`);
    });
    
    // Testar criação de um novo serviço
    console.log('\n📡 Testando POST /api/services...');
    const newService = {
      name: `Teste Interface ${Date.now()}`,
      category: 'Cortes',
      description: 'Serviço criado via teste de interface',
      price: 25,
      duration: 30,
      order: 999,
      isFeatured: false
    };
    
    const createResponse = await fetch('http://localhost:3000/api/services', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newService)
    });
    
    if (createResponse.ok) {
      const createdService = await createResponse.json();
      console.log('✅ Serviço criado com sucesso:', createdService.service.name);
      
      // Verificar se o serviço foi realmente salvo
      console.log('\n🔍 Verificando se o serviço foi salvo...');
      const verifyResponse = await fetch('http://localhost:3000/api/services');
      const verifyServices = await verifyResponse.json();
      const foundService = verifyServices.find(s => s.name === newService.name);
      
      if (foundService) {
        console.log('✅ Serviço encontrado no banco:', foundService.name);
      } else {
        console.log('❌ Serviço NÃO encontrado no banco!');
      }
    } else {
      console.log('❌ Erro ao criar serviço:', await createResponse.text());
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testServicesInterface();
