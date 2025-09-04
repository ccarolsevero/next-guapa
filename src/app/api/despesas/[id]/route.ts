import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await connectToDatabase()
    const { id } = await params
    const body = await request.json()

    const { valor, categoria, observacao, tipo } = body

    // Validar campos obrigatórios
    if (!valor || !categoria || !tipo) {
      return NextResponse.json(
        { error: 'Valor, categoria e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    // Atualizar a despesa
    const result = await db.collection('despesas').updateOne(
      { _id: id },
      {
        $set: {
          valor: parseFloat(valor),
          categoria,
          observacao,
          tipo,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Despesa não encontrada' },
        { status: 404 }
      )
    }

    // Buscar a despesa atualizada
    const despesaAtualizada = await db.collection('despesas').findOne({ _id: id })

    return NextResponse.json({
      success: true,
      data: despesaAtualizada
    })

  } catch (error) {
    console.error('Erro ao editar despesa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await connectToDatabase()
    const { id } = await params

    const result = await db.collection('despesas').deleteOne({ _id: id })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Despesa não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Despesa excluída com sucesso'
    })

  } catch (error) {
    console.error('Erro ao excluir despesa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
