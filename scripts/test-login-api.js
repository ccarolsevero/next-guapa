const fetch = require('node-fetch');

async function testLoginAPI() {
  try {
    console.log('🧪 Testando API de login...');
    
    const loginData = {
      username: 'teste',
      password: 'teste123'
    };
    
    console.log('📤 Enviando dados:', loginData);
    
    const response = await fetch('https://espacoguapa.com/api/employee-auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    console.log('📥 Status da resposta:', response.status);
    console.log('📥 Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📥 Resposta:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ Login bem-sucedido!');
      console.log('   - Token:', data.token?.substring(0, 20) + '...');
      console.log('   - Professional:', data.professional?.name);
    } else {
      console.log('❌ Login falhou');
      try {
        const errorData = JSON.parse(responseText);
        console.log('   - Erro:', errorData.error);
      } catch (e) {
        console.log('   - Erro (texto):', responseText);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

testLoginAPI();
