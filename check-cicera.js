const mongoose = require('mongoose');

const MONGODB_URI =
  'mongodb+srv://brunacanovas_db_user:amCzSzLUpD7P96gD@espacoguapa.npfnuuc.mongodb.net/?retryWrites=true&w=majority&appName=Espacoguapa';

const professionalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, trim: true, default: 'Cabeleireira' },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    shortDescription: {
      type: String,
      trim: true,
      default: 'Especialista em tratamentos capilares',
    },
    fullDescription: {
      type: String,
      trim: true,
      default: 'Profissional experiente e dedicada aos cuidados capilares',
    },
    services: [{ type: String, trim: true }],
    profileImage: { type: String, default: '/assents/fotobruna.jpeg' },
    gallery: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Professional = mongoose.model('Professional', professionalSchema);

async function checkAndReactivateCicera() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado ao MongoDB com sucesso!');

    // Verificar status da Cicera
    const cicera = await Professional.findOne({ name: { $regex: /cicera/i } });

    if (cicera) {
      console.log('\n=== STATUS DA CICERA ===');
      console.log(`Nome: ${cicera.name}`);
      console.log(`Email: ${cicera.email}`);
      console.log(`Ativo: ${cicera.isActive}`);
      console.log(`Destaque: ${cicera.isFeatured}`);

      if (!cicera.isActive) {
        console.log('\n🔄 Reativando a Cicera...');
        await Professional.findByIdAndUpdate(cicera._id, { isActive: true });
        console.log('✅ Cicera reativada com sucesso!');
      } else {
        console.log('✅ Cicera já está ativa!');
      }
    } else {
      console.log('❌ Cicera não encontrada no banco');
    }

    // Verificar todos os profissionais
    const allProfessionals = await Professional.find({});
    console.log('\n=== TODOS OS PROFISSIONAIS ===');
    console.log('Total de profissionais:', allProfessionals.length);

    allProfessionals.forEach((prof, index) => {
      console.log(`\n${index + 1}. ${prof.name} (${prof.title})`);
      console.log(`   ID: ${prof._id}`);
      console.log(`   Email: ${prof.email}`);
      console.log(`   Ativo: ${prof.isActive}`);
      console.log(`   Destaque: ${prof.isFeatured}`);
    });
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDesconectado do MongoDB');
  }
}

checkAndReactivateCicera();
