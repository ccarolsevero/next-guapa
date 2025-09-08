import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Promotion from '@/models/Promotion'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const promotion = await Promotion.findById(params.id).lean()
    
    if (!promotion) {
      return NextResponse.json(
        { error: 'Promoção não encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(promotion)
  } catch (error) {
    console.error('Erro ao buscar promoção:', error)
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
    await connectToDatabase()
    
    const body = await request.json()
    const { title, description, imageUrl, isActive, order } = body
    
    const promotion = await Promotion.findByIdAndUpdate(
      params.id,
      {
        title,
        description,
        imageUrl,
        isActive,
        order
      },
      { new: true, runValidators: true }
    )
    
    if (!promotion) {
      return NextResponse.json(
        { error: 'Promoção não encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(promotion)
  } catch (error) {
    console.error('Erro ao atualizar promoção:', error)
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
    await connectToDatabase()
    
    const promotion = await Promotion.findByIdAndDelete(params.id)
    
    if (!promotion) {
      return NextResponse.json(
        { error: 'Promoção não encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Promoção excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir promoção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
