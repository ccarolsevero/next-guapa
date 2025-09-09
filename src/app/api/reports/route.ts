import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// Cache simples para consultas frequentes
const queryCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

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

    // Validação de parâmetros
    if (!reportType) {
      return NextResponse.json({ error: 'Tipo de relatório é obrigatório' }, { status: 400 })
    }

    // Verificar cache primeiro
    const cacheKey = `${reportType}-${period}-${serviceId || ''}-${startDateParam || ''}-${endDateParam || ''}`
    const cached = queryCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data)
    }

    const { db } = await connectToDatabase()

    // Calcular datas baseado no período ou usar datas customizadas
    const now = new Date()
    let startDate: Date
    let endDate: Date = now

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam)
      endDate = new Date(endDateParam)
    } else {
      // Cache de datas para melhor performance
      const dateCache = {
        '1month': () => new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
        '3months': () => new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
        '6months': () => new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()),
        '1year': () => new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      }
      
      startDate = dateCache[period as keyof typeof dateCache]?.() || dateCache['6months']()
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
        try {
          const aniversariantes = await db.collection('clients').find({
            birthDate: { $exists: true, $ne: null }
          }).toArray()
          console.log('Aniversariantes encontrados:', aniversariantes.length)

          reportData.aniversariantes = aniversariantes
            .filter((client: any) => {
              try {
                const birthDate = new Date(client.birthDate)
                return isBirthdayThisMonth(birthDate)
              } catch (error) {
                console.error('Erro ao processar data de nascimento:', client.birthDate, error)
                return false
              }
            })
            .map((client: any) => {
              try {
                const birthDate = new Date(client.birthDate)
                return {
                  name: client.name || 'Nome não informado',
                  email: client.email || 'Email não informado',
                  phone: client.phone || 'Telefone não informado',
                  birthDate: client.birthDate,
                  age: calculateAge(birthDate)
                }
              } catch (error) {
                console.error('Erro ao mapear cliente:', client, error)
                return {
                  name: client.name || 'Nome não informado',
                  email: client.email || 'Email não informado',
                  phone: client.phone || 'Telefone não informado',
                  birthDate: client.birthDate,
                  age: 0
                }
              }
            })
        } catch (error) {
          console.error('Erro ao buscar aniversariantes:', error)
          reportData.aniversariantes = []
        }
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
        reportData.todosClientes = todosClientes.map((client: any) => ({
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

        reportData.clientesCreditoDebito = clientesCreditoDebito.map((client: any) => ({
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
            $match: {
              servicoObjectId: new ObjectId(serviceId)
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

        clientesFaixaEtaria.forEach((client: any) => {
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

      case 'servicos-mais-vendidos':
        try {
          // Buscar serviços mais vendidos com dados reais - otimizado
          const servicosMaisVendidos = await db.collection('finalizacoes').aggregate([
            {
              $match: {
                dataCriacao: { $gte: startDate, $lte: endDate },
                'servicos.0': { $exists: true } // Só processar documentos que têm serviços
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
              $lookup: {
                from: 'services',
                localField: 'servicoObjectId',
                foreignField: '_id',
                as: 'servicoInfo'
              }
            },
            {
              $unwind: '$servicoInfo'
            },
            {
              $group: {
                _id: '$servicos.servicoId',
                name: { $first: '$servicoInfo.name' },
                count: { $sum: 1 },
                totalRevenue: { $sum: '$servicos.preco' },
                avgPrice: { $avg: '$servicos.preco' }
              }
            },
            {
              $sort: { count: -1 }
            },
            {
              $limit: 10
            }
          ]).toArray()

          // Calcular estatísticas gerais
          const totalServicos = await db.collection('finalizacoes').aggregate([
            {
              $match: {
                dataCriacao: { $gte: startDate, $lte: endDate }
              }
            },
            {
              $unwind: '$servicos'
            },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$servicos.preco' },
                totalCount: { $sum: 1 },
                avgPrice: { $avg: '$servicos.preco' }
              }
            }
          ]).toArray()

          // Contar agendamentos no período
          const totalAgendamentos = await db.collection('agendamentos').countDocuments({
            data: { $gte: startDate, $lte: endDate }
          })

          reportData.servicosMaisVendidos = {
            topServices: servicosMaisVendidos,
            stats: {
              totalRevenue: totalServicos[0]?.totalRevenue || 0,
              totalServices: totalServicos[0]?.totalCount || 0,
              avgPrice: totalServicos[0]?.avgPrice || 0,
              totalAppointments: totalAgendamentos
            }
          }

          console.log('✅ Serviços mais vendidos carregados:', servicosMaisVendidos.length)
        } catch (error) {
          console.error('❌ Erro ao carregar serviços mais vendidos:', error)
          reportData.servicosMaisVendidos = {
            topServices: [],
            stats: {
              totalRevenue: 0,
              totalServices: 0,
              avgPrice: 0,
              totalAppointments: 0
            }
          }
        }
        break

      case 'produtos-vendidos':
        console.log('Executando relatório: produtos-vendidos')
        try {
          // Verificar se existem finalizações com produtos
          const finalizacoesComProdutos = await db.collection('finalizacoes').find({
            dataCriacao: { $gte: startDate, $lte: endDate },
            'produtos.0': { $exists: true }
          }).limit(1).toArray()

          if (finalizacoesComProdutos.length === 0) {
            console.log('Nenhuma finalização com produtos encontrada')
            reportData.produtosVendidos = []
            reportData.resumoProdutos = {
              receitaTotal: 0,
              descontos: 0,
              valorCusto: 0,
              totalLiquido: 0
            }
            break
          }

          // Buscar produtos vendidos
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
                totalRevenue: { $sum: { $multiply: ['$produtos.quantidade', '$produtos.preco'] } },
                totalDiscount: { $sum: { $ifNull: ['$produtos.desconto', 0] } }
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
                totalDiscount: 1,
                productCost: { $ifNull: ['$product.custo', 0] },
                totalCost: { $multiply: ['$quantity', { $ifNull: ['$product.custo', 0] }] },
                averagePrice: {
                  $round: [{ $divide: ['$totalRevenue', '$quantity'] }, 2]
                }
              }
            },
            {
              $sort: { quantity: -1 }
            }
          ]).toArray()

          console.log('Produtos vendidos encontrados:', produtosVendidos.length)

          // Calcular resumo financeiro dos produtos
          const resumoProdutos = produtosVendidos.reduce((acc: any, produto: any) => {
            acc.receitaTotal += produto.totalRevenue || 0
            acc.descontos += produto.totalDiscount || 0
            acc.valorCusto += produto.totalCost || 0
            return acc
          }, {
            receitaTotal: 0,
            descontos: 0,
            valorCusto: 0
          })

          resumoProdutos.totalLiquido = resumoProdutos.receitaTotal - resumoProdutos.descontos - resumoProdutos.valorCusto

          reportData.produtosVendidos = produtosVendidos
          reportData.resumoProdutos = resumoProdutos
        } catch (error) {
          console.error('Erro ao buscar produtos vendidos:', error)
          reportData.produtosVendidos = []
          reportData.resumoProdutos = {
            receitaTotal: 0,
            descontos: 0,
            valorCusto: 0,
            totalLiquido: 0
          }
        }
        break

      case 'comandas-alteradas':
        const comandasAlteradas = await db.collection('finalizacoes').find({
          dataCriacao: { $gte: startDate, $lte: endDate },
          alterada: true
        }).toArray()

        reportData.comandasAlteradas = comandasAlteradas.map((comanda: any) => ({
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

          // Carregar dados de clientes para o relatório financeiro
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
            topClients: [],
            stats: clientStats[0] || { totalClients: 0, newClients: 0 }
          }

          // Carregar dados de agendamentos para o relatório financeiro
          const appointmentsByStatus = await db.collection('agendamentos').aggregate([
            {
              $match: {
                data: { $gte: startDate, $lte: endDate }
              }
            },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ]).toArray()

          const totalAppointments = appointmentsByStatus.reduce((sum: any, item: any) => sum + item.count, 0)

          const appointmentsWithPercentage = appointmentsByStatus.map((item: any) => ({
            status: item._id,
            count: item.count,
            percentage: totalAppointments > 0 ? Math.round((item.count / totalAppointments) * 100) : 0
          }))

          reportData.appointments = {
            byStatus: appointmentsWithPercentage,
            total: totalAppointments
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

      const totalAppointments = appointmentsByStatus.reduce((sum: any, item: any) => sum + item.count, 0)

      const appointmentsWithPercentage = appointmentsByStatus.map((item: any) => ({
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

    // Salvar no cache
    queryCache.set(cacheKey, { data: reportData, timestamp: Date.now() })
    
    // Limpar cache antigo
    if (queryCache.size > 100) {
      const oldestKey = queryCache.keys().next().value
      if (oldestKey) {
        queryCache.delete(oldestKey)
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
