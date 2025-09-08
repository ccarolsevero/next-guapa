const mongoose = require('mongoose');

// Schema do Professional (simplificado para o script)
const professionalSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'professional'], default: 'professional' },
  canAccessFinancial: { type: Boolean, default: false },
  canAccessSiteEdit: { type: Boolean, default: false },
  canAccessGoals: { type: Boolean, default: false },
  canAccessReports: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Professional = mongoose.model('Professional', professionalSchema);

async function debugBruna() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa');
    console.log('✅ Conectado ao MongoDB');

    // Buscar a Bruna
    const bruna = await Professional.findOne({ name: /bruna/i });
    
    if (bruna) {
      console.log('👤 Bruna encontrada:');
      console.log('   Nome:', bruna.name);
      console.log('   Username:', bruna.username);
      console.log('   Role:', bruna.role);
      console.log('   isActive:', bruna.isActive);
      console.log('   Tem senha:', !!bruna.password);
      console.log('   Senha hash:', bruna.password ? bruna.password.substring(0, 20) + '...' : 'N/A');
    } else {
      console.log('❌ Bruna não encontrada');
    }

    // Listar todos os profissionais
    const allProfessionals = await Professional.find({});
    console.log('\n📋 Todos os profissionais:');
    allProfessionals.forEach(prof => {
      console.log(`   - ${prof.name} (${prof.username}) - ${prof.role} - Ativo: ${prof.isActive}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

debugBruna();
