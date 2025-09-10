import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not defined")
}
const client = new MongoClient(uri)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await client.connect()
    const db = client.db('guapa')
    const collection = db.collection('metas-comissao')

    const meta = await collection.findOne({ _id: new ObjectId(id) })
    
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Validação básica
    if (!body.nome || !body.tipo || !body.tipoMeta || !body.comissaoNormal || !body.comissaoMeta) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    // Validação específica baseada no tipo de meta
    if (body.tipoMeta === 'valor' && !body.valorMeta) {
      return NextResponse.json(
        { error: 'Valor da meta é obrigatório para metas por valor' },
        { status: 400 }
      )
    }

    if (body.tipoMeta === 'quantidade' && (!body.quantidadeMeta || !body.unidade)) {
      return NextResponse.json(
        { error: 'Quantidade e unidade são obrigatórios para metas por quantidade' },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db('guapa')
    const collection = db.collection('metas-comissao')

    const updateData = {
      ...body,
      valorMeta: body.valorMeta ? parseFloat(body.valorMeta) : 0,
      quantidadeMeta: body.quantidadeMeta ? parseInt(body.quantidadeMeta) : 0,
      comissaoNormal: parseFloat(body.comissaoNormal),
      comissaoMeta: parseFloat(body.comissaoMeta),
      updatedAt: new Date()
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await client.connect()
    const db = client.db('guapa')
    const collection = db.collection('metas-comissao')

    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    
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
export const dynamic = 'force-dynamic'
