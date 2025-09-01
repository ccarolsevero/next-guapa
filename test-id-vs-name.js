const API_BASE =
  'https://nextjs-guapa-jcat41wf8-ana-carolina-severos-projects.vercel.app/api';

async function testAPI(identifier, type) {
  console.log(`\n🔍 Testando ${type}: ${identifier}`);

  try {
    // 1. Testar API de profissionais
    console.log(`📡 Fazendo fetch para /api/professionals/${identifier}...`);
    const profResponse = await fetch(`${API_BASE}/professionals/${identifier}`);

    if (profResponse.ok) {
      const professional = await profResponse.json();
      console.log(`✅ Profissional encontrada: ${professional.name}`);
      console.log(`📋 Serviços configurados: ${professional.services.length}`);
      console.log(`📋 Serviços:`, professional.services);

      // 2. Testar API de serviços
      console.log(`📡 Fazendo fetch para /api/services...`);
      const servicesResponse = await fetch(`${API_BASE}/services`);

      if (servicesResponse.ok) {
        const allServices = await servicesResponse.json();
        console.log(`📊 Total de serviços no banco: ${allServices.length}`);

        // 3. Testar lógica de filtro
        console.log(`🔍 Testando lógica de filtro...`);
        const filteredServices = allServices.filter((service) => {
          const isIncluded = professional.services.includes(service.name);
          if (isIncluded) {
            console.log(`✅ MATCH: "${service.name}"`);
          }
          return isIncluded;
        });

        console.log(
          `🎯 Serviços filtrados encontrados: ${filteredServices.length}`,
        );
        console.log(
          `🎯 Serviços filtrados:`,
          filteredServices.map((s) => s.name),
        );

        return {
          success: true,
          professional,
          filteredServices,
          totalServices: allServices.length,
        };
      } else {
        console.error(`❌ Erro na API de serviços: ${servicesResponse.status}`);
        return { success: false, error: 'API de serviços falhou' };
      }
    } else {
      console.error(`❌ Erro na API de profissionais: ${profResponse.status}`);
      return { success: false, error: 'API de profissionais falhou' };
    }
  } catch (error) {
    console.error(`❌ Erro geral:`, error);
    return { success: false, error: error.message };
  }
}

async function compareResults() {
  console.log('🚀 Comparando API por ID vs Nome...');

  // Testar com ID
  const idResult = await testAPI('68b0dd7f95951eaee2236e8a', 'ID');

  // Testar com nome
  const nameResult = await testAPI('cicera', 'Nome');

  // Comparar resultados
  console.log('\n📊 COMPARAÇÃO DOS RESULTADOS:');
  console.log('=' * 50);

  if (idResult.success && nameResult.success) {
    console.log(
      `📋 ID - Profissional: ${idResult.professional.name}, Serviços: ${idResult.filteredServices.length}`,
    );
    console.log(
      `📋 Nome - Profissional: ${nameResult.professional.name}, Serviços: ${nameResult.filteredServices.length}`,
    );

    if (
      idResult.filteredServices.length === nameResult.filteredServices.length
    ) {
      console.log('✅ AMBAS AS APIS RETORNAM O MESMO NÚMERO DE SERVIÇOS!');
    } else {
      console.log('❌ DIFERENÇA ENCONTRADA!');
      console.log(`ID: ${idResult.filteredServices.length} serviços`);
      console.log(`Nome: ${nameResult.filteredServices.length} serviços`);
    }
  } else {
    console.log('❌ Uma das APIs falhou');
    console.log('ID:', idResult.error || 'Sucesso');
    console.log('Nome:', nameResult.error || 'Sucesso');
  }
}

compareResults();
