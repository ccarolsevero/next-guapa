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

async function checkAllProfessionals() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado ao MongoDB com sucesso!');

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
      console.log(`   Criado em: ${prof.createdAt}`);
      console.log(`   Atualizado em: ${prof.updatedAt}`);
    });

    // Verificar especificamente a Bruna
    const bruna = await Professional.findOne({ name: { $regex: /bruna/i } });
    if (bruna) {
      console.log('\n=== DADOS DA BRUNA ===');
      console.log('Nome:', bruna.name);
      console.log('Email:', bruna.email);
      console.log('Ativo:', bruna.isActive);
      console.log('Destaque:', bruna.isFeatured);
      console.log('ID:', bruna._id);
    } else {
      console.log('\n❌ Bruna não encontrada no banco!');
    }

    // Verificar a Cicera
    const cicera = await Professional.findOne({ name: { $regex: /cicera/i } });
    if (cicera) {
      console.log('\n=== DADOS DA CICERA ===');
      console.log('Nome:', cicera.name);
      console.log('Email:', cicera.email);
      console.log('Ativo:', cicera.isActive);
      console.log('Destaque:', cicera.isFeatured);
      console.log('ID:', cicera._id);
    } else {
      console.log('\n❌ Cicera não encontrada no banco!');
    }

    // Verificar a Ana Carolina
    const anaCarolina = await Professional.findOne({ name: { $regex: /ana carolina/i } });
    if (anaCarolina) {
      console.log('\n=== DADOS DA ANA CAROLINA ===');
      console.log('Nome:', anaCarolina.name);
      console.log('Email:', anaCarolina.email);
      console.log('Ativo:', anaCarolina.isActive);
      console.log('Destaque:', anaCarolina.isFeatured);
      console.log('ID:', anaCarolina._id);
    } else {
      console.log('\n❌ Ana Carolina não encontrada no banco!');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDesconectado do MongoDB');
  }
}

checkAllProfessionals();
