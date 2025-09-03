const { MongoClient, ObjectId } = require('mongodb')
require('dotenv').config()

async function debugAPIDetalhado() {
  let client
  
  try {
    console.log('🔍 Debug detalhado da API Financeiro...')
    
    const uri = process.env.MONGODB_URI
    client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.DB_NAME || 'guapa')
    
    // Simular exatamente a lógica da API
    const hoje = new Date()
    const dataInicioComissoes = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    console.log('\n📅 Datas:')
    console.log('   Hoje:', hoje.toISOString())
    console.log('   Data início comissões (30 dias):', dataInicioComissoes.toISOString())
    
    // Verificar comissões sem filtro de data primeiro
    console.log('\n🔍 Todas as comissões (sem filtro de data):')
    const todasComissoes = await db.collection('comissoes').find({}).toArray()
    console.log(`   Total encontradas: ${todasComissoes.length}`)
    
    todasComissoes.forEach((comissao, index) => {
      console.log(`   ${index + 1}. ${comissao.tipo}: ${comissao.item}`)
      console.log(`      Data: ${comissao.data}`)
      console.log(`      Profissional ID: ${comissao.profissionalId}`)
      console.log(`      Valor: R$ ${comissao.valor}`)
      console.log(`      Comissão: R$ ${comissao.comissao}`)
      console.log(`      Data >= dataInicioComissoes: ${comissao.data >= dataInicioComissoes}`)
      console.log(`      Data <= hoje: ${comissao.data <= hoje}`)
      console.log(`      Passa no filtro: ${comissao.data >= dataInicioComissoes && comissao.data <= hoje}`)
      console.log('')
    })
    
    // Verificar comissões com filtro de data
    console.log('\n🔍 Comissões com filtro de data (30 dias):')
    const comissoesFiltradas = await db.collection('comissoes').find({
      data: { $gte: dataInicioComissoes, $lte: hoje }
    }).toArray()
    
    console.log(`   Comissões que passam no filtro: ${comissoesFiltradas.length}`)
    
    // Verificar se há problema com ObjectId
    console.log('\n🔍 Verificando ObjectIds das comissões:')
    todasComissoes.forEach((comissao, index) => {
      console.log(`   ${index + 1}. Profissional ID: ${comissao.profissionalId}`)
      console.log(`      Tipo: ${typeof comissao.profissionalId}`)
      console.log(`      É ObjectId válido: ${ObjectId.isValid(comissao.profissionalId)}`)
      console.log('')
    })
    
    // Verificar profissionais
    console.log('\n🔍 Verificando profissionais:')
    const profissionais = await db.collection('professionals').find({}).toArray()
    console.log(`   Total profissionais: ${profissionais.length}`)
    profissionais.forEach((prof, index) => {
      console.log(`   ${index + 1}. ID: ${prof._id}`)
      console.log(`      Nome: ${prof.name}`)
      console.log(`      Tipo ID: ${typeof prof._id}`)
      console.log('')
    })
    
    // Testar lookup manual
    console.log('\n🔍 Testando lookup manual:')
    const comissaoTeste = todasComissoes[0]
    if (comissaoTeste) {
      console.log(`   Comissão teste: ${comissaoTeste.tipo} - ${comissaoTeste.item}`)
      console.log(`   Profissional ID: ${comissaoTeste.profissionalId}`)
      
      const profissional = await db.collection('professionals').findOne({
        _id: new ObjectId(comissaoTeste.profissionalId)
      })
      
      if (profissional) {
        console.log(`   ✅ Profissional encontrado: ${profissional.name}`)
      } else {
        console.log(`   ❌ Profissional NÃO encontrado`)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

debugAPIDetalhado()
