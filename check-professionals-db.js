import { connectToDatabase } from './src/lib/mongodb.js';

async function checkProfessionals() {
  try {
    console.log('Conectando ao banco...');
    await connectToDatabase();

    console.log('\n=== VERIFICANDO PROFISSIONAIS ===');

    // Importar dinamicamente os modelos
    const { default: Professional } = await import(
      './src/models/Professional.js'
    );
    const { default: Service } = await import('./src/models/Service.js');

    const professionals = await Professional.find({});
    console.log('Total de profissionais:', professionals.length);

    professionals.forEach((prof, index) => {
      console.log(`\n--- Profissional ${index + 1} ---`);
      console.log('ID:', prof._id);
      console.log('Nome:', prof.name);
      console.log('Serviços:', prof.services);
      console.log('Serviços em Destaque:', prof.featuredServices);
      console.log('Ativo:', prof.isActive);
    });

    console.log('\n=== VERIFICANDO SERVIÇOS ===');
    const services = await Service.find({ isActive: true });
    console.log('Total de serviços ativos:', services.length);

    services.slice(0, 5).forEach((service, index) => {
      console.log(`\n--- Serviço ${index + 1} ---`);
      console.log('Nome:', service.name);
      console.log('Categoria:', service.category);
      console.log('Preço:', service.price);
    });

    console.log('\n=== VERIFICANDO MATCH ===');
    professionals.forEach((prof) => {
      console.log(`\n--- ${prof.name} ---`);
      if (prof.services && prof.services.length > 0) {
        console.log('Serviços da profissional:', prof.services);

        const matchingServices = services.filter((service) =>
          prof.services.includes(service.name),
        );
        console.log('Serviços encontrados no banco:', matchingServices.length);
        console.log(
          'Nomes dos serviços encontrados:',
          matchingServices.map((s) => s.name),
        );
      } else {
        console.log('❌ Nenhum serviço definido para esta profissional');
      }
    });
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    process.exit(0);
  }
}

checkProfessionals();
