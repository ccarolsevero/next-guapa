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

async function checkServices() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado ao MongoDB com sucesso!');

    // Verificar total de serviços
    const totalServices = await Service.countDocuments();
    console.log(`\n📊 Total de serviços no banco: ${totalServices}`);

    // Verificar serviços ativos
    const activeServices = await Service.countDocuments({ isActive: true });
    console.log(`📊 Serviços ativos: ${activeServices}`);

    // Verificar serviços inativos
    const inactiveServices = await Service.countDocuments({ isActive: false });
    console.log(`📊 Serviços inativos: ${inactiveServices}`);

    // Listar alguns serviços
    const sampleServices = await Service.find({}).limit(5);
    console.log('\n📋 Amostra de serviços:');
    sampleServices.forEach((service, index) => {
      console.log(`${index + 1}. ${service.name} - ${service.category} - Ativo: ${service.isActive} - Duração: ${service.duration}min`);
    });

    // Verificar se há serviços sem duration
    const servicesWithoutDuration = await Service.countDocuments({ duration: { $exists: false } });
    console.log(`\n⚠️  Serviços sem duration: ${servicesWithoutDuration}`);

    // Verificar categorias
    const categories = await Service.distinct('category');
    console.log(`\n📂 Categorias encontradas: ${categories.join(', ')}`);

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDesconectado do MongoDB');
  }
}

// Executar a verificação
checkServices();
