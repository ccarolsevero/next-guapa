import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

// GET - Listar categorias de serviços
export async function GET(request: NextRequest) {
  const client = new MongoClient(process.env.MONGODB_URI!)
  
  try {
    await client.connect()
    const db = client.db('guapa')
    const servicesCollection = db.collection('services')
    
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')
    
    // Buscar todas as categorias únicas de serviços
    const services = await servicesCollection.find({ isActive: true }).toArray()
    
    // Extrair categorias únicas
    const uniqueCategories = [...new Set(services.map(service => service.category).filter(Boolean))]
    
    // Contar serviços por categoria
    const categoriesWithCount = await Promise.all(
      uniqueCategories.map(async (categoryName) => {
        const serviceCount = await servicesCollection.countDocuments({ 
          category: categoryName,
          isActive: true 
        })
        return {
          _id: categoryName, // Usar o nome como ID temporário
          name: categoryName,
          description: '',
          isActive: true,
          order: 0,
          serviceCount
        }
      })
    )
    
    // Ordenar por nome
    categoriesWithCount.sort((a, b) => a.name.localeCompare(b.name))
    
    return NextResponse.json(categoriesWithCount)
    
  } catch (error) {
    console.error('Erro ao buscar categorias de serviços:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}

// POST - Criar nova categoria de serviço (adicionando um serviço com essa categoria)
export async function POST(request: NextRequest) {
  const client = new MongoClient(process.env.MONGODB_URI!)
  
  try {
    await client.connect()
    const db = client.db('guapa')
    const servicesCollection = db.collection('services')
    
    const body = await request.json()
    const { name, description } = body
    
    // Validações
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nome da categoria é obrigatório' },
        { status: 400 }
      )
    }
    
    // Verificar se categoria já existe
    const existingService = await servicesCollection.findOne({ 
      category: { $regex: new RegExp(`^${name}$`, 'i') } 
    })
    
    if (existingService) {
      return NextResponse.json(
        { error: 'Categoria já existe' },
        { status: 409 }
      )
    }
    
    // Para categorias de serviços, vamos criar um serviço temporário para "registrar" a categoria
    // Isso é necessário porque não temos uma coleção separada de categorias de serviços
    const tempService = {
      name: `[CATEGORIA] ${name}`,
      description: description || `Categoria: ${name}`,
      price: 0,
      category: name.trim(),
      duration: 60, // Duração mínima válida
      isActive: false, // Serviço inativo, só para registrar a categoria
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await servicesCollection.insertOne(tempService)
    
    return NextResponse.json({
      _id: name,
      name: name.trim(),
      description: description?.trim() || '',
      isActive: true,
      order: 0,
      serviceCount: 0
    }, { status: 201 })
    
  } catch (error) {
    console.error('Erro ao criar categoria de serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
