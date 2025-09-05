import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

// Forçar invalidação de cache
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Listar categorias de serviços (versão 2)
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
