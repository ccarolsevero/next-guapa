import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

export async function GET() {
  let client: MongoClient | null = null
  
  try {
    console.log('🔍 === API CONFIGURAÇÕES - GET ===')
    
    // Conectar ao MongoDB
    const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not defined")
}
    client = new MongoClient(uri)
    await client.connect()
    const db = client.db(process.env.DB_NAME || 'guapa')
    
    console.log('✅ Conectado ao MongoDB')
    
    // Buscar configurações (deve haver apenas uma)
    const configuracao = await db.collection('configuracoes').findOne({})
    
    if (!configuracao) {
      console.log('⚠️ Nenhuma configuração encontrada, criando configuração padrão...')
      
      // Criar configuração padrão
      const configuracaoPadrao = {
        nomeSalao: 'Espaço Guapa',
        emailContato: 'contato@espacoguapa.com',
        telefone: '(11) 99999-9999',
        whatsapp: '5519991531394', // Número do WhatsApp do salão
        endereco: 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP',
        moeda: 'BRL',
        fusoHorario: 'America/Sao_Paulo',
        taxaCancelamento: 10,
        tempoAntecedencia: 15,
        politicaCancelamento: 'Cancelamentos devem ser feitos com pelo menos 24h de antecedência. Cancelamentos em menos de 24h podem ser cobrados 50% do valor do serviço.',
        politicaReagendamento: 'Reagendamentos podem ser feitos até 2h antes do horário marcado, sem custo adicional.',
        horariosFuncionamento: [
          { dia: 'Segunda-feira', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
          { dia: 'Terça-feira', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
          { dia: 'Quarta-feira', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
          { dia: 'Quinta-feira', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
          { dia: 'Sexta-feira', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
          { dia: 'Sábado', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
          { dia: 'Domingo', ativo: false, horaInicio: '09:00', horaFim: '18:00' }
        ],
        intervaloAgendamentos: 15,
        duracaoMaximaAgendamento: 180,
        autenticacaoDuasEtapas: false,
        sessaoAutomatica: true,
        logAtividades: true,
        ultimaAtualizacao: new Date(),
        atualizadoPor: 'sistema',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = await db.collection('configuracoes').insertOne(configuracaoPadrao)
      console.log('✅ Configuração padrão criada:', result.insertedId)
      
      await client.close()
      return NextResponse.json(configuracaoPadrao)
    }
    
    console.log('✅ Configuração encontrada')
    
    await client.close()
    return NextResponse.json(configuracao)
    
  } catch (error) {
    console.error('❌ Erro ao buscar configurações:', error)
    
    if (client) {
      try {
        await client.close()
      } catch (closeError) {
        console.error('❌ Erro ao fechar conexão:', closeError)
      }
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  let client: MongoClient | null = null
  
  try {
    const body = await request.json()
    console.log('🔍 === API CONFIGURAÇÕES - PUT ===')
    console.log('📝 Dados recebidos:', body)
    
    // Conectar ao MongoDB
    const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not defined")
}
    client = new MongoClient(uri)
    await client.connect()
    const db = client.db(process.env.DB_NAME || 'guapa')
    
    console.log('✅ Conectado ao MongoDB')
    
    // Preparar dados para atualização
    const dadosAtualizacao = {
      ...body,
      ultimaAtualizacao: new Date(),
      atualizadoPor: 'admin', // Em produção, viria do contexto de autenticação
      updatedAt: new Date()
    }
    
    // Atualizar ou criar configuração
    const result = await db.collection('configuracoes').updateOne(
      {}, // Buscar qualquer documento (deve haver apenas um)
      { $set: dadosAtualizacao },
      { upsert: true } // Criar se não existir
    )
    
    console.log('✅ Configuração atualizada:', result)
    
    await client.close()
    
    return NextResponse.json({
      success: true,
      message: 'Configurações salvas com sucesso',
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId
    })
    
  } catch (error) {
    console.error('❌ Erro ao salvar configurações:', error)
    
    if (client) {
      try {
        await client.close()
      } catch (closeError) {
        console.error('❌ Erro ao fechar conexão:', closeError)
      }
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
export const dynamic = 'force-dynamic'
