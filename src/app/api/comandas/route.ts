import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Comanda from '@/models/Comanda'

// GET - Listar comandas
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')
    const professionalId = searchParams.get('professionalId')
    
    let query: any = {}
    
    if (status) query.status = status
    if (clientId) query.clientId = clientId
    if (professionalId) query.professionalId = professionalId

    const comandas = await Comanda.find(query)
      .populate('clientId', 'name phone email')
      .populate('professionalId', 'name')
      .sort({ createdAt: -1 })

    return NextResponse.json({ comandas })

  } catch (error) {
    console.error('Erro ao buscar comandas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova comanda
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const {
      clientId,
      professionalId,
      status,
      servicos,
      produtos,
      observacoes,
      valorTotal
    } = body

    // Validações
    if (!clientId || !professionalId || !servicos || servicos.length === 0) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: clientId, professionalId, servicos' },
        { status: 400 }
      )
    }

    // Criar comanda
    const comanda = new Comanda({
      clientId,
      professionalId,
      status: status || 'em_atendimento',
      servicos,
      produtos: produtos || [],
      observacoes: observacoes || '',
      valorTotal: valorTotal || 0
    })

    await comanda.save()

    // Retornar comanda criada com dados populados
    const comandaPopulada = await Comanda.findById(comanda._id)
      .populate('clientId', 'name phone email')
      .populate('professionalId', 'name')

    return NextResponse.json({
      message: 'Comanda criada com sucesso',
      comanda: comandaPopulada
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar comanda:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar comanda existente
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { comandaId, ...updateData } = body

    if (!comandaId) {
      return NextResponse.json(
        { error: 'ID da comanda é obrigatório' },
        { status: 400 }
      )
    }

    const comanda = await Comanda.findByIdAndUpdate(
      comandaId,
      updateData,
      { new: true, runValidators: true }
    ).populate('clientId', 'name phone email')
     .populate('professionalId', 'name')

    if (!comanda) {
      return NextResponse.json(
        { error: 'Comanda não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Comanda atualizada com sucesso',
      comanda
    })

  } catch (error) {
    console.error('Erro ao atualizar comanda:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
