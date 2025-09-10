import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Service from '@/models/Service'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    console.log('Buscando serviço específico:', id)
    
    await connectDB()
    const service = await Service.findById(id)
    
    if (!service) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(service)
  } catch (error) {
    console.error('Erro ao buscar serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    console.log('Atualizando serviço:', id)
    
    await connectDB()
    
    const updatedService = await Service.findByIdAndUpdate(
      id,
      body,
      { new: true }
    )
    
    if (!updatedService) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedService)
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    console.log('Deletando serviço:', id)
    console.log('Tipo do ID:', typeof id)
    console.log('ID válido:', mongoose.Types.ObjectId.isValid(id))
    
    // Validar se o ID é um ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }
    
    console.log('Conectando ao banco de dados...')
    await connectDB()
    console.log('Conectado ao banco de dados com sucesso')
    
    // Verificar se o serviço existe antes de deletar
    console.log('Buscando serviço no banco...')
    const existingService = await Service.findById(id)
    console.log('Serviço encontrado:', existingService ? 'Sim' : 'Não')
    if (existingService) {
      console.log('Detalhes do serviço:', {
        id: existingService._id,
        name: existingService.name,
        category: existingService.category
      })
    }
    
    if (!existingService) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }
    
    const deletedService = await Service.findByIdAndDelete(id)
    console.log('Serviço deletado:', deletedService ? 'Sim' : 'Não')
    
    if (!deletedService) {
      return NextResponse.json(
        { error: 'Erro ao deletar serviço' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ message: 'Serviço deletado com sucesso' })
  } catch (err: unknown) {
    console.error('Erro ao deletar serviço:', err)
    if (err instanceof Error) {
      console.error('Stack trace:', err.stack)
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
export const dynamic = 'force-dynamic'
