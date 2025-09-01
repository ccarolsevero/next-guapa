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
    
    let query: any = {}
    
    // Filtrar por data específica
    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)
      
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
      return NextResponse.json(
        { error: 'Já existe um agendamento neste horário para este profissional' },
        { status: 400 }
      )
    }
    
    const appointment = new Appointment({
      ...body,
      date: new Date(body.date)
    })
    
    await appointment.save()
    
    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
