import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import Client from '@/models/Client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, phone, password } = body

    // Validar campos obrigatórios
    if ((!email && !phone) || !password) {
      return NextResponse.json(
        { error: 'Email/telefone e senha são obrigatórios' },
        { status: 400 }
      )
    }

    await connectDB()
    
    // Buscar cliente por email OU telefone
    let client
    if (email) {
      client = await Client.findOne({ email })
    } else if (phone) {
      // Normalizar o telefone (remover caracteres especiais)
      const normalizedPhone = phone.replace(/\D/g, '')
      client = await Client.findOne({ 
        $or: [
          { phone: phone },
          { phone: normalizedPhone },
          { phone: { $regex: normalizedPhone.replace(/^55/, '') } } // Remove código do país se presente
        ]
      })
    }

    if (!client) {
      return NextResponse.json(
        { error: 'Email/telefone ou senha incorretos' },
        { status: 401 }
      )
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, client.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email/telefone ou senha incorretos' },
        { status: 401 }
      )
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        clientId: client.id, 
        email: client.email 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    // Retornar dados do cliente (sem senha) e token
    const { password: _, ...clientWithoutPassword } = client.toObject()
    
    return NextResponse.json({
      client: clientWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
