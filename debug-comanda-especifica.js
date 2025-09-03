import { MongoClient, ObjectId } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

async function debugComandaEspecifica() {
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

    // ID da comanda que foi finalizada
    const comandaId = '68b85f2ab552c40c8bc2c68b'
    
    console.log(`🔍 === DEBUG COMANDA ${comandaId} ===`)

    // 1. Verificar a comanda
    const comanda = await db.collection('comandas').findOne({ _id: new ObjectId(comandaId) })
    
    if (comanda) {
      console.log('📋 COMANDA:')
      console.log(`   - ID: ${comanda._id}`)
      console.log(`   - Status: ${comanda.status}`)
      console.log(`   - Valor Final: ${comanda.valorFinal}`)
      console.log(`   - Data Início: ${comanda.dataInicio}`)
      console.log(`   - Data Fim: ${comanda.dataFim}`)
      console.log(`   - Cliente ID: ${comanda.clienteId}`)
      console.log(`   - Profissional ID: ${comanda.profissionalId}`)
      console.log(`   - Serviços:`, comanda.servicos)
      console.log(`   - Produtos:`, comanda.produtos)
      console.log(`   - Valor Total: ${comanda.valorTotal}`)
      console.log('')
    } else {
      console.log('❌ Comanda não encontrada')
      return
    }

    // 2. Verificar a finalização
    const finalizacao = await db.collection('finalizacoes').findOne({ comandaId: new ObjectId(comandaId) })
    
    if (finalizacao) {
      console.log('💳 FINALIZAÇÃO:')
      console.log(`   - ID: ${finalizacao._id}`)
      console.log(`   - Comanda ID: ${finalizacao.comandaId}`)
      console.log(`   - Cliente ID: ${finalizacao.clienteId}`)
      console.log(`   - Profissional ID: ${finalizacao.profissionalId}`)
      console.log(`   - Valor Final: ${finalizacao.valorFinal}`)
      console.log(`   - Total Comissão: ${finalizacao.totalComissao}`)
      console.log(`   - Detalhes Comissão:`, finalizacao.detalhesComissao)
      console.log(`   - Data Criação: ${finalizacao.dataCriacao}`)
      console.log(`   - Status: ${finalizacao.status}`)
      console.log('')
    } else {
      console.log('❌ Finalização não encontrada')
    }

    // 3. Verificar comissões
    const comissoes = await db.collection('comissoes').find({ comandaId: new ObjectId(comandaId) }).toArray()
    
    console.log('💰 COMISSÕES:')
    console.log(`   - Total de comissões: ${comissoes.length}`)
    comissoes.forEach((comissao, index) => {
      console.log(`   - Comissão ${index + 1}:`)
      console.log(`     ID: ${comissao._id}`)
      console.log(`     Tipo: ${comissao.tipo}`)
      console.log(`     Item: ${comissao.item}`)
      console.log(`     Valor: ${comissao.valor}`)
      console.log(`     Comissão: ${comissao.comissao}`)
      console.log(`     Profissional: ${comissao.profissionalId}`)
      console.log(`     Data: ${comissao.data}`)
      console.log('')
    })

    // 4. Verificar faturamento do dia
    const dataFim = comanda.dataFim
    const dataInicio = new Date(dataFim.getFullYear(), dataFim.getMonth(), dataFim.getDate())
    const dataFimFaturamento = new Date(dataFim.getFullYear(), dataFim.getMonth(), dataFim.getDate(), 23, 59, 59)
    
    console.log('📅 === VERIFICANDO FATURAMENTO ===')
    console.log(`   - Data da comanda: ${dataFim}`)
    console.log(`   - Data início faturamento: ${dataInicio}`)
    console.log(`   - Data fim faturamento: ${dataFimFaturamento}`)
    
    const faturamento = await db.collection('faturamento').findOne({
      data: { $gte: dataInicio, $lte: dataFimFaturamento }
    })
    
    if (faturamento) {
      console.log('✅ FATURAMENTO ENCONTRADO:')
      console.log(`   - ID: ${faturamento._id}`)
      console.log(`   - Data: ${faturamento.data}`)
      console.log(`   - Valor Total: ${faturamento.valorTotal}`)
      console.log(`   - Total Comissões: ${faturamento.totalComissoes}`)
      console.log(`   - Quantidade Comandas: ${faturamento.quantidadeComandas}`)
    } else {
      console.log('❌ FATURAMENTO NÃO ENCONTRADO para este dia')
      
      // Verificar se há algum faturamento
      const todosFaturamentos = await db.collection('faturamento').find({}).toArray()
      console.log(`   - Total de registros de faturamento no banco: ${todosFaturamentos.length}`)
      
      if (todosFaturamentos.length > 0) {
        console.log('   - Últimos registros:')
        todosFaturamentos.slice(-3).forEach((fat, index) => {
          console.log(`     ${index + 1}. Data: ${fat.data}, Valor: ${fat.valorTotal}`)
        })
      }
    }

  } catch (error) {
    console.error('❌ Erro durante o debug:', error)
  } finally {
    if (client) {
      await client.close()
      console.log('🔌 Conexão com MongoDB fechada')
    }
  }
}

// Executar o script
debugComandaEspecifica()
  .then(() => {
    console.log('✅ Debug concluído')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })
