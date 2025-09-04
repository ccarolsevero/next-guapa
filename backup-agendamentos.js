const { MongoClient } = require('mongodb')
const fs = require('fs')
const path = require('path')

async function backupAgendamentos() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017')
  
  try {
    await client.connect()
    const db = client.db(process.env.DB_NAME || 'guapa')
    
    console.log('🔄 Iniciando backup dos agendamentos...')
    
    // Buscar todos os agendamentos
    const agendamentos = await db.collection('appointments').find({}).toArray()
    
    console.log(`📊 Total de agendamentos encontrados: ${agendamentos.length}`)
    
    // Criar estrutura de backup
    const backup = {
      metadata: {
        dataBackup: new Date().toISOString(),
        totalAgendamentos: agendamentos.length,
        versao: '1.0',
        descricao: 'Backup completo dos agendamentos do sistema Guapa'
      },
      agendamentos: agendamentos.map(apt => ({
        _id: apt._id.toString(),
        clientName: apt.clientName,
        clientPhone: apt.clientPhone,
        clientEmail: apt.clientEmail,
        clientId: apt.clientId,
        service: apt.service,
        professional: apt.professional,
        professionalId: apt.professionalId,
        date: apt.date,
        startTime: apt.startTime,
        endTime: apt.endTime,
        duration: apt.duration,
        price: apt.price,
        notes: apt.notes,
        status: apt.status,
        createdAt: apt.createdAt,
        updatedAt: apt.updatedAt
      }))
    }
    
    // Criar nome do arquivo com timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
    const filename = `backup-agendamentos-${timestamp}.json`
    const filepath = path.join(__dirname, filename)
    
    // Salvar arquivo
    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2), 'utf8')
    
    console.log('✅ Backup criado com sucesso!')
    console.log(`📁 Arquivo: ${filename}`)
    console.log(`📊 Total de agendamentos: ${agendamentos.length}`)
    console.log(`💾 Tamanho do arquivo: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`)
    
    // Mostrar estatísticas
    const statusCounts = {}
    agendamentos.forEach(apt => {
      statusCounts[apt.status] = (statusCounts[apt.status] || 0) + 1
    })
    
    console.log('\n📈 Estatísticas dos agendamentos:')
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} agendamentos`)
    })
    
    // Mostrar agendamentos por profissional
    const profissionalCounts = {}
    agendamentos.forEach(apt => {
      const prof = apt.professional || 'Não definido'
      profissionalCounts[prof] = (profissionalCounts[prof] || 0) + 1
    })
    
    console.log('\n👥 Agendamentos por profissional:')
    Object.entries(profissionalCounts).forEach(([prof, count]) => {
      console.log(`   ${prof}: ${count} agendamentos`)
    })
    
    // Mostrar agendamentos por serviço
    const servicoCounts = {}
    agendamentos.forEach(apt => {
      const serv = apt.service || 'Não definido'
      servicoCounts[serv] = (servicoCounts[serv] || 0) + 1
    })
    
    console.log('\n🛠️ Agendamentos por serviço:')
    Object.entries(servicoCounts).forEach(([serv, count]) => {
      console.log(`   ${serv}: ${count} agendamentos`)
    })
    
    console.log(`\n🎯 Backup concluído! Arquivo salvo em: ${filepath}`)
    
  } catch (error) {
    console.error('❌ Erro ao fazer backup:', error)
  } finally {
    await client.close()
  }
}

// Carregar variáveis de ambiente
require('dotenv').config()

backupAgendamentos()
