import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import Client from '@/models/Client'
import CreditTransaction from '@/models/CreditTransaction'
import sicobService from '@/lib/sicob'

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

    // Buscar o agendamento
    const appointment = await Appointment.findById(appointmentId)
    if (!appointment) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o pagamento já foi processado
    if (appointment.signalPaid) {
      return NextResponse.json({
        success: true,
        message: 'Pagamento já foi processado',
        appointment: appointment
      })
    }

    // Verificar status do pagamento no Sicob
    const paymentStatus = await sicobService.checkPaymentStatus(transactionId)

    if (!paymentStatus.success) {
      return NextResponse.json(
        { error: `Erro ao verificar status do pagamento: ${paymentStatus.error}` },
        { status: 500 }
      )
    }

    if (paymentStatus.status === 'paid' || paymentStatus.status === 'approved') {
      // Pagamento confirmado - adicionar créditos ao cliente
      
      // Buscar ou criar cliente
      let client = null
      if (appointment.clientId) {
        client = await Client.findById(appointment.clientId)
      } else {
        // Se não há clientId, buscar por telefone ou email
        client = await Client.findOne({
          $or: [
            { phone: appointment.clientPhone },
            { email: appointment.clientEmail }
          ]
        })
      }

      if (client) {
        // Adicionar crédito ao cliente
        const currentCredits = client.credits || 0
        const newCredits = currentCredits + (appointment.signalValue || 0)

        await Client.findByIdAndUpdate(client._id, { credits: newCredits })

        // Criar transação de crédito
        const creditTransaction = new CreditTransaction({
          clientId: client._id,
          appointmentId: appointment._id,
          type: 'credit',
          amount: appointment.signalValue || 0,
          description: `Crédito por sinal pago - Agendamento ${appointment.service}`,
          status: 'completed',
          paymentMethod: 'Sicob',
          transactionId: transactionId
        })

        await creditTransaction.save()
      }

      // Atualizar o agendamento
      await Appointment.findByIdAndUpdate(appointmentId, {
        signalPaid: true,
        signalPaidAt: new Date(),
        status: 'CONFIRMED'
      })

      return NextResponse.json({
        success: true,
        message: 'Pagamento confirmado e créditos adicionados',
        appointment: {
          ...appointment.toObject(),
          signalPaid: true,
          signalPaidAt: new Date(),
          status: 'CONFIRMED'
        },
        creditsAdded: appointment.signalValue || 0,
        clientCredits: client ? (client.credits || 0) + (appointment.signalValue || 0) : 0
      })
    } else {
      // Pagamento ainda não foi processado
      return NextResponse.json({
        success: false,
        message: 'Pagamento ainda não foi processado',
        status: paymentStatus.status
      })
    }

  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
