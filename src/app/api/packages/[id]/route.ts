import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Package from '@/models/Package'
import Service from '@/models/Service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log('Buscando pacote específico:', id)
    
    await connectDB()
    const packageItem = await Package.findById(id)
      .populate('services.serviceId', 'name price')
    
    if (!packageItem) {
      return NextResponse.json(
        { error: 'Pacote não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(packageItem)
  } catch (error) {
    console.error('Erro ao buscar pacote:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    console.log('Atualizando pacote:', id)
    
    await connectDB()
    
    // Validar serviços se fornecidos
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
    
    // Recalcular preços se serviços foram alterados
    if (body.services) {
      body.originalPrice = body.services.reduce((sum: number, service: any) => sum + (service.price || 0), 0)
      if (body.discount) {
        body.discountedPrice = body.originalPrice * (1 - body.discount / 100)
      } else {
        body.discountedPrice = body.originalPrice
      }
    }
    
    const updatedPackage = await Package.findByIdAndUpdate(
      id,
      body,
      { new: true }
    ).populate('services.serviceId', 'name price')
    
    if (!updatedPackage) {
      return NextResponse.json(
        { error: 'Pacote não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedPackage)
  } catch (error) {
    console.error('Erro ao atualizar pacote:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log('Deletando pacote:', id)
    
    await connectDB()
    
    const deletedPackage = await Package.findByIdAndDelete(id)
    
    if (!deletedPackage) {
      return NextResponse.json(
        { error: 'Pacote não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Pacote deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar pacote:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
