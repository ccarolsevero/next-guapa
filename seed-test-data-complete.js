const { MongoClient, ObjectId } = require('mongodb');

async function seedTestData() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/nextjs-guapa');
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db();
    
    // Limpar dados existentes
    await db.collection('clients').deleteMany({});
    await db.collection('finalizacoes').deleteMany({});
    await db.collection('agendamentos').deleteMany({});
    await db.collection('despesas').deleteMany({});
    console.log('🧹 Dados antigos removidos');
    
    // Criar clientes de teste
    const clientes = [
      {
        _id: new ObjectId(),
        name: 'Ana Silva',
        email: 'ana@email.com',
        phone: '(11) 99999-1111',
        address: 'Rua das Flores, 123',
        birthDate: new Date('1990-05-15'),
        credito: 50.00,
        debito: 0,
        createdAt: new Date('2024-01-15'),
        isCompleteProfile: true
      },
      {
        _id: new ObjectId(),
        name: 'Maria Santos',
        email: 'maria@email.com',
        phone: '(11) 99999-2222',
        address: 'Av. Paulista, 456',
        birthDate: new Date('1985-08-20'),
        credito: 0,
        debito: 30.00,
        createdAt: new Date('2024-02-10'),
        isCompleteProfile: true
      },
      {
        _id: new ObjectId(),
        name: 'João Oliveira',
        email: 'joao@email.com',
        phone: '(11) 99999-3333',
        address: 'Rua Augusta, 789',
        birthDate: new Date('1992-12-03'),
        credito: 25.00,
        debito: 15.00,
        createdAt: new Date('2024-03-05'),
        isCompleteProfile: false
      },
      {
        _id: new ObjectId(),
        name: 'Carla Costa',
        email: 'carla@email.com',
        phone: '(11) 99999-4444',
        address: 'Rua Oscar Freire, 321',
        birthDate: new Date('1988-07-12'),
        credito: 0,
        debito: 0,
        createdAt: new Date('2024-04-20'),
        isCompleteProfile: true
      }
    ];
    
    await db.collection('clients').insertMany(clientes);
    console.log('👥 Clientes criados:', clientes.length);
    
    // Criar finalizações de teste
    const finalizacoes = [
      {
        _id: new ObjectId(),
        clienteId: clientes[0]._id.toString(),
        profissionalId: '68b0df99486fd09963c90b33', // ID de um profissional existente
        servicos: [
          {
            servicoId: '68b0df99486fd09963c90b2f', // Corte
            preco: 132.00,
            quantidade: 1
          }
        ],
        valorFinal: 132.00,
        totalComissao: 26.40,
        dataCriacao: new Date('2024-11-15'),
        status: 'finalizado'
      },
      {
        _id: new ObjectId(),
        clienteId: clientes[0]._id.toString(),
        profissionalId: '68b0df99486fd09963c90b33',
        servicos: [
          {
            servicoId: '68b0df99486fd09963c90b2f', // Corte (mesmo serviço)
            preco: 132.00,
            quantidade: 1
          }
        ],
        valorFinal: 132.00,
        totalComissao: 26.40,
        dataCriacao: new Date('2024-12-10'),
        status: 'finalizado'
      },
      {
        _id: new ObjectId(),
        clienteId: clientes[1]._id.toString(),
        profissionalId: '68b0df99486fd09963c90b33',
        servicos: [
          {
            servicoId: '68b0df99486fd09963c90b36', // Iluminado P
            preco: 500.00,
            quantidade: 1
          }
        ],
        valorFinal: 500.00,
        totalComissao: 100.00,
        dataCriacao: new Date('2024-11-20'),
        status: 'finalizado'
      },
      {
        _id: new ObjectId(),
        clienteId: clientes[2]._id.toString(),
        profissionalId: '68b0df99486fd09963c90b33',
        servicos: [
          {
            servicoId: '68b0df99486fd09963c90b2f', // Corte
            preco: 132.00,
            quantidade: 1
          }
        ],
        valorFinal: 132.00,
        totalComissao: 26.40,
        dataCriacao: new Date('2024-12-05'),
        status: 'finalizado'
      },
      {
        _id: new ObjectId(),
        clienteId: clientes[3]._id.toString(),
        profissionalId: '68b0df99486fd09963c90b33',
        servicos: [
          {
            servicoId: '68b0df99486fd09963c90b3b', // Hidratação Natural
            preco: 80.00,
            quantidade: 1
          }
        ],
        valorFinal: 80.00,
        totalComissao: 16.00,
        dataCriacao: new Date('2024-12-01'),
        status: 'finalizado'
      }
    ];
    
    await db.collection('finalizacoes').insertMany(finalizacoes);
    console.log('💰 Finalizações criadas:', finalizacoes.length);
    
    // Criar agendamentos de teste
    const agendamentos = [
      {
        _id: new ObjectId(),
        clienteId: clientes[0]._id.toString(),
        profissionalId: '68b0df99486fd09963c90b33',
        servicoId: '68b0df99486fd09963c90b2f',
        data: new Date('2024-12-20'),
        hora: '14:00',
        status: 'confirmed'
      },
      {
        _id: new ObjectId(),
        clienteId: clientes[1]._id.toString(),
        profissionalId: '68b0df99486fd09963c90b33',
        servicoId: '68b0df99486fd09963c90b36',
        data: new Date('2024-12-22'),
        hora: '10:00',
        status: 'confirmed'
      },
      {
        _id: new ObjectId(),
        clienteId: clientes[2]._id.toString(),
        profissionalId: '68b0df99486fd09963c90b33',
        servicoId: '68b0df99486fd09963c90b2f',
        data: new Date('2024-12-18'),
        hora: '16:00',
        status: 'cancelled'
      }
    ];
    
    await db.collection('agendamentos').insertMany(agendamentos);
    console.log('📅 Agendamentos criados:', agendamentos.length);
    
    // Criar despesas de teste
    const despesas = [
      {
        _id: new ObjectId(),
        descricao: 'Produtos de limpeza',
        valor: 150.00,
        categoria: 'Limpeza',
        data: new Date('2024-11-01'),
        observacao: 'Produtos para limpeza do salão'
      },
      {
        _id: new ObjectId(),
        descricao: 'Material de trabalho',
        valor: 300.00,
        categoria: 'Material',
        data: new Date('2024-11-15'),
        observacao: 'Tesouras e pentes novos'
      },
      {
        _id: new ObjectId(),
        descricao: 'Energia elétrica',
        valor: 200.00,
        categoria: 'Utilidades',
        data: new Date('2024-12-01'),
        observacao: 'Conta de luz do mês'
      }
    ];
    
    await db.collection('despesas').insertMany(despesas);
    console.log('💸 Despesas criadas:', despesas.length);
    
    console.log('✅ Dados de teste criados com sucesso!');
    console.log('📊 Resumo:');
    console.log('  - Clientes:', clientes.length);
    console.log('  - Finalizações:', finalizacoes.length);
    console.log('  - Agendamentos:', agendamentos.length);
    console.log('  - Despesas:', despesas.length);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

seedTestData();
