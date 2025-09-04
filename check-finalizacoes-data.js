const { connectToDatabase } = require('./src/lib/mongodb.ts')

async function checkFinalizacoesData() {
  try {
    const { db } = await connectToDatabase()
    console.log('🔍 Verificando dados na coleção finalizacoes...\n')

    // Contar total de documentos
    const totalCount = await db.collection('finalizacoes').countDocuments()
    console.log(`📊 Total de finalizações: ${totalCount}`)

    if (totalCount === 0) {
      console.log('❌ Nenhuma finalização encontrada!')
      return
    }

    // Buscar uma amostra de documentos
    const sample = await db.collection('finalizacoes').find({}).limit(3).toArray()
    console.log('\n📋 Amostra de documentos:')
    sample.forEach((doc, index) => {
      console.log(`\n--- Documento ${index + 1} ---`)
      console.log('ID:', doc._id)
      console.log('Cliente ID:', doc.clienteId)
      console.log('Profissional ID:', doc.profissionalId)
      console.log('Data Criação:', doc.dataCriacao)
      console.log('Valor Final:', doc.valorFinal)
      console.log('Total Comissão:', doc.totalComissao)
      console.log('Serviços:', doc.servicos?.length || 0)
      console.log('Produtos:', doc.produtos?.length || 0)
      console.log('Campos disponíveis:', Object.keys(doc))
    })

    // Verificar datas
    const dateRange = await db.collection('finalizacoes').aggregate([
      {
        $group: {
          _id: null,
          minDate: { $min: '$dataCriacao' },
          maxDate: { $max: '$dataCriacao' }
        }
      }
    ]).toArray()

    if (dateRange.length > 0) {
      console.log('\n📅 Período dos dados:')
      console.log('Data mais antiga:', dateRange[0].minDate)
      console.log('Data mais recente:', dateRange[0].maxDate)
    }

    // Verificar se há dados nos últimos 6 meses
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const recentCount = await db.collection('finalizacoes').countDocuments({
      dataCriacao: { $gte: sixMonthsAgo }
    })
    console.log(`\n📈 Finalizações nos últimos 6 meses: ${recentCount}`)

  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

checkFinalizacoesData()
