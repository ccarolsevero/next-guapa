import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const { comandaId, finalizacaoData } = await request.json()
    
    if (!comandaId || !finalizacaoData) {
      return NextResponse.json(
        { error: 'Comanda ID e dados de finalização são obrigatórios' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    
    console.log('🔄 Finalizando comanda:', comandaId)
    console.log('💰 Dados da finalização:', finalizacaoData)

    // 1. Atualizar status da comanda para 'finalizada'
    const comandaUpdateResult = await db.collection('comandas').updateOne(
      { _id: new ObjectId(comandaId) },
      { 
        $set: { 
          status: 'finalizada',
          dataFim: finalizacaoData.dataFim,
          valorFinal: finalizacaoData.valorFinal,
          desconto: finalizacaoData.desconto,
          creditAmount: finalizacaoData.creditAmount || 0
        }
      }
    )

    if (comandaUpdateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Comanda não encontrada' },
        { status: 404 }
      )
    }

    // 2. Salvar dados da finalização em uma nova coleção
    const finalizacaoResult = await db.collection('finalizacoes').insertOne({
      ...finalizacaoData,
      dataCriacao: new Date(),
      status: 'ativo'
    })

    // 3. Atualizar faturamento do dia (criar ou atualizar registro)
    const hoje = new Date()
    const dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
    const dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59)

    const faturamentoResult = await db.collection('faturamento').updateOne(
      { 
        data: { 
          $gte: dataInicio, 
          $lte: dataFim 
        } 
      },
      { 
        $inc: { 
          valorTotal: finalizacaoData.valorFinal,
          totalComissoes: finalizacaoData.totalComissao,
          quantidadeComandas: 1
        },
        $setOnInsert: { 
          data: dataInicio,
          dataCriacao: new Date()
        }
      },
      { upsert: true }
    )

    // 4. Salvar comissões dos profissionais
    if (finalizacaoData.detalhesComissao && finalizacaoData.detalhesComissao.length > 0) {
      for (const detalhe of finalizacaoData.detalhesComissao) {
        await db.collection('comissoes').insertOne({
          comandaId: new ObjectId(comandaId),
          profissionalId: new ObjectId(finalizacaoData.profissionalId),
          tipo: detalhe.tipo,
          item: detalhe.item,
          valor: detalhe.valor,
          comissao: detalhe.comissao,
          vendidoPor: detalhe.vendidoPor ? new ObjectId(detalhe.vendidoPor) : new ObjectId(finalizacaoData.profissionalId),
          data: new Date(),
          status: 'pendente'
        })
      }
    }

    // 5. Atualizar histórico do cliente
    await db.collection('clientes').updateOne(
      { _id: new ObjectId(finalizacaoData.clienteId) },
      { 
        $push: { 
          historico: {
            tipo: 'comanda_finalizada',
            comandaId: new ObjectId(comandaId),
            data: new Date(),
            valor: finalizacaoData.valorFinal,
            servicos: finalizacaoData.servicos,
            produtos: finalizacaoData.produtos
          }
        },
        $inc: { 
          totalGasto: finalizacaoData.valorFinal,
          quantidadeVisitas: 1
        }
      }
    )

    console.log('✅ Comanda finalizada com sucesso!')
    console.log('💰 Faturamento atualizado:', faturamentoResult)
    console.log('💳 Comissões salvas:', finalizacaoData.detalhesComissao?.length || 0)

    return NextResponse.json({
      success: true,
      message: 'Comanda finalizada com sucesso',
      finalizacaoId: finalizacaoResult.insertedId,
      faturamentoAtualizado: faturamentoResult.modifiedCount > 0 || faturamentoResult.upsertedCount > 0
    })

  } catch (error) {
    console.error('❌ Erro ao finalizar comanda:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ao finalizar comanda' },
      { status: 500 }
    )
  }
}
