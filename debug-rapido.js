import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

async function debugRapido() {
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

    // Verificar dados das coleções
    console.log('\n🔍 === VERIFICAÇÃO RÁPIDA ===')
    
    // 1. Finalizações
    const finalizacoes = await db.collection('finalizacoes').find({}).toArray()
    console.log(`📊 Finalizações: ${finalizacoes.length}`)
    if (finalizacoes.length > 0) {
      finalizacoes.forEach(f => {
        console.log(`   - ID: ${f._id}`)
        console.log(`     Valor: ${f.valorFinal}`)
        console.log(`     Método: ${f.metodoPagamento}`)
        console.log(`     Data: ${f.dataCriacao}`)
        console.log(`     Cliente: ${f.clienteId}`)
        console.log('')
      })
    }
    
    // 2. Comissões
    const comissoes = await db.collection('comissoes').find({}).toArray()
    console.log(`💰 Comissões: ${comissoes.length}`)
    if (comissoes.length > 0) {
      comissoes.forEach(c => {
        console.log(`   - ID: ${c._id}`)
        console.log(`     Item: ${c.item}`)
        console.log(`     Valor: ${c.valor}`)
        console.log(`     Comissão: ${c.comissao}`)
        console.log(`     Profissional: ${c.profissionalId}`)
        console.log(`     Data: ${c.data}`)
        console.log('')
      })
    }
    
    // 3. Faturamento
    const faturamento = await db.collection('faturamento').find({}).toArray()
    console.log(`📈 Faturamento: ${faturamento.length}`)
    if (faturamento.length > 0) {
      faturamento.forEach(f => {
        console.log(`   - ID: ${f._id}`)
        console.log(`     Data: ${f.data}`)
        console.log(`     Valor Total: ${f.valorTotal}`)
        console.log(`     Comissões: ${f.totalComissoes}`)
        console.log(`     Comandas: ${f.quantidadeComandas}`)
        console.log('')
      })
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
debugRapido()
  .then(() => {
    console.log('✅ Debug concluído')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })
