const { MongoClient, ObjectId } = require('mongodb')

async function testOnboarding() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://anacarolinasevero:Guapa2024@cluster0.8jqjq.mongodb.net/guapa?retryWrites=true&w=majority'
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    const db = client.db('guapa')
    
    console.log('🔍 Verificando clientes que precisam de onboarding...')
    
    // Buscar clientes que precisam de onboarding
    const clientsNeedingOnboarding = await db.collection('clients').find({
      $or: [
        { onboardingCompleted: { $ne: true } },
        { onboardingRequired: true },
        { onboardingCompleted: { $exists: false } }
      ]
    }).toArray()
    
    console.log(`📊 Encontrados ${clientsNeedingOnboarding.length} clientes que precisam de onboarding:`)
    
    clientsNeedingOnboarding.forEach((client, index) => {
      console.log(`${index + 1}. ${client.name} (${client.email})`)
      console.log(`   - onboardingCompleted: ${client.onboardingCompleted}`)
      console.log(`   - onboardingRequired: ${client.onboardingRequired}`)
      console.log(`   - isCompleteProfile: ${client.isCompleteProfile}`)
      console.log('')
    })
    
    // Forçar um cliente específico a precisar de onboarding
    if (clientsNeedingOnboarding.length > 0) {
      const testClient = clientsNeedingOnboarding[0]
      console.log(`🔄 Forçando cliente ${testClient.name} a precisar de onboarding...`)
      
      await db.collection('clients').updateOne(
        { _id: testClient._id },
        {
          $set: {
            onboardingCompleted: false,
            onboardingRequired: true,
            isCompleteProfile: false
          }
        }
      )
      
      console.log('✅ Cliente atualizado para precisar de onboarding')
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await client.close()
  }
}

testOnboarding()
