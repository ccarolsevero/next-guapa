import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await connectToDatabase()
    const { id } = await params
    const body = await request.json()

    console.log('🔍 API PUT - ID recebido:', id)
    console.log('🔍 API PUT - Body recebido:', body)

    const { valor, categoria, observacao, tipo } = body

    // Validar campos obrigatórios
    if (!valor || !categoria || !tipo) {
      console.log('❌ API PUT - Campos obrigatórios faltando')
      return NextResponse.json(
        { error: 'Valor, categoria e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    // Converter string ID para ObjectId
    let objectId
    try {
      objectId = new ObjectId(id)
      console.log('🔍 API PUT - ObjectId criado:', objectId)
    } catch (error) {
      console.log('❌ API PUT - ID inválido:', id)
      return NextResponse.json(
        { error: 'ID de despesa inválido' },
        { status: 400 }
      )
    }

    // Verificar se a despesa existe antes de atualizar
    const despesaExistente = await db.collection('despesas').findOne({ _id: objectId })
    console.log('🔍 API PUT - Despesa existente:', despesaExistente)

    if (!despesaExistente) {
      console.log('❌ API PUT - Despesa não encontrada com ID:', id)
      return NextResponse.json(
        { error: 'Despesa não encontrada' },
        { status: 404 }
      )
    }

    // Atualizar a despesa
    const result = await db.collection('despesas').updateOne(
      { _id: objectId },
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

    console.log('🔍 API PUT - Resultado da atualização:', result)

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Despesa não encontrada' },
        { status: 404 }
      )
    }

    // Buscar a despesa atualizada
    const despesaAtualizada = await db.collection('despesas').findOne({ _id: objectId })

    return NextResponse.json({
      success: true,
      data: despesaAtualizada
    })

  } catch (error) {
    console.error('❌ Erro ao editar despesa:', error)
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

    console.log('🗑️ API DELETE - ID recebido:', id)

    // Converter string ID para ObjectId
    let objectId
    try {
      objectId = new ObjectId(id)
      console.log('🗑️ API DELETE - ObjectId criado:', objectId)
    } catch (error) {
      console.log('❌ API DELETE - ID inválido:', id)
      return NextResponse.json(
        { error: 'ID de despesa inválido' },
        { status: 400 }
      )
    }

    // Verificar se a despesa existe antes de excluir
    const despesaExistente = await db.collection('despesas').findOne({ _id: objectId })
    console.log('🗑️ API DELETE - Despesa existente:', despesaExistente)

    if (!despesaExistente) {
      console.log('❌ API DELETE - Despesa não encontrada com ID:', id)
      return NextResponse.json(
        { error: 'Despesa não encontrada' },
        { status: 404 }
      )
    }

    const result = await db.collection('despesas').deleteOne({ _id: objectId })

    console.log('🗑️ API DELETE - Resultado da exclusão:', result)

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
    console.error('❌ Erro ao excluir despesa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
