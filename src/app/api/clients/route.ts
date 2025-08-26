import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, birthDate, address, password } = body

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
        password: hashedPassword
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
