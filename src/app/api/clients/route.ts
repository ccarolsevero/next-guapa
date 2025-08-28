import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('=== INÍCIO GET /api/clients ===')
    console.log('Tentando conectar ao banco de dados...')
    
    const clients = await prisma.client.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('Clientes encontrados:', clients.length)
    return NextResponse.json(clients)
  } catch (error) {
    console.error('=== ERRO GET /api/clients ===')
    console.error('Erro detalhado:', error)
    console.error('Tipo do erro:', typeof error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A')
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor', 
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        type: typeof error
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, birthDate, address, password, notes } = body

    // Validar campos obrigatórios
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Nome, email, telefone e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o email já existe
    const existingClient = await prisma.client.findUnique({
      where: { email }
    })

    if (existingClient) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 }
      )
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar cliente
    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        birthDate: birthDate ? new Date(birthDate) : null,
        address: address || 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP',
        password: hashedPassword,
        notes: notes || null
      }
    })

    // Retornar cliente sem senha
    const { password: _, ...clientWithoutPassword } = client
    return NextResponse.json(clientWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
