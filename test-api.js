const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  try {
    console.log('Testando API de profissionais...');
    
    // Teste 1: GET - Listar profissionais
    console.log('\n1. Testando GET /api/professionals...');
    const getResponse = await fetch('http://localhost:3000/api/professionals');
    const getData = await getResponse.json();
    console.log('Status:', getResponse.status);
    console.log('Profissionais encontrados:', getData.length);
    getData.forEach(prof => {
      console.log(`- ${prof.name} (${prof.email})`);
    });

    // Teste 2: POST - Adicionar Ana Carolina
    console.log('\n2. Testando POST /api/professionals...');
    const anaCarolinaData = {
      name: 'Ana Carolina Severo',
      title: 'Cabeleireira',
      email: 'ana@guapa.com',
      phone: '(19) 99999-8888',
      shortDescription: 'Especialista em cortes modernos e tratamentos capilares',
      fullDescription: 'Ana Carolina é uma profissional dedicada e apaixonada por transformar o visual de suas clientes. Com anos de experiência em cortes modernos, colorações e tratamentos capilares, ela oferece um atendimento personalizado e de qualidade.',
      services: [
        'Cortes Modernos',
        'Coloração',
        'Tratamentos Capilares',
        'Escova',
        'Finalização',
        'Hidratação',
        'Avaliação Capilar',
        'Consultoria de Visagismo'
      ],
      profileImage: '/assents/fotobruna.jpeg',
      gallery: [
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16.jpeg',
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (1).jpeg',
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (2).jpeg'
      ]
    };

    const postResponse = await fetch('http://localhost:3000/api/professionals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(anaCarolinaData)
    });

    console.log('Status:', postResponse.status);
    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log('✅ Ana Carolina adicionada com sucesso!');
      console.log('ID:', postData._id);
    } else {
      const errorData = await postResponse.json();
      console.log('❌ Erro ao adicionar:', errorData);
    }

    // Teste 3: GET novamente para verificar
    console.log('\n3. Verificando novamente GET /api/professionals...');
    const getResponse2 = await fetch('http://localhost:3000/api/professionals');
    const getData2 = await getResponse2.json();
    console.log('Status:', getResponse2.status);
    console.log('Profissionais encontrados:', getData2.length);
    getData2.forEach(prof => {
      console.log(`- ${prof.name} (${prof.email})`);
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testAPI();
