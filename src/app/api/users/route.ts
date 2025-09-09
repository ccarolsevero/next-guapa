import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    await connectDB()
    
    const users = await User.find({}).select('-password')
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      username, 
      password, 
      role, 
      canAccessFinancial, 
      canAccessSiteEdit, 
      canAccessGoals, 
      canAccessReports 
    } = body

    if (!name || !username || !password) {
      return NextResponse.json(
        { error: 'Nome, username e senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    await connectDB()

    // Verificar se o username já existe
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username já existe' },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    const newUser = new User({
      name,
      username,
      password: hashedPassword,
      role: role || 'professional',
      canAccessFinancial: canAccessFinancial || false,
      canAccessSiteEdit: canAccessSiteEdit || false,
      canAccessGoals: canAccessGoals || false,
      canAccessReports: canAccessReports || false,
      isActive: true
    })

    await newUser.save()

    // Retornar sem a senha
    const userResponse = newUser.toObject()
    delete userResponse.password

    return NextResponse.json(userResponse, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
