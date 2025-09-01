import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Professional from '@/models/Professional'

export async function GET() {
  try {
    console.log('Buscando profissionais do MongoDB...')
    
    await connectDB()
    const professionals = await Professional.find({}).sort({ name: 1 })
    console.log('Profissionais encontrados:', professionals.length)
    
    return NextResponse.json(professionals)
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error)
    
    // Fallback para dados de teste
    const testProfessionals = [
      {
        _id: '1',
        name: 'Bruna',
        title: 'Cabeleireira',
        email: 'bruna@guapa.com',
        phone: '(19) 99999-9999',
        shortDescription: 'Especialista em coloração e tratamentos capilares',
        fullDescription: 'Bruna é uma profissional experiente e dedicada aos cuidados capilares. Especialista em coloração, tratamentos e cortes modernos. Com anos de experiência, ela oferece serviços personalizados para cada cliente.',
        services: ['Coloração', 'Tratamentos', 'Cortes', 'Hidratação', 'Escova'],
        featuredServices: ['Coloração', 'Tratamentos'],
        profileImage: '/assents/fotobruna.jpeg',
        gallery: [
          '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16.jpeg',
          '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (1).jpeg',
          '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (2).jpeg'
        ],
        isActive: true,
        isFeatured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        name: 'Cicera',
        title: 'Cabeleireira',
        email: 'cicera@guapa.com',
        phone: '(19) 88888-8888',
        shortDescription: 'Especialista em penteados e maquiagem',
        fullDescription: 'Cicera é especialista em penteados, maquiagem e tratamentos capilares. Com técnica apurada e criatividade, ela transforma o visual de suas clientes com penteados únicos e maquiagens deslumbrantes.',
        services: ['Penteados', 'Maquiagem', 'Tratamentos', 'Escova', 'Finalização'],
        featuredServices: ['Penteados', 'Maquiagem'],
        profileImage: '/assents/fotobruna.jpeg',
        gallery: [
          '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (3).jpeg',
          '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (4).jpeg'
        ],
        isActive: true,
        isFeatured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    console.log('Usando dados de teste como fallback')
    return NextResponse.json(testProfessionals)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      title, 
      email, 
      phone, 
      shortDescription, 
      fullDescription, 
      services, 
      featuredServices,
      profileImage, 
      gallery 
    } = body

    console.log('Adicionando novo profissional no MongoDB...')
    
    await connectDB()
    
    const newProfessional = await Professional.create({
      name,
      title: title || 'Cabeleireira',
      email,
      phone,
      shortDescription: shortDescription || 'Especialista em tratamentos capilares',
      fullDescription: fullDescription || 'Profissional experiente e dedicada aos cuidados capilares',
      services: services || [],
      featuredServices: featuredServices || [],
      profileImage: profileImage || '/assents/fotobruna.jpeg',
      gallery: gallery || [],
      isActive: true,
      isFeatured: false
    })
    
    console.log('Profissional adicionado com sucesso:', newProfessional._id)
    
    return NextResponse.json(newProfessional, { status: 201 })
  } catch (error) {
    console.error('Erro ao adicionar profissional:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    console.log('Atualizando profissional no MongoDB...')
    
    await connectDB()
    
    const updatedProfessional = await Professional.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
    
    if (!updatedProfessional) {
      return NextResponse.json(
        { error: 'Profissional não encontrado' },
        { status: 404 }
      )
    }
    
    console.log('Profissional atualizado com sucesso:', updatedProfessional._id)
    
    return NextResponse.json(updatedProfessional)
  } catch (error) {
    console.error('Erro ao atualizar profissional:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}
