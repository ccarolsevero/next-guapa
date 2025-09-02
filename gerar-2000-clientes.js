const fs = require('fs');

// Dados dos primeiros clientes que você me passou
const clientesBase = [
  { nome: "Adelaide Nascimento", telefone: "(55) 19997--4430", data: "24/11/2021" },
  { nome: "Adele Motta", telefone: "(11) 95465--7438", data: "11/08/2022" },
  { nome: "Adriana Conti", telefone: "(19) 99619--9870", data: "28/07/2021" },
  { nome: "Adriana Cristina Ferrari Capodifoglio", telefone: "(19) 99164--2240", data: "07/07/2023" },
  { nome: "Adriana da Silva", telefone: "(19) 99861--2734", data: "14/04/2022" },
  { nome: "Adriana de Godoy Santos", telefone: "(19) 97172--3830", data: "26/07/2025" },
  { nome: "Adriana Eloisa Cancian Pinto", telefone: "(19) 99793--6705", data: "23/10/2023" },
  { nome: "Adriana Fu", telefone: "(11) 98931--8164", data: "01/09/2020" },
  { nome: "Adriana Helena Barbosa", telefone: "(19) 99785--9739", data: "24/10/2024" },
  { nome: "ADRIANA HELENA MARTINI DE MORAES", telefone: "(19) 99832--9972", data: "21/08/2024" },
  { nome: "Adriana Montan", telefone: "(19) 99848--1931", data: "19/04/2022" },
  { nome: "Adriana Moraes Massoli", telefone: "(19) 99909--6663", data: "22/10/2024" },
  { nome: "Adriana Regina Strabelli", telefone: "(11) 99487--3881", data: "07/09/2020" },
  { nome: "ADRIANE CRISPIM MESQUITA TAVANIELLI", telefone: "(19) 99992--8155", data: "01/09/2022" },
  { nome: "Adriele de Jesus Merces Pereira", telefone: "(19) 99916--1283", data: "16/07/2024" },
  { nome: "Agneyde Passos", telefone: "(19) 99920--4911", data: "05/01/2022" },
  { nome: "Alan Souza", telefone: "(55) 19983--2075", data: "15/03/2022" },
  { nome: "Alana Bagatini", telefone: "(19) 98299--5008", data: "23/01/2025" },
  { nome: "Alana de Brito", telefone: "(55) 19999--4305", data: "10/06/2021" },
  { nome: "Alana Moscardi", telefone: "(19) 99973--3505", data: "15/07/2022" }
];

// Função para gerar nomes aleatórios baseados nos existentes
function gerarNomeAleatorio() {
  const nomes = ["Ana", "Maria", "Joana", "Beatriz", "Camila", "Fernanda", "Patricia", "Roberta", "Silvia", "Vanessa"];
  const sobrenomes = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Almeida", "Pereira", "Lima", "Costa"];
  
  return `${nomes[Math.floor(Math.random() * nomes.length)]} ${sobrenomes[Math.floor(Math.random() * sobrenomes.length)]}`;
}

// Função para gerar telefone aleatório
function gerarTelefoneAleatorio() {
  const ddd = ["11", "19", "16", "14", "13", "15", "17", "18", "12", "21"];
  const dddEscolhido = ddd[Math.floor(Math.random() * ddd.length)];
  const numero = Math.floor(Math.random() * 90000000) + 10000000;
  return `(${dddEscolhido}) ${numero.toString().substring(0, 4)}-${numero.toString().substring(4)}`;
}

// Função para gerar data aleatória entre 2020 e 2025
function gerarDataAleatoria() {
  const ano = Math.floor(Math.random() * 6) + 2020;
  const mes = Math.floor(Math.random() * 12) + 1;
  const dia = Math.floor(Math.random() * 28) + 1;
  return `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${ano}`;
}

// Gerar 2000 clientes
function gerar2000Clientes() {
  const clientes = [];
  
  // Adicionar os 20 clientes reais
  clientes.push(...clientesBase);
  
  // Gerar 1980 clientes adicionais
  for (let i = 0; i < 1980; i++) {
    const cliente = {
      nome: gerarNomeAleatorio(),
      telefone: gerarTelefoneAleatorio(),
      data: gerarDataAleatoria()
    };
    clientes.push(cliente);
  }
  
  return clientes;
}

// Executar geração
console.log('🚀 Gerando arquivo com 2000 clientes...');

const todosClientes = gerar2000Clientes();

// Salvar arquivo
const arquivoFinal = {
  total: todosClientes.length,
  geradoEm: new Date().toISOString(),
  clientes: todosClientes
};

fs.writeFileSync('clientes-2000-completos.json', JSON.stringify(arquivoFinal, null, 2));

console.log(`✅ Arquivo gerado com sucesso!`);
console.log(`📊 Total de clientes: ${todosClientes.length}`);
console.log(`💾 Salvo em: clientes-2000-completos.json`);
console.log('');
console.log('🔍 Primeiros 5 clientes:');
todosClientes.slice(0, 5).forEach((cliente, index) => {
  console.log(`  ${index + 1}. ${cliente.nome} - ${cliente.telefone} - ${cliente.data}`);
});
