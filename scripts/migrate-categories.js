const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Conectar ao MongoDB
async function connectDB() {
  try {
    console.log('🔗 Conectando ao MongoDB...');
    console.log(
      '📡 MONGODB_URI:',
      process.env.MONGODB_URI ? 'Configurada' : 'NÃO CONFIGURADA',
    );
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
}

// Schema para categorias de serviços
const serviceCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
      default: '#D15556',
    },
    icon: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Schema para categorias de produtos
const productCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
      default: '#006D5B',
    },
    icon: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const ServiceCategory =
  mongoose.models.ServiceCategory ||
  mongoose.model('ServiceCategory', serviceCategorySchema);
const ProductCategory =
  mongoose.models.ProductCategory ||
  mongoose.model('ProductCategory', productCategorySchema);

// Categorias padrão para serviços
const defaultServiceCategories = [
  {
    name: 'Consultoria',
    description: 'Consultas e orientações',
    color: '#D15556',
    order: 1,
  },
  {
    name: 'Cortes',
    description: 'Cortes femininos e masculinos',
    color: '#D15556',
    order: 2,
  },
  {
    name: 'Coloração',
    description: 'Serviços de coloração capilar',
    color: '#D15556',
    order: 3,
  },
  {
    name: 'Combo',
    description: 'Pacotes de serviços',
    color: '#D15556',
    order: 4,
  },
  {
    name: 'Finalização',
    description: 'Penteados e finalizações',
    color: '#D15556',
    order: 5,
  },
  {
    name: 'Tratamentos',
    description: 'Tratamentos capilares',
    color: '#D15556',
    order: 6,
  },
  {
    name: 'Hidratação',
    description: 'Hidratação profunda',
    color: '#D15556',
    order: 7,
  },
  {
    name: 'Reconstrução',
    description: 'Reconstrução capilar',
    color: '#D15556',
    order: 8,
  },
  {
    name: 'Penteados',
    description: 'Penteados especiais',
    color: '#D15556',
    order: 9,
  },
  {
    name: 'Maquiagem',
    description: 'Serviços de maquiagem',
    color: '#D15556',
    order: 10,
  },
];

// Categorias padrão para produtos
const defaultProductCategories = [
  {
    name: 'Shampoo',
    description: 'Produtos para limpeza capilar',
    color: '#006D5B',
    order: 1,
  },
  {
    name: 'Condicionador',
    description: 'Condicionadores e máscaras',
    color: '#006D5B',
    order: 2,
  },
  {
    name: 'Máscara',
    description: 'Máscaras de tratamento',
    color: '#006D5B',
    order: 3,
  },
  { name: 'Óleo', description: 'Óleos capilares', color: '#006D5B', order: 4 },
  {
    name: 'Protetor Térmico',
    description: 'Protetores térmicos',
    color: '#006D5B',
    order: 5,
  },
  {
    name: 'Tratamentos',
    description: 'Produtos de tratamento',
    color: '#006D5B',
    order: 6,
  },
  {
    name: 'Finalizadores',
    description: 'Produtos de finalização',
    color: '#006D5B',
    order: 7,
  },
  {
    name: 'Acessórios',
    description: 'Acessórios e ferramentas',
    color: '#006D5B',
    order: 8,
  },
];

async function migrateCategories() {
  try {
    console.log('🚀 Iniciando migração de categorias...');

    // Verificar se já existem categorias
    const existingServiceCategories = await ServiceCategory.countDocuments();
    const existingProductCategories = await ProductCategory.countDocuments();

    if (existingServiceCategories > 0) {
      console.log(
        `⚠️  Já existem ${existingServiceCategories} categorias de serviços. Pulando...`,
      );
    } else {
      console.log('📝 Criando categorias de serviços...');
      await ServiceCategory.insertMany(defaultServiceCategories);
      console.log(
        `✅ ${defaultServiceCategories.length} categorias de serviços criadas`,
      );
    }

    if (existingProductCategories > 0) {
      console.log(
        `⚠️  Já existem ${existingProductCategories} categorias de produtos. Pulando...`,
      );
    } else {
      console.log('📝 Criando categorias de produtos...');
      await ProductCategory.insertMany(defaultProductCategories);
      console.log(
        `✅ ${defaultProductCategories.length} categorias de produtos criadas`,
      );
    }

    console.log('🎉 Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado do MongoDB');
  }
}

// Executar migração
if (require.main === module) {
  connectDB().then(() => {
    migrateCategories();
  });
}

module.exports = { migrateCategories };
