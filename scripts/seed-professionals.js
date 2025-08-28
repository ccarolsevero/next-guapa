const mongoose = require('mongoose')

// Conectar ao MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://brunacanovas_db_user:amCzSzLUpD7P96gD@espacoguapa.npfnuuc.mongodb.net/?retryWrites=true&w=majority&appName=Espacoguapa'

// Schema do Profissional
const professionalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    trim: true,
    default: 'Cabeleireira'
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  shortDescription: {
    type: String,
    trim: true,
    default: 'Especialista em tratamentos capilares'
  },
  fullDescription: {
    type: String,
    trim: true,
    default: 'Profissional experiente e dedicada aos cuidados capilares'
  },
  services: [{
    type: String,
    trim: true
  }],
  profileImage: {
    type: String,
    default: '/assents/fotobruna.jpeg'
  },
  gallery: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

const Professional = mongoose.model('Professional', professionalSchema)

async function seedProfessionals() {
  try {
    console.log('Conectando ao MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('Conectado ao MongoDB com sucesso!')

    // Limpar dados existentes
    console.log('Limpando dados existentes...')
    await Professional.deleteMany({})
    console.log('Dados limpos!')

    // Dados da Bruna
    const brunaData = {
      name: 'Bruna',
      title: 'Cabeleireira',
      email: 'bruna@guapa.com',
      phone: '(19) 99999-9999',
      shortDescription: 'Especialista em coloração e tratamentos capilares',
      fullDescription: 'Bruna é uma profissional experiente e dedicada aos cuidados capilares. Especialista em coloração, tratamentos e cortes modernos. Com anos de experiência, ela oferece serviços personalizados para cada cliente, sempre buscando a satisfação total e o bem-estar capilar.',
      services: [
        'Coloração',
        'Tratamentos',
        'Cortes',
        'Hidratação',
        'Escova',
        'Penteado',
        'Finalização',
        'Avaliação Capilar'
      ],
      profileImage: '/assents/fotobruna.jpeg',
      gallery: [
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16.jpeg',
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (1).jpeg',
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (2).jpeg',
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (3).jpeg',
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (4).jpeg',
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (5).jpeg',
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (6).jpeg',
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (7).jpeg',
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (8).jpeg',
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (9).jpeg',
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (10).jpeg',
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (11).jpeg'
      ],
      isActive: true,
      isFeatured: true
    }

    // Dados da Cicera
    const ciceraData = {
      name: 'Cicera',
      title: 'Cabeleireira',
      email: 'cicera@guapa.com',
      phone: '(19) 88888-8888',
      shortDescription: 'Especialista em penteados e maquiagem',
      fullDescription: 'Cicera é especialista em penteados, maquiagem e tratamentos capilares. Com técnica apurada e criatividade, ela transforma o visual de suas clientes com penteados únicos e maquiagens deslumbrantes. Sua dedicação e atenção aos detalhes garantem resultados excepcionais.',
      services: [
        'Penteados',
        'Maquiagem',
        'Tratamentos',
        'Escova',
        'Finalização',
        'Cortes',
        'Coloração',
        'Hidratação'
      ],
      profileImage: '/assents/fotobruna.jpeg',
      gallery: [
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (3).jpeg',
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (4).jpeg',
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (5).jpeg',
        '/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (6).jpeg'
      ],
      isActive: true,
      isFeatured: false
    }

    // Inserir profissionais
    console.log('Inserindo dados da Bruna...')
    const bruna = await Professional.create(brunaData)
    console.log('Bruna inserida com sucesso! ID:', bruna._id)

    console.log('Inserindo dados da Cicera...')
    const cicera = await Professional.create(ciceraData)
    console.log('Cicera inserida com sucesso! ID:', cicera._id)

    // Verificar dados inseridos
    const totalProfessionals = await Professional.countDocuments()
    console.log(`Total de profissionais no banco: ${totalProfessionals}`)

    const allProfessionals = await Professional.find({})
    console.log('Profissionais cadastrados:')
    allProfessionals.forEach(prof => {
      console.log(`- ${prof.name} (${prof.title}) - Ativo: ${prof.isActive} - Destaque: ${prof.isFeatured}`)
      console.log(`  Serviços: ${prof.services.join(', ')}`)
      console.log(`  Galeria: ${prof.gallery.length} fotos`)
    })

    console.log('\n✅ Seed concluído com sucesso!')
  } catch (error) {
    console.error('❌ Erro durante o seed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Desconectado do MongoDB')
  }
}

// Executar o seed
seedProfessionals()
