import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import ServiceCategory from '@/models/ServiceCategory'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    const query = activeOnly ? { isActive: true } : {}
    const categories = await ServiceCategory.find(query)
      .sort({ order: 1, name: 1 })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Erro ao buscar categorias de serviços:', error)
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
    const existingCategory = await ServiceCategory.findOne({ 
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
      const lastCategory = await ServiceCategory.findOne().sort({ order: -1 })
      categoryOrder = lastCategory ? lastCategory.order + 1 : 1
    }

    const newCategory = new ServiceCategory({
      name: name.trim(),
      description: description?.trim(),
      color: color || '#D15556',
      icon: icon?.trim(),
      order: categoryOrder,
      isActive: true
    })

    await newCategory.save()

    return NextResponse.json({
      success: true,
      category: newCategory,
      message: 'Categoria de serviço criada com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar categoria de serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
