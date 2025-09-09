import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import ProductCategory from '@/models/ProductCategory'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()

    const { id } = await params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const category = await ProductCategory.findById(id)
    
    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Erro ao buscar categoria de produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()

    const { id } = await params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, description, color, icon, isActive, order } = body

    const category = await ProductCategory.findById(id)
    
    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o novo nome já existe (se foi alterado)
    if (name && name !== category.name) {
      const existingCategory = await ProductCategory.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: id }
      })

      if (existingCategory) {
        return NextResponse.json(
          { error: 'Já existe uma categoria com este nome' },
          { status: 400 }
        )
      }
    }

    // Atualizar campos
    if (name !== undefined) category.name = name.trim()
    if (description !== undefined) category.description = description?.trim()
    if (color !== undefined) category.color = color
    if (icon !== undefined) category.icon = icon?.trim()
    if (isActive !== undefined) category.isActive = isActive
    if (order !== undefined) category.order = order

    await category.save()

    return NextResponse.json({
      success: true,
      category,
      message: 'Categoria de produto atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar categoria de produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()

    const { id } = await params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const category = await ProductCategory.findById(id)
    
    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se há produtos usando esta categoria
    const Product = (await import('@/models/Product')).default
    const productsUsingCategory = await Product.countDocuments({ 
      category: category.name 
    })

    if (productsUsingCategory > 0) {
      return NextResponse.json(
        { 
          error: `Não é possível excluir esta categoria. Ela está sendo usada por ${productsUsingCategory} produto(s).`,
          productsCount: productsUsingCategory
        },
        { status: 400 }
      )
    }

    await ProductCategory.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: 'Categoria de produto excluída com sucesso'
    })

  } catch (error) {
    console.error('Erro ao excluir categoria de produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
