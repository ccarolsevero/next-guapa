import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Appointment from '@/models/Appointment'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const appointment = await Appointment.findById(params.id).lean()
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    
    // Se estiver alterando horário, validar conflitos
    if (body.startTime || body.endTime || body.date || body.professionalId) {
      const existingAppointment = await Appointment.findOne({
        _id: { $ne: params.id },
        professionalId: body.professionalId || (await Appointment.findById(params.id))?.professionalId,
        date: new Date(body.date || (await Appointment.findById(params.id))?.date),
        $or: [
          {
            startTime: { $lt: body.endTime || (await Appointment.findById(params.id))?.endTime },
            endTime: { $gt: body.startTime || (await Appointment.findById(params.id))?.startTime }
          }
        ]
      })
      
      if (existingAppointment) {
        return NextResponse.json(
          { error: 'Já existe um agendamento neste horário para este profissional' },
          { status: 400 }
        )
      }
    }
    
    const appointment = await Appointment.findByIdAndUpdate(
      params.id,
      {
        ...body,
        ...(body.date && { date: new Date(body.date) })
      },
      { new: true, runValidators: true }
    )
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const appointment = await Appointment.findByIdAndDelete(params.id)
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Agendamento excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
