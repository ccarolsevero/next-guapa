const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Usar exatamente o mesmo modelo da API
const professionalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    trim: true,
    default: 'Cabeleireira'
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  shortDescription: {
    type: String,
    trim: true,
    default: 'Especialista em tratamentos capilares'
  },
  fullDescription: {
    type: String,
    trim: true,
    default: 'Profissional experiente e dedicada aos cuidados capilares'
  },
  services: [{
    type: String,
    trim: true
  }],
  featuredServices: [{
    type: String,
    trim: true
  }],
  profileImage: {
    type: String,
    default: '/assents/fotobruna.jpeg'
  },
  gallery: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'professional'],
    default: 'professional'
  },
  canAccessFinancial: {
    type: Boolean,
    default: false
  },
  canAccessSiteEdit: {
    type: Boolean,
    default: false
  },
  canAccessGoals: {
    type: Boolean,
    default: false
  },
  canAccessReports: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

const Professional = mongoose.model('Professional', professionalSchema);

async function fixBrunaPassword() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa');
    console.log('✅ Conectado ao MongoDB');

    // Buscar a Bruna
    let bruna = await Professional.findOne({ name: /bruna/i });
    
    if (bruna) {
      console.log('👤 Bruna encontrada, atualizando senha...');
      
      // Criar nova senha hash
      const hashedPassword = await bcrypt.hash('bruna123', 10);
      
      // Atualizar senha e permissões
      bruna.password = hashedPassword;
      bruna.role = 'admin';
      bruna.canAccessFinancial = true;
      bruna.canAccessSiteEdit = true;
      bruna.canAccessGoals = true;
      bruna.canAccessReports = true;
      bruna.isActive = true;
      bruna.username = 'bruna';
      
      await bruna.save();
      console.log('✅ Bruna atualizada com senha!');
    } else {
      console.log('👤 Bruna não encontrada, criando novo registro...');
      
      // Criar nova Bruna
      const hashedPassword = await bcrypt.hash('bruna123', 10);
      
      bruna = new Professional({
        name: 'Bruna',
        username: 'bruna',
        password: hashedPassword,
        role: 'admin',
        canAccessFinancial: true,
        canAccessSiteEdit: true,
        canAccessGoals: true,
        canAccessReports: true,
        isActive: true,
        title: 'Cabeleireira',
        email: '',
        phone: '',
        shortDescription: 'Especialista em tratamentos capilares',
        fullDescription: 'Profissional experiente e dedicada aos cuidados capilares',
        services: [],
        featuredServices: [],
        profileImage: '/assents/fotobruna.jpeg',
        gallery: []
      });
      
      await bruna.save();
      console.log('✅ Bruna criada com senha!');
    }
    
    // Verificar se foi salvo corretamente
    const brunaVerificada = await Professional.findOne({ username: 'bruna' });
    console.log('🔍 Verificação:');
    console.log('   Nome:', brunaVerificada.name);
    console.log('   Username:', brunaVerificada.username);
    console.log('   Role:', brunaVerificada.role);
    console.log('   isActive:', brunaVerificada.isActive);
    console.log('   Tem senha:', !!brunaVerificada.password);
    console.log('   Senha hash:', brunaVerificada.password ? brunaVerificada.password.substring(0, 20) + '...' : 'N/A');
    
    console.log('\n🎉 Configuração concluída!');
    console.log('📋 Dados de acesso da Bruna:');
    console.log('   Username: bruna');
    console.log('   Senha: bruna123');
    console.log('   Role: admin (acesso total)');
    
  } catch (error) {
    console.error('❌ Erro ao configurar Bruna:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

fixBrunaPassword();
