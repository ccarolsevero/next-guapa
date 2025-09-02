import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Prontuario from '@/models/Prontuario'
import Comanda from '@/models/Comanda'

// GET - Listar prontuários de um cliente
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const comandaId = searchParams.get('comandaId')
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'ID do cliente é obrigatório' },
        { status: 400 }
      )
    }

    let query: any = { clientId }
    
    if (comandaId) {
      query.comandaId = comandaId
    }

    const prontuarios = await Prontuario.find(query)
      .populate('professionalId', 'name')
      .populate('comandaId', 'dataInicio status')
      .sort({ dataAtendimento: -1 })

    return NextResponse.json({ prontuarios })

  } catch (error) {
    console.error('Erro ao buscar prontuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo prontuário
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const {
      clientId,
      comandaId,
      professionalId,
      historicoProcedimentos,
      reacoesEfeitos,
      recomendacoes,
      proximaSessao,
      observacoesAdicionais,
      servicosRealizados,
      produtosVendidos,
      valorTotal
    } = body

    // Validações
    if (!clientId || !comandaId || !professionalId || !historicoProcedimentos) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: clientId, comandaId, professionalId, historicoProcedimentos' },
        { status: 400 }
      )
    }

    // Verificar se já existe prontuário para esta comanda
    const existingProntuario = await Prontuario.findOne({ comandaId })
    if (existingProntuario) {
      return NextResponse.json(
        { error: 'Já existe prontuário para esta comanda' },
        { status: 400 }
      )
    }

    // Criar prontuário
    const prontuario = new Prontuario({
      clientId,
      comandaId,
      professionalId,
      historicoProcedimentos,
      reacoesEfeitos: reacoesEfeitos || '',
      recomendacoes: recomendacoes || '',
      proximaSessao: proximaSessao ? new Date(proximaSessao) : undefined,
      observacoesAdicionais: observacoesAdicionais || '',
      servicosRealizados: servicosRealizados || [],
      produtosVendidos: produtosVendidos || [],
      valorTotal: valorTotal || 0
    })

    await prontuario.save()

    // Atualizar comanda com status finalizada
    await Comanda.findByIdAndUpdate(comandaId, {
      status: 'finalizada',
      dataFim: new Date()
    })

    return NextResponse.json({
      message: 'Prontuário criado com sucesso',
      prontuario
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar prontuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar prontuário existente
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { prontuarioId, ...updateData } = body

    if (!prontuarioId) {
      return NextResponse.json(
        { error: 'ID do prontuário é obrigatório' },
        { status: 400 }
      )
    }

    const prontuario = await Prontuario.findByIdAndUpdate(
      prontuarioId,
      updateData,
      { new: true, runValidators: true }
    )

    if (!prontuario) {
      return NextResponse.json(
        { error: 'Prontuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Prontuário atualizado com sucesso',
      prontuario
    })

  } catch (error) {
    console.error('Erro ao atualizar prontuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
