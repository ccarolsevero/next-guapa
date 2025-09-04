const { MongoClient } = require('mongodb')

async function criarAgendamentoTeste() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb+srv://brunacanovas_db_user:amCzSzLUpD7P96gD@espacoguapa.npfnuuc.mongodb.net/?retryWrites=true&w=majority&appName=Espacoguapa')
  
  try {
    await client.connect()
    console.log('✅ Conectado ao MongoDB')
    
    const db = client.db('guapa')
    const appointments = db.collection('appointments')
    
    // Criar agendamento de teste para o dia 8 de janeiro de 2025
    const agendamentoTeste = {
      clientName: "Ana Carolina Severo",
      clientPhone: "5519999999999",
      clientEmail: "ana@teste.com",
      clientId: "teste123",
      service: "Back To Natural - P",
      professional: "Bruna Canovas",
      professionalId: "68b0ebbcd9700d5d16b546b8",
      date: new Date('2025-01-08T21:00:00.000Z'), // 8 de janeiro de 2025
      startTime: "16:00",
      endTime: "17:00",
      duration: 60,
      status: "SCHEDULED",
      price: 150.00,
      notes: "Agendamento de teste para verificar a visualização",
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    console.log('📝 Criando agendamento de teste...')
    console.log('📅 Data:', agendamentoTeste.date)
    console.log('⏰ Horário:', agendamentoTeste.startTime, '-', agendamentoTeste.endTime)
    console.log('👩‍💼 Profissional:', agendamentoTeste.professional)
    
    const resultado = await appointments.insertOne(agendamentoTeste)
    
    console.log('✅ Agendamento criado com sucesso!')
    console.log('🆔 ID:', resultado.insertedId)
    
    // Verificar se foi criado
    const agendamentoCriado = await appointments.findOne({ _id: resultado.insertedId })
    console.log('\n📋 Agendamento criado:')
    console.log('   Cliente:', agendamentoCriado.clientName)
    console.log('   Data:', agendamentoCriado.date)
    console.log('   Horário:', agendamentoCriado.startTime, '-', agendamentoCriado.endTime)
    console.log('   Duração:', agendamentoCriado.duration, 'min')
    console.log('   Profissional:', agendamentoCriado.professional)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await client.close()
  }
}

criarAgendamentoTeste()
