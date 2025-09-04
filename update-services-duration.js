// Script para atualizar duration dos serviços via API
const updateServicesDuration = async () => {
  const baseURL = 'http://localhost:3000'
  
  console.log('🔧 Atualizando duration dos serviços...\n')
  
  try {
    // Buscar todos os serviços
    const servicesResponse = await fetch(`${baseURL}/api/services`)
    const services = await servicesResponse.json()
    
    console.log(`📊 Serviços encontrados: ${services.length}`)
    
    for (const service of services) {
      console.log(`\n🔍 Verificando: ${service.name}`)
      console.log(`   Duration atual: ${service.duration || 'UNDEFINED'}`)
      
      if (!service.duration) {
        // Definir duration baseado no nome do serviço
        let duration = 60 // padrão
        
        if (service.name.toLowerCase().includes('avaliação') || service.name.toLowerCase().includes('avaliacao')) {
          duration = 30
        } else if (service.name.toLowerCase().includes('corte')) {
          duration = 60
        } else if (service.name.toLowerCase().includes('coloração') || service.name.toLowerCase().includes('coloracao')) {
          duration = 120
        } else if (service.name.toLowerCase().includes('tratamento')) {
          duration = 90
        } else if (service.name.toLowerCase().includes('hidratação') || service.name.toLowerCase().includes('hidratacao')) {
          duration = 60
        } else if (service.name.toLowerCase().includes('finalização') || service.name.toLowerCase().includes('finalizacao')) {
          duration = 30
        }
        
        console.log(`   ⚙️  Duration definido: ${duration} min`)
        
        // Atualizar via API PUT
        const updateResponse = await fetch(`${baseURL}/api/services`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: service._id,
            duration: duration
          })
        })
        
        if (updateResponse.ok) {
          console.log(`   ✅ Atualizado com sucesso!`)
        } else {
          console.log(`   ❌ Erro ao atualizar: ${updateResponse.status}`)
        }
      } else {
        console.log(`   ✅ Já tem duration: ${service.duration} min`)
      }
    }
    
    console.log('\n🎉 Atualização concluída!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

updateServicesDuration()
