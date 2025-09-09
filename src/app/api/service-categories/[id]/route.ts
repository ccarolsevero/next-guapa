import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import ServiceCategory from '@/models/ServiceCategory'
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

    const category = await ServiceCategory.findById(id)
    
    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Erro ao buscar categoria de serviço:', error)
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

    const category = await ServiceCategory.findById(id)
    
    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o novo nome já existe (se foi alterado)
    if (name && name !== category.name) {
      const existingCategory = await ServiceCategory.findOne({ 
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
      message: 'Categoria de serviço atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar categoria de serviço:', error)
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

    const category = await ServiceCategory.findById(id)
    
    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se há serviços usando esta categoria
    const Service = (await import('@/models/Service')).default
    const servicesUsingCategory = await Service.countDocuments({ 
      category: category.name 
    })

    if (servicesUsingCategory > 0) {
      return NextResponse.json(
        { 
          error: `Não é possível excluir esta categoria. Ela está sendo usada por ${servicesUsingCategory} serviço(s).`,
          servicesCount: servicesUsingCategory
        },
        { status: 400 }
      )
    }

    await ServiceCategory.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: 'Categoria de serviço excluída com sucesso'
    })

  } catch (error) {
    console.error('Erro ao excluir categoria de serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
