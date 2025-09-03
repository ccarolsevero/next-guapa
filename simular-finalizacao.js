import { MongoClient, ObjectId } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

async function simularFinalizacao() {
  let client

  try {
    console.log('🔄 Conectando ao MongoDB...')

    const uri = process.env.MONGODB_URI
    if (!uri) {
      throw new Error('MONGODB_URI não encontrada no .env')
    }

    client = new MongoClient(uri)
    await client.connect()

    const db = client.db(process.env.DB_NAME || 'guapa')
    console.log('✅ Conectado ao MongoDB')

    // Simular dados de finalização
    const comandaId = '68b85f2ab552c40c8bc2c68b' // ID da comanda que já existe
    const finalizacaoData = {
      clienteId: '68b0ebbcd9700d5d16b546b8', // ID do profissional (temporário)
      profissionalId: '68b0ebbcd9700d5d16b546b8',
      valorFinal: 231,
      paymentMethod: 'PIX',
      desconto: 0,
      creditAmount: 0,
      totalComissao: 23.1,
      detalhesComissao: [
        {
          tipo: 'Serviço',
          item: 'Back To Natural - P',
          valor: 231,
          comissao: 23.1,
          vendidoPor: '68b0ebbcd9700d5d16b546b8'
        }
      ],
      servicos: [
        {
          servicoId: '68b5d975eba55dd4f9fb9808',
          nome: 'Back To Natural - P',
          preco: 231,
          quantidade: 1
        }
      ],
      produtos: []
    }

    console.log('🧪 === SIMULANDO FINALIZAÇÃO COMPLETA ===')
    console.log(`📋 Comanda ID: ${comandaId}`)
    console.log(`💰 Valor Final: ${finalizacaoData.valorFinal}`)
    console.log(`💸 Total Comissão: ${finalizacaoData.totalComissao}`)

    // 1. Verificar se a comanda existe
    console.log('\n🔍 1. Verificando comanda existente...')
    const comanda = await db.collection('comandas').findOne({ _id: new ObjectId(comandaId) })
    
    if (!comanda) {
      console.log('❌ Comanda não encontrada')
      return
    }
    
    console.log('✅ Comanda encontrada:', {
      status: comanda.status,
      valorFinal: comanda.valorFinal,
      clienteId: comanda.clienteId,
      profissionalId: comanda.profissionalId
    })

    // 2. Atualizar status da comanda para 'finalizada'
    console.log('\n🔄 2. Atualizando status da comanda...')
    const dataFim = new Date()
    
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

    // 3. Salvar dados da finalização
    console.log('\n💳 3. Salvando dados da finalização...')
    const finalizacaoResult = await db.collection('finalizacoes').insertOne({
      ...finalizacaoData,
      comandaId: new ObjectId(comandaId),
      dataCriacao: new Date(),
      status: 'ativo'
    })
    
    console.log('✅ Finalização salva:', finalizacaoResult.insertedId)

    // 4. Atualizar faturamento do dia
    console.log('\n💰 4. Atualizando faturamento do dia...')
    const hoje = new Date()
    const dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
    const dataFimFaturamento = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59)
    
    console.log('📅 Data início:', dataInicio.toISOString())
    console.log('📅 Data fim:', dataFimFaturamento.toISOString())
    console.log('💰 Valor para somar:', finalizacaoData.valorFinal)

    const faturamentoResult = await db.collection('faturamento').updateOne(
      { 
        data: { 
          $gte: dataInicio, 
          $lte: dataFimFaturamento 
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

    // 5. Salvar comissões
    console.log('\n💸 5. Salvando comissões...')
    for (const detalhe of finalizacaoData.detalhesComissao) {
      try {
        const vendidoPorId = new ObjectId(detalhe.vendidoPor)
        
        const comissaoResult = await db.collection('comissoes').insertOne({
          comandaId: new ObjectId(comandaId),
          profissionalId: new ObjectId(finalizacaoData.profissionalId),
          tipo: detalhe.tipo,
          item: detalhe.item,
          valor: detalhe.valor,
          comissao: detalhe.comissao,
          vendidoPor: vendidoPorId,
          data: new Date(),
          status: 'pendente'
        })
        
        console.log(`✅ Comissão salva: ${comissaoResult.insertedId}`)
      } catch (comissaoError) {
        console.error('❌ Erro ao salvar comissão:', comissaoError)
      }
    }

    // 6. Atualizar histórico do cliente
    console.log('\n👤 6. Atualizando histórico do cliente...')
    try {
      const clienteUpdateResult = await db.collection('clientes').updateOne(
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
      
      console.log('✅ Histórico do cliente atualizado:', clienteUpdateResult.modifiedCount > 0)
    } catch (clienteError) {
      console.error('❌ Erro ao atualizar histórico do cliente:', clienteError)
    }

    // 7. Verificar resultado final
    console.log('\n🎯 === VERIFICAÇÃO FINAL ===')
    
    // Comanda
    const comandaFinal = await db.collection('comandas').findOne({ _id: new ObjectId(comandaId) })
    console.log('📋 Comanda:', {
      status: comandaFinal.status,
      valorFinal: comandaFinal.valorFinal,
      dataFim: comandaFinal.dataFim
    })
    
    // Finalização
    const finalizacaoFinal = await db.collection('finalizacoes').findOne({ comandaId: new ObjectId(comandaId) })
    console.log('💳 Finalização:', finalizacaoFinal ? '✅ Criada' : '❌ Não criada')
    
    // Faturamento
    const faturamentoFinal = await db.collection('faturamento').findOne({
      data: { $gte: dataInicio, $lte: dataFimFaturamento }
    })
    console.log('💰 Faturamento:', faturamentoFinal ? {
      valorTotal: faturamentoFinal.valorTotal,
      totalComissoes: faturamentoFinal.totalComissoes,
      quantidadeComandas: faturamentoFinal.quantidadeComandas
    } : '❌ Não criado')
    
    // Comissões
    const comissoesFinal = await db.collection('comissoes').find({ comandaId: new ObjectId(comandaId) }).toArray()
    console.log('💸 Comissões:', `${comissoesFinal.length} encontradas`)

  } catch (error) {
    console.error('❌ Erro durante a simulação:', error)
  } finally {
    if (client) {
      await client.close()
      console.log('🔌 Conexão com MongoDB fechada')
    }
  }
}

// Executar o script
simularFinalizacao()
  .then(() => {
    console.log('✅ Simulação concluída')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })
