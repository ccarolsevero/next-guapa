import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import Client from '@/models/Client'

export async function POST(request: NextRequest) {
  try {
    console.log('=== INÍCIO POST /api/clients/change-password ===')
    
    const body = await request.json()
    const { currentPassword, newPassword, clientId } = body

    console.log('Dados recebidos:', { currentPassword: '***', newPassword: '***', clientId })

    // Validar campos obrigatórios
    if (!currentPassword || !newPassword || !clientId) {
      return NextResponse.json(
        { error: 'Senha atual, nova senha e ID do cliente são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar tamanho da nova senha
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A nova senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Tentar conectar ao MongoDB
    try {
      console.log('Tentando conectar ao MongoDB...')
      
      await connectDB()
      
      // Buscar o cliente pelo ID
      const client = await Client.findById(clientId)
      
      if (!client) {
        return NextResponse.json(
          { error: 'Cliente não encontrado' },
          { status: 404 }
        )
      }

      console.log('Cliente encontrado:', client.name)

      // Verificar se a senha atual está correta
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, client.password)
      
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Senha atual incorreta' },
          { status: 401 }
        )
      }

      // Criptografar a nova senha
      const hashedNewPassword = await bcrypt.hash(newPassword, 12)

      // Atualizar a senha no banco
      await Client.findByIdAndUpdate(clientId, {
        password: hashedNewPassword,
        updatedAt: new Date()
      })

      console.log('Senha alterada com sucesso para o cliente:', clientId)

      return NextResponse.json({
        message: 'Senha alterada com sucesso'
      })

    } catch (dbError) {
      console.error('Erro no banco de dados:', dbError)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('=== ERRO POST /api/clients/change-password ===')
    console.error('Erro detalhado:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
