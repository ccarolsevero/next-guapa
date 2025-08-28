const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testProfessionalsAPI() {
  try {
    console.log('Testando API de profissionais...');
    
    // Teste 1: GET - Listar profissionais
    console.log('\n1. Testando GET /api/professionals...');
    const getResponse = await fetch('http://localhost:3000/api/professionals');
    const getData = await getResponse.json();
    console.log('Status:', getResponse.status);
    console.log('Profissionais encontrados:', getData.length);
    getData.forEach(prof => {
      console.log(`- ${prof.name} (${prof.email}) - Ativo: ${prof.isActive} - Destaque: ${prof.isFeatured}`);
    });

    // Teste 2: Verificar se a Bruna está na lista
    const bruna = getData.find(prof => prof.name.toLowerCase().includes('bruna'));
    if (bruna) {
      console.log('\n✅ Bruna encontrada na API!');
      console.log('Dados da Bruna:', {
        name: bruna.name,
        email: bruna.email,
        isActive: bruna.isActive,
        isFeatured: bruna.isFeatured,
        _id: bruna._id
      });
    } else {
      console.log('\n❌ Bruna NÃO encontrada na API');
    }

    // Teste 3: Verificar todos os profissionais
    console.log('\n2. Lista completa de profissionais:');
    getData.forEach((prof, index) => {
      console.log(`${index + 1}. ${prof.name} - ${prof.email} - Ativo: ${prof.isActive}`);
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testProfessionalsAPI();
