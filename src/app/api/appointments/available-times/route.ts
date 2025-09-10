import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import BlockedHours from '@/models/BlockedHours'

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
    
    // Buscar horários bloqueados para o profissional na data
    const checkDate = new Date(date)
    const dayOfWeek = checkDate.getDay()
    
    const blockedHours = await BlockedHours.find({
      professionalId,
      isActive: true
    }).lean()
    
    // Verificar quais bloqueios se aplicam à data
    const applicableBlocks = blockedHours.filter(block => {
      switch (block.type) {
        case 'weekly':
          return block.dayOfWeek === dayOfWeek
        case 'date_range':
          if (block.startDate && block.endDate) {
            const blockStart = new Date(block.startDate)
            const blockEnd = new Date(block.endDate)
            return checkDate >= blockStart && checkDate <= blockEnd
          }
          return false
        case 'lunch_break':
        case 'vacation':
        case 'custom':
          if (block.startDate && block.endDate) {
            const blockStart = new Date(block.startDate)
            const blockEnd = new Date(block.endDate)
            return checkDate >= blockStart && checkDate <= blockEnd
          } else if (block.dayOfWeek === dayOfWeek) {
            return true
          }
          return false
        default:
          return false
      }
    })
    
    // Horários disponíveis (9h às 18h, com intervalo de 1h)
    const allTimeSlots = [
      "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"
    ]
    
    // Filtrar horários ocupados por agendamentos
    const occupiedTimes = existingAppointments.map(apt => apt.startTime)
    
    // Filtrar horários bloqueados
    const blockedTimes = new Set<string>()
    applicableBlocks.forEach(block => {
      const [startHour, startMin] = block.startTime.split(':').map(Number)
      const [endHour, endMin] = block.endTime.split(':').map(Number)
      
      // Converter para minutos para facilitar comparação
      const startMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin
      
      // Verificar quais slots de tempo se sobrepõem com o bloqueio
      allTimeSlots.forEach(slot => {
        const [slotHour, slotMin] = slot.split(':').map(Number)
        const slotMinutes = slotHour * 60 + slotMin
        const slotEndMinutes = slotMinutes + 60 // Assumindo 1h de duração
        
        // Se o slot se sobrepõe com o bloqueio, marcar como bloqueado
        if (slotMinutes < endMinutes && slotEndMinutes > startMinutes) {
          blockedTimes.add(slot)
        }
      })
    })
    
    // Combinar horários ocupados e bloqueados
    const unavailableTimes = [...occupiedTimes, ...Array.from(blockedTimes)]
    const availableTimes = allTimeSlots.filter(time => !unavailableTimes.includes(time))
    
    return NextResponse.json({
      date,
      professionalId,
      availableTimes,
      occupiedTimes,
      blockedTimes: Array.from(blockedTimes),
      blockedHours: applicableBlocks.map(block => ({
        id: block._id,
        title: block.title,
        type: block.type,
        startTime: block.startTime,
        endTime: block.endTime,
        description: block.description
      }))
    })
  } catch (error) {
    console.error('Erro ao buscar horários disponíveis:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
