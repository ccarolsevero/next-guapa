import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testando API home-gallery...')
    
    // Por enquanto, vamos retornar dados de teste
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

    console.log('Retornando fotos de teste:', testPhotos)
    return NextResponse.json(testPhotos)
  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()
    
    // Por enquanto, apenas retornar sucesso
    return NextResponse.json({ success: true, imageUrl })
  } catch (error) {
    console.error('Erro ao adicionar foto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { photos } = await request.json()
    
    // Por enquanto, apenas retornar sucesso
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar ordem:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
