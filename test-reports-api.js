// Usando fetch nativo do Node.js

async function testReportsAPI() {
  const baseUrl = 'http://localhost:3000'
  
  const testCases = [
    { type: 'financial', period: '6months', name: 'Financeiro' },
    { type: 'clientes-aniversariantes', period: '6months', name: 'Clientes Aniversariantes' },
    { type: 'clientes-atendidos', period: '6months', name: 'Clientes Atendidos' },
    { type: 'lista-clientes', period: '6months', name: 'Lista de Clientes' },
    { type: 'faturamento-profissional', period: '6months', name: 'Faturamento Profissional' },
    { type: 'servicos-realizados', period: '6months', name: 'Serviços Realizados' },
    { type: 'produtos-vendidos', period: '6months', name: 'Produtos Vendidos' },
    { type: 'comandas-alteradas', period: '6months', name: 'Comandas Alteradas' }
  ]

  console.log('🧪 Testando API de Relatórios...\n')

  for (const testCase of testCases) {
    try {
      console.log(`📊 Testando: ${testCase.name}`)
      const url = `${baseUrl}/api/reports?period=${testCase.period}&type=${testCase.type}`
      console.log(`🔗 URL: ${url}`)
      
      const response = await fetch(url)
      const data = await response.json()
      
      console.log(`✅ Status: ${response.status}`)
      console.log(`📋 Dados retornados:`, Object.keys(data))
      console.log(`📊 Tamanho dos dados:`, JSON.stringify(data).length, 'caracteres')
      
      if (Object.keys(data).length === 0) {
        console.log('⚠️  NENHUM DADO RETORNADO!')
      } else {
        // Mostrar uma amostra dos dados
        const firstKey = Object.keys(data)[0]
        if (Array.isArray(data[firstKey])) {
          console.log(`📝 Amostra (${firstKey}):`, data[firstKey].slice(0, 2))
        } else {
          console.log(`📝 Amostra (${firstKey}):`, data[firstKey])
        }
      }
      
      console.log('─'.repeat(80))
    } catch (error) {
      console.error(`❌ Erro ao testar ${testCase.name}:`, error.message)
      console.log('─'.repeat(80))
    }
  }
}

testReportsAPI().catch(console.error)
