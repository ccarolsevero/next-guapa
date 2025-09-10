import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

// GET - Buscar comanda específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🔍 === API COMANDAS [ID] - GET ===')
    console.log('📡 Conectando ao banco...')
    
    await connectDB()
    console.log('✅ Conectado ao banco')
    
    const comandaId = id
    console.log('🔍 Buscando comanda ID:', comandaId)
    
    // Usar conexão direta do MongoDB (Mongoose não está funcionando)
    const { MongoClient } = await import('mongodb')
    const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not defined")
}
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
      clienteCredits: comanda.clientId.credits || 0,
      profissionalId: comanda.professionalId._id,
      profissionalNome: comanda.professionalId.name,
      status: comanda.status,
      inicioAt: comanda.dataInicio,
      dataInicio: comanda.dataInicio,
      dataFim: comanda.dataFim,
      dataFinalizacao: comanda.dataFinalizacao,
      valorFinal: comanda.valorFinal,
      desconto: comanda.desconto,
      creditAmount: comanda.creditAmount,
      metodoPagamento: comanda.metodoPagamento,
      isFinalizada: comanda.isFinalizada,
      servicos: comanda.servicos ? comanda.servicos.map((servico: any) => ({
        id: servico.id || servico._id,
        nome: servico.nome,
        preco: servico.preco,
        quantidade: servico.quantidade
      })) : [],
      produtos: comanda.produtos ? comanda.produtos.map((produto: any) => ({
        id: produto.id || produto._id,
        nome: produto.nome,
        preco: produto.preco,
        quantidade: produto.quantidade,
        vendidoPor: produto.vendidoPor,
        vendidoPorId: produto.vendidoPorId
      })) : [],
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🔧 === API COMANDAS [ID] - PUT ===')
    console.log('📡 Conectando ao banco...')
    
    await connectDB()
    
    const comandaId = id
    const body = await request.json()
    
    console.log('📥 Dados recebidos para atualização:')
    console.log('  - Comanda ID:', comandaId)
    console.log('  - Body completo:', body)
    console.log('  - Valor total recebido:', body.valorTotal)
    console.log('  - Serviços:', body.servicos?.length || 0)
    console.log('  - Produtos:', body.produtos?.length || 0)
    
    // Usar conexão direta do MongoDB
    const { MongoClient } = await import('mongodb')
    const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not defined")
}
    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.DB_NAME || 'guapa')
    const comandasCollection = db.collection('comandas')
    
    // Preparar dados para atualização
    const updateData = {
      ...body,
      updatedAt: new Date()
    }
    
    console.log('💾 Dados para atualização no banco:')
    console.log('  - Update data:', updateData)
    
    const result = await comandasCollection.updateOne(
      { _id: new (await import('mongodb')).ObjectId(comandaId) },
      { $set: updateData }
    )
    
    console.log('✅ Resultado da atualização:')
    console.log('  - Matched count:', result.matchedCount)
    console.log('  - Modified count:', result.modifiedCount)
    
    await client.close()
    
    if (result.matchedCount === 0) {
      console.log('❌ Comanda não encontrada para atualização')
      return NextResponse.json(
        { error: 'Comanda não encontrada' },
        { status: 404 }
      )
    }
    
    console.log('✅ Comanda atualizada com sucesso no banco')
    return NextResponse.json({
      message: 'Comanda atualizada com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro ao atualizar comanda:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir comanda
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const { id } = await params
    const comandaId = id
    
    // Usar conexão direta do MongoDB
    const { MongoClient } = await import('mongodb')
    const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not defined")
}
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
