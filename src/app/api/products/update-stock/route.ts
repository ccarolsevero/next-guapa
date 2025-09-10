import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

// POST - Atualizar estoque de produtos vendidos
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { products } = body

    if (!products || !Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Lista de produtos é obrigatória' },
        { status: 400 }
      )
    }

    const results = []
    const errors = []

    // Processar cada produto vendido
    for (const productSale of products) {
      try {
        const { productId, quantity, productName } = productSale

        if (!productId || !quantity || quantity <= 0) {
          errors.push(`Produto ${productName || 'desconhecido'}: dados inválidos`)
          continue
        }

        // Buscar produto no banco
        const product = await Product.findById(productId)
        
        if (!product) {
          errors.push(`Produto ${productName || 'desconhecido'}: não encontrado`)
          continue
        }

        // Verificar se tem estoque suficiente (apenas para vendas, não para restaurações)
        if (quantity > 0 && product.stock < quantity) {
          errors.push(`Produto ${product.name}: estoque insuficiente (disponível: ${product.stock}, solicitado: ${quantity})`)
          continue
        }

        // Atualizar estoque
        const newStock = product.stock - quantity
        await Product.findByIdAndUpdate(productId, { stock: newStock })

        results.push({
          productId,
          productName: product.name,
          quantitySold: quantity,
          previousStock: product.stock,
          newStock,
          success: true
        })

      } catch (error) {
        console.error(`Erro ao processar produto ${productSale.productName}:`, error)
        errors.push(`Erro interno ao processar ${productSale.productName || 'produto'}`)
      }
    }

    // Retornar resultado
    return NextResponse.json({
      message: 'Estoque atualizado',
      results,
      errors,
      summary: {
        totalProcessed: products.length,
        successful: results.length,
        failed: errors.length
      }
    })

  } catch (error) {
    console.error('Erro ao atualizar estoque:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Verificar estoque de produtos
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const productIds = searchParams.get('productIds')

    if (!productIds) {
      return NextResponse.json(
        { error: 'IDs dos produtos são obrigatórios' },
        { status: 400 }
      )
    }

    const ids = productIds.split(',')
    const products = await Product.find({ _id: { $in: ids } }, 'name stock price')

    return NextResponse.json({ products })

  } catch (error) {
    console.error('Erro ao verificar estoque:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
export const dynamic = 'force-dynamic'
