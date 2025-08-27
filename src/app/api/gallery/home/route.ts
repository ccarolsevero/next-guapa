import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Buscar todas as fotos da galeria da home
export async function GET() {
  try {
    const gallery = await prisma.homeGallery.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(gallery)
  } catch (error) {
    console.error('Erro ao buscar galeria da home:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Adicionar nova foto à galeria
export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL da imagem é obrigatória' },
        { status: 400 }
      )
    }

    // Pegar a maior ordem atual para adicionar no final
    const maxOrder = await prisma.homeGallery.aggregate({
      _max: { order: true }
    })

    const newOrder = (maxOrder._max.order || 0) + 1

    const newPhoto = await prisma.homeGallery.create({
      data: {
        imageUrl,
        order: newOrder
      }
    })

    return NextResponse.json(newPhoto, { status: 201 })
  } catch (error) {
    console.error('Erro ao adicionar foto à galeria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar ordem das fotos
export async function PUT(request: NextRequest) {
  try {
    const { photos } = await request.json()

    if (!Array.isArray(photos)) {
      return NextResponse.json(
        { error: 'Lista de fotos é obrigatória' },
        { status: 400 }
      )
    }

    // Atualizar a ordem de todas as fotos
    const updatePromises = photos.map((photo: any, index: number) =>
      prisma.homeGallery.update({
        where: { id: photo.id },
        data: { order: index + 1 }
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({ message: 'Ordem atualizada com sucesso' })
  } catch (error) {
    console.error('Erro ao atualizar ordem da galeria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
