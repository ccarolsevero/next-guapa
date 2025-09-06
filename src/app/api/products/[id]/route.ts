import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

// GET - Buscar produto específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const product = await Product.findById(params.id).lean()
    
    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }
    
    // Calcular preço final com desconto
    const productWithFinalPrice = {
      ...product,
      finalPrice: product.discount > 0 
        ? product.price * (1 - product.discount / 100) 
        : product.price
    }
    
    return NextResponse.json(productWithFinalPrice)
    
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar produto
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const body = await request.json()
    const {
      name,
      description,
      price,
      originalPrice,
      costPrice,
      commissionValue,
      discount,
      category,
      imageUrl,
      stock,
      isActive,
      isFeatured,
      tags,
      specifications,
      weight,
      dimensions,
      brand,
      sku
    } = body
    
    // Validações
    if (price !== undefined && price < 0) {
      return NextResponse.json(
        { error: 'Preço não pode ser negativo' },
        { status: 400 }
      )
    }
    
    if (discount !== undefined && (discount < 0 || discount > 100)) {
      return NextResponse.json(
        { error: 'Desconto deve estar entre 0 e 100%' },
        { status: 400 }
      )
    }
    
    // Verificar se SKU já existe (exceto para o produto atual)
    if (sku) {
      const existingProduct = await Product.findOne({ 
        sku, 
        _id: { $ne: params.id } 
      })
      if (existingProduct) {
        return NextResponse.json(
          { error: 'SKU já existe' },
          { status: 409 }
        )
      }
    }
    
    // Atualizar produto
    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      {
        name,
        description,
        price,
        originalPrice,
        costPrice,
        commissionValue,
        discount,
        category,
        imageUrl,
        stock,
        isActive,
        isFeatured,
        tags,
        specifications,
        weight,
        dimensions,
        brand,
        sku
      },
      { new: true, runValidators: true }
    )
    
    if (!updatedProduct) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedProduct)
    
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir produto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const deletedProduct = await Product.findByIdAndDelete(params.id)
    
    if (!deletedProduct) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: 'Produto excluído com sucesso'
    })
    
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
