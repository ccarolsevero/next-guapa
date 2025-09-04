const fetch = require('node-fetch');

async function testAPIDirect() {
  try {
    console.log('🔄 Testando API diretamente...');
    
    // Testar diferentes tipos de relatórios
    const reportTypes = [
      'clientes-aniversariantes',
      'clientes-atendidos', 
      'lista-clientes',
      'financial'
    ];
    
    for (const reportType of reportTypes) {
      console.log(`\n📊 Testando relatório: ${reportType}`);
      
      try {
        const response = await fetch(`https://nextjs-guapa.vercel.app/api/reports?period=6months&type=${reportType}`);
        console.log(`Status: ${response.status} ${response.ok ? 'OK' : 'ERRO'}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Dados recebidos:`, {
            keys: Object.keys(data),
            hasData: Object.keys(data).length > 0,
            sampleData: Object.keys(data).length > 0 ? data[Object.keys(data)[0]] : null
          });
        } else {
          const errorText = await response.text();
          console.log(`Erro: ${errorText}`);
        }
      } catch (error) {
        console.log(`Erro na requisição: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testAPIDirect();
