import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import Client from '@/models/Client'

export async function POST(request: NextRequest) {
  try {
    console.log('=== INÍCIO POST /api/clients/change-password ===')
    
    const body = await request.json()
    const { currentPassword, newPassword } = body

    console.log('Dados recebidos:', { currentPassword: '***', newPassword: '***' })

    // Validar campos obrigatórios
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Senha atual e nova senha são obrigatórias' },
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
      
      // Buscar o cliente pelo email (assumindo que temos o email do cliente logado)
      // Por enquanto, vamos buscar o primeiro cliente como exemplo
      // Em produção, você deve usar o token JWT para identificar o cliente
      const client = await Client.findOne({})
      
      if (!client) {
        return NextResponse.json(
          { error: 'Cliente não encontrado' },
          { status: 404 }
        )
      }

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
      await Client.findByIdAndUpdate(client._id, {
        password: hashedNewPassword
      })

      console.log('Senha alterada com sucesso para o cliente:', client._id)

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
