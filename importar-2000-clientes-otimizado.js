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

// Função para gerar email baseado no nome
function gerarEmail(nome) {
  if (!nome) return '';
  
  const nomeLimpo = nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '.');
  
  return `${nomeLimpo}@guapa.com`;
}

// Função para importar um cliente
async function importarCliente(cliente) {
  try {
    const dadosCliente = {
      name: cliente.nome,
      email: cliente.email || gerarEmail(cliente.nome),
      phone: padronizarTelefone(cliente.telefone),
      birthDate: converterData(cliente.data),
      address: null, // Endereço vazio por padrão
      notes: `Cliente cadastrado em ${cliente.data || 'data não informada'}`,
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
      email: dadosCliente.email
    };

  } catch (error) {
    return { 
      success: false, 
      cliente: cliente.nome, 
      error: error.message 
    };
  }
}

// Função principal
async function importarTodosClientes() {
  try {
    console.log('🚀 Iniciando importação otimizada de TODOS os 2000 clientes...');
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

    // Criar mapas para busca rápida
    const nomesExistentes = new Set(clientesExistentes.map(c => c.name.toLowerCase()));
    const telefonesExistentes = new Set(clientesExistentes.map(c => c.phone));

    // Filtrar apenas clientes novos (por nome e telefone)
    const clientesNovos = dadosClientes.filter(novoCliente => {
      const telefoneNovo = padronizarTelefone(novoCliente.telefone);
      const nomeNovo = novoCliente.nome.toLowerCase();
      
      // Verificar se já existe por nome ou telefone
      const jaExiste = nomesExistentes.has(nomeNovo) || telefonesExistentes.has(telefoneNovo);
      
      if (jaExiste) {
        console.log(`⏭️ ${novoCliente.nome} - já existe no banco`);
      }
      
      return !jaExiste;
    });

    console.log(`🆕 Clientes novos para importar: ${clientesNovos.length}`);
    console.log('');

    if (clientesNovos.length === 0) {
      console.log('✅ Todos os clientes já estão no banco!');
      return;
    }

    const resultados = [];
    let sucessos = 0;
    let falhas = 0;

    // Importar em lotes de 10 para não sobrecarregar
    const tamanhoLote = 10;
    const totalLotes = Math.ceil(clientesNovos.length / tamanhoLote);
    
    console.log(`📦 Processando ${totalLotes} lotes de ${tamanhoLote} clientes cada...`);
    console.log('');

    for (let i = 0; i < clientesNovos.length; i += tamanhoLote) {
      const lote = clientesNovos.slice(i, i + tamanhoLote);
      const numeroLote = Math.floor(i / tamanhoLote) + 1;
      
      console.log(`📦 Lote ${numeroLote}/${totalLotes} - ${lote.length} clientes`);
      console.log(`⏳ Processando: ${i + 1} a ${Math.min(i + tamanhoLote, clientesNovos.length)} de ${clientesNovos.length}`);
      
      const promessas = lote.map(cliente => importarCliente(cliente));
      const resultadosLote = await Promise.all(promessas);
      
      resultados.push(...resultadosLote);
      
      // Contar sucessos e falhas
      resultadosLote.forEach(resultado => {
        if (resultado.success) {
          sucessos++;
          console.log(`  ✅ ${resultado.cliente} (${resultado.email})`);
        } else {
          falhas++;
          console.log(`  ❌ ${resultado.cliente}: ${resultado.error}`);
        }
      });
      
      // Aguardar entre lotes para não sobrecarregar
      if (i + tamanhoLote < clientesNovos.length) {
        console.log(`⏳ Aguardando 3 segundos antes do próximo lote...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      console.log(`📊 Progresso: ${sucessos + falhas}/${clientesNovos.length} (${Math.round(((sucessos + falhas) / clientesNovos.length) * 100)}%)`);
      console.log('');
    }

    // Resumo final
    console.log('📋 RESUMO FINAL DA IMPORTAÇÃO');
    console.log('=' * 60);
    console.log(`📊 Total no arquivo: ${dadosClientes.length}`);
    console.log(`📊 Clientes já no banco: ${clientesExistentes.length}`);
    console.log(`🆕 Clientes novos: ${clientesNovos.length}`);
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
        clientesNovos: clientesNovos.length,
        sucessos,
        falhas,
        totalBanco: clientesExistentes.length + sucessos
      },
      resultados: resultados
    };

    fs.writeFileSync('resultado-importacao-otimizada.json', JSON.stringify(resultadoFinal, null, 2));
    console.log('💾 Resultados salvos em: resultado-importacao-otimizada.json');

    // Mostrar erros se houver
    if (falhas > 0) {
      console.log('');
      console.log('❌ CLIENTES COM ERRO:');
      resultados
        .filter(r => !r.success)
        .slice(0, 20)
        .forEach(r => console.log(`  - ${r.cliente}: ${r.error}`));
      
      if (falhas > 20) {
        console.log(`  ... e mais ${falhas - 20} erros`);
      }
    }

    console.log('');
    console.log('🎉 Importação concluída!');

  } catch (error) {
    console.error('💥 Erro fatal durante importação:', error);
  }
}

// Executar importação
importarTodosClientes();
