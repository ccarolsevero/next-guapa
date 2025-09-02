import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Comanda from '@/models/Comanda'

// GET - Listar comandas
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 === API COMANDAS - GET ===')
    console.log('📡 Conectando ao banco...')
    
    await connectDB()
    console.log('✅ Conectado ao banco')
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')
    const professionalId = searchParams.get('professionalId')
    
    console.log('🔍 Parâmetros de busca:')
    console.log('  - Status:', status || 'todos')
    console.log('  - Cliente ID:', clientId || 'todos')
    console.log('  - Profissional ID:', professionalId || 'todos')
    
    const query: Record<string, string> = {}
    
    if (status) query.status = status
    if (clientId) query.clientId = clientId
    if (professionalId) query.professionalId = professionalId

    console.log('🔍 Query final:', JSON.stringify(query, null, 2))
    
    // Usar conexão direta do MongoDB (Mongoose não está funcionando)
    const { MongoClient } = await import('mongodb')
    const uri = process.env.MONGODB_URI!
    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.DB_NAME || 'guapa')
    const comandasCollection = db.collection('comandas')
    
    // Buscar comandas sem populate primeiro para debug
    const comandasRaw = await comandasCollection.find(query).toArray()
    console.log('📊 Comandas encontradas (raw MongoDB):', comandasRaw.length)
    
    if (comandasRaw.length > 0) {
      console.log('📋 Primeira comanda (raw MongoDB):', {
        id: comandasRaw[0]._id,
        clientId: comandasRaw[0].clientId,
        professionalId: comandasRaw[0].professionalId,
        status: comandasRaw[0].status
      })
    }

    // Agora buscar com populate usando MongoDB aggregation
    const comandas = await comandasCollection.aggregate([
      { $match: query },
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
      },
      { $sort: { createdAt: -1 } }
    ]).toArray()

    console.log('📊 Comandas com lookup (MongoDB):', comandas.length)
    
    if (comandas.length > 0) {
      console.log('📋 Primeira comanda (lookup MongoDB):', {
        id: comandas[0]._id,
        clientId: comandas[0].clientId,
        professionalId: comandas[0].professionalId,
        status: comandas[0].status
      })
    }

    await client.close()
    console.log('✅ Retornando comandas:', comandas.length)
    return NextResponse.json({ comandas })

  } catch (error) {
    console.error('❌ Erro ao buscar comandas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova comanda
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const {
      clientId,
      professionalId,
      status,
      servicos,
      produtos,
      observacoes,
      valorTotal
    } = body

    // Validações
    if (!clientId || !professionalId || !servicos || servicos.length === 0) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: clientId, professionalId, servicos' },
        { status: 400 }
      )
    }

    // Criar comanda
    const comanda = new Comanda({
      clientId,
      professionalId,
      status: status || 'em_atendimento',
      servicos,
      produtos: produtos || [],
      observacoes: observacoes || '',
      valorTotal: valorTotal || 0
    })

    await comanda.save()

    // Retornar comanda criada com dados populados
    const comandaPopulada = await Comanda.findById(comanda._id)
      .populate('clientId', 'name phone email')
      .populate('professionalId', 'name')

    return NextResponse.json({
      message: 'Comanda criada com sucesso',
      comanda: comandaPopulada
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar comanda:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar comanda existente
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { comandaId, ...updateData } = body

    if (!comandaId) {
      return NextResponse.json(
        { error: 'ID da comanda é obrigatório' },
        { status: 400 }
      )
    }

    const comanda = await Comanda.findByIdAndUpdate(
      comandaId,
      updateData,
      { new: true, runValidators: true }
    ).populate('clientId', 'name phone email')
     .populate('professionalId', 'name')

    if (!comanda) {
      return NextResponse.json(
        { error: 'Comanda não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Comanda atualizada com sucesso',
      comanda
    })

  } catch (error) {
    console.error('Erro ao atualizar comanda:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
