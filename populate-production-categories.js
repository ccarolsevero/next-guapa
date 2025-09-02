const fetch = require('node-fetch');

// URL da API de produção
const PRODUCTION_URL = 'https://nextjs-guapa-qu43w0vsg-ana-carolina-severos-projects.vercel.app';

// Todas as categorias necessárias para o salão
const allCategories = [
  {
    name: 'Shampoo',
    description: 'Produtos para limpeza e higiene dos cabelos'
  },
  {
    name: 'Condicionador',
    description: 'Produtos para hidratação e desembaraço dos cabelos'
  },
  {
    name: 'Máscara',
    description: 'Tratamentos intensivos para cabelos danificados'
  },
  {
    name: 'Óleo',
    description: 'Óleos para finalização e proteção dos cabelos'
  },
  {
    name: 'Protetor Térmico',
    description: 'Produtos para proteger os cabelos do calor'
  },
  {
    name: 'Tratamentos',
    description: 'Produtos especiais para tratamentos capilares'
  },
  {
    name: 'Finalizadores',
    description: 'Produtos para finalização e fixação dos cabelos'
  },
  {
    name: 'Acessórios',
    description: 'Acessórios para cabelo e penteados'
  },
  {
    name: 'Coloração',
    description: 'Produtos para coloração e tingimento dos cabelos'
  },
  {
    name: 'Hidratação',
    description: 'Produtos para hidratação profunda dos cabelos'
  },
  {
    name: 'Cremes de Tratamento',
    description: 'Cremes especiais para tratamentos capilares'
  },
  {
    name: 'Maquiagem',
    description: 'Produtos de maquiagem e beleza'
  },
  {
    name: 'Geral',
    description: 'Categoria geral para produtos diversos'
  }
];

async function populateProductionCategories() {
  try {
    console.log('🌐 Populando categorias no banco de PRODUÇÃO...');
    console.log(`📡 URL da API: ${PRODUCTION_URL}`);
    
    // Primeiro, verificar categorias existentes
    console.log('\n📋 Verificando categorias existentes...');
    const existingResponse = await fetch(`${PRODUCTION_URL}/api/categories`);
    const existingCategories = await existingResponse.json();
    
    console.log(`✅ Categorias existentes: ${existingCategories.length}`);
    existingCategories.forEach(cat => {
      console.log(`   - ${cat.name}`);
    });
    
    // Inserir novas categorias
    let insertedCount = 0;
    let skippedCount = 0;
    
    console.log('\n🚀 Inserindo novas categorias...');
    
    for (const categoryData of allCategories) {
      try {
        // Verificar se a categoria já existe
        const exists = existingCategories.some(cat => 
          cat.name.toLowerCase() === categoryData.name.toLowerCase()
        );
        
        if (exists) {
          console.log(`⏭️  Pulando: ${categoryData.name} (já existe)`);
          skippedCount++;
          continue;
        }
        
        // Inserir nova categoria
        const response = await fetch(`${PRODUCTION_URL}/api/categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(categoryData)
        });
        
        if (response.ok) {
          const newCategory = await response.json();
          console.log(`✅ Inserida: ${categoryData.name} (ID: ${newCategory._id})`);
          insertedCount++;
        } else {
          const error = await response.text();
          console.error(`❌ Erro ao inserir ${categoryData.name}:`, error);
        }
        
        // Aguardar um pouco entre as inserções
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Erro ao processar ${categoryData.name}:`, error.message);
      }
    }
    
    // Verificar resultado final
    console.log('\n📊 Verificando resultado final...');
    const finalResponse = await fetch(`${PRODUCTION_URL}/api/categories`);
    const finalCategories = await finalResponse.json();
    
    console.log('\n🎉 RESULTADO FINAL:');
    console.log(`📈 Categorias inseridas: ${insertedCount}`);
    console.log(`⏭️  Categorias puladas: ${skippedCount}`);
    console.log(`📊 Total de categorias no banco: ${finalCategories.length}`);
    
    console.log('\n📋 Lista completa de categorias:');
    finalCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} - ${cat.description}`);
    });
    
    console.log('\n🎯 População concluída com sucesso!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    process.exit(1);
  }
}

// Executar o script
populateProductionCategories();
