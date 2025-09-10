import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import Client from '@/models/Client'
import sicobService, { calculateSignalValue } from '@/lib/sicob'

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
    const { appointmentId, services } = body

    if (!appointmentId || !services || !Array.isArray(services)) {
      return NextResponse.json(
        { error: 'Dados inválidos. appointmentId e services são obrigatórios.' },
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

    // Calcular valor total dos serviços
    const totalValue = services.reduce((sum: number, service: any) => {
      return sum + (service.price || 0)
    }, 0)

    if (totalValue <= 0) {
      return NextResponse.json(
        { error: 'Valor total dos serviços deve ser maior que zero' },
        { status: 400 }
      )
    }

    // Calcular 30% do valor total
    const signalValue = calculateSignalValue(totalValue)

    // Preparar dados para o Sicob
    const paymentRequest = {
      amount: signalValue,
      description: `Sinal de 30% - Agendamento ${appointment.clientName} - ${appointment.service}`,
      clientName: appointment.clientName,
      clientEmail: appointment.clientEmail || '',
      clientPhone: appointment.clientPhone,
      appointmentId: appointmentId,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
    }

    // Verificar se o Sicoob está configurado
    const isSicobConfigured = process.env.SICOOB_CLIENT_ID && process.env.SICOOB_CLIENT_SECRET

    if (isSicobConfigured) {
      // Criar link de pagamento no Sicob
      const paymentResult = await sicobService.createPaymentLink(paymentRequest)

      if (!paymentResult.success) {
        return NextResponse.json(
          { error: `Erro ao criar link de pagamento: ${paymentResult.error}` },
          { status: 500 }
        )
      }

      // Atualizar o agendamento com os dados do pagamento
      await Appointment.findByIdAndUpdate(appointmentId, {
        signalValue: signalValue,
        signalPaid: false,
        signalPaidAt: null,
        sicobTransactionId: paymentResult.transactionId,
        status: 'PENDING' // Mudar status para PENDING até o pagamento
      })

      return NextResponse.json({
        success: true,
        paymentLink: paymentResult.paymentLink,
        transactionId: paymentResult.transactionId,
        signalValue: signalValue,
        totalValue: totalValue,
        message: 'Link de pagamento criado com sucesso'
      })
    } else {
      // Modo desenvolvimento - simular pagamento
      console.log('⚠️ Sicoob não configurado - modo desenvolvimento ativo')
      
      // Atualizar o agendamento como confirmado (modo desenvolvimento)
      await Appointment.findByIdAndUpdate(appointmentId, {
        signalValue: signalValue,
        signalPaid: true, // Simular pagamento realizado
        signalPaidAt: new Date(),
        sicobTransactionId: `DEV_${Date.now()}`,
        status: 'CONFIRMED' // Confirmar diretamente
      })

      // Adicionar créditos ao cliente (modo desenvolvimento)
      await addCreditsToClient(appointment.clientId, signalValue, appointmentId, 'Sinal pago - Agendamento confirmado (modo desenvolvimento)')

      return NextResponse.json({
        success: true,
        paymentLink: null, // Sem link de pagamento
        transactionId: `DEV_${Date.now()}`,
        signalValue: signalValue,
        totalValue: totalValue,
        message: 'Agendamento confirmado (modo desenvolvimento - Sicoob não configurado)',
        developmentMode: true
      })
    }

  } catch (error) {
    console.error('Erro ao criar link de pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
