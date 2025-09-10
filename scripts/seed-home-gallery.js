const mongoose = require('mongoose');

// Schema da galeria da home
const homeGallerySchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const HomeGallery = mongoose.model('HomeGallery', homeGallerySchema);

// Fotos da galeria da home
const homePhotos = [
  {
    imageUrl: '/assents/fotoslidehome/WhatsApp Image 2025-08-26 at 20.47.05.jpeg',
    order: 1,
    isActive: true
  },
  {
    imageUrl: '/assents/fotoslidehome/WhatsApp Image 2025-08-26 at 20.47.05 (1).jpeg',
    order: 2,
    isActive: true
  },
  {
    imageUrl: '/assents/fotoslidehome/WhatsApp Image 2025-08-26 at 20.47.05 (2).jpeg',
    order: 3,
    isActive: true
  },
  {
    imageUrl: '/assents/fotoslidehome/WhatsApp Image 2025-08-26 at 20.47.05 (3).jpeg',
    order: 4,
    isActive: true
  }
];

async function seedHomeGallery() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa');
    console.log('Conectado ao MongoDB');

    // Limpar galeria existente
    await HomeGallery.deleteMany({});
    console.log('Galeria existente limpa');

    // Inserir novas fotos
    const insertedPhotos = await HomeGallery.insertMany(homePhotos);
    console.log(`${insertedPhotos.length} fotos inseridas na galeria da home`);

    // Listar fotos inseridas
    const allPhotos = await HomeGallery.find({}).sort({ order: 1 });
    console.log('Fotos na galeria:');
    allPhotos.forEach(photo => {
      console.log(`- ${photo.imageUrl} (ordem: ${photo.order}, ativa: ${photo.isActive})`);
    });

  } catch (error) {
    console.error('Erro ao popular galeria da home:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB');
  }
}

seedHomeGallery();
