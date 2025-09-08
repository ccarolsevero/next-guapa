import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Professional from '@/models/Professional'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const { username, password } = await request.json()
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username e senha são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Buscar profissional pelo username
    const professional = await Professional.findOne({ 
      username: username.toLowerCase(),
      isActive: true 
    }).select('+password')
    
    if (!professional) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }
    
    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, professional.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }
    
    // Atualizar último login
    await Professional.findByIdAndUpdate(professional._id, {
      lastLogin: new Date()
    })
    
    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: professional._id,
        username: professional.username,
        role: professional.role,
        name: professional.name
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    )
    
    // Retornar dados do profissional (sem senha)
    const { password: _, ...professionalData } = professional.toObject()
    
    return NextResponse.json({
      message: 'Login realizado com sucesso',
      token,
      professional: professionalData
    })
    
  } catch (error) {
    console.error('Erro no login do funcionário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
