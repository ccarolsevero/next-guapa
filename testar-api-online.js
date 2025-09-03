async function testarAPIOnline() {
  try {
    console.log('🌐 Testando API Financeiro online...')
    
    // Testar a API com diferentes períodos
    const periodos = ['1month', '3months', '6months', '1year']
    
    for (const periodo of periodos) {
      console.log(`\n📊 Testando período: ${periodo}`)
      
      try {
        const response = await fetch(`https://nextjs-guapa-itg7da3u8-ana-carolina-severos-projects.vercel.app/api/financeiro?period=${periodo}`)
        
        if (response.ok) {
          const data = await response.json()
          console.log(`   ✅ Status: ${response.status}`)
          console.log(`   📈 Comissões por profissional: ${data.comissoesPorProfissional?.length || 0}`)
          console.log(`   💳 Pagamentos recentes: ${data.recentPayments?.length || 0}`)
          console.log(`   💰 Métodos de pagamento: ${data.paymentMethods?.length || 0}`)
          
          if (data.comissoesPorProfissional && data.comissoesPorProfissional.length > 0) {
            console.log('   👥 Profissionais encontrados:')
            data.comissoesPorProfissional.forEach((prof, index) => {
              console.log(`      ${index + 1}. ${prof.nome}: R$ ${prof.totalComissao.toFixed(2)}`)
            })
          }
          
          if (data.recentPayments && data.recentPayments.length > 0) {
            console.log('   💳 Pagamentos encontrados:')
            data.recentPayments.slice(0, 3).forEach((pag, index) => {
              console.log(`      ${index + 1}. ${pag.clientName}: R$ ${pag.amount}`)
            })
          }
          
        } else {
          console.log(`   ❌ Status: ${response.status}`)
          const errorText = await response.text()
          console.log(`   📝 Erro: ${errorText}`)
        }
        
      } catch (error) {
        console.log(`   ❌ Erro na requisição: ${error.message}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testarAPIOnline()
