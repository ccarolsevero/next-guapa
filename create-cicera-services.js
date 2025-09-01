// Script para criar os serviços que faltam para a Cicera
const missingServices = [
  {
    name: 'Limpeza de Couro Cabeludo',
    category: 'Tratamentos',
    description: 'Limpeza profunda do couro cabeludo para remover impurezas, resíduos e células mortas.',
    price: 80.00,
    isActive: true,
    order: 1
  },
  {
    name: 'Reconstrução Capilar',
    category: 'Tratamentos',
    description: 'Tratamento intensivo para reconstruir a estrutura dos fios danificados e quebrados.',
    price: 120.00,
    isActive: true,
    order: 2
  }
]

async function createCiceraServices() {
  console.log('🚀 Criando serviços para a Cicera...')
  
  for (const service of missingServices) {
    try {
      const response = await fetch('https://nextjs-guapa-5xnzzrtrh-ana-carolina-severos-projects.vercel.app/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(service)
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log(`✅ ${service.name} criado com sucesso!`)
      } else {
        console.log(`❌ Erro ao criar ${service.name}:`, response.status)
      }
    } catch (error) {
      console.log(`❌ Erro ao criar ${service.name}:`, error.message)
    }
  }
  
  console.log('🎉 Processo concluído!')
}

createCiceraServices()
