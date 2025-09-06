import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

// Forçar invalidação de cache
export const dynamic = 'force-dynamic'
export const revalidate = 0

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
    
    const response = NextResponse.json(categoriesWithCount)
    
    // Headers para evitar cache
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    
    return response
    
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

// DELETE - Deletar categoria de serviço
export async function DELETE(request: NextRequest) {
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
    const { name } = body
    
    console.log('🗑️ Tentando deletar categoria:', name)
    
    // Validações
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nome da categoria é obrigatório' },
        { status: 400 }
      )
    }
    
    // Verificar se existem serviços ativos com essa categoria
    const activeServicesCount = await servicesCollection.countDocuments({ 
      category: name.trim(),
      isActive: true 
    })
    
    if (activeServicesCount > 0) {
      return NextResponse.json(
        { error: `Não é possível deletar a categoria "${name.trim()}" pois existem ${activeServicesCount} serviço(s) ativo(s) associado(s) a ela.` },
        { status: 409 }
      )
    }
    
    // Deletar todos os serviços (ativos e inativos) com essa categoria
    const deleteResult = await servicesCollection.deleteMany({ 
      category: name.trim() 
    })
    
    console.log('✅ Categoria deletada:', name.trim(), 'Serviços removidos:', deleteResult.deletedCount)
    
    return NextResponse.json({
      message: `Categoria "${name.trim()}" deletada com sucesso`,
      deletedServices: deleteResult.deletedCount
    })
    
  } catch (error) {
    console.error('❌ Erro ao deletar categoria:', error)
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

// PATCH - Atualizar status de categoria de serviço
export async function PATCH(request: NextRequest) {
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
    const { name, isActive } = body
    
    console.log('🔄 Atualizando status da categoria:', { name, isActive })
    
    // Validações
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nome da categoria é obrigatório' },
        { status: 400 }
      )
    }
    
    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Status isActive deve ser um valor booleano' },
        { status: 400 }
      )
    }
    
    // Atualizar todos os serviços com essa categoria
    const updateResult = await servicesCollection.updateMany(
      { category: name.trim() },
      { $set: { isActive: isActive, updatedAt: new Date() } }
    )
    
    console.log('✅ Status da categoria atualizado:', name.trim(), 'Serviços afetados:', updateResult.modifiedCount)
    
    return NextResponse.json({
      message: `Categoria "${name.trim()}" ${isActive ? 'ativada' : 'desativada'} com sucesso`,
      modifiedServices: updateResult.modifiedCount,
      isActive: isActive
    })
    
  } catch (error) {
    console.error('❌ Erro ao atualizar status da categoria:', error)
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
