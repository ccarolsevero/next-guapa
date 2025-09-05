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
    
    // Buscar todas as categorias únicas de serviços (ativos e inativos)
    const allServices = await servicesCollection.find({}).toArray()
    console.log('📋 Total de serviços encontrados:', allServices.length)
    
    // Extrair categorias únicas
    const uniqueCategories = [...new Set(allServices.map(service => service.category).filter(Boolean))]
    console.log('📋 Categorias únicas encontradas:', uniqueCategories)
    
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
  let client: MongoClient | null = null
  
  try {
    // Verificar se MONGODB_URI está definida
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI não está definida')
      return NextResponse.json(
        { error: 'Configuração do banco de dados não encontrada' },
        { status: 500 }
      )
    }
    
    client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    console.log('✅ Conectado ao MongoDB')
    
    const db = client.db('guapa')
    const servicesCollection = db.collection('services')
    
    const body = await request.json()
    const { name, description } = body
    
    console.log('📝 Dados recebidos:', { name, description })
    
    // Validações
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nome da categoria é obrigatório' },
        { status: 400 }
      )
    }
    
    // Verificar se categoria já existe
    const existingService = await servicesCollection.findOne({ 
      category: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    })
    
    if (existingService) {
      console.log('❌ Categoria já existe:', existingService)
      return NextResponse.json(
        { error: 'Categoria já existe' },
        { status: 409 }
      )
    }
    
    // Criar um serviço temporário inativo para "registrar" a categoria
    // Isso permite que a categoria apareça na lista mesmo sem serviços ativos
    const tempService = {
      name: `[CATEGORIA] ${name.trim()}`,
      description: description || `Categoria: ${name.trim()}`,
      price: 0,
      category: name.trim(),
      duration: 60,
      isActive: false, // Serviço inativo, só para registrar a categoria
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    console.log('📝 Criando serviço temporário para registrar categoria:', tempService)
    
    const result = await servicesCollection.insertOne(tempService)
    console.log('✅ Serviço temporário criado com sucesso:', result.insertedId)
    
    return NextResponse.json({
      _id: name.trim(),
      name: name.trim(),
      description: description?.trim() || '',
      isActive: true,
      order: 0,
      serviceCount: 0
    }, { status: 201 })
    
  } catch (error) {
    console.error('❌ Erro ao criar categoria de serviço:', error)
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  } finally {
    if (client) {
      try {
        await client.close()
        console.log('✅ Conexão MongoDB fechada')
      } catch (closeError) {
        console.error('❌ Erro ao fechar conexão:', closeError)
      }
    }
  }
}
