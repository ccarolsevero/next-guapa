import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

async function debugFinanceiro() {
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

    // 1. Verificar comandas finalizadas hoje
    console.log('\n🔍 === COMANDAS FINALIZADAS HOJE ===')
    const hoje = new Date()
    const dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
    const dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59)
    
    const comandasHoje = await db.collection('comandas').find({
      status: 'finalizada',
      dataFim: { $gte: dataInicio, $lte: dataFim }
    }).toArray()
    
    console.log(`📊 Comandas finalizadas hoje: ${comandasHoje.length}`)
    comandasHoje.forEach(comanda => {
      console.log(`   - ID: ${comanda._id}`)
      console.log(`     Status: ${comanda.status}`)
      console.log(`     Valor Final: ${comanda.valorFinal}`)
      console.log(`     Data Fim: ${comanda.dataFim}`)
      console.log(`     Cliente: ${comanda.clienteId}`)
      console.log('')
    })

    // 2. Verificar finalizações hoje
    console.log('🔍 === FINALIZAÇÕES HOJE ===')
    const finalizacoesHoje = await db.collection('finalizacoes').find({
      dataCriacao: { $gte: dataInicio, $lte: dataFim }
    }).toArray()
    
    console.log(`📊 Finalizações hoje: ${finalizacoesHoje.length}`)
    finalizacoesHoje.forEach(finalizacao => {
      console.log(`   - ID: ${finalizacao._id}`)
      console.log(`     Valor Final: ${finalizacao.valorFinal}`)
      console.log(`     Data Criação: ${finalizacao.dataCriacao}`)
      console.log(`     Comanda ID: ${finalizacao.comandaId}`)
      console.log('')
    })

    // 3. Verificar faturamento hoje
    console.log('🔍 === FATURAMENTO HOJE ===')
    const faturamentoHoje = await db.collection('faturamento').find({
      data: { $gte: dataInicio, $lte: dataFim }
    }).toArray()
    
    console.log(`📊 Registros de faturamento hoje: ${faturamentoHoje.length}`)
    faturamentoHoje.forEach(fat => {
      console.log(`   - ID: ${fat._id}`)
      console.log(`     Data: ${fat.data}`)
      console.log(`     Valor Total: ${fat.valorTotal}`)
      console.log(`     Total Comissões: ${fat.totalComissoes}`)
      console.log(`     Quantidade Comandas: ${fat.quantidadeComandas}`)
      console.log('')
    })

    // 4. Verificar comissões hoje
    console.log('🔍 === COMISSÕES HOJE ===')
    const comissoesHoje = await db.collection('comissoes').find({
      data: { $gte: dataInicio, $lte: dataFim }
    }).toArray()
    
    console.log(`📊 Comissões hoje: ${comissoesHoje.length}`)
    comissoesHoje.forEach(comissao => {
      console.log(`   - ID: ${comissao._id}`)
      console.log(`     Tipo: ${comissao.tipo}`)
      console.log(`     Item: ${comissao.item}`)
      console.log(`     Valor: ${comissao.valor}`)
      console.log(`     Comissão: ${comissao.comissao}`)
      console.log(`     Profissional: ${comissao.profissionalId}`)
      console.log(`     Data: ${comissao.data}`)
      console.log('')
    })

    // 5. Verificar todas as comandas finalizadas (últimos 7 dias)
    console.log('🔍 === TODAS AS COMANDAS FINALIZADAS (ÚLTIMOS 7 DIAS) ===')
    const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const comandasRecentes = await db.collection('comandas').find({
      status: 'finalizada',
      dataFim: { $gte: seteDiasAtras }
    }).sort({ dataFim: -1 }).toArray()
    
    console.log(`📊 Comandas finalizadas nos últimos 7 dias: ${comandasRecentes.length}`)
    comandasRecentes.forEach(comanda => {
      console.log(`   - ID: ${comanda._id}`)
      console.log(`     Status: ${comanda.status}`)
      console.log(`     Valor Final: ${comanda.valorFinal}`)
      console.log(`     Data Fim: ${comanda.dataFim}`)
      console.log(`     Cliente: ${comanda.clienteId}`)
      console.log('')
    })

    // 6. Verificar se há dados antigos ou incorretos
    console.log('🔍 === VERIFICANDO DADOS ANTIGOS ===')
    const comandasAntigas = await db.collection('comandas').find({
      status: 'finalizada',
      dataFim: { $lt: dataInicio }
    }).sort({ dataFim: -1 }).limit(5).toArray()
    
    console.log(`📊 Comandas finalizadas em dias anteriores (últimas 5): ${comandasAntigas.length}`)
    comandasAntigas.forEach(comanda => {
      console.log(`   - ID: ${comanda._id}`)
      console.log(`     Status: ${comanda.status}`)
      console.log(`     Valor Final: ${comanda.valorFinal}`)
      console.log(`     Data Fim: ${comanda.dataFim}`)
      console.log('')
    })

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
debugFinanceiro()
  .then(() => {
    console.log('✅ Debug concluído')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })
