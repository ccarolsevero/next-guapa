const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema do Professional (simplificado para o script)
const professionalSchema = new mongoose.Schema(
  {
    name: String,
    username: { type: String, unique: true },
    password: String,
    role: {
      type: String,
      enum: ['admin', 'professional'],
      default: 'professional',
    },
    canAccessFinancial: { type: Boolean, default: false },
    canAccessSiteEdit: { type: Boolean, default: false },
    canAccessGoals: { type: Boolean, default: false },
    canAccessReports: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Professional = mongoose.model('Professional', professionalSchema);

async function setupAdminBruna() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa',
    );
    console.log('✅ Conectado ao MongoDB');

    // Verificar se a Bruna já existe
    let bruna = await Professional.findOne({ name: /bruna/i });

    if (bruna) {
      console.log('👤 Bruna encontrada, atualizando permissões...');

      // Atualizar permissões da Bruna para admin
      bruna.role = 'admin';
      bruna.canAccessFinancial = true;
      bruna.canAccessSiteEdit = true;
      bruna.canAccessGoals = true;
      bruna.canAccessReports = true;
      bruna.isActive = true;

      // Se não tem username, criar um
      if (!bruna.username) {
        bruna.username = 'bruna';
      }

      // Se não tem senha ou quer redefinir, criar nova senha
      if (!bruna.password) {
        const hashedPassword = await bcrypt.hash('bruna123', 10);
        bruna.password = hashedPassword;
        console.log('🔑 Nova senha criada: bruna123');
      }

      await bruna.save();
      console.log('✅ Bruna atualizada como administradora principal');
    } else {
      console.log('👤 Bruna não encontrada, criando novo registro...');

      // Criar nova Bruna como admin
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
        email: 'bruna@guapa.com',
        phone: '',
        shortDescription: 'Especialista em tratamentos capilares',
        fullDescription:
          'Profissional experiente e dedicada aos cuidados capilares',
        services: [],
        featuredServices: [],
        profileImage: '/assents/fotobruna.jpeg',
        gallery: [],
      });

      await bruna.save();
      console.log('✅ Bruna criada como administradora principal');
    }

    console.log('\n🎉 Configuração concluída!');
    console.log('📋 Dados de acesso da Bruna:');
    console.log('   Username: bruna');
    console.log('   Senha: bruna123');
    console.log('   Role: admin (acesso total)');
    console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
  } catch (error) {
    console.error('❌ Erro ao configurar admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

// Executar o script
setupAdminBruna();
