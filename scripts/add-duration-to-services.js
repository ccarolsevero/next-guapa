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
    trim: true
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

async function addDurationToServices() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado ao MongoDB com sucesso!');

    // Buscar todos os serviços que não têm duration
    const servicesWithoutDuration = await Service.find({ duration: { $exists: false } });
    console.log(`Encontrados ${servicesWithoutDuration.length} serviços sem duration`);

    // Atualizar cada serviço com duration padrão baseado na categoria
    for (const service of servicesWithoutDuration) {
      let defaultDuration = 60; // padrão

      // Definir duração baseada na categoria
      switch (service.category) {
        case 'Consultoria e Avaliação':
          defaultDuration = 30;
          break;
        case 'Cortes':
          defaultDuration = 60;
          break;
        case 'Colorimetria':
          defaultDuration = 120;
          break;
        case 'Tratamentos Naturais':
          defaultDuration = 90;
          break;
      }

      await Service.updateOne(
        { _id: service._id },
        { $set: { duration: defaultDuration } }
      );
      
      console.log(`✅ Atualizado: ${service.name} - ${defaultDuration}min`);
    }

    // Verificar resultado
    const totalServices = await Service.countDocuments();
    const servicesWithDuration = await Service.countDocuments({ duration: { $exists: true } });
    
    console.log(`\n📊 Resultado:`);
    console.log(`Total de serviços: ${totalServices}`);
    console.log(`Serviços com duration: ${servicesWithDuration}`);

    console.log('\n✅ Atualização concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a atualização:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB');
  }
}

// Executar a atualização
addDurationToServices();
