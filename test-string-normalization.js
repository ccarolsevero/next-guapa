// Script para testar a normalização de strings
function normalizeString(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

// Serviços da Cicera (do admin)
const ciceraServices = [
  "Limpeza de Couro Cabeludo",
  "Reconstrução Capilar", 
  "Avaliação Capilar",
  "Iluminado M"
]

// Serviços disponíveis no banco
const availableServices = [
  "Iluminado P",
  "Iluminado M", 
  "Iluminado G",
  "Avaliação Capilar",
  "Avaliação + Tratamento"
]

console.log('🧪 Testando normalização de strings...\n')

console.log('📋 Serviços da Cicera:')
ciceraServices.forEach(service => {
  const normalized = normalizeString(service)
  console.log(`  "${service}" -> "${normalized}"`)
})

console.log('\n📋 Serviços disponíveis no banco:')
availableServices.forEach(service => {
  const normalized = normalizeString(service)
  console.log(`  "${service}" -> "${normalized}"`)
})

console.log('\n🔍 Testando comparações:')
ciceraServices.forEach(ciceraService => {
  const normalizedCicera = normalizeString(ciceraService)
  
  availableServices.forEach(availableService => {
    const normalizedAvailable = normalizeString(availableService)
    const match = normalizedCicera === normalizedAvailable
    
    if (match) {
      console.log(`✅ MATCH: "${ciceraService}" = "${availableService}"`)
    }
  })
})

console.log('\n🎯 Resultado esperado:')
console.log('- Avaliação Capilar deve dar match')
console.log('- Iluminado M deve dar match')
console.log('- Limpeza de Couro Cabeludo não deve dar match (não existe no banco)')
console.log('- Reconstrução Capilar não deve dar match (não existe no banco)')
