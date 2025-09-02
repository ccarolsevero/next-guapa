const fs = require('fs');
const path = require('path');

// Dados dos clientes que você forneceu
const clientsData = [
  {
    nome: 'Adelaide Nascimento',
    telefone: '(55) 19997--4430',
    dataCadastro: '24/11/2021',
  },
  {
    nome: 'Adele Motta',
    telefone: '(11) 95465--7438',
    dataCadastro: '11/08/2022',
  },
  {
    nome: 'Adriana Conti',
    telefone: '(19) 99619--9870',
    dataCadastro: '28/07/2021',
  },
  {
    nome: 'Adriana Cristina Ferrari Capodifoglio',
    telefone: '(19) 99164--2240',
    dataCadastro: '07/07/2023',
  },
  {
    nome: 'Adriana da Silva',
    telefone: '(19) 99861--2734',
    dataCadastro: '14/04/2022',
  },
  // Adicione mais clientes conforme necessário
];

// Função para padronizar telefone
function padronizarTelefone(telefone) {
  // Remove o código do Brasil (55) se estiver presente
  let telefoneLimpo = telefone.replace(/^\(55\)\s*/, '');

  // Remove espaços extras e hífens duplos
  telefoneLimpo = telefoneLimpo.replace(/\s+/g, '').replace(/--/g, '-');

  // Garante que tenha o formato correto (DDD) NÚMERO-NÚMERO
  if (telefoneLimpo.startsWith('(')) {
    return telefoneLimpo; // Já está no formato correto
  } else {
    // Adiciona parênteses se não tiver
    return `(${telefoneLimpo}`;
  }
}

// Criar dados para importação (com email gerado e telefone padronizado)
const importData = clientsData.map((client, index) => {
  // Gerar email baseado no nome
  const email = `${client.nome.toLowerCase().replace(/\s+/g, '.')}@guapa.com`;

  // Padronizar telefone
  const telefonePadronizado = padronizarTelefone(client.telefone);

  return {
    nome: client.nome,
    email: email,
    telefone: telefonePadronizado,
    dataNascimento: client.dataCadastro,
    endereco: 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP',
    observacoes: `Cliente cadastrado em ${client.dataCadastro}`,
    totalVisitas: 0,
    valorTotal: 0,
    ultimaVisita: '',
    servicosRealizados: '',
    ticketMedio: 0,
  };
});

// Salvar como JSON para verificação
fs.writeFileSync(
  'clients-import-data.json',
  JSON.stringify(importData, null, 2),
);

console.log('Dados preparados para importação:');
console.log(`Total de clientes: ${importData.length}`);
console.log('\nExemplos de telefones padronizados:');
importData.forEach((client) => {
  console.log(`- ${client.nome}: ${client.telefone}`);
});

console.log('\nArquivo clients-import-data.json criado com sucesso!');
console.log('Agora você pode:');
console.log('1. Acessar /admin/clientes/importar no sistema');
console.log('2. Usar o botão "Baixar Template" para ver o formato esperado');
console.log('3. Criar um arquivo Excel com esses dados e importar');
