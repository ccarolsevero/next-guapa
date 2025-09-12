import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  let client;
  
  try {
    const { searchParams } = new URL(request.url)
    const professionalId = searchParams.get('professionalId')
    
    console.log('🔍 Buscando serviços do MongoDB (driver nativo)...')
    console.log('📡 MONGODB_URI:', process.env.MONGODB_URI ? 'Configurada' : 'NÃO CONFIGURADA')
    console.log('👤 ProfessionalId:', professionalId || 'Nenhum (todos os serviços)')
    
    // Conectar diretamente ao MongoDB
    client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()
    console.log('✅ Conectado ao banco de dados')
    
    const db = client.db('guapa')
    const servicesCollection = db.collection('services')
    
    // Verificar total de documentos
    const totalCount = await servicesCollection.countDocuments()
    console.log('📊 Total de documentos na coleção services:', totalCount)
    
    // Verificar documentos ativos
    const activeCount = await servicesCollection.countDocuments({ isActive: true })
    console.log('📊 Documentos ativos na coleção services:', activeCount)
    
    // Buscar um exemplo de documento
    const sampleDoc = await servicesCollection.findOne({})
    console.log('📋 Exemplo de documento:', sampleDoc ? {
      name: sampleDoc.name,
      isActive: sampleDoc.isActive,
      category: sampleDoc.category
    } : 'Nenhum documento encontrado')
    
    let services
    
    if (professionalId) {
      // Buscar serviços específicos do profissional
      const professionalsCollection = db.collection('professionals')
      
      // Tentar buscar por ObjectId primeiro, depois por nome
      let professional
      try {
        // Tentar como ObjectId
        professional = await professionalsCollection.findOne({ _id: new ObjectId(professionalId) })
      } catch (error) {
        // Se falhar, tentar buscar por nome (case insensitive)
        professional = await professionalsCollection.findOne({ 
          name: { $regex: new RegExp(professionalId, 'i') }
        })
      }
      
      if (!professional) {
        console.log('❌ Profissional não encontrado:', professionalId)
        return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 })
      }
      
      console.log('👤 Profissional encontrado:', professional.name)
      console.log('📋 Serviços do profissional:', professional.services)
      
      if (!professional.services || professional.services.length === 0) {
        console.log('❌ Profissional não tem serviços cadastrados')
        return NextResponse.json({ error: 'Profissional não tem serviços cadastrados' }, { status: 404 })
      }
      
      // Buscar serviços que correspondem aos nomes do profissional
      services = await servicesCollection.find({ 
        isActive: true,
        name: { $in: professional.services }
      }).sort({ category: 1, order: 1 }).toArray()
      
      console.log('✅ Serviços do profissional encontrados:', services.length)
    } else {
      // Buscar todos os serviços ativos
      console.log('🔍 Buscando todos os serviços ativos...')
      services = await servicesCollection.find({ isActive: true }).sort({ category: 1, order: 1 }).toArray()
      console.log('✅ Todos os serviços ativos encontrados:', services.length)
      
      // Debug: verificar se há serviços inativos também
      const allServices = await servicesCollection.find({}).sort({ category: 1, order: 1 }).toArray()
      console.log('📊 Total de serviços no banco (ativos + inativos):', allServices.length)
      
      if (allServices.length > 0) {
        console.log('📋 Primeiro serviço encontrado:', {
          name: allServices[0].name,
          isActive: allServices[0].isActive,
          category: allServices[0].category
        })
      }
    }
    
    if (services.length === 0) {
      console.log('❌ Nenhum serviço encontrado')
      return NextResponse.json({ error: 'Nenhum serviço encontrado' }, { status: 404 })
    }
    
    console.log('📦 Retornando serviços do banco:', services.length)
    return NextResponse.json(services)
  } catch (error) {
    console.error('❌ Erro ao buscar serviços:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  } finally {
    if (client) {
      await client.close()
      console.log('🔌 Conexão MongoDB fechada')
    }
  }
}

