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
    const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not defined")
}
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
      isFinalizada: comanda.isFinalizada,
      clienteId: comanda.clienteId,
      clienteNome: comanda.clienteNome,
      profissionalId: comanda.profissionalId,
      valorTotal: comanda.valorTotal
    })
    console.log('🔍 Estrutura completa da comanda:', JSON.stringify(comanda, null, 2))

    // Verificar se a comanda já foi finalizada
    if (comanda.isFinalizada || comanda.status === 'finalizada') {
      console.log('❌ Comanda já foi finalizada anteriormente')
      return NextResponse.json(
        { 
          error: 'Esta comanda já foi finalizada e não pode ser finalizada novamente',
          comandaId: comandaId,
          dataFinalizacao: comanda.dataFinalizacao,
          status: comanda.status
        },
        { status: 409 }
      )
    }

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
          isFinalizada: true,
          dataFim: dataFim,
          valorFinal: finalizacaoData.valorFinal || comanda.valorTotal,
          desconto: finalizacaoData.desconto || 0,
          creditAmount: finalizacaoData.creditAmount || 0,
          valorSinal: finalizacaoData.valorSinal || 0,
          metodoPagamento: finalizacaoData.paymentMethod || finalizacaoData.metodoPagamento || 'dinheiro',
          dataFinalizacao: new Date()
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

    // 3. Obter nome do cliente
    console.log('👤 Obtendo nome do cliente...')
    console.log('🔍 comanda.clienteNome:', comanda.clienteNome)
    console.log('🔍 comanda.clienteId:', comanda.clienteId)
    
    let clienteNome = 'Cliente não encontrado'
    
    // Primeiro tenta usar o nome que já está na comanda
    if (comanda.clienteNome) {
      clienteNome = comanda.clienteNome
      console.log('✅ Nome do cliente obtido da comanda:', clienteNome)
    }
    // Se não tiver na comanda, busca no banco
    else if (comanda.clienteId) {
      try {
        console.log('🔍 Buscando cliente no banco com ID:', comanda.clienteId)
        const cliente = await db.collection('clients').findOne({ _id: new ObjectId(comanda.clienteId) })
        
        if (cliente) {
          clienteNome = cliente.name || cliente.nome || cliente.fullName || 'Nome não definido'
          console.log('✅ Cliente encontrado no banco:', clienteNome)
        } else {
          console.log('⚠️ Cliente não encontrado no banco')
        }
      } catch (error) {
        console.log('⚠️ Erro ao buscar cliente no banco:', error)
      }
    } else {
      console.log('⚠️ Comanda não tem clienteId nem clienteNome')
    }

    // 4. Obter nome do profissional
    console.log('👨‍💼 Obtendo nome do profissional...')
    let profissionalNome = 'Profissional não encontrado'
    
    try {
      const profissionalId = finalizacaoData.profissionalId || comanda.profissionalId
      console.log('🔍 Buscando profissional no banco com ID:', profissionalId)
      
      if (profissionalId) {
        const profissional = await db.collection('professionals').findOne({ _id: new ObjectId(profissionalId) })
        
        if (profissional) {
          profissionalNome = profissional.name || profissional.nome || profissional.fullName || 'Nome não definido'
          console.log('✅ Profissional encontrado no banco:', profissionalNome)
        } else {
          console.log('⚠️ Profissional não encontrado no banco')
        }
      } else {
        console.log('⚠️ Comanda não tem profissionalId')
      }
    } catch (error) {
      console.log('⚠️ Erro ao buscar profissional no banco:', error)
    }

    // 5. Salvar dados da finalização em uma nova coleção
    console.log('💳 Salvando dados da finalização...')
    
    // 5.1. Calcular comissões específicas dos serviços
    console.log('💰 Calculando comissões específicas dos serviços...')
    let totalComissao = 0
    const detalhesComissao: any[] = []
    
    if (comanda.servicos && Array.isArray(comanda.servicos)) {
      for (const servico of comanda.servicos) {
        try {
          // Buscar dados do serviço para obter comissões
          const serviceData = await db.collection('services').findOne({ 
            _id: new ObjectId(servico.servicoId || servico.id) 
          })
          
          if (serviceData && serviceData.commissions) {
            const valorServico = (servico.preco || 0) * (servico.quantidade || 1)
            const profissionalId = finalizacaoData.profissionalId || comanda.profissionalId
            
            // Buscar comissão específica para o profissional
            const comissaoData = serviceData.commissions.find((comm: any) => 
              comm.professionalId === profissionalId
            )
            
            // Verificar se o profissional é assistente
            const profissional = await db.collection('professionals').findOne({ _id: new ObjectId(profissionalId) })
            const isAssistant = profissional?.isAssistant || false
            
            let percentualComissao = 10 // Fallback para 10%
            if (comissaoData) {
              // Usar comissão de assistente se o profissional for assistente
              percentualComissao = isAssistant ? comissaoData.assistantCommission : comissaoData.commission
            }
            const comissao = valorServico * (percentualComissao / 100)
            
            totalComissao += comissao
            detalhesComissao.push({
              tipo: 'servico',
              item: servico.nome || 'Serviço',
              valor: valorServico,
              comissao: comissao,
              percentualComissao: percentualComissao,
              profissionalId: profissionalId,
              profissionalNome: profissionalNome
            })
            
            console.log(`💰 Comissão do serviço ${servico.nome}: ${percentualComissao}% = R$ ${comissao.toFixed(2)}`)
          } else {
            // Fallback para 10% se não conseguir buscar o serviço
            const valorServico = (servico.preco || 0) * (servico.quantidade || 1)
            const comissao = valorServico * 0.10
            totalComissao += comissao
            detalhesComissao.push({
              tipo: 'servico',
              item: servico.nome || 'Serviço',
              valor: valorServico,
              comissao: comissao,
              percentualComissao: 10,
              profissionalId: finalizacaoData.profissionalId || comanda.profissionalId,
              profissionalNome: profissionalNome
            })
          }
        } catch (error) {
          console.error('Erro ao calcular comissão do serviço:', error)
          // Fallback para 10%
          const valorServico = (servico.preco || 0) * (servico.quantidade || 1)
          const comissao = valorServico * 0.10
          totalComissao += comissao
          detalhesComissao.push({
            tipo: 'servico',
            item: servico.nome || 'Serviço',
            valor: valorServico,
            comissao: comissao,
            percentualComissao: 10,
            profissionalId: finalizacaoData.profissionalId || comanda.profissionalId,
            profissionalNome: profissionalNome
          })
        }
      }
    }
    
    // Calcular comissões dos produtos (15% para quem vendeu)
    if (comanda.produtos && Array.isArray(comanda.produtos)) {
      for (const produto of comanda.produtos) {
        const valorProduto = (produto.preco || 0) * (produto.quantidade || 1)
        const comissao = valorProduto * 0.15
        totalComissao += comissao
        detalhesComissao.push({
          tipo: 'produto',
          item: produto.nome || 'Produto',
          valor: valorProduto,
          comissao: comissao,
          percentualComissao: 15,
          vendidoPor: produto.vendidoPor || 'Não definido',
          vendidoPorId: produto.vendidoPorId
        })
      }
    }
    
    console.log(`💰 Total de comissões calculado: R$ ${totalComissao.toFixed(2)}`)

    // Preparar dados da finalização
    const dadosFinalizacao = {
      comandaId: new ObjectId(comandaId),
      clienteId: finalizacaoData.clienteId || comanda.clienteId,
      clienteNome: clienteNome,
      profissionalId: finalizacaoData.profissionalId || comanda.profissionalId,
      profissionalNome: profissionalNome,
      valorFinal: finalizacaoData.valorFinal || comanda.valorTotal,
      metodoPagamento: finalizacaoData.paymentMethod || finalizacaoData.metodoPagamento || 'Não definido',
      desconto: finalizacaoData.desconto || 0,
      creditAmount: finalizacaoData.creditAmount || 0,
      totalComissao: totalComissao,
      detalhesComissao: detalhesComissao,
      valorSinal: finalizacaoData.valorSinal || 0,
      servicos: finalizacaoData.servicos || comanda.servicos || [],
      produtos: finalizacaoData.produtos || comanda.produtos || [],
      dataCriacao: new Date(),
      status: 'ativo'
    }
    
    console.log('📋 Dados da finalização a serem salvos:', dadosFinalizacao)
    
    const finalizacaoResult = await db.collection('finalizacoes').insertOne(dadosFinalizacao)
    console.log('✅ Finalização salva:', finalizacaoResult.insertedId)

    // 6. Atualizar faturamento do dia (criar ou atualizar registro)
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

    // 7. Salvar comissões dos profissionais
    if (finalizacaoData.detalhesComissao && Array.isArray(finalizacaoData.detalhesComissao) && finalizacaoData.detalhesComissao.length > 0) {
      console.log('💰 Salvando comissões:', finalizacaoData.detalhesComissao.length)
      
      for (const detalhe of finalizacaoData.detalhesComissao) {
        try {
          console.log('🔍 Processando detalhe:', detalhe)
          
          // Determinar o profissional correto para cada item
          let profissionalId
          
          if (detalhe.tipo === 'Produto' && detalhe.vendidoPor && detalhe.vendidoPor !== 'Não definido') {
            // Para produtos, buscar o profissional pelo nome
            if (typeof detalhe.vendidoPor === 'string') {
              const profissional = await db.collection('professionals').findOne({ name: detalhe.vendidoPor })
              if (profissional) {
                profissionalId = profissional._id
                console.log(`🛍️ Produto ${detalhe.item} - Comissão para vendedor: ${detalhe.vendidoPor} (ID: ${profissionalId})`)
              } else {
                console.log(`⚠️ Profissional não encontrado: ${detalhe.vendidoPor}, usando profissional da comanda`)
                profissionalId = new ObjectId(dadosFinalizacao.profissionalId)
              }
            } else if (ObjectId.isValid(detalhe.vendidoPor)) {
              // Se vendidoPor for um ObjectId válido
              profissionalId = new ObjectId(detalhe.vendidoPor)
              console.log(`🛍️ Produto ${detalhe.item} - Comissão para vendedor ID: ${detalhe.vendidoPor}`)
            } else {
              console.log(`⚠️ VendidoPor inválido: ${detalhe.vendidoPor}, usando profissional da comanda`)
              profissionalId = new ObjectId(dadosFinalizacao.profissionalId)
            }
          } else {
            // Para serviços, usar o profissional da comanda
            profissionalId = new ObjectId(dadosFinalizacao.profissionalId)
            console.log(`✂️ Serviço ${detalhe.item} - Comissão para profissional: ${dadosFinalizacao.profissionalId}`)
          }
          
          await db.collection('comissoes').insertOne({
            comandaId: new ObjectId(comandaId),
            profissionalId: profissionalId,
            tipo: detalhe.tipo || 'Serviço',
            item: detalhe.item || 'Item não especificado',
            valor: detalhe.valor || 0,
            comissao: detalhe.comissao || 0,
            vendidoPor: detalhe.vendidoPor,
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
      console.log('ℹ️ Nenhuma comissão para salvar - detalhesComissao:', finalizacaoData.detalhesComissao)
    }

    // 8. Atualizar histórico do cliente
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
              } as any
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

    // 7. Salvar prontuário se houver dados
    console.log('📋 Verificando se deve salvar prontuário...')
    
    if (finalizacaoData.historicoProcedimentos || finalizacaoData.observacoes || finalizacaoData.recomendacoes) {
      console.log('📋 Verificando se já existe prontuário para esta comanda...')
      
      // Verificar se já existe prontuário para esta comanda
      const prontuarioExistente = await db.collection('prontuarios').findOne({
        comandaId: new ObjectId(comandaId)
      })
      
      if (prontuarioExistente) {
        console.log('ℹ️ Prontuário já existe para esta comanda, pulando criação')
      } else {
        console.log('📋 Salvando prontuário...')
        
        const prontuarioData = {
          clientId: comanda.clienteId.toString(), // Garantir que seja string
          comandaId: new ObjectId(comandaId),
          professionalId: comanda.profissionalId.toString(), // Garantir que seja string
          dataAtendimento: new Date(),
          historicoProcedimentos: finalizacaoData.historicoProcedimentos || finalizacaoData.observacoes || 'Procedimentos realizados conforme comanda',
          reacoesEfeitos: finalizacaoData.reacoesEfeitos || '',
          recomendacoes: finalizacaoData.recomendacoes || '',
          proximaSessao: finalizacaoData.proximaSessao ? new Date(finalizacaoData.proximaSessao) : null,
          observacoesAdicionais: finalizacaoData.observacoesAdicionais || '',
          servicosRealizados: comanda.servicos?.map((servico: any) => ({
            servicoId: servico.servicoId || servico.id,
            nome: servico.nome || servico.name,
            preco: servico.preco || servico.price || 0,
            quantidade: servico.quantidade || 1
          })) || [],
          produtosVendidos: comanda.produtos?.map((produto: any) => ({
            produtoId: produto.produtoId || produto.id,
            nome: produto.nome || produto.name,
            preco: produto.preco || produto.price || 0,
            quantidade: produto.quantidade || 1,
            vendidoPor: produto.vendidoPor || produto.vendidoPorId
          })) || [],
          valorTotal: dadosFinalizacao.valorFinal,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        console.log('📋 Dados do prontuário:', prontuarioData)
        
        try {
          const prontuarioResult = await db.collection('prontuarios').insertOne(prontuarioData)
          console.log('✅ Prontuário salvo com sucesso:', prontuarioResult.insertedId)
        } catch (prontuarioError) {
          console.error('❌ Erro ao salvar prontuário:', prontuarioError)
          // Não falhar a finalização por causa do prontuário
        }
      }
    } else {
      console.log('ℹ️ Nenhum dado de prontuário fornecido, pulando criação do prontuário')
    }

    // 8. Descontar créditos do cliente se foi usado
    if (finalizacaoData.creditAmount && finalizacaoData.creditAmount > 0 && comanda.clienteId) {
      console.log('💰 Descontando créditos do cliente:', finalizacaoData.creditAmount)
      
      try {
        const creditUpdateResult = await db.collection('clients').updateOne(
          { _id: new ObjectId(comanda.clienteId) },
          {
            $inc: { credits: -finalizacaoData.creditAmount },
            $push: {
              creditHistory: {
                amount: -finalizacaoData.creditAmount,
                type: 'comanda_usage',
                description: `Uso de créditos na comanda ${comandaId}`,
                comandaId: comandaId,
                createdAt: new Date()
              } as any
            }
          }
        )
        
        console.log('✅ Créditos descontados do cliente:', creditUpdateResult.modifiedCount > 0)
      } catch (creditError) {
        console.error('❌ Erro ao descontar créditos:', creditError)
        // Não falhar a finalização por causa dos créditos
      }
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
export const dynamic = 'force-dynamic'
