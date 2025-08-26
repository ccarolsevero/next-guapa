import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        appointments: {
          include: {
            service: true,
            professional: true
          },
          orderBy: {
            date: 'desc'
          }
        },
        payments: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Remover senha do retorno
    const { password: _, ...clientWithoutPassword } = client
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
    const body = await request.json()
    const { name, email, phone, birthDate, address, notes } = body

    // Verificar se o cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id: params.id }
    })

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o email já existe em outro cliente
    if (email && email !== existingClient.email) {
      const clientWithEmail = await prisma.client.findUnique({
        where: { email }
      })

      if (clientWithEmail) {
        return NextResponse.json(
          { error: 'Email já está em uso por outro cliente' },
          { status: 409 }
        )
      }
    }

    // Atualizar cliente
    const updatedClient = await prisma.client.update({
      where: { id: params.id },
      data: {
        name,
        email,
        phone,
        birthDate: birthDate ? new Date(birthDate) : null,
        address,
        notes
      }
    })

    // Retornar cliente sem senha
    const { password: _, ...clientWithoutPassword } = updatedClient
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
    // Verificar se o cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id: params.id }
    })

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Deletar cliente (cascade irá deletar appointments e payments relacionados)
    await prisma.client.delete({
      where: { id: params.id }
    })

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
