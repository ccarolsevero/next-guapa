import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  let client: any = null
  
  try {
    console.log('🔄 API de finalização chamada')
    
    const body = await request.json()
    console.log('📦 Body recebido:', body)
    
    const { comandaId, finalizacaoData } = body
    
    if (!comandaId || !finalizacaoData) {
      console.error('❌ Dados inválidos:', { comandaId, finalizacaoData })
      return NextResponse.json(
        { error: 'Comanda ID e dados de finalização são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar se comandaId é um ObjectId válido
    if (!ObjectId.isValid(comandaId)) {
      console.error('❌ ComandaId inválido:', comandaId)
      return NextResponse.json(
        { error: 'ID da comanda inválido' },
        { status: 400 }
      )
    }

    // Validar campos obrigatórios
    const camposObrigatorios = ['clienteId', 'profissionalId', 'valorFinal', 'paymentMethod']
    for (const campo of camposObrigatorios) {
      if (!finalizacaoData[campo]) {
        console.error(`❌ Campo obrigatório ausente: ${campo}`)
        return NextResponse.json(
          { error: `Campo obrigatório ausente: ${campo}` },
          { status: 400 }
        )
      }
    }

    // Validar se clienteId e profissionalId são ObjectIds válidos
    if (!ObjectId.isValid(finalizacaoData.clienteId)) {
      console.error('❌ ClienteId inválido:', finalizacaoData.clienteId)
      return NextResponse.json(
        { error: 'ID do cliente inválido' },
        { status: 400 }
      )
    }

    if (!ObjectId.isValid(finalizacaoData.profissionalId)) {
      console.error('❌ ProfissionalId inválido:', finalizacaoData.profissionalId)
      return NextResponse.json(
        { error: 'ID do profissional inválido' },
        { status: 400 }
      )
    }

    // Conectar ao MongoDB
    const { MongoClient } = await import('mongodb')
    const uri = process.env.MONGODB_URI!
    client = new MongoClient(uri)
    await client.connect()
    const db = client.db(process.env.DB_NAME || 'guapa')
    
    console.log('🔄 Finalizando comanda:', comandaId)
    console.log('💰 Dados da finalização:', finalizacaoData)
    console.log('🔍 Tipo do comandaId:', typeof comandaId)
    console.log('🔍 ComandaId é string válida?', comandaId && comandaId.length > 0)

    // 1. Atualizar status da comanda para 'finalizada'
    console.log('🔄 Atualizando comanda no banco...')
    console.log('🔍 Query de busca:', { _id: new ObjectId(comandaId) })
    
    // Garantir que dataFim seja uma data válida
    const dataFim = finalizacaoData.dataFim ? new Date(finalizacaoData.dataFim) : new Date()
    
    console.log('🔍 Dados para atualizar:', { 
      status: 'finalizada',
      dataFim: dataFim,
      valorFinal: finalizacaoData.valorFinal,
      desconto: finalizacaoData.desconto || 0,
      creditAmount: finalizacaoData.creditAmount || 0
    })
    
    const comandaUpdateResult = await db.collection('comandas').updateOne(
      { _id: new ObjectId(comandaId) },
      { 
        $set: { 
          status: 'finalizada',
          dataFim: dataFim,
          valorFinal: finalizacaoData.valorFinal,
          desconto: finalizacaoData.desconto || 0,
          creditAmount: finalizacaoData.creditAmount || 0
        }
      }
    )
    
    console.log('✅ Resultado da atualização da comanda:', comandaUpdateResult)

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
    console.log('🔄 Atualizando faturamento do dia...')
    const hoje = new Date()
    const dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
    const dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59)
    
    console.log('📅 Data início:', dataInicio.toISOString())
    console.log('📅 Data fim:', dataFim.toISOString())
    console.log('💰 Valor para somar:', finalizacaoData.valorFinal)

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
          totalComissoes: finalizacaoData.totalComissao || 0,
          quantidadeComandas: 1
        },
        $setOnInsert: { 
          data: dataInicio,
          dataCriacao: new Date()
        }
      },
      { upsert: true }
    )
    
    console.log('✅ Resultado da atualização do faturamento:', faturamentoResult)

    // 4. Salvar comissões dos profissionais
    if (finalizacaoData.detalhesComissao && Array.isArray(finalizacaoData.detalhesComissao) && finalizacaoData.detalhesComissao.length > 0) {
      console.log('💰 Salvando comissões:', finalizacaoData.detalhesComissao.length)
      
      for (const detalhe of finalizacaoData.detalhesComissao) {
        try {
          // Validar se vendidoPor é um ObjectId válido
          let vendidoPorId
          if (detalhe.vendidoPor && detalhe.vendidoPor !== 'Não definido' && ObjectId.isValid(detalhe.vendidoPor)) {
            vendidoPorId = new ObjectId(detalhe.vendidoPor)
          } else {
            vendidoPorId = new ObjectId(finalizacaoData.profissionalId)
          }
          
          await db.collection('comissoes').insertOne({
            comandaId: new ObjectId(comandaId),
            profissionalId: new ObjectId(finalizacaoData.profissionalId),
            tipo: detalhe.tipo || 'Serviço',
            item: detalhe.item || 'Item não especificado',
            valor: detalhe.valor || 0,
            comissao: detalhe.comissao || 0,
            vendidoPor: vendidoPorId,
            data: new Date(),
            status: 'pendente'
          })
        } catch (comissaoError) {
          console.error('❌ Erro ao salvar comissão:', comissaoError)
          console.error('❌ Detalhe da comissão:', detalhe)
        }
      }
    } else {
      console.log('ℹ️ Nenhuma comissão para salvar')
    }

    // 5. Atualizar histórico do cliente
    try {
      console.log('🔄 Atualizando histórico do cliente:', finalizacaoData.clienteId)
      
      await db.collection('clientes').updateOne(
        { _id: new ObjectId(finalizacaoData.clienteId) },
        { 
          $push: { 
            historico: {
              tipo: 'comanda_finalizada',
              comandaId: new ObjectId(comandaId),
              data: new Date(),
              valor: finalizacaoData.valorFinal,
              servicos: finalizacaoData.servicos || [],
              produtos: finalizacaoData.produtos || []
            }
          },
          $inc: { 
            totalGasto: finalizacaoData.valorFinal,
            quantidadeVisitas: 1
          }
        }
      )
      
      console.log('✅ Histórico do cliente atualizado com sucesso')
    } catch (clienteError) {
      console.error('❌ Erro ao atualizar histórico do cliente:', clienteError)
      // Não falhar a finalização por causa do histórico
    }

    console.log('✅ Comanda finalizada com sucesso!')
    console.log('💰 Faturamento atualizado:', faturamentoResult)
    console.log('💳 Comissões salvas:', finalizacaoData.detalhesComissao?.length || 0)

    // Fechar conexão
    await client.close()

    return NextResponse.json({
      success: true,
      message: 'Comanda finalizada com sucesso',
      finalizacaoId: finalizacaoResult.insertedId,
      faturamentoAtualizado: faturamentoResult.modifiedCount > 0 || faturamentoResult.upsertedCount > 0
    })

  } catch (error) {
    console.error('❌ Erro ao finalizar comanda:', error)
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'N/A')
    console.error('❌ Tipo do erro:', typeof error)
    
    // Fechar conexão em caso de erro também
    if (client) {
      try {
        await client.close()
      } catch (closeError) {
        console.error('❌ Erro ao fechar conexão:', closeError)
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor ao finalizar comanda',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
