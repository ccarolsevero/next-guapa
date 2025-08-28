import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Client from '@/models/Client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const client = await Client.findById(params.id)

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Remover senha do retorno
    const { password: _, ...clientWithoutPassword } = client.toObject()
    return NextResponse.json(clientWithoutPassword)
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
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
