async function testApiAgendamentos() {
  try {
    console.log('🔍 Testando API de agendamentos...')
    
    // Testar busca por data específica
    const testDate = '2025-09-08' // Dia 8 de setembro (que é quando o agendamento está salvo em UTC)
    const response = await fetch(`http://localhost:3000/api/appointments?date=${testDate}`)
    
    if (response.ok) {
      const appointments = await response.json()
      console.log(`✅ API funcionando! Encontrados ${appointments.length} agendamentos para ${testDate}`)
      
      appointments.forEach((apt, index) => {
        console.log(`\n${index + 1}. ${apt.clientName}`)
        console.log(`   📅 Data: ${apt.date}`)
        console.log(`   ⏰ Início: ${apt.startTime}`)
        console.log(`   ⏰ Fim: ${apt.endTime}`)
        console.log(`   👩‍💼 Profissional: ${apt.professional}`)
        console.log(`   🛠️ Serviço: ${apt.service}`)
      })
    } else {
      console.error('❌ Erro na API:', response.status, response.statusText)
    }
  } catch (error) {
    console.error('❌ Erro ao testar API:', error)
  }
}

testApiAgendamentos()
