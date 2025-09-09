import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

export async function GET() {
  let client: MongoClient | null = null
  
  try {
    console.log('🔍 === API SITE SETTINGS - GET ===')
    
    // Conectar ao MongoDB
    const uri = process.env.MONGODB_URI!
    client = new MongoClient(uri)
    await client.connect()
    const db = client.db(process.env.DB_NAME || 'guapa')
    
    console.log('✅ Conectado ao MongoDB')
    
    // Buscar configurações (apenas dados públicos)
    const configuracao = await db.collection('configuracoes').findOne({})
    
    if (!configuracao) {
      console.log('⚠️ Nenhuma configuração encontrada')
      await client.close()
      return NextResponse.json({
        nomeSalao: 'Espaço Guapa',
        emailContato: 'contato@espacoguapa.com',
        telefone: '(11) 99999-9999',
        endereco: 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP',
        horariosFuncionamento: [
          { dia: 'Segunda-feira', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
          { dia: 'Terça-feira', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
          { dia: 'Quarta-feira', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
          { dia: 'Quinta-feira', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
          { dia: 'Sexta-feira', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
          { dia: 'Sábado', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
          { dia: 'Domingo', ativo: false, horaInicio: '09:00', horaFim: '18:00' }
        ]
      })
    }
    
    // Retornar apenas dados públicos (sem configurações sensíveis)
    const dadosPublicos = {
      nomeSalao: configuracao.nomeSalao,
      emailContato: configuracao.emailContato,
      telefone: configuracao.telefone,
      whatsapp: configuracao.whatsapp,
      endereco: configuracao.endereco,
      horariosFuncionamento: configuracao.horariosFuncionamento,
      politicaCancelamento: configuracao.politicaCancelamento,
      politicaReagendamento: configuracao.politicaReagendamento
    }
    
    console.log('✅ Configurações públicas retornadas')
    
    await client.close()
    return NextResponse.json(dadosPublicos)
    
  } catch (error) {
    console.error('❌ Erro ao buscar configurações do site:', error)
    
    if (client) {
      try {
        await client.close()
      } catch (closeError) {
        console.error('❌ Erro ao fechar conexão:', closeError)
      }
    }
    
    // Retornar configurações padrão em caso de erro
    return NextResponse.json({
      nomeSalao: 'Espaço Guapa',
      emailContato: 'contato@espacoguapa.com',
      telefone: '(11) 99999-9999',
      whatsapp: '5519991531394',
      endereco: 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP',
      horariosFuncionamento: [
        { dia: 'Segunda-feira', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
        { dia: 'Terça-feira', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
        { dia: 'Quarta-feira', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
        { dia: 'Quinta-feira', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
        { dia: 'Sexta-feira', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
        { dia: 'Sábado', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
        { dia: 'Domingo', ativo: false, horaInicio: '09:00', horaFim: '18:00' }
      ]
    })
  }
}