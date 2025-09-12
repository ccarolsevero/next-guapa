import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  
  try {
    const { id } = await params
    console.log('🔍 Buscando serviço específico:', id)
    
    // Conectar diretamente ao MongoDB
    client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()
    console.log('✅ Conectado ao banco de dados')
    
    const db = client.db('guapa')
    const servicesCollection = db.collection('services')
    
    // Verificar se o ID é válido
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }
    
    const service = await servicesCollection.findOne({ _id: new ObjectId(id) })
    
    if (!service) {
      console.log('❌ Serviço não encontrado:', id)
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }
    
    console.log('✅ Serviço encontrado:', service.name)
    return NextResponse.json(service)
  } catch (error) {
    console.error('❌ Erro ao buscar serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    if (client) {
      await client.close()
      console.log('🔌 Conexão MongoDB fechada')
    }
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  
  try {
    const { id } = await params
    const body = await request.json()

    console.log('📝 Atualizando serviço:', id)
    console.log('📝 Dados para atualização:', body)
    
    // Conectar diretamente ao MongoDB
    client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()
    console.log('✅ Conectado ao banco de dados')
    
    const db = client.db('guapa')
    const servicesCollection = db.collection('services')
    
    // Verificar se o ID é válido
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }
    
    // Verificar se a categoria existe (se fornecida)
    if (body.category) {
      const serviceCategoriesCollection = db.collection('servicecategories')
      const categoryExists = await serviceCategoriesCollection.findOne({ 
        name: body.category, 
        isActive: true 
      })
      
      if (!categoryExists) {
        console.log('⚠️ Categoria não encontrada, criando automaticamente:', body.category)
        
        // Verificar qual é o próximo order
        const lastCategory = await serviceCategoriesCollection.findOne({}, { sort: { order: -1 } })
        const nextOrder = lastCategory ? lastCategory.order + 1 : 1
        
        // Criar categoria automaticamente se não existir
        const newCategory = {
          name: body.category,
          description: `Categoria criada automaticamente para ${body.category}`,
          color: '#D15556',
          icon: '',
          order: nextOrder,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        await serviceCategoriesCollection.insertOne(newCategory)
        console.log('✅ Categoria criada automaticamente:', body.category)
      } else {
        console.log('✅ Categoria encontrada:', body.category)
      }
    }
    
    const result = await servicesCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...body, 
          updatedAt: new Date() 
        } 
      }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }
    
    const updatedService = await servicesCollection.findOne({ _id: new ObjectId(id) })
    console.log('✅ Serviço atualizado com sucesso:', updatedService?.name)
    
    return NextResponse.json(updatedService)
  } catch (error) {
    console.error('❌ Erro ao atualizar serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    if (client) {
      await client.close()
      console.log('🔌 Conexão MongoDB fechada')
    }
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  
  try {
    const { id } = await params

    console.log('🗑️ Deletando serviço:', id)
    console.log('🔍 Tipo do ID:', typeof id)
    console.log('✅ ID válido:', ObjectId.isValid(id))
    
    // Validar se o ID é um ObjectId válido
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }
    
    // Conectar diretamente ao MongoDB
    client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()
    console.log('✅ Conectado ao banco de dados')
    
    const db = client.db('guapa')
    const servicesCollection = db.collection('services')
    
    // Verificar se o serviço existe antes de deletar
    console.log('🔍 Buscando serviço no banco...')
    const existingService = await servicesCollection.findOne({ _id: new ObjectId(id) })
    console.log('📋 Serviço encontrado:', existingService ? 'Sim' : 'Não')
    if (existingService) {
      console.log('📋 Detalhes do serviço:', {
        id: existingService._id,
        name: existingService.name,
        category: existingService.category
      })
    }
    
    if (!existingService) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }
    
    const result = await servicesCollection.deleteOne({ _id: new ObjectId(id) })
    console.log('🗑️ Serviço deletado:', result.deletedCount > 0 ? 'Sim' : 'Não')
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Erro ao deletar serviço' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ message: 'Serviço deletado com sucesso' })
  } catch (err: unknown) {
    console.error('❌ Erro ao deletar serviço:', err)
    if (err instanceof Error) {
      console.error('Stack trace:', err.stack)
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    if (client) {
      await client.close()
      console.log('🔌 Conexão MongoDB fechada')
    }
  }
}
