import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import Product from '@/models/Product'

// GET - Listar categorias
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')
    const isDefault = searchParams.get('isDefault')
    
    // Construir filtros
    const filters: any = {}
    
    if (isActive !== null) {
      filters.isActive = isActive === 'true'
    }
    
    if (isDefault !== null) {
      filters.isDefault = isDefault === 'true'
    }
    
    // Buscar categorias
    const categories = await Category.find(filters)
      .sort({ order: 1, name: 1 })
      .lean()
    
    // Contar produtos por categoria
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ 
          category: category.name,
          isActive: true 
        })
        return {
          ...category,
          productCount
        }
      })
    )
    
    return NextResponse.json(categoriesWithCount)
    
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova categoria
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { name, description, isDefault, order } = body
    
    // Validações
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nome da categoria é obrigatório' },
        { status: 400 }
      )
    }
    
    // Verificar se categoria já existe
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    })
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Categoria já existe' },
        { status: 409 }
      )
    }
    
    // Criar categoria
    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() || '',
      isDefault: isDefault || false,
      order: order || 0
    })
    
    return NextResponse.json(category, { status: 201 })
    
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar múltiplas categorias (para reordenação)
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { action, categoryIds, data } = body
    
    if (!action || !categoryIds || !Array.isArray(categoryIds)) {
      return NextResponse.json(
        { error: 'Ação e IDs das categorias são obrigatórios' },
        { status: 400 }
      )
    }
    
    let updateData: any = {}
    
    switch (action) {
      case 'activate':
        updateData = { isActive: true }
        break
      case 'deactivate':
        updateData = { isActive: false }
        break
      case 'updateOrder':
        if (!data || !data.order) {
          return NextResponse.json(
            { error: 'Ordem é obrigatória' },
            { status: 400 }
          )
        }
        updateData = { order: data.order }
        break
      default:
        return NextResponse.json(
          { error: 'Ação inválida' },
          { status: 400 }
        )
    }
    
    // Atualizar categorias
    const result = await Category.updateMany(
      { _id: { $in: categoryIds } },
      updateData
    )
    
    return NextResponse.json({
      message: `${result.modifiedCount} categorias atualizadas`,
      modifiedCount: result.modifiedCount
    })
    
  } catch (error) {
    console.error('Erro ao atualizar categorias:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
export const dynamic = 'force-dynamic'
