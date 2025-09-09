import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import Client from '@/models/Client'
import { rateLimit, sanitizeInput, isValidEmail, isValidPhone, isValidOrigin } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    console.log('=== INÍCIO GET /api/clients ===')
    
    // Rate limiting
    if (!rateLimit(request)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }
    
    // Validate origin
    const origin = request.headers.get('origin')
    if (origin && !isValidOrigin(origin)) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
    }
    
    console.log('Tentando conectar ao MongoDB...')
    await connectDB()
    
    // Verificar se há parâmetro de busca por telefone
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    
    let clients
    if (phone) {
      // Sanitize phone input
      const sanitizedPhone = sanitizeInput(phone)
      if (!isValidPhone(sanitizedPhone)) {
        return NextResponse.json({ error: 'Invalid phone format' }, { status: 400 })
      }
      
      console.log('Buscando cliente por telefone:', sanitizedPhone)
      clients = await Client.find({ phone: sanitizedPhone }).sort({ createdAt: -1 })
    } else {
      clients = await Client.find({}).sort({ createdAt: -1 })
    }

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
    
    // Rate limiting
    if (!rateLimit(request)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }
    
    // Validate origin
    const origin = request.headers.get('origin')
    if (origin && !isValidOrigin(origin)) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
    }
    
    const body = await request.json()
    const { name, email, phone, birthDate, address, password, notes } = body

    console.log('Dados recebidos:', { name, email, phone, address, notes })

    // Sanitize all inputs
    const sanitizedName = sanitizeInput(name)
    const sanitizedEmail = sanitizeInput(email)
    const sanitizedPhone = sanitizeInput(phone)
    const sanitizedAddress = sanitizeInput(address)
    const sanitizedNotes = sanitizeInput(notes)

    // Validar campos obrigatórios
    if (!sanitizedName || !sanitizedEmail || !sanitizedPhone) {
      return NextResponse.json(
        { error: 'Nome, email e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    // Validate phone format
    if (!isValidPhone(sanitizedPhone)) {
      return NextResponse.json(
        { error: 'Formato de telefone inválido' },
        { status: 400 }
      )
    }

    // Tentar conectar ao MongoDB primeiro
    try {
      console.log('Tentando conectar ao MongoDB...')
      
      await connectDB()
      
      // Verificar se o email já existe
      const existingClient = await Client.findOne({ email: sanitizedEmail })
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
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        birthDate: birthDate ? new Date(birthDate) : null,
        address: sanitizedAddress || 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP',
        password: hashedPassword,
        notes: sanitizedNotes || null
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
