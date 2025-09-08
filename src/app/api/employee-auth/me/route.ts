import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Professional from '@/models/Professional'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    
    // Buscar dados do profissional
    const professional = await Professional.findById(decoded.id)
    
    if (!professional || !professional.isActive) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado ou inativo' },
        { status: 404 }
      )
    }
    
    // Retornar dados do profissional (sem senha)
    const { password, ...professionalData } = professional.toObject()
    
    return NextResponse.json({
      professional: professionalData
    })
    
  } catch (error) {
    console.error('Erro ao verificar token:', error)
    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 401 }
    )
  }
}
