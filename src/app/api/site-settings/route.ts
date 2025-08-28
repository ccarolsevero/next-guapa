import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

// Modelo simples para configurações do site
interface SiteSettings {
  siteName: string
  description: string
  address: string
  whatsapp: string
  email: string
  updatedAt: string
}

export async function GET() {
  try {
    console.log('Buscando configurações do site...')
    
    // Por enquanto, vamos usar dados estáticos
    // Em uma implementação futura, você pode criar um modelo SiteSettings no MongoDB
    const settings: SiteSettings = {
      siteName: 'Guapa',
      description: 'Salão de beleza especializado em tratamentos capilares e coloração',
      address: 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP',
      whatsapp: '(19) 99999-9999',
      email: 'contato@guapa.com',
      updatedAt: new Date().toISOString()
    }
    
    console.log('Configurações carregadas')
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { siteName, description, address, whatsapp, email } = body

    console.log('Atualizando configurações do site...')
    
    // Por enquanto, vamos apenas retornar sucesso
    // Em uma implementação futura, você pode salvar no MongoDB
    const updatedSettings: SiteSettings = {
      siteName,
      description,
      address,
      whatsapp,
      email,
      updatedAt: new Date().toISOString()
    }
    
    console.log('Configurações atualizadas com sucesso')
    
    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
