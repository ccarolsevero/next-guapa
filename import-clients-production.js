const fs = require('fs')

// URL da API de produção
const PRODUCTION_API_URL = 'https://espaco-guapa.vercel.app/api/clients'

// Função para padronizar telefone (remover (55) e ajustar formato)
function padronizarTelefone(telefone) {
  if (!telefone) return ''
  
  // Remover (55) e outros caracteres especiais
  let telefoneLimpo = telefone.replace(/\(55\)/g, '').replace(/[^\d]/g, '')
  
  // Se começar com 55, remover
  if (telefoneLimpo.startsWith('55')) {
    telefoneLimpo = telefoneLimpo.substring(2)
  }
  
  // Formatar como (XX) XXXXX-XXXX
  if (telefoneLimpo.length === 11) {
    return `(${telefoneLimpo.substring(0, 2)}) ${telefoneLimpo.substring(2, 7)}-${telefoneLimpo.substring(7)}`
  } else if (telefoneLimpo.length === 10) {
    return `(${telefoneLimpo.substring(0, 2)}) ${telefoneLimpo.substring(2, 6)}-${telefoneLimpo.substring(6)}`
  }
  
  return telefoneLimpo
}

// Função para converter data do formato brasileiro para ISO
function converterData(dataStr) {
  if (!dataStr) return null
  
  // Formato esperado: DD/MM/YYYY
  const partes = dataStr.split('/')
  if (partes.length === 3) {
    const dia = partes[0].padStart(2, '0')
    const mes = partes[1].padStart(2, '0')
    const ano = partes[2]
    return `${ano}-${mes}-${dia}`
  }
  
  return null
}

// Função para gerar email baseado no nome
function gerarEmail(nome) {
  if (!nome) return ''
  
  const nomeLimpo = nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '.')
  
  return `${nomeLimpo}@guapa.com`
}

// Função para importar um cliente
async function importarCliente(cliente) {
  try {
    const dadosCliente = {
      name: cliente.name,
      email: cliente.email || gerarEmail(cliente.name),
      phone: padronizarTelefone(cliente.phone),
      birthDate: converterData(cliente.birthDate),
      address: cliente.address || 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP',
      notes: `Cliente cadastrado em ${cliente.birthDate || 'data não informada'}`,
      profileComplete: false,
      onboardingRequired: true,
      firstAccess: true
    }

    console.log(`Importando: ${dadosCliente.name} (${dadosCliente.email})`)

    const response = await fetch(PRODUCTION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosCliente)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`HTTP ${response.status}: ${errorData.error || 'Erro desconhecido'}`)
    }

    const resultado = await response.json()
    console.log(`✅ ${dadosCliente.name} importado com sucesso (ID: ${resultado._id})`)
    return { success: true, cliente: dadosCliente.name, id: resultado._id }

  } catch (error) {
    console.error(`❌ Erro ao importar ${cliente.name}:`, error.message)
    return { success: false, cliente: cliente.name, error: error.message }
  }
}

// Função principal
async function importarClientes() {
  try {
    console.log('🚀 Iniciando importação de clientes para produção...')
    console.log(`📡 API: ${PRODUCTION_API_URL}`)
    console.log('')

    // Ler dados dos clientes
    const dadosClientes = JSON.parse(fs.readFileSync('clientes-guapa-importacao.json', 'utf8'))
    console.log(`📊 Total de clientes para importar: ${dadosClientes.length}`)
    console.log('')

    const resultados = []
    let sucessos = 0
    let falhas = 0

    // Importar em lotes de 10 para não sobrecarregar a API
    const tamanhoLote = 10
    for (let i = 0; i < dadosClientes.length; i += tamanhoLote) {
      const lote = dadosClientes.slice(i, i + tamanhoLote)
      console.log(`📦 Processando lote ${Math.floor(i / tamanhoLote) + 1}/${Math.ceil(dadosClientes.length / tamanhoLote)}`)
      
      const promessas = lote.map(cliente => importarCliente(cliente))
      const resultadosLote = await Promise.all(promessas)
      
      resultados.push(...resultadosLote)
      
      // Contar sucessos e falhas
      resultadosLote.forEach(resultado => {
        if (resultado.success) sucessos++
        else falhas++
      })
      
      // Aguardar um pouco entre os lotes para não sobrecarregar
      if (i + tamanhoLote < dadosClientes.length) {
        console.log('⏳ Aguardando 2 segundos antes do próximo lote...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      
      console.log('')
    }

    // Resumo final
    console.log('📋 RESUMO DA IMPORTAÇÃO')
    console.log('=' * 50)
    console.log(`✅ Sucessos: ${sucessos}`)
    console.log(`❌ Falhas: ${falhas}`)
    console.log(`📊 Total: ${dadosClientes.length}`)
    console.log('')

    // Salvar resultados
    const resultadoFinal = {
      timestamp: new Date().toISOString(),
      total: dadosClientes.length,
      sucessos,
      falhas,
      resultados
    }

    fs.writeFileSync('resultado-importacao-producao.json', JSON.stringify(resultadoFinal, null, 2))
    console.log('💾 Resultados salvos em: resultado-importacao-producao.json')

    // Mostrar erros se houver
    if (falhas > 0) {
      console.log('')
      console.log('❌ CLIENTES COM ERRO:')
      resultados
        .filter(r => !r.success)
        .forEach(r => console.log(`  - ${r.cliente}: ${r.error}`))
    }

  } catch (error) {
    console.error('💥 Erro fatal durante importação:', error)
  }
}

// Executar importação
importarClientes()
