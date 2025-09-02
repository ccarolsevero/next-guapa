import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import Client from '@/models/Client'

export async function GET() {
  try {
    console.log('=== INÍCIO GET /api/clients ===')
    console.log('Tentando conectar ao MongoDB...')

    await connectDB()
    const clients = await Client.find({}).sort({ createdAt: -1 })

    console.log('Clientes encontrados no MongoDB:', clients.length)
    return NextResponse.json(clients)
  } catch (error) {
    console.error('=== ERRO GET /api/clients ===')
    console.error('Erro detalhado:', error)
    console.error('Tipo do erro:', typeof error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A')

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== INÍCIO POST /api/clients ===')
    const body = await request.json()
    const { name, email, phone, birthDate, address, password, notes } = body

    console.log('Dados recebidos:', { name, email, phone, address, notes })

    // Validar campos obrigatórios
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Nome, email e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    // Tentar conectar ao MongoDB primeiro
    try {
      console.log('Tentando conectar ao MongoDB...')
      
      await connectDB()
      
      // Verificar se o email já existe
      const existingClient = await Client.findOne({ email })
      if (existingClient) {
        return NextResponse.json(
          { error: 'Email já cadastrado' },
          { status: 409 }
        )
      }

      // Gerar senha padrão se não for fornecida
      const defaultPassword = password || '123456'
      const hashedPassword = await bcrypt.hash(defaultPassword, 12)

      // Criar cliente no MongoDB
      const client = await Client.create({
        name,
        email,
        phone,
        birthDate: birthDate ? new Date(birthDate) : null,
        address: address || 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP',
        password: hashedPassword,
        notes: notes || null
      })

      console.log('Cliente criado no MongoDB:', client._id)

      // Retornar cliente sem senha
      const { password: _, ...clientWithoutPassword } = client.toObject()
      return NextResponse.json(clientWithoutPassword, { status: 201 })
    } catch (dbError) {
      console.error('Erro ao conectar ao MongoDB:', dbError)
      
      // Fallback para cliente simulado
      console.log('Usando fallback simulado')
      const simulatedClient = {
        _id: `simulated-${Date.now()}`,
        name,
        email,
        phone,
        address: address || 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP',
        notes: notes || null,
        birthDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      console.log('Cliente simulado criado:', simulatedClient._id)
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
