import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET() {
  try {
    console.log('Buscando fotos da home do banco de dados...')
    
    const photos = await DatabaseService.getHomePhotos()
    console.log('Fotos encontradas no banco:', photos.length)
    
    return NextResponse.json(photos)
  } catch (error) {
    console.error('Erro ao buscar fotos da home:', error)
    
    // Fallback para dados de teste se o banco falhar
    const testPhotos = [
      {
        id: '1',
        imageUrl: '/assents/fotoslidehome/WhatsApp Image 2025-08-26 at 20.47.05.jpeg',
        order: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        imageUrl: '/assents/fotoslidehome/WhatsApp Image 2025-08-26 at 20.47.05 (1).jpeg',
        order: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
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
    console.log('Adicionando nova foto no banco de dados...')
    
    const newPhoto = await DatabaseService.addHomePhoto(imageUrl)
    console.log('Foto adicionada com sucesso:', newPhoto.id)
    
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
    console.log('Atualizando ordem das fotos no banco de dados...')
    
    await DatabaseService.updateHomePhotoOrder(photos)
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
    
    console.log('Deletando foto do banco de dados:', id)
    
    await DatabaseService.deleteHomePhoto(id)
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
