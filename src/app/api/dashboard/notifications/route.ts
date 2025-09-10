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

    // Buscar novos agendamentos (últimas 24 horas)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const newAppointments = await db.collection('appointments').find({
      createdAt: { $gte: yesterday.toISOString() }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray()

    // Buscar reservas de produtos (últimas 24 horas)
    const newProductReservations = await db.collection('orders').find({
      createdAt: { $gte: yesterday.toISOString() },
      status: 'PENDING'
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray()

    // Buscar dados dos profissionais para os agendamentos
    const professionals = await db.collection('professionals').find({}).toArray()
    const professionalMap = new Map(professionals.map(p => [p._id.toString(), p]))

    // Formatar notificações
    const notifications: any[] = []

    // Adicionar notificações de agendamentos
    newAppointments.forEach(appointment => {
      const professional = professionalMap.get(appointment.professionalId)
      notifications.push({
        id: `appointment-${appointment._id}`,
        type: 'appointment',
        title: 'Novo Agendamento',
        message: `${appointment.clientName} agendou ${appointment.service} com ${professional?.name || 'Profissional'}`,
        time: appointment.createdAt,
        data: {
          appointmentId: appointment._id,
          clientName: appointment.clientName,
          service: appointment.service,
          professional: professional?.name || 'Profissional',
          date: appointment.date,
          time: appointment.startTime
        }
      })
    })

    // Adicionar notificações de reservas de produtos
    newProductReservations.forEach(order => {
      notifications.push({
        id: `order-${order._id}`,
        type: 'product_reservation',
        title: 'Nova Reserva de Produto',
        message: `${order.clientName} reservou produtos no valor de R$ ${order.total.toFixed(2)}`,
        time: order.createdAt,
        data: {
          orderId: order._id,
          clientName: order.clientName,
          total: order.total,
          products: order.products
        }
      })
    })

    // Ordenar por tempo (mais recentes primeiro)
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    // Contar notificações não lidas (simulando - você pode implementar um sistema de leitura)
    const unreadCount = notifications.length

    return NextResponse.json({
      notifications: notifications.slice(0, 20), // Limitar a 20 notificações
      unreadCount,
      lastUpdate: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erro ao buscar notificações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
export const dynamic = 'force-dynamic'
