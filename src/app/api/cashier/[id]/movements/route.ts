import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

// Remover inicialização no nível do módulo

// POST - Adicionar movimentação (sangria ou suprimento)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const uri = process.env.MONGODB_URI!
  const client = new MongoClient(uri)
  
  try {
    const { id } = await params
    const body = await request.json()
    const { type, amount, description } = body

    if (!type || !amount || !description) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    if (!['WITHDRAWAL', 'SUPPLY'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de movimentação inválido' },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db('guapa')

    // Verificar se o caixa está aberto
    const cashier = await db.collection('cashiers').findOne({
      _id: new ObjectId(id),
      status: 'OPEN'
    })

    if (!cashier) {
      return NextResponse.json(
        { error: 'Caixa não encontrado ou fechado' },
        { status: 404 }
      )
    }

    // Criar movimentação
    const movement = {
      cashierId: id,
      type,
      amount: parseFloat(amount),
      description,
      createdAt: new Date().toISOString(),
      createdBy: cashier.responsibleId
    }

    const result = await db.collection('cashierMovements').insertOne(movement)

    return NextResponse.json({
      success: true,
      movementId: result.insertedId
    })

  } catch (error) {
    console.error('Erro ao adicionar movimentação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
