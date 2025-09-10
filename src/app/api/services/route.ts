import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Service from '@/models/Service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const professionalId = searchParams.get('professionalId')
    
    console.log('🔍 Buscando serviços do MongoDB...')
    console.log('📡 MONGODB_URI:', process.env.MONGODB_URI ? 'Configurada' : 'NÃO CONFIGURADA')
    console.log('👤 ProfessionalId:', professionalId || 'Nenhum (todos os serviços)')
    
    await connectDB()
    console.log('✅ Conectado ao banco de dados')
    
    // Debug: verificar se o modelo Service está funcionando
    console.log('🔧 Modelo Service:', Service.modelName)
    const serviceCount = await Service.countDocuments()
    console.log('📊 Total de documentos na coleção services:', serviceCount)
    
    let services
    
    if (professionalId) {
      // Buscar serviços específicos do profissional
      const Professional = (await import('@/models/Professional')).default
      const professional = await Professional.findById(professionalId)
      
      if (!professional) {
        console.log('❌ Profissional não encontrado:', professionalId)
        return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 })
      }
      
      console.log('👤 Profissional encontrado:', professional.name)
      console.log('📋 Serviços do profissional:', professional.services)
      
      if (!professional.services || professional.services.length === 0) {
        console.log('❌ Profissional não tem serviços cadastrados')
        return NextResponse.json({ error: 'Profissional não tem serviços cadastrados' }, { status: 404 })
      }
      
      // Buscar serviços que correspondem aos nomes do profissional
      services = await Service.find({ 
        isActive: true,
        name: { $in: professional.services }
      }).sort({ category: 1, order: 1 })
      
      console.log('✅ Serviços do profissional encontrados:', services.length)
    } else {
      // Buscar todos os serviços ativos
      console.log('🔍 Buscando todos os serviços ativos...')
      services = await Service.find({ isActive: true }).sort({ category: 1, order: 1 })
      console.log('✅ Todos os serviços ativos encontrados:', services.length)
      
      // Debug: verificar se há serviços inativos também
      const allServices = await Service.find({}).sort({ category: 1, order: 1 })
      console.log('📊 Total de serviços no banco (ativos + inativos):', allServices.length)
      
      if (allServices.length > 0) {
        console.log('📋 Primeiro serviço encontrado:', {
          name: allServices[0].name,
          isActive: allServices[0].isActive,
          category: allServices[0].category
        })
      }
    }
    
    if (services.length === 0) {
      console.log('❌ Nenhum serviço encontrado')
      return NextResponse.json({ error: 'Nenhum serviço encontrado' }, { status: 404 })
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
    
    // Validar se a categoria existe
    const ServiceCategory = (await import('@/models/ServiceCategory')).default
    const categoryExists = await ServiceCategory.findOne({ 
      name: category, 
      isActive: true 
    })
    
    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Categoria de serviço não encontrada ou inativa' },
        { status: 400 }
      )
    }
    
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
export const dynamic = 'force-dynamic'
