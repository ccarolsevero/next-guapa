import { NextRequest, NextResponse } from 'next/server'
import { localDB } from '@/lib/localStorage'

export async function GET() {
  try {
    console.log('Tentando buscar fotos da home do localStorage...')
    
    const photos = await localDB.getHomePhotos()
    const activePhotos = photos.filter(photo => photo.isActive).sort((a, b) => a.order - b.order)
    
    console.log('Fotos encontradas no localStorage:', activePhotos)
    return NextResponse.json(activePhotos)
  } catch (error) {
    console.error('Erro ao buscar fotos da home:', error)
    
    // Fallback para dados de teste se o localStorage falhar
    const testPhotos = [
      {
        id: '1',
        imageUrl: '/assents/fotoslidehome/WhatsApp Image 2025-08-26 at 20.47.05.jpeg',
        order: 1,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        imageUrl: '/assents/fotoslidehome/WhatsApp Image 2025-08-26 at 20.47.05 (1).jpeg',
        order: 2,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        imageUrl: '/assents/fotoslidehome/WhatsApp Image 2025-08-26 at 20.47.05 (2).jpeg',
        order: 3,
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ]
    
    console.log('Usando dados de teste como fallback')
    return NextResponse.json(testPhotos)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()
    console.log('Tentando adicionar foto no localStorage:', imageUrl)
    
    const newPhoto = await localDB.addHomePhoto(imageUrl)
    
    console.log('Foto adicionada com sucesso no localStorage:', newPhoto)
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
    console.log('Tentando atualizar ordem das fotos no localStorage')
    
    await localDB.updateHomePhotoOrder(photos)
    
    console.log('Ordem das fotos atualizada com sucesso no localStorage')
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
    
    console.log('Tentando deletar foto do localStorage:', id)
    
    await localDB.deleteHomePhoto(id)
    
    console.log('Foto deletada com sucesso do localStorage')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar foto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}
