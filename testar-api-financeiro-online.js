async function testarApiFinanceiro() {
  try {
    console.log('🔍 Testando API de financeiro online...');
    
    const response = await fetch('https://nextjs-guapa-d31d5x67x-ana-carolina-severos-projects.vercel.app/api/financeiro');
    
    console.log('📡 Status da resposta:', response.status);
    console.log('📡 Status OK:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na resposta:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Dados recebidos:', data);
    
    if (data.error) {
      console.error('❌ Erro nos dados:', data.error);
    } else {
      console.log('📊 Dados financeiros carregados com sucesso!');
      console.log('💰 Faturamento:', data.faturamentoPorMes);
      console.log('👩‍💼 Comissões:', data.comissoesPorProfissional);
      console.log('💳 Métodos de pagamento:', data.metodosPagamento);
      console.log('📋 Pagamentos recentes:', data.pagamentosRecentes);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error);
  }
}

testarApiFinanceiro();
