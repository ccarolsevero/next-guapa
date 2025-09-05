import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Appointment from '@/models/Appointment'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const professionalId = searchParams.get('professionalId')
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')
    
    let query: any = {}
    
    // Filtrar por data específica
    if (date) {
      // Considerar que a data vem no formato YYYY-MM-DD
      // Precisamos buscar considerando o fuso horário
      const startDate = new Date(date + 'T00:00:00.000Z') // UTC
      const endDate = new Date(date + 'T23:59:59.999Z')   // UTC
      
      query.date = {
        $gte: startDate,
        $lte: endDate
      }
    }
    
    // Filtrar por profissional
    if (professionalId) {
      query.professionalId = professionalId
    }
    
    // Filtrar por status
    if (status && status !== 'all') {
      query.status = status
    }
    
    // Filtrar por cliente
    if (clientId) {
      query.clientId = clientId
    }
    
    const appointments = await Appointment.find(query)
      .sort({ date: 1, startTime: 1 })
      .lean()
    
    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    
    console.log('🔍 === API APPOINTMENTS - POST ===')
    console.log('📝 Dados recebidos:', JSON.stringify(body, null, 2))
    
    // Validar se já existe agendamento no mesmo horário para o profissional
    const existingAppointment = await Appointment.findOne({
      professionalId: body.professionalId,
      date: new Date(body.date),
      $or: [
        {
          startTime: { $lt: body.endTime },
          endTime: { $gt: body.startTime }
        }
      ]
    })
    
    if (existingAppointment) {
      console.log('❌ Agendamento já existe neste horário')
      return NextResponse.json(
        { error: 'Já existe um agendamento neste horário para este profissional' },
        { status: 400 }
      )
    }
    
    const appointment = new Appointment({
      ...body,
      date: new Date(body.date)
    })
    
    console.log('💾 Salvando agendamento:', {
      clientId: appointment.clientId,
      clientName: appointment.clientName,
      service: appointment.service,
      professional: appointment.professional,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime
    })
    
    await appointment.save()
    
    console.log('✅ Agendamento salvo com sucesso:', appointment._id)
    
    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('❌ Erro ao criar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
