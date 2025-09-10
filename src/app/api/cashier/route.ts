import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not defined")
}
const client = new MongoClient(uri)

// GET - Buscar caixas abertos
export async function GET(request: NextRequest) {
  try {
    await client.connect()
    const db = client.db('guapa')

    // Buscar caixas abertos
    const openCashiers = await db.collection('cashiers').find({
      status: 'OPEN'
    }).toArray()

    // Para cada caixa, buscar dados do responsável
    const cashiersWithDetails = await Promise.all(
      openCashiers.map(async (cashier) => {
        const professional = await db.collection('professionals').findOne({
          _id: cashier.responsibleId
        })

        // Buscar movimentações do caixa
        const movements = await db.collection('cashierMovements').find({
          cashierId: cashier._id
        }).toArray()

        // Calcular totais por método de pagamento
        const paymentTotals = await db.collection('finalizacoes').aggregate([
          {
            $match: {
              cashierId: cashier._id,
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

        return {
          ...cashier,
          responsible: professional,
          movements,
          paymentTotals
        }
      })
    )

    return NextResponse.json(cashiersWithDetails)

  } catch (error) {
    console.error('Erro ao buscar caixas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}

// POST - Abrir novo caixa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { responsibleId, initialCash = 0 } = body

    await client.connect()
    const db = client.db('guapa')

    // Verificar se já existe um caixa aberto para este profissional
    const existingCashier = await db.collection('cashiers').findOne({
      responsibleId,
      status: 'OPEN'
    })

    if (existingCashier) {
      return NextResponse.json(
        { error: 'Já existe um caixa aberto para este profissional' },
        { status: 400 }
      )
    }

    // Criar novo caixa
    const newCashier = {
      responsibleId,
      status: 'OPEN',
      openedAt: new Date().toISOString(),
      closedAt: null,
      initialCash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await db.collection('cashiers').insertOne(newCashier)

    return NextResponse.json({
      success: true,
      cashierId: result.insertedId
    })

  } catch (error) {
    console.error('Erro ao abrir caixa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
