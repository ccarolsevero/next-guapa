const { MongoClient } = require('mongodb');

async function seedTestData() {
  const client = new MongoClient(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/guapa',
  );

  try {
    console.log('🔌 Conectando ao MongoDB...');
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db('guapa');

    // Criar produtos de teste
    console.log('📦 Criando produtos de teste...');
    const produtos = [
      {
        name: 'Shampoo Hidratante',
        price: 45.0,
        custo: 25.0,
        description: 'Shampoo para cabelos secos',
        category: 'Cabelo',
        stock: 50,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Condicionador Reparador',
        price: 55.0,
        custo: 30.0,
        description: 'Condicionador para cabelos danificados',
        category: 'Cabelo',
        stock: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Máscara Capilar',
        price: 85.0,
        custo: 45.0,
        description: 'Máscara nutritiva para cabelos',
        category: 'Cabelo',
        stock: 20,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Creme para Pentear',
        price: 35.0,
        custo: 18.0,
        description: 'Creme para facilitar o penteado',
        category: 'Cabelo',
        stock: 40,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Óleo de Argan',
        price: 65.0,
        custo: 35.0,
        description: 'Óleo nutritivo para pontas',
        category: 'Cabelo',
        stock: 25,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const produtosResult = await db.collection('products').insertMany(produtos);
    console.log(`✅ ${produtosResult.insertedCount} produtos criados`);

    // Buscar os IDs dos produtos criados
    const produtosCriados = await db.collection('products').find({}).toArray();
    console.log(
      '📋 IDs dos produtos:',
      produtosCriados.map((p) => p._id.toString()),
    );

    // Criar finalizações de teste
    console.log('💰 Criando finalizações de teste...');
    const finalizacoes = [
      {
        clienteId: '507f1f77bcf86cd799439011', // ID fictício
        clienteNome: 'Maria Silva',
        profissionalId: '507f1f77bcf86cd799439012', // ID fictício
        profissionalNome: 'Bruna',
        dataCriacao: new Date('2024-01-15'),
        produtos: [
          {
            id: produtosCriados[0]._id.toString(),
            nome: produtosCriados[0].name,
            quantidade: 2,
            preco: produtosCriados[0].price,
            custo: produtosCriados[0].custo,
            desconto: 5.0,
          },
          {
            id: produtosCriados[1]._id.toString(),
            nome: produtosCriados[1].name,
            quantidade: 1,
            preco: produtosCriados[1].price,
            custo: produtosCriados[1].custo,
            desconto: 0,
          },
        ],
        servicos: [],
        total: 140.0,
        descontoTotal: 5.0,
        valorPago: 135.0,
        formaPagamento: 'dinheiro',
        alterada: false,
      },
      {
        clienteId: '507f1f77bcf86cd799439013',
        clienteNome: 'Ana Costa',
        profissionalId: '507f1f77bcf86cd799439012',
        profissionalNome: 'Bruna',
        dataCriacao: new Date('2024-01-20'),
        produtos: [
          {
            id: produtosCriados[2]._id.toString(),
            nome: produtosCriados[2].name,
            quantidade: 1,
            preco: produtosCriados[2].price,
            custo: produtosCriados[2].custo,
            desconto: 10.0,
          },
          {
            id: produtosCriados[3]._id.toString(),
            nome: produtosCriados[3].name,
            quantidade: 3,
            preco: produtosCriados[3].price,
            custo: produtosCriados[3].custo,
            desconto: 0,
          },
        ],
        servicos: [],
        total: 190.0,
        descontoTotal: 10.0,
        valorPago: 180.0,
        formaPagamento: 'cartao',
        alterada: false,
      },
      {
        clienteId: '507f1f77bcf86cd799439014',
        clienteNome: 'Carla Santos',
        profissionalId: '507f1f77bcf86cd799439012',
        profissionalNome: 'Bruna',
        dataCriacao: new Date('2024-02-01'),
        produtos: [
          {
            id: produtosCriados[4]._id.toString(),
            nome: produtosCriados[4].name,
            quantidade: 2,
            preco: produtosCriados[4].price,
            custo: produtosCriados[4].custo,
            desconto: 0,
          },
          {
            id: produtosCriados[0]._id.toString(),
            nome: produtosCriados[0].name,
            quantidade: 1,
            preco: produtosCriados[0].price,
            custo: produtosCriados[0].custo,
            desconto: 0,
          },
        ],
        servicos: [],
        total: 155.0,
        descontoTotal: 0,
        valorPago: 155.0,
        formaPagamento: 'pix',
        alterada: false,
      },
      {
        clienteId: '507f1f77bcf86cd799439015',
        clienteNome: 'Fernanda Lima',
        profissionalId: '507f1f77bcf86cd799439012',
        profissionalNome: 'Bruna',
        dataCriacao: new Date('2024-02-10'),
        produtos: [
          {
            id: produtosCriados[1]._id.toString(),
            nome: produtosCriados[1].name,
            quantidade: 2,
            preco: produtosCriados[1].price,
            custo: produtosCriados[1].custo,
            desconto: 15.0,
          },
        ],
        servicos: [],
        total: 110.0,
        descontoTotal: 15.0,
        valorPago: 95.0,
        formaPagamento: 'dinheiro',
        alterada: false,
      },
    ];

    const finalizacoesResult = await db
      .collection('finalizacoes')
      .insertMany(finalizacoes);
    console.log(`✅ ${finalizacoesResult.insertedCount} finalizações criadas`);

    console.log('🎉 Dados de teste criados com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
    console.log('🔌 Desconectado do MongoDB');
  }
}

seedTestData();
