// Script para criar os serviços que faltam
const missingServices = [
  {
    name: 'Avaliação + Tratamento',
    category: 'Consultoria e Avaliação',
    description:
      'Avaliação + tratamento personalizado para resultados mais eficazes.',
    price: 140.0,
    isActive: true,
    order: 3,
  },
  {
    name: 'Corte Infantil',
    category: 'Cortes',
    description:
      'Cuidado especial para os pequenos, com paciência e carinho para deixar as crianças confortáveis.',
    price: 40.0,
    isActive: true,
    order: 3,
  },
  {
    name: 'Corte e Tratamento Keune',
    category: 'Cortes',
    description:
      'Corte + tratamento premium Keune Care para fios mais saudáveis.',
    price: 198.0,
    isActive: true,
    order: 2,
  },
  {
    name: 'Acabamento',
    category: 'Cortes',
    description:
      'Ajustes finos e definição para finalizar seu visual com perfeição e brilho.',
    price: 30.0,
    isActive: true,
    order: 4,
  },
];

async function createMissingServices() {
  console.log('🚀 Criando serviços que faltam...');

  for (const service of missingServices) {
    try {
      const response = await fetch(
        'https://nextjs-guapa-4d084rgek-ana-carolina-severos-projects.vercel.app/api/services',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(service),
        },
      );

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ${service.name} criado com sucesso!`);
      } else {
        console.log(`❌ Erro ao criar ${service.name}:`, response.status);
      }
    } catch (error) {
      console.log(`❌ Erro ao criar ${service.name}:`, error.message);
    }
  }

  console.log('🎉 Processo concluído!');
}

createMissingServices();
