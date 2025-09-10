import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  let client: MongoClient | null = null
  
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    
    console.log('🔍 === API RECOMENDAÇÕES - GET ===')
    console.log('🔍 Buscando recomendações para cliente:', clientId)
    
    // Conectar ao MongoDB
    const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not defined")
}
    client = new MongoClient(uri)
    await client.connect()
    const db = client.db(process.env.DB_NAME || 'guapa')
    
    console.log('✅ Conectado ao MongoDB')
    
    // Buscar recomendações do cliente
    const recomendacoes = await db.collection('recomendacoes').aggregate([
      {
        $match: {
          clientId: clientId
        }
      },
      {
        $lookup: {
          from: 'professionals',
          let: { profId: '$profissionalId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$_id', { $toObjectId: '$$profId' }] },
                    { $eq: [{ $toString: '$_id' }, '$$profId'] }
                  ]
                }
              }
            }
          ],
          as: 'professionalData'
        }
      },
      {
        $addFields: {
          professional: { $arrayElemAt: ['$professionalData', 0] }
        }
      },
      {
        $project: {
          professionalData: 0
        }
      },
      {
        $sort: { dataRecomendacao: -1 }
      }
    ]).toArray()
    
    console.log('📊 Recomendações encontradas:', recomendacoes.length)
    
    // Formatar dados das recomendações
    const recomendacoesFormatadas = recomendacoes.map(recomendacao => ({
      _id: recomendacao._id,
      titulo: recomendacao.titulo,
      descricao: recomendacao.descricao,
      tipo: recomendacao.tipo,
      prioridade: recomendacao.prioridade,
      status: recomendacao.status,
      anexos: recomendacao.anexos || [],
      professional: {
        _id: recomendacao.professional?._id,
        name: recomendacao.professional?.name || 'Profissional não encontrado'
      },
      dataRecomendacao: recomendacao.dataRecomendacao,
      dataValidade: recomendacao.dataValidade,
      observacoes: recomendacao.observacoes,
      createdAt: recomendacao.createdAt,
      updatedAt: recomendacao.updatedAt
    }))
    
    console.log('✅ Recomendações formatadas com sucesso')
    
    await client.close()
    
    return NextResponse.json({
      recomendacoes: recomendacoesFormatadas,
      total: recomendacoesFormatadas.length
    })
    
  } catch (error) {
    console.error('❌ Erro ao buscar recomendações:', error)
    
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

export async function POST(request: NextRequest) {
  let client: MongoClient | null = null
  
  try {
    const body = await request.json()
    const { clientId, titulo, descricao, tipo, prioridade, anexos, profissionalId, dataValidade, observacoes } = body
    
    console.log('🔍 === API RECOMENDAÇÕES - POST ===')
    console.log('🔍 Criando nova recomendação para cliente:', clientId)
    
    // Conectar ao MongoDB
    const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not defined")
}
    client = new MongoClient(uri)
    await client.connect()
    const db = client.db(process.env.DB_NAME || 'guapa')
    
    console.log('✅ Conectado ao MongoDB')
    
    // Criar nova recomendação
    const novaRecomendacao = {
      clientId,
      titulo,
      descricao,
      tipo,
      prioridade: prioridade || 'media',
      status: 'ativa',
      anexos: anexos || [],
      profissionalId,
      dataRecomendacao: new Date(),
      dataValidade: dataValidade ? new Date(dataValidade) : null,
      observacoes,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await db.collection('recomendacoes').insertOne(novaRecomendacao)
    
    console.log('✅ Recomendação criada com sucesso:', result.insertedId)
    
    await client.close()
    
    return NextResponse.json({
      success: true,
      message: 'Recomendação criada com sucesso',
      id: result.insertedId
    })
    
  } catch (error) {
    console.error('❌ Erro ao criar recomendação:', error)
    
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
