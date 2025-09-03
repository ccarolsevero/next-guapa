const { MongoClient } = require('mongodb');
require('dotenv').config();

async function debugEllenFinanceiro() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db(process.env.DB_NAME || 'guapa');
    
    // 1. Verificar se Ellen existe na coleção de profissionais
    console.log('\n🔍 === VERIFICANDO ELLEN ===');
    const ellen = await db.collection('professionals').findOne({
      name: { $regex: /ellen/i }
    });
    
    if (ellen) {
      console.log(`✅ Ellen encontrada: ${ellen.name} (ID: ${ellen._id})`);
    } else {
      console.log('❌ Ellen não encontrada na coleção de profissionais');
      
      // Listar todos os profissionais para ver o que existe
      const todosProfissionais = await db.collection('professionals').find({}).toArray();
      console.log('\n📊 Todos os profissionais:');
      todosProfissionais.forEach(prof => {
        console.log(`   - ${prof.name} (ID: ${prof._id})`);
      });
    }
    
    // 2. Verificar comissões da Ellen
    console.log('\n🔍 === COMISSÕES DA ELLEN ===');
    const comissoesEllen = await db.collection('comissoes').find({
      'vendidoPor': { $regex: /ellen/i }
    }).toArray();
    
    console.log(`📊 Comissões encontradas para Ellen: ${comissoesEllen.length}`);
    
    for (const comissao of comissoesEllen) {
      console.log(`\n💰 Comissão #${comissao._id}`);
      console.log(`   Tipo: ${comissao.tipo}`);
      console.log(`   Item: ${comissao.item}`);
      console.log(`   Valor: R$ ${comissao.valor}`);
      console.log(`   Comissão: R$ ${comissao.comissao}`);
      console.log(`   Vendido por: ${comissao.vendidoPor}`);
      console.log(`   Profissional ID: ${comissao.profissionalId}`);
    }
    
    // 3. Verificar se há comissões com vendidoPor como ObjectId
    console.log('\n🔍 === VERIFICANDO COMISSÕES POR OBJECTID ===');
    if (ellen) {
      const comissoesPorId = await db.collection('comissoes').find({
        'vendidoPor': ellen._id.toString()
      }).toArray();
      
      console.log(`📊 Comissões com vendidoPor como ObjectId: ${comissoesPorId.length}`);
      comissoesPorId.forEach(comissao => {
        console.log(`   - ${comissao.tipo}: ${comissao.item} - R$ ${comissao.valor}`);
      });
    }
    
    // 4. Verificar comissões por profissionalId (que deveria ser o ID da Ellen)
    console.log('\n🔍 === VERIFICANDO COMISSÕES POR PROFISSIONALID ===');
    if (ellen) {
      const comissoesPorProfissionalId = await db.collection('comissoes').find({
        'profissionalId': ellen._id.toString()
      }).toArray();
      
      console.log(`📊 Comissões com profissionalId da Ellen: ${comissoesPorProfissionalId.length}`);
      comissoesPorProfissionalId.forEach(comissao => {
        console.log(`   - ${comissao.tipo}: ${comissao.item} - R$ ${comissao.valor}`);
      });
    }
    
    // 5. Simular a query da API de financeiro para comissões
    console.log('\n🔍 === SIMULANDO QUERY DA API FINANCEIRO ===');
    
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    console.log(`📅 Período: ${inicioMes.toLocaleDateString()} a ${fimMes.toLocaleDateString()}`);
    
    // Query similar à da API de financeiro
    const comissoesPorProfissional = await db.collection('comissoes').aggregate([
      {
        $match: {
          data: { $gte: inicioMes, $lte: fimMes }
        }
      },
      {
        $group: {
          _id: '$profissionalId',
          totalComissao: { $sum: '$comissao' },
          totalVendas: { $sum: '$valor' },
          totalItens: { $sum: 1 },
          detalhes: {
            $push: {
              tipo: '$tipo',
              item: '$item',
              valor: '$valor',
              comissao: '$comissao',
              vendidoPor: '$vendidoPor'
            }
          }
        }
      },
      {
        $lookup: {
          from: 'professionals',
          localField: '_id',
          foreignField: '_id',
          as: 'profissional'
        }
      },
      {
        $addFields: {
          profissional: { $arrayElemAt: ['$profissional', 0] }
        }
      }
    ]).toArray();
    
    console.log(`📊 Resultado da agregação: ${comissoesPorProfissional.length} profissionais`);
    
    for (const resultado of comissoesPorProfissional) {
      if (resultado.profissional) {
        console.log(`\n👩‍💼 ${resultado.profissional.name}:`);
        console.log(`   Total de comissão: R$ ${resultado.totalComissao}`);
        console.log(`   Total de vendas: R$ ${resultado.totalVendas}`);
        console.log(`   Total de itens: ${resultado.totalItens}`);
      } else {
        console.log(`\n❌ Profissional não encontrado (ID: ${resultado._id}):`);
        console.log(`   Total de comissão: R$ ${resultado.totalComissao}`);
        console.log(`   Total de vendas: R$ ${resultado.totalVendas}`);
        console.log(`   Total de itens: ${resultado.totalItens}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

debugEllenFinanceiro();
