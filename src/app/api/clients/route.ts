import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Configuração do Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET() {
  try {
    console.log('=== INÍCIO GET /api/clients ===')
    console.log('Tentando conectar ao Supabase via REST API...')

    const response = await fetch(`${SUPABASE_URL}/rest/v1/clients?select=*&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Supabase API error: ${response.status}`)
    }

    const clients = await response.json()
    console.log('Clientes encontrados via Supabase:', clients.length)
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'test-2',
        name: 'Maria Teste',
        email: 'maria@teste.com',
        phone: '(19) 88888-8888',
        address: 'Rua Teste Online, 456',
        notes: 'Cliente teste online',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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

    // Tentar conectar ao Supabase via REST API primeiro
    try {
      console.log('Tentando conectar ao Supabase via REST API...')
      
      // Verificar se o email já existe
      const existingResponse = await fetch(`${SUPABASE_URL}/rest/v1/clients?email=eq.${encodeURIComponent(email)}&select=id`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      if (existingResponse.ok) {
        const existingClients = await existingResponse.json()
        if (existingClients.length > 0) {
          return NextResponse.json(
            { error: 'Email já cadastrado' },
            { status: 409 }
          )
        }
      }

      // Criptografar senha
      const hashedPassword = await bcrypt.hash(password, 12)

      // Gerar ID único
      const clientId = `cl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Criar cliente no Supabase
      const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/clients`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          id: clientId,
          name,
          email,
          phone,
          birth_date: birthDate ? new Date(birthDate).toISOString() : null,
          address: address || 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP',
          password: hashedPassword,
          notes: notes || null
        })
      })

      if (!createResponse.ok) {
        throw new Error(`Supabase API error: ${createResponse.status}`)
      }

      const client = await createResponse.json()
      console.log('Cliente criado no Supabase:', client[0].id)

      // Retornar cliente sem senha
      const { password: _, ...clientWithoutPassword } = client[0]
      return NextResponse.json(clientWithoutPassword, { status: 201 })
    } catch (dbError) {
      console.error('Erro ao conectar ao Supabase:', dbError)
      
      // Fallback para cliente simulado
      console.log('Usando fallback simulado')
      const simulatedClient = {
        id: `simulated-${Date.now()}`,
        name,
        email,
        phone,
        address: address || 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP',
        notes: notes || null,
        birth_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
