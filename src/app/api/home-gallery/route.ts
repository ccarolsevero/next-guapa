import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import HomeGallery from '@/models/HomeGallery'

export async function GET() {
  try {
    console.log('Buscando fotos da home do MongoDB...')
    
    await connectDB()
    const photos = await HomeGallery.find({ isActive: true }).sort({ order: 1 })
    console.log('Fotos encontradas no MongoDB:', photos.length)
    
    return NextResponse.json(photos)
  } catch (error) {
    console.error('Erro ao buscar fotos da home:', error)
    
    // Fallback para dados de teste se o banco falhar
    const testPhotos = [
      {
        _id: '1',
        imageUrl: '/assents/fotoslidehome/WhatsApp Image 2025-08-26 at 20.47.05.jpeg',
        order: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        imageUrl: '/assents/fotoslidehome/WhatsApp Image 2025-08-26 at 20.47.05 (1).jpeg',
        order: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '3',
        imageUrl: '/assents/fotoslidehome/WhatsApp Image 2025-08-26 at 20.47.05 (2).jpeg',
        order: 3,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    console.log('Usando dados de teste como fallback')
    return NextResponse.json(testPhotos)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()
    console.log('Adicionando nova foto no MongoDB...')
    
    await connectDB()
    
    // Pegar a maior ordem atual
    const maxOrderPhoto = await HomeGallery.findOne().sort({ order: -1 })
    const newOrder = (maxOrderPhoto?.order || 0) + 1
    
    const newPhoto = await HomeGallery.create({
      imageUrl,
      order: newOrder,
      isActive: true
    })
    
    console.log('Foto adicionada com sucesso:', newPhoto._id)
    
    return NextResponse.json(newPhoto)
  } catch (error) {
    console.error('Erro ao adicionar foto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const photos = await request.json()
    console.log('Atualizando ordem das fotos no MongoDB...')
    
    await connectDB()
    
    for (const photo of photos) {
      await HomeGallery.findByIdAndUpdate(photo.id, { order: photo.order })
    }
    
    console.log('Ordem das fotos atualizada com sucesso')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar ordem das fotos:', error)
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
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 })
    }
    
    console.log('Deletando foto do MongoDB:', id)
    
    await connectDB()
    await HomeGallery.findByIdAndDelete(id)
    console.log('Foto deletada com sucesso')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar foto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}
export const dynamic = 'force-dynamic'
