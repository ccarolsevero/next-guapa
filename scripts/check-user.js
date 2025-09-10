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

async function checkUser() {
  try {
    // Conectar ao MongoDB usando a mesma string da aplicação
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa',
    );
    console.log('✅ Conectado ao MongoDB');

    // Verificar se o usuário teste existe
    const testUser = await Professional.findOne({ username: 'teste' });
    
    if (testUser) {
      console.log('👤 Usuário teste encontrado:');
      console.log('   - Nome:', testUser.name);
      console.log('   - Username:', testUser.username);
      console.log('   - Role:', testUser.role);
      console.log('   - Ativo:', testUser.isActive);
      console.log('   - Permissões:');
      console.log('     * Financial:', testUser.canAccessFinancial);
      console.log('     * Site Edit:', testUser.canAccessSiteEdit);
      console.log('     * Goals:', testUser.canAccessGoals);
      console.log('     * Reports:', testUser.canAccessReports);
      
      // Testar senha
      const isPasswordValid = await bcrypt.compare('teste123', testUser.password);
      console.log('   - Senha válida:', isPasswordValid);
    } else {
      console.log('❌ Usuário teste NÃO encontrado');
    }

    // Listar todos os usuários
    console.log('\n📋 Todos os usuários no banco:');
    const allUsers = await Professional.find({}).select('name username role isActive');
    allUsers.forEach((user) => {
      console.log(`   - ${user.name} (${user.username}) - ${user.role} - Ativo: ${user.isActive}`);
    });

  } catch (error) {
    console.error('❌ Erro ao verificar usuário:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

// Executar o script
checkUser();
