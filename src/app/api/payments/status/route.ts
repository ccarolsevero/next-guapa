import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import Client from '@/models/Client'
import sicobService from '@/lib/sicob'

// Função para adicionar créditos ao cliente
async function addCreditsToClient(clientId: string, amount: number, appointmentId: string, description: string) {
  try {
    await Client.findByIdAndUpdate(clientId, {
      $inc: { credits: amount },
      $push: {
        creditHistory: {
          amount: amount,
          type: 'signal_payment',
          description: description,
          appointmentId: appointmentId,
          createdAt: new Date()
        }
      }
    })
    console.log(`✅ Créditos adicionados: R$ ${amount} para cliente ${clientId}`)
  } catch (error) {
    console.error('❌ Erro ao adicionar créditos:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { appointmentId, transactionId } = body

    if (!appointmentId || !transactionId) {
      return NextResponse.json(
        { error: 'appointmentId e transactionId são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar status no Sicob
    const statusResult = await sicobService.checkPaymentStatus(transactionId)

    if (!statusResult.success) {
      return NextResponse.json(
        { error: `Erro ao verificar status: ${statusResult.error}` },
        { status: 500 }
      )
    }

    // Se o pagamento foi confirmado, atualizar o agendamento e adicionar créditos
    if (statusResult.paid) {
      const appointment = await Appointment.findById(appointmentId)
      if (appointment) {
        await Appointment.findByIdAndUpdate(appointmentId, {
          signalPaid: true,
          signalPaidAt: statusResult.paidAt || new Date(),
          status: 'CONFIRMED' // Mudar para CONFIRMED após pagamento
        })

        // Adicionar créditos ao cliente
        if (appointment.signalValue && appointment.clientId) {
          await addCreditsToClient(
            appointment.clientId, 
            appointment.signalValue, 
            appointmentId, 
            'Sinal pago - Agendamento confirmado'
          )
        }
      }
    }

    return NextResponse.json({
      success: true,
      paid: statusResult.paid,
      paidAt: statusResult.paidAt,
      message: statusResult.paid ? 'Pagamento confirmado' : 'Pagamento pendente'
    })

  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET para verificar status de um agendamento específico
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'appointmentId é obrigatório' },
        { status: 400 }
      )
    }

    const appointment = await Appointment.findById(appointmentId)
    if (!appointment) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      signalPaid: appointment.signalPaid,
      signalPaidAt: appointment.signalPaidAt,
      signalValue: appointment.signalValue,
      status: appointment.status
    })

  } catch (error) {
    console.error('Erro ao buscar status do agendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
