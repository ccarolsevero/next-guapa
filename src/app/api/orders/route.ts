import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Product from '@/models/Product'

// GET - Listar pedidos
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const sort = searchParams.get('sort') || '-createdAt'
    
    // Construir filtros
    const filters: any = {}
    if (status && status !== 'all') {
      filters.status = status
    }
    
    // Calcular skip para paginação
    const skip = (page - 1) * limit
    
    // Buscar pedidos
    const orders = await Order.find(filters)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate('items.productId', 'name imageUrl')
    
    // Contar total de pedidos
    const total = await Order.countDocuments(filters)
    
    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo pedido
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    console.log('Dados recebidos na API:', body)
    
    const { customerInfo, items, total, paymentMethod, pickupDate, notes } = body
    
    // Validar dados obrigatórios
    console.log('Validando customerInfo:', customerInfo)
    
    if (!customerInfo?.name || !customerInfo?.email || !customerInfo?.phone) {
      console.log('Erro: Dados do cliente incompletos')
      console.log('name:', customerInfo?.name)
      console.log('email:', customerInfo?.email)
      console.log('phone:', customerInfo?.phone)
      return NextResponse.json(
        { error: 'Dados do cliente são obrigatórios' },
        { status: 400 }
      )
    }
    
    console.log('Validando items:', items)
    
    if (!items || items.length === 0) {
      console.log('Erro: Nenhum item no pedido')
      return NextResponse.json(
        { error: 'Pelo menos um item é obrigatório' },
        { status: 400 }
      )
    }
    
    // Verificar disponibilidade de estoque
    console.log('Verificando estoque dos produtos...')
    for (const item of items) {
      console.log(`Verificando produto: ${item.name} (ID: ${item.productId})`)
      const product = await Product.findById(item.productId)
      
      if (!product) {
        console.log(`Erro: Produto não encontrado - ${item.name}`)
        return NextResponse.json(
          { error: `Produto ${item.name} não encontrado` },
          { status: 400 }
        )
      }
      
      console.log(`Produto encontrado:`, {
        id: product._id,
        name: product.name,
        stock: product.stock,
        isActive: product.isActive
      })
      
      console.log(`Estoque do produto ${item.name}: ${product.stock}, Quantidade solicitada: ${item.quantity}`)
      
      if (product.stock < item.quantity) {
        console.log(`Erro: Estoque insuficiente - ${item.name}`)
        return NextResponse.json(
          { error: `Estoque insuficiente para ${item.name}. Disponível: ${product.stock}` },
          { status: 400 }
        )
      }
    }
    
    // Gerar número do pedido
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    
    // Contar pedidos do dia
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    
    const count = await Order.countDocuments({
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    })
    
    const orderNumber = `PED${year}${month}${day}${String(count + 1).padStart(3, '0')}`
    console.log('Número do pedido gerado:', orderNumber)
    
    // Criar pedido
    console.log('Criando pedido...')
    const orderData = {
      orderNumber,
      customerInfo,
      items,
      total,
      paymentMethod: paymentMethod || 'cash',
      pickupDate: pickupDate ? new Date(pickupDate) : null,
      notes
    }
    console.log('Dados do pedido a serem salvos:', orderData)
    
    const order = new Order(orderData)
    
    try {
      await order.save()
      console.log('Pedido salvo com sucesso!')
    } catch (saveError) {
      console.error('Erro ao salvar pedido:', saveError)
      return NextResponse.json(
        { error: 'Erro ao salvar pedido no banco de dados' },
        { status: 500 }
      )
    }
    
    // Atualizar estoque dos produtos
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      )
    }
    
    // Buscar pedido com dados populados
    const savedOrder = await Order.findById(order._id)
      .populate('items.productId', 'name imageUrl')
    
    return NextResponse.json({
      success: true,
      order: savedOrder,
      message: 'Pedido criado com sucesso'
    })
    
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
export const dynamic = 'force-dynamic'
