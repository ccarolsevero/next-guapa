const { MongoClient } = require('mongodb');
require('dotenv').config();

async function corrigirComissoesEllen() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db(process.env.DB_NAME || 'guapa');
    
    // 1. Buscar Ellen
    console.log('\n🔍 === BUSCANDO ELLEN ===');
    const ellen = await db.collection('professionals').findOne({
      name: { $regex: /ellen/i }
    });
    
    if (!ellen) {
      console.log('❌ Ellen não encontrada');
      return;
    }
    
    console.log(`✅ Ellen encontrada: ${ellen.name} (ID: ${ellen._id})`);
    
    // 2. Buscar comissões de produtos que deveriam ser da Ellen
    console.log('\n🔍 === BUSCANDO COMISSÕES PARA CORRIGIR ===');
    const comissoesParaCorrigir = await db.collection('comissoes').find({
      tipo: 'Produto',
      comandaId: { $in: [
        '68b8658589a933c14c3fd3c0', // Comanda da Cicera com produtos da Ellen
        '68b86dabeb7dbafcd6f0caac'  // Outra comanda com produtos da Ellen
      ]}
    }).toArray();
    
    console.log(`📊 Comissões encontradas para corrigir: ${comissoesParaCorrigir.length}`);
    
    for (const comissao of comissoesParaCorrigir) {
      console.log(`\n💰 Comissão #${comissao._id}`);
      console.log(`   Item: ${comissao.item}`);
      console.log(`   Valor: R$ ${comissao.valor}`);
      console.log(`   Comissão: R$ ${comissao.comissao}`);
      console.log(`   Profissional atual: ${comissao.profissionalId}`);
      
      // Verificar se o produto foi vendido por Ellen
      const comanda = await db.collection('comandas').findOne({
        _id: new (require('mongodb')).ObjectId(comissao.comandaId)
      });
      
      if (comanda && comanda.produtos) {
        const produto = comanda.produtos.find(p => p.nome === comissao.item);
        if (produto && produto.vendidoPor && produto.vendidoPor.toLowerCase().includes('ellen')) {
          console.log(`   ✅ Produto vendido por Ellen: ${produto.vendidoPor}`);
          
          // Atualizar a comissão para Ellen
          const resultado = await db.collection('comissoes').updateOne(
            { _id: comissao._id },
            { 
              $set: { 
                profissionalId: ellen._id.toString(),
                vendidoPor: produto.vendidoPor
              }
            }
          );
          
          if (resultado.modifiedCount > 0) {
            console.log(`   ✅ Comissão corrigida para Ellen`);
          } else {
            console.log(`   ❌ Erro ao corrigir comissão`);
          }
        } else {
          console.log(`   ℹ️ Produto não vendido por Ellen ou não encontrado`);
        }
      }
    }
    
    // 3. Verificar se as correções funcionaram
    console.log('\n🔍 === VERIFICANDO CORREÇÕES ===');
    const comissoesCorrigidas = await db.collection('comissoes').find({
      'profissionalId': ellen._id.toString()
    }).toArray();
    
    console.log(`📊 Comissões da Ellen após correção: ${comissoesCorrigidas.length}`);
    
    for (const comissao of comissoesCorrigidas) {
      console.log(`\n💰 Comissão #${comissao._id}`);
      console.log(`   Tipo: ${comissao.tipo}`);
      console.log(`   Item: ${comissao.item}`);
      console.log(`   Valor: R$ ${comissao.valor}`);
      console.log(`   Comissão: R$ ${comissao.comissao}`);
      console.log(`   Vendido por: ${comissao.vendidoPor || 'N/A'}`);
    }
    
    // 4. Verificar o painel financeiro agora
    console.log('\n🔍 === VERIFICANDO PAINEL FINANCEIRO ===');
    
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
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
          totalItens: { $sum: 1 }
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
      }
    }
    
    console.log('\n✅ Correção concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

corrigirComissoesEllen();
