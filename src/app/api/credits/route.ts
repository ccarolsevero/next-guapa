import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Client from '@/models/Client'
import CreditTransaction from '@/models/CreditTransaction'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    
    await connectDB()
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'ID do cliente é obrigatório' },
        { status: 400 }
      )
    }
    
    if (!ObjectId.isValid(clientId)) {
      return NextResponse.json(
        { error: 'ID do cliente inválido' },
        { status: 400 }
      )
    }
    
    // Buscar cliente e suas transações de crédito
    const client = await Client.findById(clientId)
    if (!client) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }
    
    const transactions = await CreditTransaction.find({ clientId })
      .sort({ createdAt: -1 })
      .limit(50)
    
    return NextResponse.json({
      client: {
        _id: client._id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        credits: client.credits || 0
      },
      transactions
    })
  } catch (error) {
    console.error('Erro ao buscar créditos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, appointmentId, type, amount, description, paymentMethod, transactionId } = body
    
    await connectDB()
    
    // Validações
    if (!clientId || !type || !amount || !description) {
      return NextResponse.json(
        { error: 'Dados obrigatórios: clientId, type, amount, description' },
        { status: 400 }
      )
    }
    
    if (!ObjectId.isValid(clientId)) {
      return NextResponse.json(
        { error: 'ID do cliente inválido' },
        { status: 400 }
      )
    }
    
    if (appointmentId && !ObjectId.isValid(appointmentId)) {
      return NextResponse.json(
        { error: 'ID do agendamento inválido' },
        { status: 400 }
      )
    }
    
    if (!['credit', 'debit', 'refund'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de transação inválido' },
        { status: 400 }
      )
    }
    
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Valor deve ser maior que zero' },
        { status: 400 }
      )
    }
    
    // Buscar cliente
    const client = await Client.findById(clientId)
    if (!client) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }
    
    // Verificar se há créditos suficientes para débito
    if (type === 'debit' && (client.credits || 0) < amount) {
      return NextResponse.json(
        { error: 'Créditos insuficientes' },
        { status: 400 }
      )
    }
    
    // Criar transação
    const transaction = new CreditTransaction({
      clientId,
      appointmentId,
      type,
      amount,
      description,
      paymentMethod,
      transactionId,
      status: 'completed'
    })
    
    await transaction.save()
    
    // Atualizar créditos do cliente
    const currentCredits = client.credits || 0
    let newCredits = currentCredits
    
    if (type === 'credit' || type === 'refund') {
      newCredits = currentCredits + amount
    } else if (type === 'debit') {
      newCredits = currentCredits - amount
    }
    
    await Client.findByIdAndUpdate(clientId, { credits: newCredits })
    
    return NextResponse.json({
      message: 'Transação realizada com sucesso',
      transaction,
      newCredits
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao processar transação de crédito:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
