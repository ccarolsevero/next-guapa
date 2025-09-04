import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Appointment from '@/models/Appointment'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const professionalId = searchParams.get('professionalId')
    
    if (!date || !professionalId) {
      return NextResponse.json(
        { error: 'Data e ID do profissional são obrigatórios' },
        { status: 400 }
      )
    }
    
    await connectToDatabase()
    
    // Buscar agendamentos existentes para o profissional na data
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)
    
    const existingAppointments = await Appointment.find({
      professionalId,
      date: {
        $gte: startDate,
        $lte: endDate
      },
      status: { $in: ['SCHEDULED', 'CONFIRMED'] }
    }).lean()
    
    // Horários disponíveis (9h às 18h, com intervalo de 1h)
    const allTimeSlots = [
      "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"
    ]
    
    // Filtrar horários ocupados
    const occupiedTimes = existingAppointments.map(apt => apt.startTime)
    const availableTimes = allTimeSlots.filter(time => !occupiedTimes.includes(time))
    
    return NextResponse.json({
      date,
      professionalId,
      availableTimes,
      occupiedTimes
    })
  } catch (error) {
    console.error('Erro ao buscar horários disponíveis:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
