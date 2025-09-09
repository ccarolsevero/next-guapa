import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

interface ReserveItem {
  productId: string
  quantity: number
}

interface ReserveRequest {
  items: ReserveItem[]
  customerInfo?: {
    name: string
    email: string
    phone: string
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body: ReserveRequest = await request.json()
    const { items, customerInfo } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum item para reservar' },
        { status: 400 }
      )
    }

    // Verificar disponibilidade de estoque
    const stockChecks = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.productId)
        if (!product) {
          return { productId: item.productId, error: 'Produto não encontrado' }
        }
        if (!product.isActive) {
          return { productId: item.productId, error: 'Produto não está ativo' }
        }
        if (product.stock < item.quantity) {
          return { 
            productId: item.productId, 
            error: `Estoque insuficiente. Disponível: ${product.stock}, Solicitado: ${item.quantity}` 
          }
        }
        return { productId: item.productId, product, quantity: item.quantity }
      })
    )

    // Verificar se há erros
    const errors = stockChecks.filter(check => 'error' in check)
    if (errors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Erro na verificação de estoque',
          details: errors 
        },
        { status: 400 }
      )
    }

    // Atualizar estoque
    const updatePromises = stockChecks.map(async (check) => {
      if ('product' in check && 'quantity' in check) {
        const { product, quantity } = check
        return Product.findByIdAndUpdate(
          product._id,
          { $inc: { stock: -(quantity || 0) } },
          { new: true }
        )
      }
    })

    const updatedProducts = await Promise.all(updatePromises)

    // Aqui você pode adicionar lógica para:
    // 1. Salvar a reserva no banco de dados
    // 2. Enviar e-mail de confirmação
    // 3. Notificar o admin
    // 4. Gerar código de reserva

    const reservationCode = `RES${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // Log da reserva (você pode expandir isso para salvar em uma coleção de reservas)
    console.log('Reserva realizada:', {
      code: reservationCode,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        product: updatedProducts.find(p => p?._id.toString() === item.productId)
      })),
      customerInfo,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      reservationCode,
      message: 'Produtos reservados com sucesso',
      updatedProducts: updatedProducts.map(p => ({
        _id: p?._id,
        name: p?.name,
        newStock: p?.stock
      }))
    })

  } catch (error) {
    console.error('Erro ao processar reserva:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

