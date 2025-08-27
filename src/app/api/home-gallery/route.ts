import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('Tentando buscar fotos da home do banco...')
    
    const photos = await prisma.homeGallery.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        order: 'asc'
      },
      select: {
        id: true,
        imageUrl: true,
        order: true
      }
    })

    console.log('Fotos encontradas no banco:', photos)
    return NextResponse.json(photos)
  } catch (error) {
    console.error('Erro ao buscar fotos da home:', error)
    
    // Fallback para dados de teste se o banco falhar
    const testPhotos = [
      {
        id: '1',
        imageUrl: '/assents/fotoslidehome/WhatsApp Image 2025-08-26 at 20.47.05.jpeg',
        order: 1
      },
      {
        id: '2',
        imageUrl: '/assents/fotoslidehome/WhatsApp Image 2025-08-26 at 20.47.05 (1).jpeg',
        order: 2
      },
      {
        id: '3',
        imageUrl: '/assents/fotoslidehome/WhatsApp Image 2025-08-26 at 20.47.05 (2).jpeg',
        order: 3
      },
      {
        id: '4',
        imageUrl: '/assents/fotoslidehome/WhatsApp Image 2025-08-26 at 20.47.05 (3).jpeg',
        order: 4
      }
    ]

    console.log('Retornando fotos de teste como fallback')
    return NextResponse.json(testPhotos)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()
    
    console.log('Tentando adicionar foto no banco:', imageUrl)

    // Encontrar a maior ordem atual
    const maxOrder = await prisma.homeGallery.aggregate({
      where: { isActive: true },
      _max: { order: true }
    })

    const newOrder = (maxOrder._max.order || 0) + 1

    const photo = await prisma.homeGallery.create({
      data: {
        imageUrl,
        order: newOrder,
        isActive: true
      }
    })

    console.log('Foto adicionada no banco com sucesso:', photo)
    return NextResponse.json(photo)
  } catch (error) {
    console.error('Erro ao adicionar foto no banco:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { photos } = await request.json()
    
    console.log('Tentando atualizar ordem das fotos no banco:', photos)

    // Atualizar a ordem de todas as fotos
    const updatePromises = photos.map((photo: { id: string; imageUrl: string; order: number }, index: number) =>
      prisma.homeGallery.update({
        where: { id: photo.id },
        data: { order: index + 1 }
      })
    )

    await Promise.all(updatePromises)

    console.log('Ordem das fotos atualizada no banco com sucesso')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar ordem no banco:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID da foto é obrigatório' },
        { status: 400 }
      )
    }

    console.log('Tentando deletar foto do banco:', id)

    // Deletar a foto do banco
    await prisma.homeGallery.delete({
      where: { id }
    })

    console.log('Foto deletada do banco com sucesso')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar foto do banco:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}
