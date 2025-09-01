// Script para criar serviços via API
const services = [
  {
    name: 'Avaliação Capilar',
    category: 'Consultoria e Avaliação',
    description: 'Avaliação completa do couro cabeludo e fios para identificar necessidades específicas.',
    price: 60.00,
    isActive: true,
    order: 1
  },
  {
    name: 'Consultoria/Corte',
    category: 'Consultoria e Avaliação',
    description: 'Consultoria de visagismo + corte personalizado para valorizar seu tipo de cabelo.',
    price: 198.00,
    isActive: true,
    order: 2
  },
  {
    name: 'Corte',
    category: 'Cortes',
    description: 'Corte de cabelo com manutenção das pontas e acabamento profissional.',
    price: 132.00,
    isActive: true,
    order: 1
  },
  {
    name: 'Back To Natural - P',
    category: 'Colorimetria',
    description: 'Repigmentação de cabelos loiros para cabelos mais curtos.',
    price: 231.00,
    isActive: true,
    order: 1
  },
  {
    name: 'Back To Natural - M',
    category: 'Colorimetria',
    description: 'Repigmentação de cabelos loiros para cabelos médios.',
    price: 319.00,
    isActive: true,
    order: 2
  },
  {
    name: 'Back To Natural - G',
    category: 'Colorimetria',
    description: 'Repigmentação de cabelos loiros para cabelos longos.',
    price: 319.00,
    isActive: true,
    order: 3
  },
  {
    name: 'Iluminado P',
    category: 'Colorimetria',
    description: 'Iluminado para cabelos mais curtos com técnica personalizada.',
    price: 231.00,
    isActive: true,
    order: 4
  },
  {
    name: 'Iluminado M',
    category: 'Colorimetria',
    description: 'Iluminado para cabelos médios com técnica personalizada.',
    price: 319.00,
    isActive: true,
    order: 5
  },
  {
    name: 'Iluminado G',
    category: 'Colorimetria',
    description: 'Iluminado para cabelos longos com técnica personalizada.',
    price: 319.00,
    isActive: true,
    order: 6
  },
  {
    name: 'Mechas Coloridas',
    category: 'Colorimetria',
    description: 'Mechas coloridas personalizadas para um visual único.',
    price: 319.00,
    isActive: true,
    order: 7
  },
  {
    name: 'Coloração Keune',
    category: 'Colorimetria',
    description: 'Coloração profissional com produtos Keune de alta qualidade.',
    price: 319.00,
    isActive: true,
    order: 8
  },
  {
    name: 'Limpeza de Couro Cabeludo',
    category: 'Tratamentos',
    description: 'Limpeza profunda do couro cabeludo para remover impurezas e resíduos.',
    price: 80.00,
    isActive: true,
    order: 1
  },
  {
    name: 'Reconstrução Capilar',
    category: 'Tratamentos',
    description: 'Tratamento intensivo para reconstruir a estrutura dos fios danificados.',
    price: 120.00,
    isActive: true,
    order: 2
  },
  {
    name: 'Hidratação Natural',
    category: 'Tratamentos',
    description: 'Hidratação profunda com produtos naturais para fios mais saudáveis.',
    price: 100.00,
    isActive: true,
    order: 3
  },
  {
    name: 'Tratamento Anti-Queda',
    category: 'Tratamentos',
    description: 'Tratamento especializado para combater a queda capilar.',
    price: 150.00,
    isActive: true,
    order: 4
  }
]

async function createServices() {
  console.log('🚀 Criando serviços via API...')
  
  for (const service of services) {
    try {
      const response = await fetch('https://nextjs-guapa-4349iy0sq-ana-carolina-severos-projects.vercel.app/api/services', {
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

createServices()
