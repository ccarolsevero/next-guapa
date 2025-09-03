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
    console.log('🔍 Query MongoDB usada:', JSON.stringify(query, null, 2))
    
    if (comandasRaw.length > 0) {
      console.log('📋 Primeira comanda (raw MongoDB):', {
        id: comandasRaw[0]._id,
        clientId: comandasRaw[0].clientId,
        professionalId: comandasRaw[0].professionalId,
        status: comandasRaw[0].status,
        dataInicio: comandasRaw[0].dataInicio
      })
    } else {
      console.log('⚠️ Nenhuma comanda encontrada com a query:', query)
      // Verificar se existem comandas no banco
      const totalComandas = await comandasCollection.countDocuments({})
      console.log('📊 Total de comandas no banco:', totalComandas)
      
      if (totalComandas > 0) {
        const amostra = await comandasCollection.find({}).limit(5).toArray()
        console.log('📋 Amostra de comandas no banco:', amostra.map(c => ({
          id: c._id,
          clientId: c.clientId,
          clientIdType: typeof c.clientId,
          status: c.status,
          dataInicio: c.dataInicio
        })))
        
        // Verificar se há comandas com clientId similar
        const comandasComClientId = await comandasCollection.find({
          clientId: { $exists: true }
        }).limit(5).toArray()
        console.log('🔍 Comandas com clientId definido:', comandasComClientId.map(c => ({
          id: c._id,
          clientId: c.clientId,
          clientIdType: typeof c.clientId
        })))
      }
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
    console.log('🔄 === API COMANDAS - POST ===')
    
    const body = await request.json()
    console.log('📦 Body recebido:', body)
    
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

    // Conectar ao MongoDB diretamente
    const { MongoClient } = await import('mongodb')
    const uri = process.env.MONGODB_URI!
    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db(process.env.DB_NAME || 'guapa')
    
    console.log('✅ Conectado ao MongoDB')
    console.log('🔍 Criando comanda para cliente:', clientId)

    // Criar comanda usando MongoDB direto
    const comandaData = {
      clientId: new (await import('mongodb')).ObjectId(clientId),
      professionalId: new (await import('mongodb')).ObjectId(professionalId),
      status: status || 'em_atendimento',
      dataInicio: new Date(),
      servicos,
      produtos: produtos || [],
      observacoes: observacoes || '',
      valorTotal: valorTotal || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('comandas').insertOne(comandaData)
    console.log('✅ Comanda criada com ID:', result.insertedId)

    // Buscar comanda criada com dados populados
    const comandaPopulada = await db.collection('comandas').aggregate([
      { $match: { _id: result.insertedId } },
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
    console.log('✅ Comanda retornada com dados populados')

    return NextResponse.json({
      message: 'Comanda criada com sucesso',
      comanda: comandaPopulada[0]
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Erro ao criar comanda:', error)
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
