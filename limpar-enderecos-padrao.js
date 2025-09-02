const fs = require('fs');

// URL da API de produção
const PRODUCTION_API_URL = 'https://nextjs-guapa-ar12ywnnv-ana-carolina-severos-projects.vercel.app/api/clients';

// Função para limpar endereço padrão de um cliente
async function limparEnderecoPadrao(cliente) {
  try {
    // Se o endereço for o padrão do salão, limpar para null
    if (cliente.address === 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP') {
      console.log(`🧹 Limpando endereço padrão de: ${cliente.name}`);
      
      const response = await fetch(`${PRODUCTION_API_URL}/${cliente._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP ${response.status}: ${errorData.error || 'Erro desconhecido'}`);
      }

      console.log(`✅ ${cliente.name} - endereço limpo com sucesso`);
      return { success: true, cliente: cliente.name };
    } else {
      console.log(`⏭️ ${cliente.name} - endereço já está correto`);
      return { success: true, cliente: cliente.name, skipped: true };
    }

  } catch (error) {
    console.error(`❌ Erro ao limpar endereço de ${cliente.name}:`, error.message);
    return { success: false, cliente: cliente.name, error: error.message };
  }
}

// Função principal
async function limparEnderecosPadrao() {
  try {
    console.log('🧹 Iniciando limpeza de endereços padrão...');
    console.log(`📡 API: ${PRODUCTION_API_URL}`);
    console.log('');

    // Buscar todos os clientes
    const response = await fetch(PRODUCTION_API_URL);
    if (!response.ok) {
      throw new Error('Erro ao buscar clientes');
    }

    const clientes = await response.json();
    console.log(`📊 Total de clientes encontrados: ${clientes.length}`);

    // Filtrar apenas os que têm endereço padrão
    const clientesComEnderecoPadrao = clientes.filter(cliente => 
      cliente.address === 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP'
    );

    console.log(`🎯 Clientes com endereço padrão: ${clientesComEnderecoPadrao.length}`);
    console.log('');

    if (clientesComEnderecoPadrao.length === 0) {
      console.log('✅ Nenhum cliente com endereço padrão encontrado!');
      return;
    }

    const resultados = [];
    let sucessos = 0;
    let falhas = 0;
    let pulados = 0;

    // Processar em lotes de 3 para não sobrecarregar
    const tamanhoLote = 3;
    for (let i = 0; i < clientesComEnderecoPadrao.length; i += tamanhoLote) {
      const lote = clientesComEnderecoPadrao.slice(i, i + tamanhoLote);
      console.log(`📦 Processando lote ${Math.floor(i / tamanhoLote) + 1}/${Math.ceil(clientesComEnderecoPadrao.length / tamanhoLote)}`);
      
      const promessas = lote.map(cliente => limparEnderecoPadrao(cliente));
      const resultadosLote = await Promise.all(promessas);
      
      resultados.push(...resultadosLote);
      
      // Contar resultados
      resultadosLote.forEach(resultado => {
        if (resultado.success) {
          if (resultado.skipped) {
            pulados++;
          } else {
            sucessos++;
          }
        } else {
          falhas++;
        }
      });
      
      // Aguardar entre lotes
      if (i + tamanhoLote < clientesComEnderecoPadrao.length) {
        console.log('⏳ Aguardando 2 segundos antes do próximo lote...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      console.log('');
    }

    // Resumo final
    console.log('📋 RESUMO DA LIMPEZA');
    console.log('=' * 50);
    console.log(`✅ Sucessos: ${sucessos}`);
    console.log(`⏭️ Pulados: ${pulados}`);
    console.log(`❌ Falhas: ${falhas}`);
    console.log(`📊 Total processado: ${clientesComEnderecoPadrao.length}`);
    console.log('');

    // Salvar resultados
    const resultadoFinal = {
      timestamp: new Date().toISOString(),
      total: clientesComEnderecoPadrao.length,
      sucessos,
      pulados,
      falhas,
      resultados
    };

    fs.writeFileSync('resultado-limpeza-enderecos.json', JSON.stringify(resultadoFinal, null, 2));
    console.log('💾 Resultados salvos em: resultado-limpeza-enderecos.json');

    // Mostrar erros se houver
    if (falhas > 0) {
      console.log('');
      console.log('❌ CLIENTES COM ERRO:');
      resultados
        .filter(r => !r.success)
        .forEach(r => console.log(`  - ${r.cliente}: ${r.error}`));
    }

  } catch (error) {
    console.error('💥 Erro fatal durante limpeza:', error);
  }
}

// Executar limpeza
limparEnderecosPadrao();
