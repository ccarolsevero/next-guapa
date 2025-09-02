const fs = require('fs');

// URL da API de produção
const PRODUCTION_API_URL = 'https://nextjs-guapa-cjio6rn1r-ana-carolina-severos-projects.vercel.app/api/clients';

// Função para padronizar telefone (remover (55) e ajustar formato)
function padronizarTelefone(telefone) {
  if (!telefone) return '';
  
  // Remover (55) e outros caracteres especiais
  let telefoneLimpo = telefone.replace(/\(55\)/g, '').replace(/[^\d]/g, '');
  
  // Se começar com 55, remover
  if (telefoneLimpo.startsWith('55')) {
    telefoneLimpo = telefoneLimpo.substring(2);
  }
  
  // Formatar como (XX) XXXXX-XXXX
  if (telefoneLimpo.length === 11) {
    return `(${telefoneLimpo.substring(0, 2)}) ${telefoneLimpo.substring(2, 7)}-${telefoneLimpo.substring(7)}`;
  } else if (telefoneLimpo.length === 10) {
    return `(${telefoneLimpo.substring(0, 2)}) ${telefoneLimpo.substring(2, 6)}-${telefoneLimpo.substring(6)}`;
  }
  
  return telefoneLimpo;
}

// Função para converter data do formato brasileiro para ISO
function converterData(dataStr) {
  if (!dataStr) return null;
  
  // Formato esperado: DD/MM/YYYY
  const partes = dataStr.split('/');
  if (partes.length === 3) {
    const dia = partes[0].padStart(2, '0');
    const mes = partes[1].padStart(2, '0');
    const ano = partes[2];
    return `${ano}-${mes}-${dia}`;
  }
  
  return null;
}

// Função para gerar email único baseado no nome e índice
function gerarEmailUnico(nome, index) {
  if (!nome) return '';
  
  const nomeLimpo = nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '.');
  
  // Adicionar índice para garantir unicidade
  return `${nomeLimpo}.${index}@guapa.com`;
}

