import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import ProductCategory from '@/models/ProductCategory'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    const query = activeOnly ? { isActive: true } : {}
    const categories = await ProductCategory.find(query)
      .sort({ order: 1, name: 1 })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Erro ao buscar categorias de produtos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { name, description, color, icon, order } = body

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nome da categoria é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se já existe uma categoria ativa com o mesmo nome
    const existingCategory = await ProductCategory.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      isActive: true
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Já existe uma categoria ativa com este nome' },
        { status: 400 }
      )
    }

    // Se não foi especificado um order, pegar o próximo número
    let categoryOrder = order
    if (categoryOrder === undefined || categoryOrder === null) {
      const lastCategory = await ProductCategory.findOne().sort({ order: -1 })
      categoryOrder = lastCategory ? lastCategory.order + 1 : 1
    }

    const newCategory = new ProductCategory({
      name: name.trim(),
      description: description?.trim(),
      color: color || '#006D5B',
      icon: icon?.trim(),
      order: categoryOrder,
      isActive: true
    })

    await newCategory.save()

    return NextResponse.json({
      success: true,
      category: newCategory,
      message: 'Categoria de produto criada com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar categoria de produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
