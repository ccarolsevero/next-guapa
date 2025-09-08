const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function forceUpdateBruna() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa');
    console.log('✅ Conectado ao MongoDB');

    // Usar a coleção diretamente
    const db = mongoose.connection.db;
    const collection = db.collection('professionals');
    
    // Buscar a Bruna
    const bruna = await collection.findOne({ name: /bruna/i });
    console.log('👤 Bruna encontrada:', bruna ? 'Sim' : 'Não');
    
    if (bruna) {
      console.log('📋 Dados atuais da Bruna:', {
        name: bruna.name,
        username: bruna.username,
        role: bruna.role,
        isActive: bruna.isActive,
        hasPassword: !!bruna.password
      });
      
      // Criar nova senha hash
      const hashedPassword = await bcrypt.hash('bruna123', 10);
      
      // Atualizar diretamente na coleção
      const result = await collection.updateOne(
        { _id: bruna._id },
        {
          $set: {
            password: hashedPassword,
            username: 'bruna',
            role: 'admin',
            canAccessFinancial: true,
            canAccessSiteEdit: true,
            canAccessGoals: true,
            canAccessReports: true,
            isActive: true
          }
        }
      );
      
      console.log('✅ Resultado da atualização:', result);
      
      // Verificar se foi atualizado
      const brunaAtualizada = await collection.findOne({ _id: bruna._id });
      console.log('🔍 Verificação pós-atualização:');
      console.log('   Nome:', brunaAtualizada.name);
      console.log('   Username:', brunaAtualizada.username);
      console.log('   Role:', brunaAtualizada.role);
      console.log('   isActive:', brunaAtualizada.isActive);
      console.log('   Tem senha:', !!brunaAtualizada.password);
      console.log('   Senha hash:', brunaAtualizada.password ? brunaAtualizada.password.substring(0, 20) + '...' : 'N/A');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

forceUpdateBruna();
