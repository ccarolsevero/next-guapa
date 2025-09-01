import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Service from '@/models/Service'

export async function GET() {
  try {
    console.log('🔍 Buscando serviços do MongoDB...')
    console.log('📡 MONGODB_URI:', process.env.MONGODB_URI ? 'Configurada' : 'NÃO CONFIGURADA')
    
    await connectDB()
    console.log('✅ Conectado ao banco de dados')
    
    // Buscar todos os serviços primeiro para debug
    const allServices = await Service.find({})
    console.log('📊 Total de serviços no banco (sem filtro):', allServices.length)
    
    if (allServices.length > 0) {
      console.log('📋 Primeiros 3 serviços encontrados:')
      allServices.slice(0, 3).forEach((service, index) => {
        console.log(`  ${index + 1}. ${service.name} - Ativo: ${service.isActive}`)
      })
    }
    
    // Agora buscar apenas os ativos
    const services = await Service.find({ isActive: true }).sort({ category: 1, order: 1 })
    console.log('✅ Serviços ativos encontrados:', services.length)
    
    if (services.length === 0) {
      console.log('❌ Nenhum serviço ativo encontrado no banco')
      return NextResponse.json({ error: 'Nenhum serviço ativo encontrado' }, { status: 404 })
    }
    
    console.log('📦 Retornando serviços do banco:', services.length)
    return NextResponse.json(services)
  } catch (error) {
    console.error('❌ Erro ao buscar serviços:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, description, price, order, isFeatured } = body

    console.log('Adicionando novo serviço no MongoDB...')
    
    await connectDB()
    
    const newService = await Service.create({
      name,
      category,
      description,
      price,
      order: order || 0,
      isActive: true,
      isFeatured: isFeatured || false
    })
    
    console.log('Serviço adicionado com sucesso:', newService._id)
    
    return NextResponse.json(newService, { status: 201 })
  } catch (error) {
    console.error('Erro ao adicionar serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    console.log('Atualizando serviço no MongoDB...')
    
    await connectDB()
    
    const updatedService = await Service.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    
    if (!updatedService) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }
    
    console.log('Serviço atualizado com sucesso:', updatedService._id)
    
    return NextResponse.json(updatedService)
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}
