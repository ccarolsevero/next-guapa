import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error('MONGODB_URI environment variable is not defined')
}
const client = new MongoClient(uri)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { finalCash, notes } = body

    await client.connect()
    const db = client.db('guapa')

    // Buscar o caixa
    const cashier = await db.collection('cashiers').findOne({
      _id: new ObjectId(id),
      status: 'OPEN'
    })

    if (!cashier) {
      return NextResponse.json(
        { error: 'Caixa não encontrado ou já fechado' },
        { status: 404 }
      )
    }

    // Calcular totais finais
    const paymentTotals = await db.collection('finalizacoes').aggregate([
      {
        $match: {
          cashierId: id,
          dataFinalizacao: {
            $gte: cashier.openedAt
          }
        }
      },
      {
        $group: {
          _id: '$metodoPagamento',
          total: { $sum: '$valorFinal' },
          count: { $sum: 1 }
        }
      }
    ]).toArray()

    // Buscar movimentações (sangrias e suprimentos)
    const movements = await db.collection('cashierMovements').find({
      cashierId: id
    }).toArray()

    // Calcular total de sangrias e suprimentos
    const totalWithdrawals = movements
      .filter(m => m.type === 'WITHDRAWAL')
      .reduce((sum, m) => sum + m.amount, 0)
    
    const totalSupplies = movements
      .filter(m => m.type === 'SUPPLY')
      .reduce((sum, m) => sum + m.amount, 0)

    // Calcular o valor final do caixa (dinheiro inicial + suprimentos - sangrias)
    const calculatedFinalCash = cashier.initialCash + totalSupplies - totalWithdrawals

    // Fechar o caixa
    const updatedCashier = await db.collection('cashiers').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'CLOSED',
          closedAt: new Date().toISOString(),
          finalCash: calculatedFinalCash, // Usar o valor calculado automaticamente
          notes,
          updatedAt: new Date().toISOString(),
          // Dados para relatório
          paymentTotals,
          movements,
          totalWithdrawals,
          totalSupplies,
          calculatedFinalCash
        }
      }
    )

    if (updatedCashier.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Erro ao fechar caixa' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Caixa fechado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao fechar caixa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
