import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  let client: MongoClient | null = null
  
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    
    console.log('🔍 === API CLIENT DASHBOARD - GET ===')
    console.log('👤 Client ID:', clientId)
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'ID do cliente é obrigatório' },
        { status: 400 }
      )
    }
    
    // Conectar ao MongoDB
    const uri = process.env.MONGODB_URI!
    client = new MongoClient(uri)
    await client.connect()
    const db = client.db(process.env.DB_NAME || 'guapa')
    
    console.log('✅ Conectado ao MongoDB')
    
    // Buscar dados do cliente
    const cliente = await db.collection('clients').findOne({
      _id: new ObjectId(clientId)
    })
    
    if (!cliente) {
      console.log('❌ Cliente não encontrado')
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }
    
    console.log('✅ Cliente encontrado:', cliente.name)
    
    // Buscar agendamentos do cliente
    const agendamentos = await db.collection('appointments').find({
      clientId: clientId
    }).sort({ date: -1 }).toArray()
    
    console.log('📅 Agendamentos encontrados:', agendamentos.length)
    
    // Buscar comandas finalizadas do cliente
    const comandas = await db.collection('finalizacoes').find({
      clienteId: clientId
    }).sort({ dataFinalizacao: -1 }).toArray()
    
    console.log('📋 Comandas finalizadas encontradas:', comandas.length)
    
    // Buscar pedidos do cliente
    const pedidos = await db.collection('orders').find({
      clientId: clientId
    }).sort({ createdAt: -1 }).toArray()
    
    console.log('🛒 Pedidos encontrados:', pedidos.length)
    
    // Processar agendamentos
    const appointments = agendamentos.map(apt => ({
      id: apt._id.toString(),
      service: apt.service || 'Serviço não especificado',
      professional: apt.professional || 'Profissional não especificado',
      date: apt.date || new Date().toISOString().split('T')[0],
      time: apt.time || '00:00',
      status: apt.status || 'pending',
      price: apt.price || 0,
      rating: apt.rating,
      review: apt.review,
      reviewed: apt.reviewed || false
    }))
    
    // Processar comandas como histórico
    const historico = comandas.map(comanda => ({
      id: comanda._id.toString(),
      service: comanda.servicos?.map((s: any) => s.nome).join(' + ') || 'Serviço não especificado',
      professional: comanda.profissionalNome || 'Profissional não especificado',
      date: comanda.dataFinalizacao ? new Date(comanda.dataFinalizacao).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      time: comanda.horarioFinalizacao || '00:00',
      status: 'completed',
      price: comanda.valorFinal || 0,
      rating: comanda.rating,
      review: comanda.review,
      reviewed: comanda.reviewed || false
    }))
    
    // Processar pedidos
    const orders = pedidos.map(pedido => ({
      id: pedido._id.toString(),
      items: pedido.items || [],
      total: pedido.total || 0,
      status: pedido.status || 'pending',
      createdAt: pedido.createdAt ? new Date(pedido.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }))
    
    // Combinar agendamentos e histórico
    const allAppointments = [...appointments, ...historico].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    const dashboardData = {
      client: {
        id: cliente._id.toString(),
        name: cliente.name,
        email: cliente.email,
        phone: cliente.phone,
        birthDate: cliente.birthDate,
        address: cliente.address,
        createdAt: cliente.createdAt
      },
      appointments: allAppointments,
      orders: orders,
      stats: {
        totalAppointments: allAppointments.length,
        totalOrders: orders.length,
        completedAppointments: allAppointments.filter(a => a.status === 'completed').length,
        pendingAppointments: allAppointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length
      }
    }
    
    console.log('📊 Dashboard data prepared:', {
      appointments: dashboardData.appointments.length,
      orders: dashboardData.orders.length,
      stats: dashboardData.stats
    })
    
    await client.close()
    
    return NextResponse.json(dashboardData)
    
  } catch (error) {
    console.error('❌ Erro ao buscar dados do dashboard:', error)
    
    if (client) {
      try {
        await client.close()
      } catch (closeError) {
        console.error('❌ Erro ao fechar conexão:', closeError)
      }
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
