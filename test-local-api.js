// Script para testar a API local de serviços
async function testLocalAPI() {
  console.log('🧪 Testando API local de serviços...')
  
  try {
    const response = await fetch('http://localhost:3000/api/services')
    
    if (response.ok) {
      const services = await response.json()
      console.log(`✅ API local funcionando! ${services.length} serviços encontrados`)
      console.log('📋 Primeiros 3 serviços:')
      services.slice(0, 3).forEach((service, index) => {
        console.log(`  ${index + 1}. ${service.name} - Ativo: ${service.isActive}`)
      })
    } else {
      console.log(`❌ Erro na API local: ${response.status}`)
      const errorText = await response.text()
      console.log('Erro:', errorText)
    }
  } catch (error) {
    console.log('❌ Erro ao conectar com API local:', error.message)
  }
  
  console.log('\n🌐 Testando API de produção...')
  
  try {
    const response = await fetch('https://nextjs-guapa-4d084rgek-ana-carolina-severos-projects.vercel.app/api/services')
    
    if (response.ok) {
      const services = await response.json()
      console.log(`✅ API de produção funcionando! ${services.length} serviços encontrados`)
      console.log('📋 Primeiros 3 serviços:')
      services.slice(0, 3).forEach((service, index) => {
        console.log(`  ${index + 1}. ${service.name} - Ativo: ${service.isActive}`)
      })
    } else {
      console.log(`❌ Erro na API de produção: ${response.status}`)
    }
  } catch (error) {
    console.log('❌ Erro ao conectar com API de produção:', error.message)
  }
}

testLocalAPI()
