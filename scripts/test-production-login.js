const https = require('https');

async function testProductionLogin() {
  try {
    console.log('🧪 Testando login com usuários de produção...');
    
    const productionUsers = ['ellenzona', 'vitoriona', 'cicera', 'felipe'];
    const commonPasswords = ['123456', 'password', 'admin', 'admin123', 'senha123', '123'];
    
    for (const username of productionUsers) {
      console.log(`\n🔐 Testando usuário: ${username}`);
      
      for (const password of commonPasswords) {
        const testData = { username, password };
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
        
        try {
          const response = await new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
              let data = '';
              res.on('data', (chunk) => {
                data += chunk;
              });
              res.on('end', () => {
                resolve({ status: res.statusCode, data });
              });
            });
            
            req.on('error', reject);
            req.write(postData);
            req.end();
          });
          
          if (response.status === 200) {
            console.log(`   ✅ LOGIN FUNCIONOU! Usuário: ${username}, Senha: ${password}`);
            const jsonData = JSON.parse(response.data);
            console.log(`   📋 Dados:`, jsonData);
            return; // Parar de testar este usuário
          } else if (response.status === 401) {
            console.log(`   ❌ Senha "${password}" inválida`);
          } else {
            console.log(`   ⚠️ Status ${response.status}: ${response.data}`);
          }
        } catch (error) {
          console.log(`   ❌ Erro ao testar senha "${password}":`, error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testProductionLogin();
