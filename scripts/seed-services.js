const mongoose = require('mongoose');

// Conectar ao MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://brunacanovas_db_user:amCzSzLUpD7P96gD@espacoguapa.npfnuuc.mongodb.net/?retryWrites=true&w=majority&appName=Espacoguapa';

// Schema do Serviço
const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: ['Consultoria e Avaliação', 'Cortes', 'Colorimetria', 'Tratamentos Naturais']
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 15,
    max: 480,
    default: 60
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);

async function seedServices() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado ao MongoDB com sucesso!');

    // Limpar dados existentes
    console.log('Limpando dados existentes...');
    await Service.deleteMany({});
    console.log('Dados limpos!');

    // Dados dos serviços
    const servicesData = [
      // Consultoria e Avaliação
      {
        name: 'Avaliação Capilar',
        category: 'Consultoria e Avaliação',
        description: 'Avaliação completa do couro cabeludo e fios para identificar necessidades específicas.',
        price: 60.00,
        duration: 30,
        isActive: true,
        order: 1
      },
      {
        name: 'Consultoria/Corte',
        category: 'Consultoria e Avaliação',
        description: 'Consultoria de visagismo + corte personalizado para valorizar seu tipo de cabelo.',
        price: 198.00,
        duration: 90,
        isActive: true,
        order: 2
      },
      {
        name: 'Avaliação + Tratamento',
        category: 'Consultoria e Avaliação',
        description: 'Avaliação + tratamento personalizado para resultados mais eficazes.',
        price: 140.00,
        duration: 60,
        isActive: true,
        order: 3
      },
      
      // Cortes
      {
        name: 'Corte',
        category: 'Cortes',
        description: 'Corte de cabelo com manutenção das pontas e acabamento profissional.',
        price: 132.00,
        isActive: true,
        order: 1
      },
      {
        name: 'Corte e Tratamento Keune',
        category: 'Cortes',
        description: 'Corte + tratamento premium Keune Care para fios mais saudáveis.',
        price: 198.00,
        isActive: true,
        order: 2
      },
      {
        name: 'Corte Infantil',
        category: 'Cortes',
        description: 'Cuidado especial para os pequenos, com paciência e carinho para deixar as crianças confortáveis.',
        price: 40.00,
        isActive: true,
        order: 3
      },
      {
        name: 'Acabamento',
        category: 'Cortes',
        description: 'Ajustes finos e definição para finalizar seu visual com perfeição e brilho.',
        price: 30.00,
        isActive: true,
        order: 4
      },
      
      // Colorimetria
      {
        name: 'Back To Natural - P',
        category: 'Colorimetria',
        description: 'Repigmentação de cabelos loiros para cabelos mais curtos.',
        price: 231.00,
        isActive: true,
        order: 1
      },
      {
        name: 'Back To Natural - M',
        category: 'Colorimetria',
        description: 'Repigmentação de cabelos loiros para cabelos médios.',
        price: 319.00,
        isActive: true,
        order: 2
      },
      {
        name: 'Back To Natural - G',
        category: 'Colorimetria',
        description: 'Repigmentação de cabelos loiros para cabelos longos.',
        price: 385.00,
        isActive: true,
        order: 3
      },
      {
        name: 'Iluminado P',
        category: 'Colorimetria',
        description: 'Iluminado para cabelos até o ombro com técnicas modernas.',
        price: 500.00,
        isActive: true,
        order: 4
      },
      {
        name: 'Iluminado M',
        category: 'Colorimetria',
        description: 'Iluminado para cabelos abaixo do ombro com brilho natural.',
        price: 605.00,
        isActive: true,
        order: 5
      },
      {
        name: 'Iluminado G',
        category: 'Colorimetria',
        description: 'Iluminado para cabelos longos com efeito deslumbrante.',
        price: 715.00,
        isActive: true,
        order: 6
      },
      {
        name: 'Mechas Coloridas',
        category: 'Colorimetria',
        description: 'Mechas localizadas coloridas ou platinadas para um visual único.',
        price: 250.00,
        isActive: true,
        order: 7
      },
      {
        name: 'Coloração Keune',
        category: 'Colorimetria',
        description: 'Cobertura de brancos com Tinta Color Keune de alta qualidade.',
        price: 121.00,
        isActive: true,
        order: 8
      },
      
      // Tratamentos Naturais
      {
        name: 'Hidratação Natural',
        category: 'Tratamentos Naturais',
        description: 'Hidratação com produtos naturais Keune para restaurar a umidade dos fios.',
        price: 80.00,
        isActive: true,
        order: 1
      },
      {
        name: 'Reconstrução Capilar',
        category: 'Tratamentos Naturais',
        description: 'Fortalece os fios danificados e restaura a estrutura capilar com proteínas naturais.',
        price: 120.00,
        isActive: true,
        order: 2
      },
      {
        name: 'Limpeza de Couro Cabeludo',
        category: 'Tratamentos Naturais',
        description: 'Limpeza profunda e desintoxicante do couro cabeludo para melhorar a saúde dos folículos.',
        price: 100.00,
        isActive: true,
        order: 3
      },
      {
        name: 'Tratamento Anti-Queda',
        category: 'Tratamentos Naturais',
        description: 'Tratamento específico para queda de cabelo com produtos naturais.',
        price: 150.00,
        isActive: true,
        order: 4
      },
      {
        name: 'Terapia Capilar Completa',
        category: 'Tratamentos Naturais',
        description: 'Pacote completo de tratamentos para máxima revitalização dos fios.',
        price: 200.00,
        isActive: true,
        order: 5
      }
    ];

    // Inserir serviços
    console.log('Inserindo serviços...');
    const services = await Service.insertMany(servicesData);
    console.log(`${services.length} serviços inseridos com sucesso!`);

    // Verificar dados inseridos
    const totalServices = await Service.countDocuments();
    console.log(`Total de serviços no banco: ${totalServices}`);

    // Agrupar por categoria
    const servicesByCategory = await Service.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          services: { $push: { name: '$name', price: '$price' } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('\nServiços por categoria:');
    servicesByCategory.forEach(category => {
      console.log(`\n${category._id} (${category.count} serviços):`);
      category.services.forEach(service => {
        console.log(`  - ${service.name}: R$ ${service.price.toFixed(2)}`);
      });
    });

    console.log('\n✅ Seed de serviços concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB');
  }
}

// Executar o seed
seedServices();
