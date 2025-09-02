import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import Product from '@/models/Product'

// GET - Buscar categoria específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const category = await Category.findById(params.id).lean()
    
    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }
    
    // Contar produtos nesta categoria
    const productCount = await Product.countDocuments({ 
      category: category.name,
      isActive: true 
    })
    
    return NextResponse.json({
      ...category,
      productCount
    })
    
  } catch (error) {
    console.error('Erro ao buscar categoria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar categoria
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { name, description, isActive, isDefault, order } = body
    
    // Validações
    if (name && !name.trim()) {
      return NextResponse.json(
        { error: 'Nome da categoria não pode ser vazio' },
        { status: 400 }
      )
    }
    
    // Se estiver alterando o nome, verificar se já existe
    if (name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: params.id }
      })
      
      if (existingCategory) {
        return NextResponse.json(
          { error: 'Nome da categoria já existe' },
          { status: 409 }
        )
      }
    }
    
    // Preparar dados para atualização
    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim() || ''
    if (isActive !== undefined) updateData.isActive = isActive
    if (isDefault !== undefined) updateData.isDefault = isDefault
    if (order !== undefined) updateData.order = order
    
    // Atualizar categoria
    const updatedCategory = await Category.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).lean()
    
    if (!updatedCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }
    
    // Se o nome foi alterado, atualizar produtos que usam esta categoria
    if (name && name !== updatedCategory.name) {
      await Product.updateMany(
        { category: updatedCategory.name },
        { category: name }
      )
    }
    
    return NextResponse.json(updatedCategory)
    
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir categoria
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const category = await Category.findById(params.id)
    
    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }
    
    // Verificar se há produtos usando esta categoria
    const productCount = await Product.countDocuments({ 
      category: category.name,
      isActive: true 
    })
    
    if (productCount > 0) {
      return NextResponse.json(
        { 
          error: `Não é possível excluir a categoria "${category.name}" pois há ${productCount} produtos ativos usando ela. Remova ou altere a categoria dos produtos primeiro.` 
        },
        { status: 400 }
      )
    }
    
    // Excluir categoria
    await Category.findByIdAndDelete(params.id)
    
    return NextResponse.json({
      message: 'Categoria excluída com sucesso'
    })
    
  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
