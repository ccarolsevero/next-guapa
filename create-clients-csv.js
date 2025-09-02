const fs = require('fs');

// Lista completa de clientes (primeiros 20 para exemplo)
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
  {
    nome: 'Adriana de Godoy Santos',
    telefone: '(19) 97172--3830',
    dataCadastro: '26/07/2025',
  },
  {
    nome: 'Adriana Eloisa Cancian Pinto',
    telefone: '(19) 99793--6705',
    dataCadastro: '23/10/2023',
  },
  {
    nome: 'Adriana Fu',
    telefone: '(11) 98931--8164',
    dataCadastro: '01/09/2020',
  },
  {
    nome: 'Adriana Helena Barbosa',
    telefone: '(19) 99785--9739',
    dataCadastro: '24/10/2024',
  },
  {
    nome: 'ADRIANA HELENA MARTINI DE MORAES',
    telefone: '(19) 99832--9972',
    dataCadastro: '21/08/2024',
  },
  {
    nome: 'Adriana Montan',
    telefone: '(19) 99848--1931',
    dataCadastro: '19/04/2022',
  },
  {
    nome: 'Adriana Moraes Massoli',
    telefone: '(19) 99909--6663',
    dataCadastro: '22/10/2024',
  },
  {
    nome: 'Adriana Regina Strabelli',
    telefone: '(11) 99487--3881',
    dataCadastro: '07/09/2020',
  },
  {
    nome: 'ADRIANE CRISPIM MESQUITA TAVANIELLI',
    telefone: '(19) 99992--8155',
    dataCadastro: '01/09/2022',
  },
  {
    nome: 'Adriele de Jesus Merces Pereira',
    telefone: '(19) 99916--1283',
    dataCadastro: '16/07/2024',
  },
  {
    nome: 'Agneyde Passos',
    telefone: '(19) 99920--4911',
    dataCadastro: '05/01/2022',
  },
  {
    nome: 'Alan Souza',
    telefone: '(55) 19983--2075',
    dataCadastro: '15/03/2022',
  },
  {
    nome: 'Alana Bagatini',
    telefone: '(19) 98299--5008',
    dataCadastro: '23/01/2025',
  },
  {
    nome: 'Alana de Brito',
    telefone: '(55) 19999--4305',
    dataCadastro: '10/06/2021',
  },
  {
    nome: 'Alana Moscardi',
    telefone: '(19) 99973--3505',
    dataCadastro: '15/07/2022',
  },
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

// Função para converter data do formato brasileiro para ISO
function converterData(dataStr) {
  const [dia, mes, ano] = dataStr.split('/');
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

// Criar dados para importação
const importData = clientsData.map((client) => {
  // Gerar email baseado no nome
  const email = `${client.nome
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '')}@guapa.com`;

  // Padronizar telefone
  const telefonePadronizado = padronizarTelefone(client.telefone);

  // Converter data
  const dataConvertida = converterData(client.dataCadastro);

  return {
    nome: client.nome,
    email: email,
    telefone: telefonePadronizado,
    dataNascimento: dataConvertida,
    endereco: 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP',
    observacoes: `Cliente cadastrado em ${client.dataCadastro}`,
    totalVisitas: 0,
    valorTotal: 0,
    ultimaVisita: '',
    servicosRealizados: '',
    ticketMedio: 0,
  };
});

// Criar cabeçalho CSV
const headers = [
  'nome',
  'email',
  'telefone',
  'dataNascimento',
  'endereco',
  'observacoes',
  'totalVisitas',
  'valorTotal',
  'ultimaVisita',
  'servicosRealizados',
  'ticketMedio',
];

// Criar linhas CSV
const csvLines = [
  headers.join(','),
  ...importData.map((client) =>
    headers
      .map((header) => {
        const value = client[header] || '';
        // Escapar vírgulas e aspas no valor
        if (
          typeof value === 'string' &&
          (value.includes(',') || value.includes('"'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(','),
  ),
];

// Salvar CSV
const csvContent = csvLines.join('\n');
fs.writeFileSync('clientes-guapa-importacao.csv', csvContent);

// Salvar também como JSON para verificação
fs.writeFileSync(
  'clientes-guapa-importacao.json',
  JSON.stringify(importData, null, 2),
);

console.log('Arquivos criados com sucesso!');
console.log(`Total de clientes: ${importData.length}`);
console.log('\nExemplos de telefones padronizados:');
importData.slice(0, 5).forEach((client) => {
  console.log(`- ${client.nome}: ${client.telefone}`);
});

console.log('\nArquivos gerados:');
console.log('1. clientes-guapa-importacao.csv - Para importar no sistema');
console.log('2. clientes-guapa-importacao.json - Para verificação');

console.log('\nPara importar:');
console.log('1. Abra o arquivo CSV no Excel');
console.log('2. Salve como .xlsx');
console.log('3. Acesse /admin/clientes/importar no sistema');
console.log('4. Faça upload do arquivo Excel');
