import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Service from '@/models/Service'

export async function GET() {
  try {
    console.log('Buscando serviços do MongoDB...')
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Configurada' : 'NÃO CONFIGURADA')
    
    await connectDB()
    const services = await Service.find({ isActive: true }).sort({ category: 1, order: 1 })
    console.log('Serviços encontrados:', services.length)
    
    if (services.length === 0) {
      console.log('Nenhum serviço encontrado no banco, usando fallback...')
      throw new Error('Nenhum serviço no banco')
    }
    
    return NextResponse.json(services)
  } catch (error) {
    console.error('Erro ao buscar serviços:', error)
    console.log('Usando dados de fallback...')
    
    // Fallback para dados estáticos
    const fallbackServices = [
      // Consultoria e Avaliação
      {
        _id: '1',
        name: 'Avaliação Capilar',
        category: 'Consultoria e Avaliação',
        description: 'Avaliação completa do couro cabeludo e fios para identificar necessidades específicas.',
        price: 60.00,
        isActive: true,
        order: 1
      },
      {
        _id: '2',
        name: 'Consultoria/Corte',
        category: 'Consultoria e Avaliação',
        description: 'Consultoria de visagismo + corte personalizado para valorizar seu tipo de cabelo.',
        price: 198.00,
        isActive: true,
        order: 2
      },
      {
        _id: '3',
        name: 'Avaliação + Tratamento',
        category: 'Consultoria e Avaliação',
        description: 'Avaliação + tratamento personalizado para resultados mais eficazes.',
        price: 140.00,
        isActive: true,
        order: 3
      },
      
      // Cortes
      {
        _id: '4',
        name: 'Corte',
        category: 'Cortes',
        description: 'Corte de cabelo com manutenção das pontas e acabamento profissional.',
        price: 132.00,
        isActive: true,
        order: 1
      },
      {
        _id: '5',
        name: 'Corte e Tratamento Keune',
        category: 'Cortes',
        description: 'Corte + tratamento premium Keune Care para fios mais saudáveis.',
        price: 198.00,
        isActive: true,
        order: 2
      },
      {
        _id: '6',
        name: 'Corte Infantil',
        category: 'Cortes',
        description: 'Cuidado especial para os pequenos, com paciência e carinho para deixar as crianças confortáveis.',
        price: 40.00,
        isActive: true,
        order: 3
      },
      {
        _id: '7',
        name: 'Acabamento',
        category: 'Cortes',
        description: 'Ajustes finos e definição para finalizar seu visual com perfeição e brilho.',
        price: 30.00,
        isActive: true,
        order: 4
      },
      
      // Colorimetria
      {
        _id: '8',
        name: 'Back To Natural - P',
        category: 'Colorimetria',
        description: 'Repigmentação de cabelos loiros para cabelos mais curtos.',
        price: 231.00,
        isActive: true,
        order: 1
      },
      {
        _id: '9',
        name: 'Back To Natural - M',
        category: 'Colorimetria',
        description: 'Repigmentação de cabelos loiros para cabelos médios.',
        price: 319.00,
        isActive: true,
        order: 2
      },
      {
        _id: '10',
        name: 'Back To Natural - G',
        category: 'Colorimetria',
        description: 'Repigmentação de cabelos loiros para cabelos longos.',
        price: 385.00,
        isActive: true,
        order: 3
      },
      {
        _id: '11',
        name: 'Iluminado P',
        category: 'Colorimetria',
        description: 'Iluminado para cabelos até o ombro com técnicas modernas.',
        price: 500.00,
        isActive: true,
        order: 4
      },
      {
        _id: '12',
        name: 'Iluminado M',
        category: 'Colorimetria',
        description: 'Iluminado para cabelos abaixo do ombro com brilho natural.',
        price: 605.00,
        isActive: true,
        order: 5
      },
      {
        _id: '13',
        name: 'Iluminado G',
        category: 'Colorimetria',
        description: 'Iluminado para cabelos longos com efeito deslumbrante.',
        price: 715.00,
        isActive: true,
        order: 6
      },
      {
        _id: '14',
        name: 'Mechas Coloridas',
        category: 'Colorimetria',
        description: 'Mechas localizadas coloridas ou platinadas para um visual único.',
        price: 250.00,
        isActive: true,
        order: 7
      },
      {
        _id: '15',
        name: 'Coloração Keune',
        category: 'Colorimetria',
        description: 'Cobertura de brancos com Tinta Color Keune de alta qualidade.',
        price: 121.00,
        isActive: true,
        order: 8
      },
      
      // Tratamentos Naturais
      {
        _id: '16',
        name: 'Hidratação Natural',
        category: 'Tratamentos Naturais',
        description: 'Hidratação com produtos naturais Keune para restaurar a umidade dos fios.',
        price: 80.00,
        isActive: true,
        order: 1
      },
      {
        _id: '17',
        name: 'Reconstrução Capilar',
        category: 'Tratamentos Naturais',
        description: 'Fortalece os fios danificados e restaura a estrutura capilar com proteínas naturais.',
        price: 120.00,
        isActive: true,
        order: 2
      },
      {
        _id: '18',
        name: 'Limpeza de Couro Cabeludo',
        category: 'Tratamentos Naturais',
        description: 'Limpeza profunda e desintoxicante do couro cabeludo para melhorar a saúde dos folículos.',
        price: 100.00,
        isActive: true,
        order: 3
      },
      {
        _id: '19',
        name: 'Tratamento Anti-Queda',
        category: 'Tratamentos Naturais',
        description: 'Tratamento específico para queda de cabelo com produtos naturais.',
        price: 150.00,
        isActive: true,
        order: 4
      },
      {
        _id: '20',
        name: 'Terapia Capilar Completa',
        category: 'Tratamentos Naturais',
        description: 'Pacote completo de tratamentos para máxima revitalização dos fios.',
        price: 200.00,
        isActive: true,
        order: 5
      }
    ]
    
    console.log('Usando dados de fallback')
    return NextResponse.json(fallbackServices)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, description, price, order, isFeatured } = body

    console.log('Adicionando novo serviço no MongoDB...')
    
    await connectDB()
    
    const newService = await Service.create({
      name,
      category,
      description,
      price,
      order: order || 0,
      isActive: true,
      isFeatured: isFeatured || false
    })
    
    console.log('Serviço adicionado com sucesso:', newService._id)
    
    return NextResponse.json(newService, { status: 201 })
  } catch (error) {
    console.error('Erro ao adicionar serviço:', error)
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

    console.log('Atualizando serviço no MongoDB...')
    
    await connectDB()
    
    const updatedService = await Service.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    
    if (!updatedService) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }
    
    console.log('Serviço atualizado com sucesso:', updatedService._id)
    
    return NextResponse.json(updatedService)
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}
