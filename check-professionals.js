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

async function checkProfessionals() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado ao MongoDB com sucesso!');

    const professionals = await Professional.find({});
    console.log('\n=== PROFISSIONAIS NO BANCO ===');
    console.log('Total de profissionais:', professionals.length);
    
    professionals.forEach((prof, index) => {
      console.log(`\n${index + 1}. ${prof.name} (${prof.title})`);
      console.log(`   ID: ${prof._id}`);
      console.log(`   Email: ${prof.email}`);
      console.log(`   Ativo: ${prof.isActive}`);
      console.log(`   Destaque: ${prof.isFeatured}`);
      console.log(`   Serviços: ${prof.services.length} serviços`);
      console.log(`   Galeria: ${prof.gallery.length} fotos`);
    });

    // Verificar especificamente por Ana Carolina
    const anaCarolina = await Professional.findOne({ name: { $regex: /ana carolina/i } });
    if (anaCarolina) {
      console.log('\n✅ Ana Carolina Severo encontrada no banco!');
      console.log('Dados:', JSON.stringify(anaCarolina, null, 2));
    } else {
      console.log('\n❌ Ana Carolina Severo NÃO encontrada no banco');
      
      // Verificar se existe algum profissional com "Ana" no nome
      const anaProfessionals = await Professional.find({ name: { $regex: /ana/i } });
      if (anaProfessionals.length > 0) {
        console.log('\nProfissionais com "Ana" no nome:');
        anaProfessionals.forEach(prof => {
          console.log(`- ${prof.name} (${prof.email})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDesconectado do MongoDB');
  }
}

checkProfessionals();
