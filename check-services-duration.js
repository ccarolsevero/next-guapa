// Script para verificar e corrigir o campo duration nos serviços
const { MongoClient } = require('mongodb')

const checkAndFixServices = async () => {
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db('guapa')
    const servicesCollection = db.collection('services')
    
    console.log('🔍 Verificando serviços no banco...')
    
    const services = await servicesCollection.find({}).toArray()
    console.log(`📊 Total de serviços: ${services.length}`)
    
    services.forEach((service, index) => {
      console.log(`${index + 1}. ${service.name} - Duration: ${service.duration || 'UNDEFINED'}`)
    })
    
    // Atualizar serviços que não têm duration
    const servicesWithoutDuration = services.filter(s => !s.duration)
    console.log(`\n🔧 Serviços sem duration: ${servicesWithoutDuration.length}`)
    
    if (servicesWithoutDuration.length > 0) {
      console.log('📝 Atualizando serviços sem duration...')
      
      for (const service of servicesWithoutDuration) {
        // Definir duration baseado no nome do serviço ou usar padrão
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
        
        await servicesCollection.updateOne(
          { _id: service._id },
          { $set: { duration: duration } }
        )
        
        console.log(`✅ ${service.name} - Duration atualizado para ${duration} min`)
      }
    }
    
    console.log('\n🎉 Verificação concluída!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await client.close()
  }
}

checkAndFixServices()
