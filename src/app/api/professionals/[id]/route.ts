import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Professional from '@/models/Professional'
import bcrypt from 'bcryptjs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('Buscando profissional com ID/nome:', id)
    
    await connectDB()
    
    let professional
    
    // Se o ID parece ser um ObjectId válido, busca por ID
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      professional = await Professional.findById(id)
    } else {
      // Se não é um ObjectId, busca por nome
      // Normalizar o termo de busca removendo acentos
      const normalizeString = (str: string) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      }
      
      const normalizedId = normalizeString(id)
      
      // Buscar todos os profissionais e filtrar localmente para lidar com acentos
      const allProfessionals = await Professional.find({})
      
      // Buscar por nome que contenha o termo (case-insensitive e sem acentos)
      professional = allProfessionals.find(p => 
        normalizeString(p.name).includes(normalizedId)
      )
      
      // Se não encontrar, tenta buscar por nome que comece com o termo
      if (!professional) {
        professional = allProfessionals.find(p => 
          normalizeString(p.name).startsWith(normalizedId)
        )
      }
    }
    
    if (!professional) {
      console.log('Profissional não encontrado:', id)
      return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 })
    }
    
    console.log('Profissional encontrado:', professional.name)
    return NextResponse.json(professional)
  } catch (error) {
    console.error('Erro ao buscar profissional:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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
      gallery,
      isActive,
      isFeatured,
      // Novos campos para funcionários
      username,
      password,
      role,
      canAccessFinancial,
      canAccessSiteEdit,
      canAccessGoals,
      canAccessReports,
      newPassword
    } = body

    console.log('Atualizando profissional:', id)
    
    await connectDB()
    
    // Preparar dados de atualização
    const updateData: any = {
      name,
      title,
      email,
      phone,
      shortDescription,
      fullDescription,
      services,
      featuredServices,
      profileImage,
      gallery,
      isActive,
      isFeatured
    }
    
    // Adicionar campos de funcionário se fornecidos
    if (username !== undefined) updateData.username = username
    if (role !== undefined) updateData.role = role
    if (canAccessFinancial !== undefined) updateData.canAccessFinancial = canAccessFinancial
    if (canAccessSiteEdit !== undefined) updateData.canAccessSiteEdit = canAccessSiteEdit
    if (canAccessGoals !== undefined) updateData.canAccessGoals = canAccessGoals
    if (canAccessReports !== undefined) updateData.canAccessReports = canAccessReports
    
    // Se há uma nova senha, fazer hash dela
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 12)
    } else if (password) {
      // Se foi fornecida uma senha (sem newPassword), fazer hash dela
      updateData.password = await bcrypt.hash(password, 12)
    }
    
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
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log('Deletando profissional:', id)
    
    await connectDB()
    
    const deletedProfessional = await Professional.findByIdAndDelete(id)
    
    if (!deletedProfessional) {
      return NextResponse.json(
        { error: 'Profissional não encontrado' },
        { status: 404 }
      )
    }
    
    console.log('Profissional deletado com sucesso:', id)
    
    return NextResponse.json({ message: 'Profissional deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar profissional:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
export const dynamic = 'force-dynamic'
