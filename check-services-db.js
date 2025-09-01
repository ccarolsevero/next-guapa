import { connectToDatabase } from './src/lib/mongodb.js'

async function checkAndFixServices() {
  try {
    console.log('🔍 Conectando ao banco...')
    await connectToDatabase()
    
    // Importar dinamicamente os modelos
    const { default: Service } = await import('./src/models/Service.js')
    
    console.log('\n=== VERIFICANDO SERVIÇOS ===')
    const allServices = await Service.find({})
    console.log('📊 Total de serviços no banco:', allServices.length)
    
    if (allServices.length === 0) {
      console.log('❌ Nenhum serviço encontrado no banco!')
      console.log('📝 Criando serviços padrão...')
      
      const defaultServices = [
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
      
      const createdServices = await Service.insertMany(defaultServices)
      console.log('✅ Serviços criados:', createdServices.length)
      
    } else {
      console.log('📋 Serviços encontrados:')
      allServices.forEach((service, index) => {
        console.log(`  ${index + 1}. ${service.name} - Ativo: ${service.isActive}`)
      })
      
      // Verificar se há serviços inativos
      const inactiveServices = allServices.filter(s => !s.isActive)
      if (inactiveServices.length > 0) {
        console.log(`\n⚠️  ${inactiveServices.length} serviços inativos encontrados. Ativando...`)
        
        await Service.updateMany(
          { isActive: false },
          { isActive: true }
        )
        
        console.log('✅ Todos os serviços foram ativados!')
      }
    }
    
    // Verificar final
    const finalServices = await Service.find({ isActive: true })
    console.log(`\n🎉 Total de serviços ativos: ${finalServices.length}`)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    process.exit(0)
  }
}

checkAndFixServices()
