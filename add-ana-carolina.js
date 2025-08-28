const mongoose = require('mongoose');

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

async function addAnaCarolina() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado ao MongoDB com sucesso!');

    // Verificar se já existe
    const existingAna = await Professional.findOne({ name: { $regex: /ana carolina/i } });
    if (existingAna) {
      console.log('Ana Carolina já existe no banco!');
      console.log('Dados:', JSON.stringify(existingAna, null, 2));
      return;
    }

    // Dados da Ana Carolina
    const anaCarolinaData = {
      name: 'Ana Carolina Severo',
      title: 'Cabeleireira',
      email: 'ana@guapa.com',
      phone: '(19) 99999-8888',
      shortDescription: 'Especialista em cortes modernos e tratamentos capilares',
      fullDescription: 'Ana Carolina é uma profissional dedicada e apaixonada por transformar o visual de suas clientes. Com anos de experiência em cortes modernos, colorações e tratamentos capilares, ela oferece um atendimento personalizado e de qualidade. Sua técnica apurada e atenção aos detalhes garantem resultados excepcionais para cada cliente.',
      services: [
        'Cortes Modernos',
        'Coloração',
        'Tratamentos Capilares',
        'Escova',
        'Finalização',
        'Hidratação',
        'Avaliação Capilar',
        'Consultoria de Visagismo'
      ],
      profileImage: '/assents/fotobruna.jpeg', // Usando foto da Bruna como placeholder
      gallery: [
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16.jpeg',
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (1).jpeg',
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (2).jpeg',
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (3).jpeg',
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (4).jpeg'
      ],
      isActive: true,
      isFeatured: true
    };

    console.log('Inserindo Ana Carolina...');
    const anaCarolina = await Professional.create(anaCarolinaData);
    console.log('✅ Ana Carolina inserida com sucesso! ID:', anaCarolina._id);

    // Verificar todos os profissionais
    const allProfessionals = await Professional.find({});
    console.log('\n=== TODOS OS PROFISSIONAIS NO BANCO ===');
    console.log('Total de profissionais:', allProfessionals.length);
    
    allProfessionals.forEach((prof, index) => {
      console.log(`\n${index + 1}. ${prof.name} (${prof.title})`);
      console.log(`   ID: ${prof._id}`);
      console.log(`   Email: ${prof.email}`);
      console.log(`   Ativo: ${prof.isActive}`);
      console.log(`   Destaque: ${prof.isFeatured}`);
    });

    console.log('\n✅ Ana Carolina Severo adicionada com sucesso!');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDesconectado do MongoDB');
  }
}

addAnaCarolina();
