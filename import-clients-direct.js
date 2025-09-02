const fs = require('fs');

// Ler os dados do JSON gerado
const importData = JSON.parse(
  fs.readFileSync('clientes-guapa-importacao.json', 'utf8'),
);

console.log(`Iniciando importação de ${importData.length} clientes...`);

// Função para importar cliente individual
async function importarCliente(cliente) {
  try {
    const response = await fetch('http://localhost:3000/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: cliente.nome,
        email: cliente.email,
        phone: cliente.telefone,
        birthDate: cliente.dataNascimento,
        address: cliente.endereco,
        notes: cliente.observacoes,
        password: '123456', // Senha padrão
        profileComplete: false, // Flag indicando que o perfil precisa ser completado
        onboardingRequired: true, // Flag para forçar onboarding
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, cliente: cliente.nome, id: result._id };
    } else {
      const error = await response.json();
      return {
        success: false,
        cliente: cliente.nome,
        error: error.message || 'Erro desconhecido',
      };
    }
  } catch (error) {
    return { success: false, cliente: cliente.nome, error: error.message };
  }
}

// Função principal de importação
async function importarTodos() {
  const resultados = {
    total: importData.length,
    sucessos: 0,
    erros: 0,
    detalhes: [],
  };

  console.log('\nIniciando importação...\n');

  for (let i = 0; i < importData.length; i++) {
    const cliente = importData[i];
    console.log(`[${i + 1}/${importData.length}] Importando: ${cliente.nome}`);

    const resultado = await importarCliente(cliente);

    if (resultado.success) {
      resultados.sucessos++;
      console.log(`✅ ${cliente.nome} - Importado com sucesso`);
    } else {
      resultados.erros++;
      console.log(`❌ ${cliente.nome} - Erro: ${resultado.error}`);
    }

    resultados.detalhes.push(resultado);

    // Pequena pausa entre as requisições
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Exibir resumo
  console.log('\n' + '='.repeat(50));
  console.log('RESUMO DA IMPORTAÇÃO');
  console.log('='.repeat(50));
  console.log(`Total de clientes: ${resultados.total}`);
  console.log(`✅ Sucessos: ${resultados.sucessos}`);
  console.log(`❌ Erros: ${resultados.erros}`);

  if (resultados.erros > 0) {
    console.log('\nDetalhes dos erros:');
    resultados.detalhes
      .filter((r) => !r.success)
      .forEach((r) => console.log(`- ${r.cliente}: ${r.error}`));
  }

  console.log('\n📝 IMPORTANTE:');
  console.log('- Todos os clientes foram criados com senha padrão: 123456');
  console.log('- Eles precisarão completar o perfil no primeiro acesso');
  console.log('- O sistema irá solicitar dados adicionais automaticamente');

  // Salvar resultados
  fs.writeFileSync(
    'resultado-importacao.json',
    JSON.stringify(resultados, null, 2),
  );
  console.log('\nResultados salvos em: resultado-importacao.json');

  return resultados;
}

// Executar importação
if (require.main === module) {
  importarTodos()
    .then(() => {
      console.log('\nImportação concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro na importação:', error);
      process.exit(1);
    });
}
