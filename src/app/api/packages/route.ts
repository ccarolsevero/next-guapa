import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Package from '@/models/Package'
import Service from '@/models/Service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')
    
    await connectDB()
    
    let query: any = {}
    
    if (isActive !== null) {
      query.isActive = isActive === 'true'
    }
    
    const packages = await Package.find(query)
      .sort({ createdAt: -1 })
      .populate('services.serviceId', 'name price')
    
    return NextResponse.json(packages)
  } catch (error) {
    console.error('Erro ao buscar pacotes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    await connectDB()
    
    // Validar se todos os serviços existem
    if (body.services && body.services.length > 0) {
      for (const serviceItem of body.services) {
        const service = await Service.findById(serviceItem.serviceId)
        if (!service) {
          return NextResponse.json(
            { error: `Serviço com ID ${serviceItem.serviceId} não encontrado` },
            { status: 400 }
          )
        }
        
        // Preencher dados do serviço
        serviceItem.name = service.name
        serviceItem.price = service.price
      }
    }
    
    // Calcular preço original se não fornecido
    if (!body.originalPrice && body.services) {
      body.originalPrice = body.services.reduce((sum: number, service: any) => sum + (service.price || 0), 0)
    }
    
    // Calcular preço com desconto se não fornecido
    if (!body.discountedPrice && body.discount) {
      body.discountedPrice = body.originalPrice * (1 - body.discount / 100)
    } else if (!body.discountedPrice) {
      body.discountedPrice = body.originalPrice
    }
    
    const newPackage = new Package(body)
    const savedPackage = await newPackage.save()
    
    return NextResponse.json(savedPackage, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar pacote:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
export const dynamic = 'force-dynamic'
