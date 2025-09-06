import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

const uri = process.env.MONGODB_URI!
const client = new MongoClient(uri)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await client.connect()
    const db = client.db('guapa')
    const collection = db.collection('metas-comissao')

    const meta = await collection.findOne({ _id: new ObjectId(params.id) })
    
    if (!meta) {
      return NextResponse.json(
        { error: 'Meta não encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(meta)
  } catch (error) {
    console.error('Erro ao buscar meta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validação básica
    if (!body.nome || !body.tipo || !body.valorMeta || !body.comissaoNormal || !body.comissaoMeta) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db('guapa')
    const collection = db.collection('metas-comissao')

    const updateData = {
      ...body,
      valorMeta: parseFloat(body.valorMeta),
      comissaoNormal: parseFloat(body.comissaoNormal),
      comissaoMeta: parseFloat(body.comissaoMeta),
      updatedAt: new Date()
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Meta não encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Meta atualizada com sucesso' })
  } catch (error) {
    console.error('Erro ao atualizar meta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await client.connect()
    const db = client.db('guapa')
    const collection = db.collection('metas-comissao')

    const result = await collection.deleteOne({ _id: new ObjectId(params.id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Meta não encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Meta excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir meta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
