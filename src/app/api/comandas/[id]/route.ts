import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

// GET - Buscar comanda específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 === API COMANDAS [ID] - GET ===')
    console.log('📡 Conectando ao banco...')
    
    await connectDB()
    console.log('✅ Conectado ao banco')
    
    const comandaId = params.id
    console.log('🔍 Buscando comanda ID:', comandaId)
    
    // Usar conexão direta do MongoDB (Mongoose não está funcionando)
    const { MongoClient } = await import('mongodb')
    const uri = process.env.MONGODB_URI!
    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.DB_NAME || 'guapa')
    const comandasCollection = db.collection('comandas')
    
    // Buscar comanda com populate usando MongoDB aggregation
    const comandas = await comandasCollection.aggregate([
      { $match: { _id: new (await import('mongodb')).ObjectId(comandaId) } },
      {
        $lookup: {
          from: 'clients',
          localField: 'clientId',
          foreignField: '_id',
          as: 'clientData'
        }
      },
      {
        $lookup: {
          from: 'professionals',
          localField: 'professionalId',
          foreignField: '_id',
          as: 'professionalData'
        }
      },
      {
        $addFields: {
          clientId: { $arrayElemAt: ['$clientData', 0] },
          professionalId: { $arrayElemAt: ['$professionalData', 0] }
        }
      },
      {
        $project: {
          clientData: 0,
          professionalData: 0
        }
      }
    ]).toArray()

    await client.close()
    
    if (comandas.length === 0) {
      console.log('❌ Comanda não encontrada')
      return NextResponse.json(
        { error: 'Comanda não encontrada' },
        { status: 404 }
      )
    }

    const comanda = comandas[0]
    console.log('✅ Comanda encontrada:', comanda._id)
    
    // Formatar dados para o frontend
    const formattedComanda = {
      id: comanda._id,
      clienteId: comanda.clientId._id,
      clienteNome: comanda.clientId.name,
      clienteTelefone: comanda.clientId.phone,
      clienteEmail: comanda.clientId.email,
      profissionalId: comanda.professionalId._id,
      profissionalNome: comanda.professionalId.name,
      status: comanda.status,
      inicioAt: comanda.dataInicio,
      servicos: comanda.servicos || [],
      produtos: comanda.produtos || [],
      observacoes: comanda.observacoes || '',
      valorTotal: comanda.valorTotal || 0,
      createdAt: comanda.createdAt,
      updatedAt: comanda.updatedAt
    }

    return NextResponse.json({ comanda: formattedComanda })

  } catch (error) {
    console.error('❌ Erro ao buscar comanda:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar comanda
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const comandaId = params.id
    const body = await request.json()
    
    // Usar conexão direta do MongoDB
    const { MongoClient } = await import('mongodb')
    const uri = process.env.MONGODB_URI!
    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.DB_NAME || 'guapa')
    const comandasCollection = db.collection('comandas')
    
    const result = await comandasCollection.updateOne(
      { _id: new (await import('mongodb')).ObjectId(comandaId) },
      { $set: body }
    )
    
    await client.close()
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Comanda não encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: 'Comanda atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar comanda:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir comanda
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const comandaId = params.id
    
    // Usar conexão direta do MongoDB
    const { MongoClient } = await import('mongodb')
    const uri = process.env.MONGODB_URI!
    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.DB_NAME || 'guapa')
    const comandasCollection = db.collection('comandas')
    
    const result = await comandasCollection.deleteOne({
      _id: new (await import('mongodb')).ObjectId(comandaId)
    })
    
    await client.close()
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Comanda não encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: 'Comanda excluída com sucesso'
    })

  } catch (error) {
    console.error('Erro ao excluir comanda:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
