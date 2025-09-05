require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

async function testarFinalizacoes() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('guapa');
    
    console.log('🔍 Verificando coleção finalizacoes...');
    
    // Buscar todas as finalizações
    const finalizacoes = await db.collection('finalizacoes').find({}).toArray();
    console.log('📋 Total de finalizações:', finalizacoes.length);
    
    if (finalizacoes.length > 0) {
      console.log('📋 Primeira finalização:', {
        _id: finalizacoes[0]._id,
        clienteId: finalizacoes[0].clienteId,
        profissionalNome: finalizacoes[0].profissionalNome,
        profissionalId: finalizacoes[0].profissionalId,
        dataFinalizacao: finalizacoes[0].dataFinalizacao,
        valorFinal: finalizacoes[0].valorFinal
      });
      
      // Mostrar todos os clientes com finalizações
      const clientesComFinalizacoes = [...new Set(finalizacoes.map(f => f.clienteId))];
      console.log('👥 Clientes com finalizações:', clientesComFinalizacoes);
    }
    
    // Buscar finalizações para o cliente específico
    const finalizacoesCliente = await db.collection('finalizacoes').find({
      clienteId: '68b762df9ae24432334dda9a'
    }).toArray();
    
    console.log('👤 Finalizações do cliente:', finalizacoesCliente.length);
    
    if (finalizacoesCliente.length > 0) {
      console.log('👤 Primeira finalização do cliente:', {
        _id: finalizacoesCliente[0]._id,
        clienteId: finalizacoesCliente[0].clienteId,
        profissionalNome: finalizacoesCliente[0].profissionalNome,
        dataFinalizacao: finalizacoesCliente[0].dataFinalizacao,
        valorFinal: finalizacoesCliente[0].valorFinal
      });
    }
    
    // Buscar comandas ativas para o cliente (tentar diferentes estruturas)
    const comandasAtivas1 = await db.collection('comandas').find({
      'clientId._id': new ObjectId('68b762df9ae24432334dda9a')
    }).toArray();
    
    const comandasAtivas2 = await db.collection('comandas').find({
      clientId: '68b762df9ae24432334dda9a'
    }).toArray();
    
    console.log('📋 Comandas ativas (clientId._id):', comandasAtivas1.length);
    console.log('📋 Comandas ativas (clientId):', comandasAtivas2.length);
    
    if (comandasAtivas2.length > 0) {
      console.log('📋 Primeira comanda ativa:', {
        _id: comandasAtivas2[0]._id,
        status: comandasAtivas2[0].status,
        valorTotal: comandasAtivas2[0].valorTotal,
        dataInicio: comandasAtivas2[0].dataInicio,
        servicos: comandasAtivas2[0].servicos?.length || 0,
        clientId: comandasAtivas2[0].clientId
      });
    }
    
    // Buscar todas as comandas para ver a estrutura
    const todasComandas = await db.collection('comandas').find({}).limit(3).toArray();
    console.log('📋 Estrutura das comandas:');
    todasComandas.forEach((comanda, index) => {
      console.log(`  Comanda ${index + 1}:`, {
        _id: comanda._id,
        clientId: comanda.clientId,
        status: comanda.status
      });
    });
    
    // Verificar se o profissional existe
    const profissional = await db.collection('professionals').findOne({ _id: new ObjectId('68b0dd7f95951eaee2236a8a') });
    console.log('👨‍💼 Profissional encontrado:', {
      _id: profissional?._id,
      name: profissional?.name,
      nome: profissional?.nome,
      fullName: profissional?.fullName
    });
    
    // Listar todos os profissionais
    const todosProfissionais = await db.collection('professionals').find({}).toArray();
    console.log('👥 Todos os profissionais:');
    todosProfissionais.forEach((prof, index) => {
      console.log(`  Profissional ${index + 1}:`, {
        _id: prof._id,
        name: prof.name,
        nome: prof.nome,
        fullName: prof.fullName
      });
    });
    
    // Verificar pedidos para o cliente específico
    const pedidosCliente = await db.collection('orders').find({
      clientId: '68b7706576f2048aa96ecf6c'
    }).toArray();
    
    console.log('🛒 Pedidos do cliente:', pedidosCliente.length);
    
    if (pedidosCliente.length > 0) {
      console.log('🛒 Primeiro pedido:', {
        _id: pedidosCliente[0]._id,
        clientId: pedidosCliente[0].clientId,
        total: pedidosCliente[0].total,
        status: pedidosCliente[0].status,
        createdAt: pedidosCliente[0].createdAt
      });
    }
    
    // Verificar se há pedidos em geral
    const todosPedidos = await db.collection('orders').find({}).toArray();
    console.log('🛒 Total de pedidos no sistema:', todosPedidos.length);
    
    if (todosPedidos.length > 0) {
      console.log('🛒 Primeiro pedido do sistema:', {
        _id: todosPedidos[0]._id,
        clientId: todosPedidos[0].clientId,
        total: todosPedidos[0].total,
        status: todosPedidos[0].status
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

testarFinalizacoes();
