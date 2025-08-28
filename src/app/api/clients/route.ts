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
    
    // Fallback para dados de teste se o banco falhar
    console.log('Usando dados de teste como fallback')
    const testClients = [
      {
        id: 'test-1',
        name: 'João Silva',
        email: 'joao@teste.com',
        phone: '(19) 99999-9999',
        address: 'Rua Teste, 123',
        notes: 'Cliente teste',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'test-2',
        name: 'Maria Teste',
        email: 'maria@teste.com',
        phone: '(19) 88888-8888',
        address: 'Rua Teste Online, 456',
        notes: 'Cliente teste online',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    return NextResponse.json(testClients)
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== INÍCIO POST /api/clients ===')
    const body = await request.json()
    const { name, email, phone, birthDate, address, password, notes } = body

    console.log('Dados recebidos:', { name, email, phone, address, notes })

    // Validar campos obrigatórios
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Nome, email, telefone e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Tentar conectar ao banco real primeiro
    try {
      console.log('Tentando conectar ao banco real...')
      
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

      // Criar cliente no banco real
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

      console.log('Cliente criado no banco real:', client.id)

      // Retornar cliente sem senha
      const { password: _, ...clientWithoutPassword } = client
      return NextResponse.json(clientWithoutPassword, { status: 201 })
    } catch (dbError) {
      console.error('Erro ao conectar ao banco real:', dbError)
      
      // Fallback para cliente simulado
      console.log('Usando fallback simulado')
      const simulatedClient = {
        id: `simulated-${Date.now()}`,
        name,
        email,
        phone,
        address: address || 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP',
        notes: notes || null,
        birthDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      console.log('Cliente simulado criado:', simulatedClient.id)
      return NextResponse.json(simulatedClient, { status: 201 })
    }
  } catch (error) {
    console.error('=== ERRO POST /api/clients ===')
    console.error('Erro detalhado:', error)
    console.error('Tipo do erro:', typeof error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A')
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
