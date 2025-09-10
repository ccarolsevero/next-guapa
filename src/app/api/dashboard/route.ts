import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not defined")
}
const client = new MongoClient(uri)

export async function GET(request: NextRequest) {
  try {
    await client.connect()
    const db = client.db('guapa')

    // Buscar dados para as estatísticas
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // 1. Agendamentos de hoje
    const appointmentsToday = await db.collection('appointments').countDocuments({
      date: {
        $gte: today.toISOString(),
        $lt: tomorrow.toISOString()
      }
    })

    // 2. Total de clientes ativos (últimos 30 dias)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const activeClients = await db.collection('clients').countDocuments({
      createdAt: { $gte: thirtyDaysAgo.toISOString() }
    })

    // 3. Faturamento do mês atual
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    const monthlyRevenue = await db.collection('finalizacoes').aggregate([
      {
        $match: {
          dataFinalizacao: {
            $gte: startOfMonth.toISOString(),
            $lte: endOfMonth.toISOString()
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$valorFinal' }
        }
      }
    ]).toArray()

    const revenue = monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0

    // 4. Agendamentos recentes (últimos 5)
    const recentAppointments = await db.collection('appointments').find({
      date: { $gte: today.toISOString() }
    })
    .sort({ date: 1 })
    .limit(5)
    .toArray()

    // Buscar dados dos profissionais para os agendamentos
    const professionals = await db.collection('professionals').find({}).toArray()
    const professionalMap = new Map(professionals.map(p => [p._id.toString(), p]))

    // 5. Serviços mais populares
    const topServices = await db.collection('finalizacoes').aggregate([
      {
        $match: {
          dataFinalizacao: {
            $gte: startOfMonth.toISOString(),
            $lte: endOfMonth.toISOString()
          }
        }
      },
      { $unwind: '$servicos' },
      {
        $group: {
          _id: '$servicos.nome',
          count: { $sum: 1 },
          revenue: { $sum: '$servicos.preco' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 4 }
    ]).toArray()

    // 6. Clientes VIP (mais gastos)
    const vipClients = await db.collection('finalizacoes').aggregate([
      {
        $match: {
          dataFinalizacao: {
            $gte: startOfMonth.toISOString(),
            $lte: endOfMonth.toISOString()
          }
        }
      },
      {
        $group: {
          _id: '$clienteId',
          totalSpent: { $sum: '$valorFinal' },
          visits: { $sum: 1 },
          lastVisit: { $max: '$dataFinalizacao' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 3 }
    ]).toArray()

    // Buscar dados dos clientes VIP
    const clientIds = vipClients.map(vip => vip._id)
    const clients = await db.collection('clients').find({
      _id: { $in: clientIds }
    }).toArray()
    const clientMap = new Map(clients.map(c => [c._id.toString(), c]))

    // 7. Comissionamento por profissional
    const professionalCommissions = await db.collection('finalizacoes').aggregate([
      {
        $match: {
          dataFinalizacao: {
            $gte: startOfMonth.toISOString(),
            $lte: endOfMonth.toISOString()
          }
        }
      },
      {
        $group: {
          _id: '$professionalId',
          services: {
            $sum: {
              $reduce: {
                input: '$servicos',
                initialValue: 0,
                in: { $add: ['$$value', '$$this.preco'] }
              }
            }
          },
          products: {
            $sum: {
              $reduce: {
                input: '$produtos',
                initialValue: 0,
                in: { $add: ['$$value', '$$this.preco'] }
              }
            }
          },
          serviceCount: {
            $sum: { $size: '$servicos' }
          },
          productCount: {
            $sum: { $size: '$produtos' }
          }
        }
      }
    ]).toArray()

    // Calcular comissões (20% sobre serviços e produtos)
    const commissionData = professionalCommissions.map(prof => {
      const professional = professionalMap.get(prof._id.toString())
      const serviceCommission = prof.services * 0.20
      const productCommission = prof.products * 0.20
      
      return {
        id: prof._id,
        name: professional?.name || 'Profissional',
        role: professional?.role || 'Profissional',
        services: {
          total: prof.services,
          count: prof.serviceCount,
          commission: serviceCommission
        },
        products: {
          total: prof.products,
          count: prof.productCount,
          commission: productCommission
        },
        commission: {
          services: serviceCommission,
          products: productCommission,
          total: serviceCommission + productCommission
        }
      }
    })

    // Formatar dados para resposta
    const dashboardData = {
      stats: {
        appointmentsToday,
        activeClients,
        monthlyRevenue: revenue,
        averageRating: 4.8 // Mock por enquanto
      },
      recentAppointments: recentAppointments.map(apt => ({
        id: apt._id,
        clientName: apt.clientName,
        service: apt.service,
        time: apt.startTime,
        professional: professionalMap.get(apt.professionalId)?.name || 'Profissional',
        status: apt.status,
        date: apt.date
      })),
      topServices: topServices.map(service => ({
        name: service._id,
        bookings: service.count,
        revenue: service.revenue
      })),
      vipClients: vipClients.map(vip => {
        const client = clientMap.get(vip._id.toString())
        const daysSinceLastVisit = Math.floor(
          (new Date().getTime() - new Date(vip.lastVisit).getTime()) / (1000 * 60 * 60 * 24)
        )
        
        return {
          name: client?.name || 'Cliente',
          visits: vip.visits,
          totalSpent: vip.totalSpent,
          lastVisit: daysSinceLastVisit === 0 ? 'Hoje' : 
                    daysSinceLastVisit === 1 ? '1 dia atrás' :
                    `${daysSinceLastVisit} dias atrás`
        }
      }),
      professionalCommissions: commissionData
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Erro ao buscar dados da dashboard:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
