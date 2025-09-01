import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'

// GET - Buscar pedido específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const order = await Order.findById(params.id)
      .populate('items.productId', 'name imageUrl')
    
    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ order })
    
  } catch (error) {
    console.error('Erro ao buscar pedido:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar pedido
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { status, notes, pickupDate } = body
    
    const updateData: any = {}
    
    if (status) {
      updateData.status = status
    }
    
    if (notes !== undefined) {
      updateData.notes = notes
    }
    
    if (pickupDate) {
      updateData.pickupDate = new Date(pickupDate)
    }
    
    const order = await Order.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).populate('items.productId', 'name imageUrl')
    
    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      order,
      message: 'Pedido atualizado com sucesso'
    })
    
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Cancelar pedido
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const order = await Order.findById(params.id)
    
    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }
    
    // Se o pedido foi cancelado, restaurar estoque
    if (order.status !== 'cancelled') {
      // Importar Product aqui para evitar dependência circular
      const { default: Product } = await import('@/models/Product')
      
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } }
        )
      }
    }
    
    // Marcar como cancelado
    order.status = 'cancelled'
    await order.save()
    
    return NextResponse.json({
      success: true,
      message: 'Pedido cancelado com sucesso'
    })
    
  } catch (error) {
    console.error('Erro ao cancelar pedido:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

