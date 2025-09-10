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
    email: String,
    phone: String,
    title: String,
    shortDescription: String,
    fullDescription: String,
    services: [String],
    featuredServices: [String],
    profileImage: String,
    gallery: [String],
  },
  { timestamps: true },
);

const Professional = mongoose.model('Professional', professionalSchema);

async function createTestUser() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa',
    );
    console.log('✅ Conectado ao MongoDB');

    // Verificar se o usuário teste já existe
    let testUser = await Professional.findOne({ username: 'teste' });

    if (testUser) {
      console.log('👤 Usuário teste encontrado, atualizando...');

      // Atualizar senha
      const hashedPassword = await bcrypt.hash('teste123', 10);
      testUser.password = hashedPassword;
      testUser.isActive = true;
      testUser.role = 'professional';
      testUser.canAccessFinancial = true;
      testUser.canAccessSiteEdit = true;
      testUser.canAccessGoals = true;
      testUser.canAccessReports = true;

      await testUser.save();
      console.log('✅ Usuário teste atualizado');
    } else {
      console.log('👤 Criando novo usuário teste...');

      // Criar novo usuário teste
      const hashedPassword = await bcrypt.hash('teste123', 10);

      testUser = new Professional({
        name: 'Usuário Teste',
        username: 'teste',
        password: hashedPassword,
        role: 'professional',
        canAccessFinancial: true,
        canAccessSiteEdit: true,
        canAccessGoals: true,
        canAccessReports: true,
        isActive: true,
        title: 'Profissional',
        email: 'teste@guapa.com',
        phone: '',
        shortDescription: 'Usuário de teste para desenvolvimento',
        fullDescription: 'Usuário criado para testes do sistema',
        services: [],
        featuredServices: [],
        profileImage: '/assents/fotobruna.jpeg',
        gallery: [],
      });

      await testUser.save();
      console.log('✅ Usuário teste criado');
    }

    console.log('\n🎉 Configuração concluída!');
    console.log('📋 Dados de acesso do usuário teste:');
    console.log('   Username: teste');
    console.log('   Senha: teste123');
    console.log('   Role: professional (com permissões especiais)');
    console.log('\n⚠️  IMPORTANTE: Este é um usuário de teste!');

    // Listar todos os usuários ativos
    console.log('\n📋 Usuários ativos no sistema:');
    const allUsers = await Professional.find({ isActive: true }).select(
      'name username role',
    );
    allUsers.forEach((user) => {
      console.log(`   - ${user.name} (${user.username}) - ${user.role}`);
    });
  } catch (error) {
    console.error('❌ Erro ao criar usuário teste:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

// Executar o script
createTestUser();
