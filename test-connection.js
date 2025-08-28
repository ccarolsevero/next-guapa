const mongoose = require('mongoose');

// Testar com a URI que está sendo usada
const MONGODB_URI = 'mongodb+srv://brunacanovas_db_user:amCzSzLUpD7P96gD@espacoguapa.npfnuuc.mongodb.net/?retryWrites=true&w=majority&appName=Espacoguapa';

const professionalSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  title: { type: String, trim: true, default: 'Cabeleireira' },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  shortDescription: { type: String, trim: true, default: 'Especialista em tratamentos capilares' },
  fullDescription: { type: String, trim: true, default: 'Profissional experiente e dedicada aos cuidados capilares' },
  services: [{ type: String, trim: true }],
  profileImage: { type: String, default: '/assents/fotobruna.jpeg' },
  gallery: [{ type: String }],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

const Professional = mongoose.model('Professional', professionalSchema);

async function testConnection() {
  try {
    console.log('Testando conexão com MongoDB...');
    console.log('URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB com sucesso!');
    
    // Verificar profissionais
    const professionals = await Professional.find({});
    console.log('\nProfissionais no banco:', professionals.length);
    professionals.forEach(prof => {
      console.log(`- ${prof.name} (${prof.email}) - ID: ${prof._id}`);
    });
    
    // Tentar adicionar Ana Carolina
    console.log('\nTentando adicionar Ana Carolina...');
    const anaCarolina = await Professional.create({
      name: 'Ana Carolina Severo',
      title: 'Cabeleireira',
      email: 'ana@guapa.com',
      phone: '(19) 99999-8888',
      shortDescription: 'Especialista em cortes modernos e tratamentos capilares',
      fullDescription: 'Ana Carolina é uma profissional dedicada e apaixonada por transformar o visual de suas clientes.',
      services: ['Cortes Modernos', 'Coloração', 'Tratamentos Capilares'],
      profileImage: '/assents/fotobruna.jpeg',
      gallery: ['/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16.jpeg'],
      isActive: true,
      isFeatured: true
    });
    
    console.log('✅ Ana Carolina adicionada com sucesso! ID:', anaCarolina._id);
    
    // Verificar novamente
    const updatedProfessionals = await Professional.find({});
    console.log('\nProfissionais após adicionar Ana Carolina:', updatedProfessionals.length);
    updatedProfessionals.forEach(prof => {
      console.log(`- ${prof.name} (${prof.email}) - ID: ${prof._id}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDesconectado do MongoDB');
  }
}

testConnection();
