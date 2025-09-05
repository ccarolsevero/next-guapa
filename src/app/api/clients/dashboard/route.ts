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
    const db = client.db('guapa')
    
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
    if (agendamentos.length > 0) {
      console.log('🔍 Primeiro agendamento:', {
        _id: agendamentos[0]._id,
        service: agendamentos[0].service,
        startTime: agendamentos[0].startTime,
        time: agendamentos[0].time,
        date: agendamentos[0].date,
        status: agendamentos[0].status
      })
    }
    
    // Buscar comandas finalizadas do cliente (histórico)
    const comandasFinalizadas = await db.collection('finalizacoes').find({
      clienteId: clientId
    }).sort({ dataFinalizacao: -1 }).toArray()
    
    console.log('📋 Comandas finalizadas encontradas:', comandasFinalizadas.length)
    
    // Buscar comandas ativas do cliente (em_atendimento)
    const comandasAtivas = await db.collection('comandas').find({
      'clientId._id': new ObjectId(clientId)
    }).sort({ dataInicio: -1 }).toArray()
    
    console.log('📋 Comandas ativas encontradas:', comandasAtivas.length)
    
    // Buscar pedidos do cliente pelo email
    const pedidos = await db.collection('orders').find({
      'customerInfo.email': cliente.email
    }).sort({ createdAt: -1 }).toArray()
    
    console.log('🛒 Pedidos encontrados:', pedidos.length)
    
    // Processar agendamentos - buscar nomes dos profissionais
    const appointments = await Promise.all(agendamentos.map(async (apt) => {
      let professionalName = 'Profissional não especificado'
      
      // Se já tem o nome do profissional no agendamento, usar ele
      if (apt.professional) {
        professionalName = apt.professional
      } else if (apt.professionalId) {
        // Se não tem o nome, buscar pelo ID
        try {
          const professional = await db.collection('professionals').findOne({ _id: new ObjectId(apt.professionalId) })
          if (professional) {
            professionalName = professional.name || professional.nome || professional.fullName || 'Nome não definido'
          }
        } catch (error) {
          console.log('⚠️ Erro ao buscar profissional:', error)
        }
      }
      
      return {
        id: apt._id.toString(),
        service: apt.service || 'Serviço não especificado',
        professional: professionalName,
        date: apt.date || new Date().toISOString().split('T')[0],
        time: apt.startTime || '00:00',
        status: apt.status || 'pending',
        price: apt.price || 0,
        rating: apt.rating,
        review: apt.review,
        reviewed: apt.reviewed || false
      }
    }))
    
    // Processar comandas finalizadas como histórico
    const historico = await Promise.all(comandasFinalizadas.map(async (comanda) => {
      let professionalName = comanda.profissionalNome || 'Profissional não especificado'
      
      // Se não tem o nome do profissional, buscar pelo ID
      if (!comanda.profissionalNome && comanda.profissionalId) {
        try {
          const profissional = await db.collection('professionals').findOne({ _id: new ObjectId(comanda.profissionalId) })
          if (profissional) {
            professionalName = profissional.name || profissional.nome || profissional.fullName || 'Nome não definido'
          }
        } catch (error) {
          console.log('⚠️ Erro ao buscar profissional:', error)
        }
      }
      
      return {
        id: comanda._id.toString(),
        service: comanda.servicos?.map((s: any) => s.nome).join(' + ') || 'Serviço não especificado',
        professional: professionalName,
        date: comanda.dataFinalizacao ? new Date(comanda.dataFinalizacao).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: comanda.horarioFinalizacao || '00:00',
        status: 'completed',
        price: comanda.valorFinal || 0,
        rating: comanda.rating,
        review: comanda.review,
        reviewed: comanda.reviewed || false
      }
    }))
    
    // Processar comandas ativas (em atendimento)
    const comandasEmAtendimento = comandasAtivas.map(comanda => ({
      id: comanda._id.toString(),
      service: comanda.servicos?.map((s: any) => s.nome).join(' + ') || 'Serviço não especificado',
      professional: comanda.profissionalId?.name || 'Profissional não especificado',
      date: comanda.dataInicio ? new Date(comanda.dataInicio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      time: comanda.servicos?.[0]?.horarioInicio || '00:00',
      status: 'in_progress',
      price: comanda.valorTotal || 0,
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
    
    // Combinar agendamentos, comandas em atendimento e histórico
    const allAppointments = [...appointments, ...comandasEmAtendimento, ...historico].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    const dashboardData = {
      client: {
        id: cliente._id.toString(),
        _id: cliente._id.toString(),
        name: cliente.name,
        email: cliente.email,
        phone: cliente.phone,
        birthDate: cliente.birthDate ? new Date(cliente.birthDate).toISOString().split('T')[0] : null,
        address: cliente.address,
        createdAt: cliente.createdAt,
        onboardingCompleted: cliente.onboardingCompleted || false,
        onboardingRequired: cliente.onboardingRequired || false,
        isCompleteProfile: cliente.isCompleteProfile || false
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
