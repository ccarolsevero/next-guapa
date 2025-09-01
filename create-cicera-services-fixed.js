const API_URL = 'https://nextjs-guapa-m42l2zk5d-ana-carolina-severos-projects.vercel.app/api/services'

const servicesToCreate = [
  {
    name: 'Limpeza de Couro Cabeludo',
    category: 'Consultoria e Avaliação', // Categoria válida!
    description: 'Limpeza profunda e tratamento do couro cabeludo para remover impurezas e promover saúde capilar',
    price: 120.00,
    isActive: true,
    order: 1
  },
  {
    name: 'Reconstrução Capilar',
    category: 'Consultoria e Avaliação', // Categoria válida!
    description: 'Tratamento intensivo para reconstruir a estrutura dos fios danificados',
    price: 150.00,
    isActive: true,
    order: 2
  }
]

async function createServices() {
  console.log('🚀 Criando serviços faltantes para Cicera...')
  
  for (const service of servicesToCreate) {
    try {
      console.log(`📝 Criando: ${service.name}`)
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(service)
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log(`✅ ${service.name} criado com sucesso! ID: ${result._id}`)
      } else {
        const errorText = await response.text()
        console.error(`❌ Erro ao criar ${service.name}: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error(`❌ Erro ao criar ${service.name}:`, error)
    }
    
    // Aguarda 1 segundo entre as requisições
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('🎯 Processo concluído!')
}

createServices()