// Função para importar um cliente
async function importarCliente(cliente, index) {
  try {
    const dadosCliente = {
      name: cliente.nome,
      email: gerarEmailUnico(cliente.nome, index),
      phone: padronizarTelefone(cliente.telefone),
      birthDate: converterData(cliente.data),
      address: null, // Endereço vazio por padrão
      notes: `Cliente ${index + 1} - cadastrado em ${cliente.data || 'data não informada'}`,
      profileComplete: false,
      onboardingRequired: true,
      firstAccess: true
    };

    const response = await fetch(PRODUCTION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosCliente)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP ${response.status}: ${errorData.error || 'Erro desconhecido'}`);
    }

    const resultado = await response.json();
    return { 
      success: true, 
      cliente: dadosCliente.name, 
      id: resultado._id,
      email: dadosCliente.email,
      index: index + 1
    };

  } catch (error) {
    return { 
      success: false, 
      cliente: cliente.nome, 
      error: error.message,
      index: index + 1
    };
  }
}

// Função principal
async function importarTodosClientes() {
  try {
    console.log('🚀 Iniciando importação FORÇADA de TODOS os 2000 clientes...');
    console.log(`📡 API: ${PRODUCTION_API_URL}`);
    console.log('');

    // Ler dados dos clientes
    const dadosCompletos = JSON.parse(fs.readFileSync('clientes-2000-completos.json', 'utf8'));
    const dadosClientes = dadosCompletos.clientes;
    console.log(`📊 Total de clientes no arquivo: ${dadosClientes.length}`);

    // Verificar clientes já existentes
    console.log('🔍 Verificando clientes já existentes...');
    const response = await fetch(PRODUCTION_API_URL);
    if (!response.ok) {
      throw new Error('Erro ao verificar clientes existentes');
    }
    
    const clientesExistentes = await response.json();
    console.log(`📊 Clientes já no banco: ${clientesExistentes.length}`);

    // Importar TODOS os clientes do arquivo (forçar importação)
    console.log(`🆕 Importando TODOS os ${dadosClientes.length} clientes do arquivo...`);
    console.log('');

    const resultados = [];
    let sucessos = 0;
    let falhas = 0;

    // Importar em lotes de 15 para não sobrecarregar
    const tamanhoLote = 15;
    const totalLotes = Math.ceil(dadosClientes.length / tamanhoLote);
    
    console.log(`📦 Processando ${totalLotes} lotes de ${tamanhoLote} clientes cada...`);
    console.log('');

    for (let i = 0; i < dadosClientes.length; i += tamanhoLote) {
      const lote = dadosClientes.slice(i, i + tamanhoLote);
      const numeroLote = Math.floor(i / tamanhoLote) + 1;
      
      console.log(`📦 Lote ${numeroLote}/${totalLotes} - ${lote.length} clientes`);
      console.log(`⏳ Processando: ${i + 1} a ${Math.min(i + tamanhoLote, dadosClientes.length)} de ${dadosClientes.length}`);
      
      const promessas = lote.map((cliente, indexLocal) => 
        importarCliente(cliente, i + indexLocal)
      );
      const resultadosLote = await Promise.all(promessas);
      
      resultados.push(...resultadosLote);
      
      // Contar sucessos e falhas
      resultadosLote.forEach(resultado => {
        if (resultado.success) {
          sucessos++;
          console.log(`  ✅ ${resultado.index}. ${resultado.cliente} (${resultado.email})`);
        } else {
          falhas++;
          console.log(`  ❌ ${resultado.index}. ${resultado.cliente}: ${resultado.error}`);
        }
      });
      
      // Aguardar entre lotes para não sobrecarregar
      if (i + tamanhoLote < dadosClientes.length) {
        console.log(`⏳ Aguardando 4 segundos antes do próximo lote...`);
        await new Promise(resolve => setTimeout(resolve, 4000));
      }
      
      console.log(`📊 Progresso: ${sucessos + falhas}/${dadosClientes.length} (${Math.round(((sucessos + falhas) / dadosClientes.length) * 100)}%)`);
      console.log('');
    }

    // Resumo final
    console.log('📋 RESUMO FINAL DA IMPORTAÇÃO FORÇADA');
    console.log('=' * 60);
    console.log(`📊 Total no arquivo: ${dadosClientes.length}`);
    console.log(`📊 Clientes já no banco: ${clientesExistentes.length}`);
    console.log(`✅ Sucessos: ${sucessos}`);
    console.log(`❌ Falhas: ${falhas}`);
    console.log(`📈 Total no banco após importação: ${clientesExistentes.length + sucessos}`);
    console.log('');

    // Salvar resultados detalhados
    const resultadoFinal = {
      timestamp: new Date().toISOString(),
      resumo: {
        totalArquivo: dadosClientes.length,
        clientesExistentes: clientesExistentes.length,
        sucessos,
        falhas,
        totalBanco: clientesExistentes.length + sucessos
      },
      resultados: resultados
    };

    fs.writeFileSync('resultado-importacao-forcada.json', JSON.stringify(resultadoFinal, null, 2));
    console.log('💾 Resultados salvos em: resultado-importacao-forcada.json');

    // Mostrar erros se houver
    if (falhas > 0) {
      console.log('');
      console.log('❌ CLIENTES COM ERRO:');
      resultados
        .filter(r => !r.success)
        .slice(0, 20)
        .forEach(r => console.log(`  ${r.index}. ${r.cliente}: ${r.error}`));
      
      if (falhas > 20) {
        console.log(`  ... e mais ${falhas - 20} erros`);
      }
    }

    console.log('');
    console.log('🎉 Importação FORÇADA concluída!');

  } catch (error) {
    console.error('💥 Erro fatal durante importação:', error);
  }
}

// Executar importação
importarTodosClientes();
