import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import Client from '@/models/Client'

export async function POST(request: NextRequest) {
  try {
    console.log('=== INÍCIO POST /api/clients/complete-onboarding ===')
    
    const body = await request.json()
    const { 
      clientId, 
      name, 
      email, 
      phone, 
      birthDate, 
      address, 
      newPassword 
    } = body

    console.log('Dados recebidos:', { 
      clientId, 
      name, 
      email, 
      phone, 
      birthDate,
      address,
      hasNewPassword: !!newPassword
    })

    // Validar campos obrigatórios
    if (!clientId || !name || !email || !phone) {
      return NextResponse.json(
        { error: 'ID do cliente, nome, email e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    // Validar senha se fornecida
    if (newPassword && newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    await connectDB()
    
    // Buscar o cliente atual
    const currentClient = await Client.findById(clientId)
    
    if (!currentClient) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    console.log('Cliente encontrado:', currentClient.name)

    // Verificar se o email já existe em outro cliente
    if (email !== currentClient.email) {
      const existingClient = await Client.findOne({ email })
      
      if (existingClient) {
        return NextResponse.json(
          { error: 'Este email já está em uso por outro cliente' },
          { status: 409 }
        )
      }
    }

    // Preparar dados para atualização
    const updateData: any = {
      name,
      email,
      phone,
      birthDate: birthDate ? new Date(birthDate) : null,
      address: address || 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP',
      onboardingCompleted: true,
      onboardingCompletedAt: new Date(),
      isCompleteProfile: true,
      profileComplete: true,
      firstAccess: false,
      onboardingRequired: false
    }

    console.log('Dados para atualização:', {
      ...updateData,
      birthDate: updateData.birthDate ? updateData.birthDate.toISOString() : null
    })

    // Se uma nova senha foi fornecida, criptografá-la
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      updateData.password = hashedPassword
    }

    // Atualizar cliente
    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      updateData,
      { new: true }
    )

    console.log('Onboarding completado para:', updatedClient.name)

    // Retornar cliente sem senha
    const { password: _, ...clientWithoutPassword } = updatedClient.toObject()
    
    return NextResponse.json({
      message: 'Onboarding completado com sucesso',
      client: clientWithoutPassword
    })

  } catch (error) {
    console.error('=== ERRO POST /api/clients/complete-onboarding ===')
    console.error('Erro detalhado:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
