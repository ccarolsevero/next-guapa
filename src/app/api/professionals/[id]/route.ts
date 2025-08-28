import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Professional from '@/models/Professional'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('Buscando profissional:', params.id)
    
    await connectDB()
    const professional = await Professional.findById(params.id)
    
    if (!professional) {
      return NextResponse.json(
        { error: 'Profissional não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(professional)
  } catch (error) {
    console.error('Erro ao buscar profissional:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
      profileImage, 
      gallery,
      isActive,
      isFeatured 
    } = body

    console.log('Atualizando profissional:', params.id)
    
    await connectDB()
    
    const updatedProfessional = await Professional.findByIdAndUpdate(
      params.id,
      {
        name,
        title,
        email,
        phone,
        shortDescription,
        fullDescription,
        services,
        profileImage,
        gallery,
        isActive,
        isFeatured
      },
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
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('Deletando profissional:', params.id)
    
    await connectDB()
    
    const deletedProfessional = await Professional.findByIdAndDelete(params.id)
    
    if (!deletedProfessional) {
      return NextResponse.json(
        { error: 'Profissional não encontrado' },
        { status: 404 }
      )
    }
    
    console.log('Profissional deletado com sucesso:', params.id)
    
    return NextResponse.json({ message: 'Profissional deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar profissional:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
