const { MongoClient } = require('mongodb')

async function updateClientsOnboarding() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://anacarolinasevero:Guapa2024@cluster0.8jqjq.mongodb.net/guapa?retryWrites=true&w=majority'
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    const db = client.db('guapa')
    
    console.log('🔍 Atualizando clientes para onboarding...')
    
    // Atualizar todos os clientes que não têm isCompleteProfile definido
    const result = await db.collection('clients').updateMany(
      {
        $or: [
          { isCompleteProfile: { $exists: false } },
          { isCompleteProfile: null }
        ]
      },
      {
        $set: {
          isCompleteProfile: false,
          onboardingCompleted: false,
          onboardingRequired: true
        }
      }
    )
    
    console.log(`✅ Atualizados ${result.modifiedCount} clientes`)
    
    // Verificar quantos clientes agora precisam de onboarding
    const clientsNeedingOnboarding = await db.collection('clients').countDocuments({
      isCompleteProfile: false
    })
    
    console.log(`📊 Total de clientes que precisam de onboarding: ${clientsNeedingOnboarding}`)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await client.close()
  }
}

updateClientsOnboarding()
