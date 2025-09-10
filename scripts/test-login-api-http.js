const https = require('https');
const http = require('http');

async function testLoginAPI() {
  try {
    console.log('🧪 Testando API de login via HTTP...');
    
    const testData = {
      username: 'bruna',
      password: 'bruna123'
    };
    
    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'espacoguapa.com',
      port: 443,
      path: '/api/employee-auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    console.log('📡 Enviando requisição para:', `https://${options.hostname}${options.path}`);
    console.log('📝 Dados:', testData);
    
    const req = https.request(options, (res) => {
      console.log('📊 Status:', res.statusCode);
      console.log('📋 Headers:', res.headers);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📄 Resposta completa:');
        try {
          const jsonData = JSON.parse(data);
          console.log(JSON.stringify(jsonData, null, 2));
        } catch (e) {
          console.log('❌ Resposta não é JSON válido:');
          console.log(data);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Erro na requisição:', error);
    });
    
    req.write(postData);
    req.end();
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Testar também com o usuário teste
async function testLoginAPITeste() {
  try {
    console.log('\n🧪 Testando API de login com usuário teste...');
    
    const testData = {
      username: 'teste',
      password: 'teste123'
    };
    
    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'espacoguapa.com',
      port: 443,
      path: '/api/employee-auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    console.log('📡 Enviando requisição para:', `https://${options.hostname}${options.path}`);
    console.log('📝 Dados:', testData);
    
    const req = https.request(options, (res) => {
      console.log('📊 Status:', res.statusCode);
      console.log('📋 Headers:', res.headers);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📄 Resposta completa:');
        try {
          const jsonData = JSON.parse(data);
          console.log(JSON.stringify(jsonData, null, 2));
        } catch (e) {
          console.log('❌ Resposta não é JSON válido:');
          console.log(data);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Erro na requisição:', error);
    });
    
    req.write(postData);
    req.end();
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar ambos os testes
testLoginAPI();
setTimeout(() => {
  testLoginAPITeste();
}, 2000);
