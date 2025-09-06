import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI!
const client = new MongoClient(uri)

export async function GET() {
  try {
    await client.connect()
    const db = client.db('guapa')
    const collection = db.collection('metas-comissao')

    const metas = await collection.find({}).toArray()
    
    return NextResponse.json(metas)
  } catch (error) {
    console.error('Erro ao buscar metas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}

export async function POST(request: NextRequest) {
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

    const meta = {
      ...body,
      valorMeta: parseFloat(body.valorMeta),
      comissaoNormal: parseFloat(body.comissaoNormal),
      comissaoMeta: parseFloat(body.comissaoMeta),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(meta)
    
    return NextResponse.json(
      { 
        message: 'Meta criada com sucesso',
        id: result.insertedId 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar meta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
