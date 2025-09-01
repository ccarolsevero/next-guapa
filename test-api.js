// Script simples para testar as APIs
async function testAPIs() {
  try {
    console.log('🔍 Testando API de Profissionais...')
    
    // Testar API de profissionais
    const profResponse = await fetch('https://nextjs-guapa-bul0ypbgr-ana-carolina-severos-projects.vercel.app/api/professionals')
    if (profResponse.ok) {
      const professionals = await profResponse.json()
      console.log('✅ Profissionais encontrados:', professionals.length)
      professionals.forEach(prof => {
        console.log(`  - ${prof.name}: ${prof.services?.length || 0} serviços`)
        if (prof.services) {
          console.log(`    Serviços: ${prof.services.join(', ')}`)
        }
      })
    } else {
      console.log('❌ Erro na API de profissionais:', profResponse.status)
    }
    
    console.log('\n🔍 Testando API de Serviços...')
    
    // Testar API de serviços
    const servicesResponse = await fetch('https://nextjs-guapa-bul0ypbgr-ana-carolina-severos-projects.vercel.app/api/services')
    if (servicesResponse.ok) {
      const services = await servicesResponse.json()
      console.log('✅ Serviços encontrados:', services.length)
      console.log('📋 Primeiros 5 serviços:')
      services.slice(0, 5).forEach(service => {
        console.log(`  - ${service.name} (R$ ${service.price})`)
      })
    } else {
      console.log('❌ Erro na API de serviços:', servicesResponse.status)
    }
    
    console.log('\n🔍 Testando API de Profissional específico (Bruna)...')
    
    // Testar API de profissional específico
    const brunaResponse = await fetch('https://nextjs-guapa-bul0ypbgr-ana-carolina-severos-projects.vercel.app/api/professionals/bruna')
    if (brunaResponse.ok) {
      const bruna = await brunaResponse.json()
      console.log('✅ Bruna encontrada:')
      console.log(`  Nome: ${bruna.name}`)
      console.log(`  Serviços: ${bruna.services?.length || 0}`)
      if (bruna.services) {
        console.log(`    Lista: ${bruna.services.join(', ')}`)
      }
    } else {
      console.log('❌ Erro na API de Bruna:', brunaResponse.status)
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

testAPIs()
