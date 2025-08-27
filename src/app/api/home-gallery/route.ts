import { NextRequest, NextResponse } from 'next/server'

// Função para fazer requisições à API REST do Supabase
async function supabaseRequest(endpoint: string, options: RequestInit = {}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Variáveis do Supabase não configuradas')
  }

  const url = `${supabaseUrl}/rest/v1/${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Erro na API do Supabase: ${response.status} - ${error}`)
  }

  return response.json()
}

export async function GET() {
  try {
    console.log('Tentando buscar fotos da home via API REST do Supabase...')
    
    const photos = await supabaseRequest('home_gallery?select=id,imageUrl,order&isActive=eq.true&order=order.asc')
    
    console.log('Fotos encontradas via API REST:', photos)
    return NextResponse.json(photos)
  } catch (error) {
    console.error('Erro ao buscar fotos da home:', error)
    
    // Fallback para dados de teste se a API falhar
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
      }
    ]
    
    console.log('Usando dados de teste como fallback')
    return NextResponse.json(testPhotos)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()
    console.log('Tentando adicionar foto via API REST do Supabase:', imageUrl)
    
    // Buscar o maior order atual
    const existingPhotos = await supabaseRequest('home_gallery?select=order&order=order.desc&limit=1')
    const nextOrder = existingPhotos.length > 0 ? existingPhotos[0].order + 1 : 1
    
    // Inserir nova foto
    const newPhoto = await supabaseRequest('home_gallery', {
      method: 'POST',
      body: JSON.stringify({
        imageUrl,
        order: nextOrder,
        isActive: true
      })
    })
    
    console.log('Foto adicionada com sucesso via API REST:', newPhoto)
    return NextResponse.json(newPhoto[0])
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
    console.log('Tentando atualizar ordem das fotos via API REST do Supabase')
    
    // Atualizar cada foto com sua nova ordem
    for (const photo of photos) {
      await supabaseRequest(`home_gallery?id=eq.${photo.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ order: photo.order })
      })
    }
    
    console.log('Ordem das fotos atualizada com sucesso via API REST')
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
    
    console.log('Tentando deletar foto via API REST do Supabase:', id)
    
    // Deletar a foto (soft delete - marcar como inativa)
    await supabaseRequest(`home_gallery?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: false })
    })
    
    console.log('Foto deletada com sucesso via API REST')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar foto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}
