import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Client from '@/models/Client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 === API CLIENTES [ID] - GET ===')
    console.log('🔍 Buscando cliente ID:', params.id)
    
    // Conectar ao MongoDB diretamente
    const { MongoClient } = await import('mongodb')
    const uri = process.env.MONGODB_URI!
    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db(process.env.DB_NAME || 'guapa')
    
    console.log('✅ Conectado ao MongoDB')
    
    // Buscar cliente por ID
    const clientData = await db.collection('clients').findOne({
      _id: new (await import('mongodb')).ObjectId(params.id)
    })
    
    console.log('🔍 Cliente encontrado:', clientData ? 'SIM' : 'NÃO')
    
    if (!clientData) {
      await client.close()
      console.log('❌ Cliente não encontrado')
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Buscar comandas do cliente
    const comandas = await db.collection('comandas').find({
      clientId: new (await import('mongodb')).ObjectId(params.id)
    }).toArray()
    
    console.log('📊 Comandas encontradas:', comandas.length)
    
    // Buscar finalizações do cliente
    const finalizacoes = await db.collection('finalizacoes').find({
      clienteId: params.id
    }).toArray()
    
    console.log('📊 Finalizações encontradas:', finalizacoes.length)
    
    // Formatar dados do cliente
    const clienteFormatado = {
      _id: clientData._id,
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      birthDate: clientData.birthDate,
      address: clientData.address,
      notes: clientData.notes,
      totalGasto: clientData.totalGasto || 0,
      quantidadeVisitas: clientData.quantidadeVisitas || 0,
      historico: clientData.historico || [],
      comandas: comandas.length,
      finalizacoes: finalizacoes.length
    }
    
    await client.close()
    console.log('✅ Cliente retornado com sucesso')
    
    return NextResponse.json(clienteFormatado)
  } catch (error) {
    console.error('❌ Erro ao buscar cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { name, email, phone, birthDate, address, notes } = body

    // Verificar se o cliente existe
    const existingClient = await Client.findById(params.id)

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o email já existe em outro cliente
    if (email && email !== existingClient.email) {
      const clientWithEmail = await Client.findOne({ email })

      if (clientWithEmail) {
        return NextResponse.json(
          { error: 'Email já está em uso por outro cliente' },
          { status: 409 }
        )
      }
    }

    // Atualizar cliente
    const updatedClient = await Client.findByIdAndUpdate(
      params.id,
      {
        name,
        email,
        phone,
        birthDate: birthDate ? new Date(birthDate) : null,
        address,
        notes
      },
      { new: true }
    )

    // Retornar cliente sem senha
    const { password: _, ...clientWithoutPassword } = updatedClient.toObject()
    return NextResponse.json(clientWithoutPassword)
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    // Verificar se o cliente existe
    const existingClient = await Client.findById(params.id)

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Deletar cliente
    await Client.findByIdAndDelete(params.id)

    return NextResponse.json(
      { message: 'Cliente deletado com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao deletar cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
