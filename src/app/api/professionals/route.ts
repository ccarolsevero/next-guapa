import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Professional from '@/models/Professional'

export async function GET() {
  try {
    console.log('Buscando profissionais do MongoDB...')
    
    await connectDB()
    const professionals = await Professional.find({}).sort({ name: 1 })
    console.log('Profissionais encontrados:', professionals.length)
    
    return NextResponse.json(professionals)
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      title, 
      email, 
      phone, 
      shortDescription, 
      fullDescription, 
      services, 
      featuredServices,
      profileImage, 
      gallery 
    } = body

    console.log('Adicionando novo profissional no MongoDB...')
    
    await connectDB()
    
    const newProfessional = await Professional.create({
      name,
      title: title || 'Cabeleireira',
      email,
      phone,
      shortDescription: shortDescription || 'Especialista em tratamentos capilares',
      fullDescription: fullDescription || 'Profissional experiente e dedicada aos cuidados capilares',
      services: services || [],
      featuredServices: featuredServices || [],
      profileImage: profileImage || '/assents/fotobruna.jpeg',
      gallery: gallery || [],
      isActive: true,
      isFeatured: false
    })
    
    console.log('Profissional adicionado com sucesso:', newProfessional._id)
    
    return NextResponse.json(newProfessional, { status: 201 })
  } catch (error) {
    console.error('Erro ao adicionar profissional:', error)
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

    console.log('Atualizando profissional no MongoDB...')
    
    await connectDB()
    
    const updatedProfessional = await Professional.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
    
    if (!updatedProfessional) {
      return NextResponse.json(
        { error: 'Profissional não encontrado' },
        { status: 404 }
      )
    }
    
    console.log('Profissional atualizado com sucesso:', updatedProfessional._id)
    
    return NextResponse.json(updatedProfessional)
  } catch (error) {
    console.error('Erro ao atualizar profissional:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}
