import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '6months'
    const reportType = searchParams.get('type') || 'financial'
    const serviceId = searchParams.get('serviceId')
    const professionalId = searchParams.get('professionalId')
    const ageRange = searchParams.get('ageRange')
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')

    console.log('Relatório solicitado:', { reportType, period, startDateParam, endDateParam })

    const { db } = await connectToDatabase()
    console.log('Conexão com banco estabelecida:', !!db)

    // Calcular datas baseado no período ou usar datas customizadas
    const now = new Date()
    let startDate: Date
    let endDate: Date = now

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam)
      endDate = new Date(endDateParam)
    } else {
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
    }

    const reportData: any = {}

    // Função auxiliar para calcular idade
    const calculateAge = (birthDate: Date) => {
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    }

    // Função auxiliar para verificar aniversário
    const isBirthdayThisMonth = (birthDate: Date) => {
      const today = new Date()
      return birthDate.getMonth() === today.getMonth()
    }

    switch (reportType) {
      case 'clientes-aniversariantes':
        console.log('Executando relatório: clientes-aniversariantes')
        const aniversariantes = await db.collection('clients').find({
          birthDate: { $exists: true, $ne: null }
        }).toArray()
        console.log('Aniversariantes encontrados:', aniversariantes.length)

        reportData.aniversariantes = aniversariantes
          .filter(client => isBirthdayThisMonth(new Date(client.birthDate)))
          .map(client => ({
            name: client.name,
            email: client.email,
            phone: client.phone,
            birthDate: client.birthDate,
            age: calculateAge(new Date(client.birthDate))
          }))
        break

      case 'clientes-atendidos':
        console.log('Executando relatório: clientes-atendidos')
        const clientesAtendidos = await db.collection('finalizacoes').aggregate([
          {
            $match: {
              dataCriacao: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $addFields: {
              clienteObjectId: { $toObjectId: '$clienteId' }
            }
          },
          {
            $group: {
              _id: '$clienteObjectId',
              totalVisits: { $sum: 1 },
              totalSpent: { $sum: '$valorFinal' },
              lastVisit: { $max: '$dataCriacao' }
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
              email: '$client.email',
              phone: '$client.phone',
              totalVisits: 1,
              totalSpent: 1,
              lastVisit: 1
            }
          },
          {
            $sort: { lastVisit: -1 }
          }
        ]).toArray()

        reportData.clientesAtendidos = clientesAtendidos
        break

      case 'lista-clientes':
        console.log('Executando relatório: lista-clientes')
        const todosClientes = await db.collection('clients').find({}).toArray()
        console.log('Total de clientes:', todosClientes.length)
        reportData.todosClientes = todosClientes.map(client => ({
          name: client.name,
          email: client.email,
          phone: client.phone,
          address: client.address,
          birthDate: client.birthDate,
          createdAt: client.createdAt,
          isCompleteProfile: client.isCompleteProfile || false
        }))
        break

      case 'clientes-credito-debito':
        // Assumindo que temos campos de crédito/débito nos clientes
        const clientesCreditoDebito = await db.collection('clients').find({
          $or: [
            { credito: { $exists: true, $gt: 0 } },
            { debito: { $exists: true, $gt: 0 } }
          ]
        }).toArray()

        reportData.clientesCreditoDebito = clientesCreditoDebito.map(client => ({
          name: client.name,
          email: client.email,
          phone: client.phone,
          credito: client.credito || 0,
          debito: client.debito || 0
        }))
        break

      case 'taxa-retorno':
        const taxaRetorno = await db.collection('finalizacoes').aggregate([
          {
            $match: {
              dataCriacao: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: '$clienteId',
              visits: { $sum: 1 }
            }
          },
          {
            $group: {
              _id: null,
              totalClients: { $sum: 1 },
              returningClients: {
                $sum: {
                  $cond: [{ $gt: ['$visits', 1] }, 1, 0]
                }
              }
            }
          }
        ]).toArray()

        const stats = taxaRetorno[0] || { totalClients: 0, returningClients: 0 }
        reportData.taxaRetorno = {
          totalClients: stats.totalClients,
          returningClients: stats.returningClients,
          returnRate: stats.totalClients > 0 ? (stats.returningClients / stats.totalClients * 100).toFixed(2) : 0
        }
        break

      case 'clientes-servico-especifico':
        if (!serviceId) {
          return NextResponse.json({ error: 'ID do serviço é obrigatório' }, { status: 400 })
        }

        const clientesServicoEspecifico = await db.collection('finalizacoes').aggregate([
          {
            $match: {
              'servicos.servicoId': new ObjectId(serviceId),
              dataCriacao: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $unwind: '$servicos'
          },
          {
            $match: {
              'servicos.servicoId': new ObjectId(serviceId)
            }
          },
          {
            $group: {
              _id: '$clienteId',
              totalServices: { $sum: 1 },
              totalSpent: { $sum: '$servicos.preco' }
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
              email: '$client.email',
              phone: '$client.phone',
              totalServices: 1,
              totalSpent: 1
            }
          }
        ]).toArray()

        reportData.clientesServicoEspecifico = clientesServicoEspecifico
        break

      case 'clientes-faixa-etaria':
        const clientesFaixaEtaria = await db.collection('clients').find({
          birthDate: { $exists: true, $ne: null }
        }).toArray()

        const faixasEtarias = {
          '0-18': 0,
          '19-25': 0,
          '26-35': 0,
          '36-45': 0,
          '46-55': 0,
          '56-65': 0,
          '65+': 0
        }

        clientesFaixaEtaria.forEach(client => {
          const age = calculateAge(new Date(client.birthDate))
          if (age <= 18) faixasEtarias['0-18']++
          else if (age <= 25) faixasEtarias['19-25']++
          else if (age <= 35) faixasEtarias['26-35']++
          else if (age <= 45) faixasEtarias['36-45']++
          else if (age <= 55) faixasEtarias['46-55']++
          else if (age <= 65) faixasEtarias['56-65']++
          else faixasEtarias['65+']++
        })

        reportData.faixasEtarias = faixasEtarias
        break

      case 'retorno-profissional':
        const retornoProfissional = await db.collection('finalizacoes').aggregate([
          {
            $match: {
              dataCriacao: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: {
                clienteId: '$clienteId',
                profissionalId: '$profissionalId'
              },
              visits: { $sum: 1 }
            }
          },
          {
            $group: {
              _id: '$_id.profissionalId',
              totalClients: { $sum: 1 },
              returningClients: {
                $sum: {
                  $cond: [{ $gt: ['$visits', 1] }, 1, 0]
                }
              }
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
              totalClients: 1,
              returningClients: 1,
              returnRate: {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$returningClients', '$totalClients'] },
                      100
                    ]
                  },
                  2
                ]
              }
            }
          }
        ]).toArray()

        reportData.retornoProfissional = retornoProfissional
        break

      case 'faturamento-profissional':
        const faturamentoProfissional = await db.collection('finalizacoes').aggregate([
          {
            $match: {
              dataCriacao: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $addFields: {
              profissionalObjectId: { $toObjectId: '$profissionalId' }
            }
          },
          {
            $group: {
              _id: '$profissionalObjectId',
              totalRevenue: { $sum: '$valorFinal' },
              totalComandas: { $sum: 1 },
              totalCommissions: { $sum: '$totalComissao' }
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
              name: '$professional.name',
              totalRevenue: 1,
              totalComandas: 1,
              totalCommissions: 1,
              averageTicket: {
                $round: [{ $divide: ['$totalRevenue', '$totalComandas'] }, 2]
              }
            }
          },
          {
            $sort: { totalRevenue: -1 }
          }
        ]).toArray()

        reportData.faturamentoProfissional = faturamentoProfissional
        break

      case 'servicos-realizados':
        const servicosRealizados = await db.collection('finalizacoes').aggregate([
          {
            $match: {
              dataCriacao: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $unwind: '$servicos'
          },
          {
            $addFields: {
              servicoObjectId: { $toObjectId: '$servicos.servicoId' }
            }
          },
          {
            $group: {
              _id: '$servicoObjectId',
              count: { $sum: 1 },
              totalRevenue: { $sum: '$servicos.preco' }
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
              name: '$service.name',
              count: 1,
              totalRevenue: 1,
              averagePrice: {
                $round: [{ $divide: ['$totalRevenue', '$count'] }, 2]
              }
            }
          },
          {
            $sort: { count: -1 }
          }
        ]).toArray()

        reportData.servicosRealizados = servicosRealizados
        break

      case 'produtos-vendidos':
        const produtosVendidos = await db.collection('finalizacoes').aggregate([
          {
            $match: {
              dataCriacao: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $unwind: '$produtos'
          },
          {
            $addFields: {
              produtoObjectId: { $toObjectId: '$produtos.id' }
            }
          },
          {
            $group: {
              _id: '$produtoObjectId',
              quantity: { $sum: '$produtos.quantidade' },
              totalRevenue: { $sum: { $multiply: ['$produtos.quantidade', '$produtos.preco'] } }
            }
          },
          {
            $lookup: {
              from: 'products',
              localField: '_id',
              foreignField: '_id',
              as: 'product'
            }
          },
          {
            $unwind: '$product'
          },
          {
            $project: {
              name: '$product.name',
              quantity: 1,
              totalRevenue: 1,
              averagePrice: {
                $round: [{ $divide: ['$totalRevenue', '$quantity'] }, 2]
              }
            }
          },
          {
            $sort: { quantity: -1 }
          }
        ]).toArray()

        reportData.produtosVendidos = produtosVendidos
        break

      case 'comandas-alteradas':
        const comandasAlteradas = await db.collection('finalizacoes').find({
          dataCriacao: { $gte: startDate, $lte: endDate },
          alterada: true
        }).toArray()

        reportData.comandasAlteradas = comandasAlteradas.map(comanda => ({
          id: comanda._id,
          clienteNome: comanda.clienteNome,
          profissionalNome: comanda.profissionalNome,
          valorTotal: comanda.valorFinal,
          dataFinalizacao: comanda.dataCriacao,
          motivoAlteracao: comanda.motivoAlteracao || 'Não especificado'
        }))
        break

      case 'clientes-agendamentos':
        const clientesComAgendamentos = await db.collection('agendamentos').aggregate([
          {
            $match: {
              data: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $addFields: {
              clienteObjectId: { $toObjectId: '$clienteId' }
            }
          },
          {
            $group: {
              _id: '$clienteObjectId',
              totalAppointments: { $sum: 1 },
              confirmedAppointments: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0]
                }
              },
              cancelledAppointments: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
                }
              }
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
              email: '$client.email',
              phone: '$client.phone',
              totalAppointments: 1,
              confirmedAppointments: 1,
              cancelledAppointments: 1
            }
          },
          {
            $sort: { totalAppointments: -1 }
          }
        ]).toArray()

        reportData.clientesAgendamentos = clientesComAgendamentos
        break

      case 'clientes-agendamentos-cancelados':
        const clientesCancelados = await db.collection('agendamentos').aggregate([
          {
            $match: {
              data: { $gte: startDate, $lte: endDate },
              status: 'cancelled'
            }
          },
          {
            $addFields: {
              clienteObjectId: { $toObjectId: '$clienteId' }
            }
          },
          {
            $group: {
              _id: '$clienteObjectId',
              cancelledCount: { $sum: 1 }
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
              email: '$client.email',
              phone: '$client.phone',
              cancelledCount: 1
            }
          },
          {
            $sort: { cancelledCount: -1 }
          }
        ]).toArray()

        reportData.clientesCancelados = clientesCancelados
        break

      default:
        // Relatórios básicos (financial, clients, services, professionals, appointments)
        if (reportType === 'financial' || reportType === 'all') {
          console.log('Executando relatório: financial')
          const financialData = await db.collection('finalizacoes').aggregate([
            {
              $match: {
                dataCriacao: { $gte: startDate, $lte: endDate }
              }
            },
            {
              $group: {
                _id: {
                  year: { $year: '$dataCriacao' },
                  month: { $month: '$dataCriacao' }
                },
                totalRevenue: { $sum: '$valorFinal' },
                totalCommissions: { $sum: '$totalComissao' },
                count: { $sum: 1 }
              }
            },
            {
              $sort: { '_id.year': 1, '_id.month': 1 }
            }
          ]).toArray()

          const expensesData = await db.collection('despesas').aggregate([
            {
              $match: {
                data: { $gte: startDate, $lte: endDate }
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
            dataCriacao: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $addFields: {
            clienteObjectId: { $toObjectId: '$clienteId' }
          }
        },
        {
          $group: {
            _id: '$clienteObjectId',
            totalSpent: { $sum: '$valorFinal' },
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
            dataCriacao: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $unwind: '$servicos'
        },
        {
          $addFields: {
            servicoObjectId: { $toObjectId: '$servicos.servicoId' }
          }
        },
        {
          $group: {
            _id: '$servicoObjectId',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$servicos.preco' }
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
            dataCriacao: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $addFields: {
            profissionalObjectId: { $toObjectId: '$profissionalId' }
          }
        },
        {
          $group: {
            _id: '$profissionalObjectId',
            appointments: { $sum: 1 },
            revenue: { $sum: '$valorFinal' },
            commissions: { $sum: '$totalComissao' }
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
            name: '$professional.name',
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
    }

    console.log('Dados retornados:', { reportType, dataKeys: Object.keys(reportData) })
    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Erro ao buscar dados dos relatórios:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
