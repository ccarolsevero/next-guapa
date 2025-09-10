import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not defined")
  }
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    const db = client.db('guapa')

    const { searchParams } = new URL(request.url)
    const professionalId = searchParams.get('professionalId')
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    // Buscar faturamento do dia por profissional
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    let matchQuery: any = {
      dataFinalizacao: {
        $gte: startOfDay.toISOString(),
        $lte: endOfDay.toISOString()
      }
    }

    if (professionalId && professionalId !== 'all') {
      matchQuery.professionalId = professionalId
    }

    const dailyRevenue = await db.collection('finalizacoes').aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$professionalId',
          totalRevenue: { $sum: '$valorFinal' },
          totalServices: {
            $sum: {
              $reduce: {
                input: '$servicos',
                initialValue: 0,
                in: { $add: ['$$value', '$$this.preco'] }
              }
            }
          },
          totalProducts: {
            $sum: {
              $reduce: {
                input: '$produtos',
                initialValue: 0,
                in: { $add: ['$$value', '$$this.preco'] }
              }
            }
          },
          count: { $sum: 1 }
        }
      }
    ]).toArray()

    // Buscar dados dos profissionais
    const professionals = await db.collection('professionals').find({}).toArray()
    const professionalMap = new Map(professionals.map(p => [p._id.toString(), p]))

    // Formatar dados
    const revenueData = dailyRevenue.map(item => {
      const professional = professionalMap.get(item._id)
      return {
        professionalId: item._id,
        professionalName: professional?.name || 'Profissional',
        totalRevenue: item.totalRevenue,
        totalServices: item.totalServices,
        totalProducts: item.totalProducts,
        count: item.count
      }
    })

    // Calcular total geral se não especificou profissional
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.totalRevenue, 0)
    const totalServices = revenueData.reduce((sum, item) => sum + item.totalServices, 0)
    const totalProducts = revenueData.reduce((sum, item) => sum + item.totalProducts, 0)
    const totalCount = revenueData.reduce((sum, item) => sum + item.count, 0)

    return NextResponse.json({
      date,
      professionalId,
      revenueData,
      totals: {
        totalRevenue,
        totalServices,
        totalProducts,
        totalCount
      },
      professionals: professionals.map(p => ({
        id: p._id,
        name: p.name,
        role: p.role
      }))
    })

  } catch (error) {
    console.error('Erro ao buscar dados da caixa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
