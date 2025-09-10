import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client: MongoClient | null = null
  
  try {
    const { id } = await params
    console.log('🔍 === API CLIENTE PRONTUÁRIOS - GET ===')
    console.log('🔍 Buscando prontuários do cliente ID:', id)
    
    // Conectar ao MongoDB
    const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not defined")
}
    client = new MongoClient(uri)
    await client.connect()
    const db = client.db(process.env.DB_NAME || 'guapa')
    
    console.log('✅ Conectado ao MongoDB')
    
    // Buscar prontuários do cliente (lidar com ambos os tipos: string e ObjectId)
    const prontuarios = await db.collection('prontuarios').aggregate([
      {
        $match: {
          $or: [
            { clientId: id },
            { clientId: new ObjectId(id) }
          ]
        }
      },
      {
        $lookup: {
          from: 'professionals',
          let: { profId: '$professionalId' },
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
        $lookup: {
          from: 'comandas',
          localField: 'comandaId',
          foreignField: '_id',
          as: 'comandaData'
        }
      },
      {
        $addFields: {
          professional: { $arrayElemAt: ['$professionalData', 0] },
          comanda: { $arrayElemAt: ['$comandaData', 0] }
        }
      },
      {
        $project: {
          professionalData: 0,
          comandaData: 0
        }
      },
      {
        $sort: { dataAtendimento: -1 }
      }
    ]).toArray()
    
    console.log('📊 Prontuários encontrados:', prontuarios.length)
    
    // Formatar dados dos prontuários
    const prontuariosFormatados = prontuarios.map(prontuario => ({
      _id: prontuario._id,
      dataAtendimento: prontuario.dataAtendimento,
      historicoProcedimentos: prontuario.historicoProcedimentos,
      reacoesEfeitos: prontuario.reacoesEfeitos,
      recomendacoes: prontuario.recomendacoes,
      proximaSessao: prontuario.proximaSessao,
      observacoesAdicionais: prontuario.observacoesAdicionais,
      servicosRealizados: prontuario.servicosRealizados || [],
      produtosVendidos: prontuario.produtosVendidos || [],
      valorTotal: prontuario.valorTotal,
      professional: {
        _id: prontuario.professional?._id,
        name: prontuario.professional?.name || 'Profissional não encontrado'
      },
      comanda: {
        _id: prontuario.comanda?._id,
        dataInicio: prontuario.comanda?.dataInicio,
        status: prontuario.comanda?.status
      },
      createdAt: prontuario.createdAt,
      updatedAt: prontuario.updatedAt
    }))
    
    console.log('✅ Prontuários formatados com sucesso')
    
    await client.close()
    
    return NextResponse.json({
      prontuarios: prontuariosFormatados,
      total: prontuariosFormatados.length
    })
    
  } catch (error) {
    console.error('❌ Erro ao buscar prontuários do cliente:', error)
    
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
