const { MongoClient, ObjectId } = require('mongodb')

async function debugFinalizacoes() {
  const uri = process.env.MONGODB_URI
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log('✅ Conectado ao MongoDB')
    
    const db = client.db('guapa')
    
    // 1. Verificar estrutura das finalizações
    console.log('\n🔍 === ESTRUTURA DAS FINALIZAÇÕES ===')
    const finalizacoes = await db.collection('finalizacoes').find({}).limit(3).toArray()
    
    finalizacoes.forEach((finalizacao, index) => {
      console.log(`\n📋 Finalização ${index + 1}:`)
      console.log('  - _id:', finalizacao._id)
      console.log('  - comandaId:', finalizacao.comandaId)
      console.log('  - clienteId:', finalizacao.clienteId)
      console.log('  - clienteNome:', finalizacao.clienteNome)
      console.log('  - valorFinal:', finalizacao.valorFinal)
      console.log('  - metodoPagamento:', finalizacao.metodoPagamento)
      console.log('  - dataCriacao:', finalizacao.dataCriacao)
      console.log('  - status:', finalizacao.status)
    })
    
    // 2. Verificar estrutura das comandas
    console.log('\n🔍 === ESTRUTURA DAS COMANDAS ===')
    const comandas = await db.collection('comandas').find({ status: 'finalizada' }).limit(3).toArray()
    
    comandas.forEach((comanda, index) => {
      console.log(`\n📋 Comanda ${index + 1}:`)
      console.log('  - _id:', comanda._id)
      console.log('  - clienteId:', comanda.clienteId)
      console.log('  - clienteNome:', comanda.clienteNome)
      console.log('  - status:', comanda.status)
      console.log('  - valorTotal:', comanda.valorTotal)
    })
    
    // 3. Verificar estrutura dos clientes
    console.log('\n🔍 === ESTRUTURA DOS CLIENTES ===')
    const clientes = await db.collection('clients').find({}).limit(3).toArray()
    
    clientes.forEach((cliente, index) => {
      console.log(`\n👤 Cliente ${index + 1}:`)
      console.log('  - _id:', cliente._id)
      console.log('  - name:', cliente.name)
      console.log('  - nome:', cliente.nome)
      console.log('  - fullName:', cliente.fullName)
      console.log('  - email:', cliente.email)
    })
    
    // 4. Testar a query dos pagamentos recentes
    console.log('\n🔍 === TESTE DA QUERY DE PAGAMENTOS RECENTES ===')
    const dataInicio = new Date('2025-08-01')
    const hoje = new Date()
    
    const pagamentosRecentes = await db.collection('finalizacoes').aggregate([
      {
        $match: {
          status: 'ativo',
          dataCriacao: { $gte: dataInicio, $lte: hoje }
        }
      },
      {
        $project: {
          _id: 1,
          clientName: '$clienteNome',
          service: { $arrayElemAt: ['$servicos.nome', 0] },
          amount: '$valorFinal',
          method: '$metodoPagamento',
          date: '$dataCriacao',
          status: 'PAID'
        }
      },
      {
        $sort: { date: -1 }
      },
      {
        $limit: 5
      }
    ]).toArray()
    
    console.log('\n📊 Pagamentos recentes encontrados:', pagamentosRecentes.length)
    pagamentosRecentes.forEach((pagamento, index) => {
      console.log(`\n💰 Pagamento ${index + 1}:`)
      console.log('  - clientName:', pagamento.clientName)
      console.log('  - service:', pagamento.service)
      console.log('  - amount:', pagamento.amount)
      console.log('  - method:', pagamento.method)
      console.log('  - date:', pagamento.date)
    })
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await client.close()
    console.log('\n✅ Conexão fechada')
  }
}

debugFinalizacoes()