export async function POST(request: NextRequest) {
  let client;
  
  try {
    const body = await request.json()
    const { 
      name, 
      category, 
      description, 
      price, 
      duration, 
      breakTime, 
      allowOnlineBooking, 
      valueType, 
      cost, 
      returnDays, 
      order, 
      isFeatured, 
      isActive 
    } = body

    console.log('📝 Dados recebidos para novo serviço:', {
      name,
      category,
      description,
      price,
      duration,
      breakTime,
      allowOnlineBooking,
      valueType,
      cost,
      returnDays,
      order,
      isFeatured,
      isActive
    })
    console.log('Adicionando novo serviço no MongoDB...')
    
    // Conectar diretamente ao MongoDB
    client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()
    console.log('✅ Conectado ao banco de dados')
    
    const db = client.db('guapa')
    const servicesCollection = db.collection('services')
    const serviceCategoriesCollection = db.collection('servicecategories')
    
    // Verificar se já existe um serviço com o mesmo nome
    const existingService = await servicesCollection.findOne({ name })
    
    if (existingService) {
      return NextResponse.json(
        { error: 'Já existe um serviço com este nome' },
        { status: 400 }
      )
    }
    
    // Verificar se a categoria existe (opcional - se não existir, será criada automaticamente)
    if (category && category !== 'Geral') {
      const categoryExists = await serviceCategoriesCollection.findOne({ 
        name: category,
        isActive: true 
      })
      
      if (!categoryExists) {
        console.log('⚠️ Categoria não encontrada, criando automaticamente:', category)
        
        // Verificar qual é o próximo order
        const lastCategory = await serviceCategoriesCollection.findOne({}, { sort: { order: -1 } })
        const nextOrder = lastCategory ? lastCategory.order + 1 : 1
        
        // Criar categoria automaticamente se não existir
        const newCategory = {
          name: category,
          description: `Categoria criada automaticamente para ${category}`,
          color: '#D15556',
          icon: '',
          order: nextOrder,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        await serviceCategoriesCollection.insertOne(newCategory)
        console.log('✅ Categoria criada automaticamente:', category)
      } else {
        console.log('✅ Categoria encontrada:', category)
      }
    }
    
    const newService = {
      name: name || '',
      category: category || 'Geral',
      description: description || '',
      price: price || 0,
      duration: duration || 60,
      breakTime: breakTime || 0,
      allowOnlineBooking: allowOnlineBooking !== false,
      valueType: valueType || 'fixed',
      cost: cost || 0,
      returnDays: returnDays || 0,
      order: order || 0,
      isActive: isActive !== false,
      isFeatured: isFeatured || false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await servicesCollection.insertOne(newService)
    console.log('✅ Serviço adicionado com sucesso:', result.insertedId)
    console.log('📋 Serviço criado:', { ...newService, _id: result.insertedId })
    
    return NextResponse.json({ 
      success: true,
      message: 'Serviço criado com sucesso',
      service: { ...newService, _id: result.insertedId }
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao adicionar serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  } finally {
    if (client) {
      await client.close()
      console.log('🔌 Conexão MongoDB fechada')
    }
  }
}

export async function PUT(request: NextRequest) {
  let client;
  
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    console.log('Atualizando serviço no MongoDB...')
    
    // Conectar diretamente ao MongoDB
    client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()
    console.log('✅ Conectado ao banco de dados')
    
    const db = client.db('guapa')
    const servicesCollection = db.collection('services')
    
    const result = await servicesCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updateData, 
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
    console.log('Serviço atualizado com sucesso:', updatedService?._id)
    
    return NextResponse.json(updatedService)
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  } finally {
    if (client) {
      await client.close()
      console.log('🔌 Conexão MongoDB fechada')
    }
  }
}
export const dynamic = 'force-dynamic'
