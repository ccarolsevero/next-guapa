import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  let client: MongoClient | null = null
  
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

    // Conectar ao MongoDB
    const uri = process.env.MONGODB_URI!
    client = new MongoClient(uri)
    await client.connect()
    const db = client.db(process.env.DB_NAME || 'guapa')
    
    console.log('🔄 Finalizando comanda:', comandaId)
    console.log('💰 Dados da finalização:', finalizacaoData)

    // 1. Buscar a comanda para obter dados necessários
    console.log('🔍 Buscando comanda no banco...')
    const comanda = await db.collection('comandas').findOne({ _id: new ObjectId(comandaId) })
    
    if (!comanda) {
      console.error('❌ Comanda não encontrada:', comandaId)
      return NextResponse.json(
        { error: 'Comanda não encontrada' },
        { status: 404 }
      )
    }

    console.log('✅ Comanda encontrada:', {
      status: comanda.status,
      clienteId: comanda.clienteId,
      profissionalId: comanda.profissionalId,
      valorTotal: comanda.valorTotal
    })

    // 2. Atualizar status da comanda para 'finalizada'
    console.log('🔄 Atualizando comanda no banco...')
    
    // Garantir que dataFim seja uma data válida
    const dataFim = finalizacaoData.dataFim ? new Date(finalizacaoData.dataFim) : new Date()
    
    console.log('🔍 Dados para atualizar:', { 
      status: 'finalizada',
      dataFim: dataFim,
      valorFinal: finalizacaoData.valorFinal || comanda.valorTotal,
      desconto: finalizacaoData.desconto || 0,
      creditAmount: finalizacaoData.creditAmount || 0
    })
    
    const comandaUpdateResult = await db.collection('comandas').updateOne(
      { _id: new ObjectId(comandaId) },
      { 
        $set: { 
          status: 'finalizada',
          dataFim: dataFim,
          valorFinal: finalizacaoData.valorFinal || comanda.valorTotal,
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

    // 3. Salvar dados da finalização em uma nova coleção
    console.log('💳 Salvando dados da finalização...')
    
    // Preparar dados da finalização
    const dadosFinalizacao = {
      comandaId: new ObjectId(comandaId),
      clienteId: finalizacaoData.clienteId || comanda.clienteId,
      profissionalId: finalizacaoData.profissionalId || comanda.profissionalId,
      valorFinal: finalizacaoData.valorFinal || comanda.valorTotal,
      metodoPagamento: finalizacaoData.paymentMethod || finalizacaoData.metodoPagamento || 'Não definido',
      desconto: finalizacaoData.desconto || 0,
      creditAmount: finalizacaoData.creditAmount || 0,
      totalComissao: finalizacaoData.totalComissao || 0,
      servicos: finalizacaoData.servicos || comanda.servicos || [],
      produtos: finalizacaoData.produtos || comanda.produtos || [],
      dataCriacao: new Date(),
      status: 'ativo'
    }
    
    console.log('📋 Dados da finalização a serem salvos:', dadosFinalizacao)
    
    const finalizacaoResult = await db.collection('finalizacoes').insertOne(dadosFinalizacao)
    console.log('✅ Finalização salva:', finalizacaoResult.insertedId)

    // 4. Atualizar faturamento do dia (criar ou atualizar registro)
    console.log('🔄 Atualizando faturamento do dia...')
    const hoje = new Date()
    const dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
    const dataFimFaturamento = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59)
    
    console.log('📅 Data início:', dataInicio.toISOString())
    console.log('📅 Data fim:', dataFimFaturamento.toISOString())
    console.log('💰 Valor para somar:', dadosFinalizacao.valorFinal)

    const faturamentoResult = await db.collection('faturamento').updateOne(
      { 
        data: { 
          $gte: dataInicio, 
          $lte: dataFimFaturamento 
        } 
      },
      { 
        $inc: { 
          valorTotal: dadosFinalizacao.valorFinal,
          totalComissoes: dadosFinalizacao.totalComissao || 0,
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

    // 5. Salvar comissões dos profissionais
    if (finalizacaoData.detalhesComissao && Array.isArray(finalizacaoData.detalhesComissao) && finalizacaoData.detalhesComissao.length > 0) {
      console.log('💰 Salvando comissões:', finalizacaoData.detalhesComissao.length)
      
      for (const detalhe of finalizacaoData.detalhesComissao) {
        try {
          // Determinar o profissional correto para cada item
          let profissionalId
          if (detalhe.tipo === 'Produto' && detalhe.vendidoPor && detalhe.vendidoPor !== 'Não definido' && ObjectId.isValid(detalhe.vendidoPor)) {
            // Para produtos, usar o vendidoPor
            profissionalId = new ObjectId(detalhe.vendidoPor)
            console.log(`🛍️ Produto ${detalhe.item} - Comissão para vendedor: ${detalhe.vendidoPor}`)
          } else {
            // Para serviços, usar o profissional da comanda
            profissionalId = new ObjectId(dadosFinalizacao.profissionalId)
            console.log(`✂️ Serviço ${detalhe.item} - Comissão para profissional: ${dadosFinalizacao.profissionalId}`)
          }
          
          await db.collection('comissoes').insertOne({
            comandaId: new ObjectId(comandaId),
            profissionalId: profissionalId, // Usar o profissional correto
            tipo: detalhe.tipo || 'Serviço',
            item: detalhe.item || 'Item não especificado',
            valor: detalhe.valor || 0,
            comissao: detalhe.comissao || 0,
            vendidoPor: detalhe.vendidoPor ? new ObjectId(detalhe.vendidoPor) : null,
            data: new Date(),
            status: 'pendente'
          })
          
          console.log(`✅ Comissão salva para: ${detalhe.item} - Profissional: ${profissionalId}`)
        } catch (comissaoError) {
          console.error('❌ Erro ao salvar comissão:', comissaoError)
          console.error('❌ Detalhe da comissão:', detalhe)
        }
      }
    } else {
      console.log('ℹ️ Nenhuma comissão para salvar')
    }

    // 6. Atualizar histórico do cliente
    try {
      console.log('🔄 Atualizando histórico do cliente:', dadosFinalizacao.clienteId)
      
      if (dadosFinalizacao.clienteId) {
        await db.collection('clientes').updateOne(
          { _id: new ObjectId(dadosFinalizacao.clienteId) },
          { 
            $push: { 
              historico: {
                tipo: 'comanda_finalizada',
                comandaId: new ObjectId(comandaId),
                data: new Date(),
                valor: dadosFinalizacao.valorFinal,
                servicos: dadosFinalizacao.servicos || [],
                produtos: dadosFinalizacao.produtos || []
              }
            },
            $inc: { 
              totalGasto: dadosFinalizacao.valorFinal,
              quantidadeVisitas: 1
            }
          }
        )
        
        console.log('✅ Histórico do cliente atualizado com sucesso')
      } else {
        console.log('⚠️ Cliente ID não encontrado, pulando atualização do histórico')
      }
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
