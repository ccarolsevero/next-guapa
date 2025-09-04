const { MongoClient } = require('mongodb')

async function debugAgendamentosDia8() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb+srv://brunacanovas_db_user:amCzSzLUpD7P96gD@espacoguapa.npfnuuc.mongodb.net/?retryWrites=true&w=majority&appName=Espacoguapa')
  
  try {
    await client.connect()
    console.log('✅ Conectado ao MongoDB')
    
    const db = client.db('guapa')
    const appointments = db.collection('appointments')
    
    // Buscar todos os agendamentos para entender a estrutura
    console.log('🔍 Buscando todos os agendamentos...')
    
    const allAppointments = await appointments.find({}).sort({ date: 1, startTime: 1 }).limit(10).toArray()
    
    console.log(`\n📊 Total de agendamentos encontrados: ${allAppointments.length}`)
    
    if (allAppointments.length > 0) {
      console.log('\n📋 Primeiros agendamentos:')
      allAppointments.forEach((apt, index) => {
        console.log(`\n${index + 1}. ${apt.clientName}`)
        console.log(`   📅 Data: ${apt.date}`)
        console.log(`   ⏰ Início: ${apt.startTime}`)
        console.log(`   ⏰ Fim: ${apt.endTime}`)
        console.log(`   ⏱️ Duração: ${apt.duration} min`)
        console.log(`   👩‍💼 Profissional: ${apt.professional} (ID: ${apt.professionalId})`)
        console.log(`   🛠️ Serviço: ${apt.service}`)
        console.log(`   📊 Status: ${apt.status}`)
      })
    }
    
    // Buscar agendamentos do dia 7 de setembro de 2025 (domingo)
    // O agendamento está salvo como "Sun Sep 07 2025 21:00:00 GMT-0300"
    // Isso significa que é 7 de setembro no fuso horário local, mas 8 de setembro UTC
    const targetDate = new Date('2025-09-07T21:00:00.000Z') // UTC
    const startDate = new Date('2025-09-07T00:00:00.000Z')
    const endDate = new Date('2025-09-07T23:59:59.999Z')
    
    console.log('\n🔍 Buscando agendamentos para:', targetDate.toISOString().split('T')[0])
    console.log('📅 Range:', startDate.toISOString(), 'até', endDate.toISOString())
    
    const dayAppointments = await appointments.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).toArray()
    
    // Também vamos buscar por uma data mais ampla para ver o que está acontecendo
    console.log('\n🔍 Buscando com range mais amplo...')
    const wideStartDate = new Date('2025-09-07T00:00:00.000Z')
    const wideEndDate = new Date('2025-09-08T23:59:59.999Z')
    
    const wideAppointments = await appointments.find({
      date: {
        $gte: wideStartDate,
        $lte: wideEndDate
      }
    }).toArray()
    
    console.log(`📊 Agendamentos encontrados no range amplo: ${wideAppointments.length}`)
    wideAppointments.forEach((apt, index) => {
      console.log(`\n${index + 1}. ${apt.clientName}`)
      console.log(`   📅 Data UTC: ${apt.date.toISOString()}`)
      console.log(`   📅 Data Local: ${apt.date.toString()}`)
      console.log(`   ⏰ Início: ${apt.startTime}`)
      console.log(`   ⏰ Fim: ${apt.endTime}`)
    })
    
    console.log(`\n📊 Total de agendamentos encontrados: ${dayAppointments.length}`)
    
    if (dayAppointments.length > 0) {
      console.log('\n📋 Detalhes dos agendamentos:')
      dayAppointments.forEach((apt, index) => {
        console.log(`\n${index + 1}. ${apt.clientName}`)
        console.log(`   📅 Data: ${apt.date}`)
        console.log(`   ⏰ Início: ${apt.startTime}`)
        console.log(`   ⏰ Fim: ${apt.endTime}`)
        console.log(`   ⏱️ Duração: ${apt.duration} min`)
        console.log(`   👩‍💼 Profissional: ${apt.professional} (ID: ${apt.professionalId})`)
        console.log(`   🛠️ Serviço: ${apt.service}`)
        console.log(`   📊 Status: ${apt.status}`)
      })
    } else {
      console.log('❌ Nenhum agendamento encontrado para este dia')
    }
    
    // Verificar também profissionais
    const professionals = db.collection('professionals')
    const profs = await professionals.find({}).toArray()
    
    console.log(`\n👩‍💼 Profissionais disponíveis (${profs.length}):`)
    profs.forEach(prof => {
      console.log(`   - ${prof.name} (ID: ${prof._id})`)
    })
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await client.close()
  }
}

debugAgendamentosDia8()
