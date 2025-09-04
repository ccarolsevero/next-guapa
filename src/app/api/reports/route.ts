import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '6months'
    const reportType = searchParams.get('type') || 'financial'

    await connectDB()
    const db = (await import('@/lib/mongodb')).default.db

    // Calcular datas baseado no período
    const now = new Date()
    let startDate: Date

    switch (period) {
      case '1month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        break
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
        break
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
    }

    const reportData: any = {}

    if (reportType === 'financial' || reportType === 'all') {
      // Dados financeiros das finalizações
      const financialData = await db.collection('finalizacoes').aggregate([
        {
          $match: {
            dataFinalizacao: { $gte: startDate, $lte: now }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$dataFinalizacao' },
              month: { $month: '$dataFinalizacao' }
            },
            totalRevenue: { $sum: '$valorTotal' },
            totalCommissions: { $sum: '$comissoes' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]).toArray()

      // Dados de despesas
      const expensesData = await db.collection('despesas').aggregate([
        {
          $match: {
            data: { $gte: startDate, $lte: now }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$data' },
              month: { $month: '$data' }
            },
            totalExpenses: { $sum: '$valor' }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]).toArray()

      reportData.financial = {
        revenue: financialData,
        expenses: expensesData
      }
    }

    if (reportType === 'clients' || reportType === 'all') {
      // Clientes mais fiéis
      const topClients = await db.collection('finalizacoes').aggregate([
        {
          $match: {
            dataFinalizacao: { $gte: startDate, $lte: now }
          }
        },
        {
          $group: {
            _id: '$clienteId',
            totalSpent: { $sum: '$valorTotal' },
            visits: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'clients',
            localField: '_id',
            foreignField: '_id',
            as: 'client'
          }
        },
        {
          $unwind: '$client'
        },
        {
          $project: {
            name: '$client.name',
            totalSpent: 1,
            visits: 1
          }
        },
        {
          $sort: { totalSpent: -1 }
        },
        {
          $limit: 10
        }
      ]).toArray()

      // Estatísticas de clientes
      const clientStats = await db.collection('clients').aggregate([
        {
          $group: {
            _id: null,
            totalClients: { $sum: 1 },
            newClients: {
              $sum: {
                $cond: [
                  { $gte: ['$createdAt', startDate] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]).toArray()

      reportData.clients = {
        topClients,
        stats: clientStats[0] || { totalClients: 0, newClients: 0 }
      }
    }

    if (reportType === 'services' || reportType === 'all') {
      // Serviços mais vendidos
      const topServices = await db.collection('finalizacoes').aggregate([
        {
          $match: {
            dataFinalizacao: { $gte: startDate, $lte: now }
          }
        },
        {
          $unwind: '$servicos'
        },
        {
          $group: {
            _id: '$servicos.servicoId',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$servicos.valor' }
          }
        },
        {
          $lookup: {
            from: 'services',
            localField: '_id',
            foreignField: '_id',
            as: 'service'
          }
        },
        {
          $unwind: '$service'
        },
        {
          $project: {
            name: '$service.nome',
            count: 1,
            totalRevenue: 1
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        }
      ]).toArray()

      reportData.services = { topServices }
    }

    if (reportType === 'professionals' || reportType === 'all') {
      // Profissionais mais ativos
      const topProfessionals = await db.collection('finalizacoes').aggregate([
        {
          $match: {
            dataFinalizacao: { $gte: startDate, $lte: now }
          }
        },
        {
          $group: {
            _id: '$profissionalId',
            appointments: { $sum: 1 },
            revenue: { $sum: '$valorTotal' },
            commissions: { $sum: '$comissoes' }
          }
        },
        {
          $lookup: {
            from: 'professionals',
            localField: '_id',
            foreignField: '_id',
            as: 'professional'
          }
        },
        {
          $unwind: '$professional'
        },
        {
          $project: {
            name: '$professional.nome',
            appointments: 1,
            revenue: 1,
            commissions: 1
          }
        },
        {
          $sort: { appointments: -1 }
        },
        {
          $limit: 10
        }
      ]).toArray()

      reportData.professionals = { topProfessionals }
    }

    if (reportType === 'appointments' || reportType === 'all') {
      // Status dos agendamentos
      const appointmentsByStatus = await db.collection('agendamentos').aggregate([
        {
          $match: {
            data: { $gte: startDate, $lte: now }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]).toArray()

      const totalAppointments = appointmentsByStatus.reduce((sum, item) => sum + item.count, 0)

      const appointmentsWithPercentage = appointmentsByStatus.map(item => ({
        status: item._id,
        count: item.count,
        percentage: totalAppointments > 0 ? Math.round((item.count / totalAppointments) * 100) : 0
      }))

      reportData.appointments = {
        byStatus: appointmentsWithPercentage,
        total: totalAppointments
      }
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Erro ao buscar dados dos relatórios:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
