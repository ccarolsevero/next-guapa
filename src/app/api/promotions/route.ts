import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Promotion from '@/models/Promotion'

export async function GET() {
  try {
    await connectToDatabase()
    
    const promotions = await Promotion.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean()
    
    return NextResponse.json(promotions)
  } catch (error) {
    console.error('Erro ao buscar promoções:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    const { title, description, imageUrl, order } = body
    
    if (!title || !description || !imageUrl) {
      return NextResponse.json(
        { error: 'Título, descrição e URL da imagem são obrigatórios' },
        { status: 400 }
      )
    }
    
    const promotion = new Promotion({
      title,
      description,
      imageUrl,
      order: order || 0,
      isActive: true
    })
    
    await promotion.save()
    
    return NextResponse.json(promotion, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar promoção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    const { promotions } = body
    
    if (!Array.isArray(promotions)) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      )
    }
    
    // Atualizar ordem das promoções
    for (const promo of promotions) {
      await Promotion.findByIdAndUpdate(promo.id, { order: promo.order })
    }
    
    return NextResponse.json({ message: 'Ordem atualizada com sucesso' })
  } catch (error) {
    console.error('Erro ao atualizar ordem das promoções:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
