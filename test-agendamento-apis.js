// Script para testar as APIs de agendamento
const testAPIs = async () => {
  const baseURL = 'http://localhost:3000'
  
  console.log('🧪 Testando APIs de agendamento...\n')
  
  try {
    // Teste 1: Buscar profissionais
    console.log('1️⃣ Testando API de profissionais...')
    const professionalsResponse = await fetch(`${baseURL}/api/professionals`)
    const professionals = await professionalsResponse.json()
    console.log('✅ Profissionais encontrados:', professionals.length)
    console.log('📋 Profissionais:', professionals.map(p => ({ id: p._id, name: p.name, services: p.services })))
    
    if (professionals.length === 0) {
      console.log('❌ Nenhum profissional encontrado!')
      return
    }
    
    const firstProfessional = professionals[0]
    console.log(`\n2️⃣ Testando API de serviços para ${firstProfessional.name}...`)
    
    // Teste 2: Buscar serviços do primeiro profissional
    const servicesResponse = await fetch(`${baseURL}/api/services?professionalId=${firstProfessional._id}`)
    const services = await servicesResponse.json()
    console.log('✅ Serviços encontrados:', services.length)
    console.log('📋 Serviços:', services.map(s => ({ id: s._id, name: s.name, price: s.price, duration: s.duration })))
    
    // Teste 3: Buscar horários disponíveis
    console.log(`\n3️⃣ Testando API de horários disponíveis...`)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split('T')[0]
    
    const timesResponse = await fetch(`${baseURL}/api/appointments/available-times?date=${dateStr}&professionalId=${firstProfessional._id}`)
    const times = await timesResponse.json()
    console.log('✅ Horários disponíveis:', times.availableTimes.length)
    console.log('📋 Horários:', times.availableTimes)
    
    console.log('\n🎉 Todos os testes passaram!')
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error)
  }
}

// Executar testes
testAPIs()
