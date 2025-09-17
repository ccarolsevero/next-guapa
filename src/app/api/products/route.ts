import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

// GET - Listar produtos (com filtros)
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')
    const isFeatured = searchParams.get('isFeatured')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    
    // Construir filtros
    const filters: any = {}
    
    if (category && category !== 'all') {
      filters.category = category
    }
    
    if (isActive !== null) {
      filters.isActive = isActive === 'true'
    }
    
    if (isFeatured !== null) {
      filters.isFeatured = isFeatured === 'true'
    }
    
    if (search) {
      filters.$text = { $search: search }
    }
    
    // Calcular skip para paginação
    const skip = (page - 1) * limit
    
    // Buscar produtos
    const products = await Product.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
    
    // Contar total para paginação
    const total = await Product.countDocuments(filters)
    
    // Calcular preços finais com desconto
    const productsWithFinalPrice = products.map(product => ({
      ...product,
      finalPrice: product.discount > 0 
        ? product.price * (1 - product.discount / 100) 
        : product.price
    }))
    
    return NextResponse.json({
      products: productsWithFinalPrice,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo produto
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando criação de produto...')
    await connectDB()
    
    const body = await request.json()
    console.log('📋 Dados recebidos:', body)
    
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
    
    console.log('📦 Dados extraídos:', {
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
    })
    
    // Validações
    if (!name || !price) {
      console.error('❌ Validação falhou: Nome ou preço ausente')
      return NextResponse.json(
        { error: 'Nome e preço são obrigatórios' },
        { status: 400 }
      )
    }
    
    if (isNaN(price) || price < 0) {
      console.error('❌ Validação falhou: Preço inválido:', price)
      return NextResponse.json(
        { error: 'Preço deve ser um número válido e não pode ser negativo' },
        { status: 400 }
      )
    }
    
    // Validar costPrice se fornecido
    if (costPrice !== undefined && costPrice !== null && costPrice !== '') {
      if (isNaN(costPrice) || costPrice < 0) {
        console.error('❌ Validação falhou: Preço de custo inválido:', costPrice)
        return NextResponse.json(
          { error: 'Preço de custo deve ser um número válido e não pode ser negativo' },
          { status: 400 }
        )
      }
    }
    
    if (discount && (discount < 0 || discount > 100)) {
      return NextResponse.json(
        { error: 'Desconto deve estar entre 0 e 100%' },
        { status: 400 }
      )
    }
    
    // Verificar se SKU já existe
    if (sku) {
      const existingProduct = await Product.findOne({ sku })
      if (existingProduct) {
        return NextResponse.json(
          { error: 'SKU já existe' },
          { status: 409 }
        )
      }
    }
    
    // Validar se a categoria existe (se fornecida) - criar automaticamente se não existir
    if (category && category !== 'Geral') {
      const ProductCategory = (await import('@/models/ProductCategory')).default
      const categoryExists = await ProductCategory.findOne({ 
        name: category, 
        isActive: true 
      })
      
      if (!categoryExists) {
        console.log('⚠️ Categoria de produto não encontrada, criando automaticamente:', category)
        
        // Verificar qual é o próximo order
        const lastCategory = await ProductCategory.findOne().sort({ order: -1 })
        const nextOrder = lastCategory ? lastCategory.order + 1 : 1
        
        // Criar categoria automaticamente se não existir
        const newCategory = new ProductCategory({
          name: category,
          description: `Categoria criada automaticamente para ${category}`,
          color: '#006D5B',
          icon: '',
          order: nextOrder,
          isActive: true
        })
        await newCategory.save()
        console.log('✅ Categoria de produto criada automaticamente:', category)
      } else {
        console.log('✅ Categoria de produto encontrada:', category)
      }
    }
    
    // Criar produto
    console.log('🏗️ Criando produto no banco de dados...')
    const productData = {
      name,
      description,
      price,
      originalPrice: originalPrice || price,
      costPrice: costPrice !== undefined && costPrice !== null && costPrice !== '' ? costPrice : 0,
      commissionValue: commissionValue !== undefined && commissionValue !== null && commissionValue !== '' ? commissionValue : 0,
      discount: discount !== undefined && discount !== null && discount !== '' ? discount : 0,
      category: category || 'Geral',
      imageUrl,
      stock: stock !== undefined && stock !== null && stock !== '' ? stock : 0,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured || false,
      tags: tags || [],
      specifications: specifications || {},
      weight,
      dimensions,
      brand,
      sku
    }
    
    console.log('📦 Dados do produto para criação:', productData)
    
    const product = await Product.create(productData)
    console.log('✅ Produto criado com sucesso:', product._id)
    
    return NextResponse.json(product, { status: 201 })
    
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar múltiplos produtos (para ações em lote)
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { action, productIds, data } = body
    
    if (!action || !productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: 'Ação e IDs dos produtos são obrigatórios' },
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
      case 'feature':
        updateData = { isFeatured: true }
        break
      case 'unfeature':
        updateData = { isFeatured: false }
        break
      case 'applyDiscount':
        if (!data || !data.discount) {
          return NextResponse.json(
            { error: 'Desconto é obrigatório' },
            { status: 400 }
          )
        }
        updateData = { discount: data.discount }
        break
      case 'updatePrice':
        if (!data || !data.price) {
          return NextResponse.json(
            { error: 'Preço é obrigatório' },
            { status: 400 }
          )
        }
        updateData = { price: data.price }
        break
      default:
        return NextResponse.json(
          { error: 'Ação inválida' },
          { status: 400 }
        )
    }
    
    // Atualizar produtos
    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      updateData
    )
    
    return NextResponse.json({
      message: `${result.modifiedCount} produtos atualizados`,
      modifiedCount: result.modifiedCount
    })
    
  } catch (error) {
    console.error('Erro ao atualizar produtos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
export const dynamic = 'force-dynamic'
