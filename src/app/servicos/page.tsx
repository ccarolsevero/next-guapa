'use client'

import { useState, useEffect } from 'react'
import LayoutPublic from '../layout-public'

// Forçar revalidação da página
export const dynamic = 'force-dynamic'

interface Service {
  _id: string
  name: string
  category: string
  description: string
  price: number
  isActive: boolean
  order: number
}

interface Promotion {
  _id: string
  title: string
  description: string
  imageUrl: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadServices()
    loadPromotions()
  }, [])

  const loadServices = async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando serviços da API...')
      const timestamp = Date.now()
      const response = await fetch(`/api/services?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      console.log('📡 Resposta da API:', response.status, response.ok)
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar serviços: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📦 Dados recebidos da API:', data.length, 'serviços')
      console.log('📋 Primeiros serviços:', data.slice(0, 3).map((s: Service) => ({ name: s.name, category: s.category })))
      
      setServices(data)
    } catch (error) {
      console.error('❌ Erro ao carregar serviços:', error)
      console.log('🔄 Usando fallback com dados estáticos...')
      // Fallback para dados estáticos se a API falhar
      setServices([
        // Consultoria e Avaliação
        {
          _id: '1',
          name: 'Avaliação Capilar',
          category: 'Consultoria e Avaliação',
          description: 'Avaliação completa do couro cabeludo e fios para identificar necessidades específicas.',
          price: 60.00,
          isActive: true,
          order: 1
        },
        {
          _id: '2',
          name: 'Consultoria/Corte',
          category: 'Consultoria e Avaliação',
          description: 'Consultoria de visagismo + corte personalizado para valorizar seu tipo de cabelo.',
          price: 198.00,
          isActive: true,
          order: 2
        },
        {
          _id: '3',
          name: 'Avaliação + Tratamento',
          category: 'Consultoria e Avaliação',
          description: 'Avaliação + tratamento personalizado para resultados mais eficazes.',
          price: 140.00,
          isActive: true,
          order: 3
        },
        
        // Cortes
        {
          _id: '4',
          name: 'Corte',
          category: 'Cortes',
          description: 'Corte de cabelo com manutenção das pontas e acabamento profissional.',
          price: 132.00,
          isActive: true,
          order: 1
        },
        {
          _id: '5',
          name: 'Corte e Tratamento Keune',
          category: 'Cortes',
          description: 'Corte + tratamento premium Keune Care para fios mais saudáveis.',
          price: 198.00,
          isActive: true,
          order: 2
        },
        {
          _id: '6',
          name: 'Corte Infantil',
          category: 'Cortes',
          description: 'Cuidado especial para os pequenos, com paciência e carinho para deixar as crianças confortáveis.',
          price: 40.00,
          isActive: true,
          order: 3
        },
        {
          _id: '7',
          name: 'Acabamento',
          category: 'Cortes',
          description: 'Ajustes finos e definição para finalizar seu visual com perfeição e brilho.',
          price: 30.00,
          isActive: true,
          order: 4
        },
        
        // Colorimetria
        {
          _id: '8',
          name: 'Back To Natural - P',
          category: 'Colorimetria',
          description: 'Repigmentação de cabelos loiros para cabelos mais curtos.',
          price: 231.00,
          isActive: true,
          order: 1
        },
        {
          _id: '9',
          name: 'Back To Natural - M',
          category: 'Colorimetria',
          description: 'Repigmentação de cabelos loiros para cabelos médios.',
          price: 319.00,
          isActive: true,
          order: 2
        },
        {
          _id: '10',
          name: 'Back To Natural - G',
          category: 'Colorimetria',
          description: 'Repigmentação de cabelos loiros para cabelos longos.',
          price: 385.00,
          isActive: true,
          order: 3
        },
        {
          _id: '11',
          name: 'Iluminado P',
          category: 'Colorimetria',
          description: 'Iluminado para cabelos até o ombro com técnicas modernas.',
          price: 500.00,
          isActive: true,
          order: 4
        },
        {
          _id: '12',
          name: 'Iluminado M',
          category: 'Colorimetria',
          description: 'Iluminado para cabelos abaixo do ombro com brilho natural.',
          price: 605.00,
          isActive: true,
          order: 5
        },
        {
          _id: '13',
          name: 'Iluminado G',
          category: 'Colorimetria',
          description: 'Iluminado para cabelos longos com efeito deslumbrante.',
          price: 715.00,
          isActive: true,
          order: 6
        },
        {
          _id: '14',
          name: 'Mechas Coloridas',
          category: 'Colorimetria',
          description: 'Mechas localizadas coloridas ou platinadas para um visual único.',
          price: 250.00,
          isActive: true,
          order: 7
        },
        {
          _id: '15',
          name: 'Coloração Keune',
          category: 'Colorimetria',
          description: 'Cobertura de brancos com Tinta Color Keune de alta qualidade.',
          price: 121.00,
          isActive: true,
          order: 8
        },
        
        // Tratamentos Naturais
        {
          _id: '16',
          name: 'Hidratação Natural',
          category: 'Tratamentos Naturais',
          description: 'Hidratação com produtos naturais Keune para restaurar a umidade dos fios.',
          price: 80.00,
          isActive: true,
          order: 1
        },
        {
          _id: '17',
          name: 'Reconstrução Capilar',
          category: 'Tratamentos Naturais',
          description: 'Fortalece os fios danificados e restaura a estrutura capilar com proteínas naturais.',
          price: 120.00,
          isActive: true,
          order: 2
        },
        {
          _id: '18',
          name: 'Limpeza de Couro Cabeludo',
          category: 'Tratamentos Naturais',
          description: 'Limpeza profunda e desintoxicante do couro cabeludo para melhorar a saúde dos folículos.',
          price: 100.00,
          isActive: true,
          order: 3
        },
        {
          _id: '19',
          name: 'Tratamento Anti-Queda',
          category: 'Tratamentos Naturais',
          description: 'Tratamento específico para queda de cabelo com produtos naturais.',
          price: 150.00,
          isActive: true,
          order: 4
        },
        {
          _id: '20',
          name: 'Terapia Capilar Completa',
          category: 'Tratamentos Naturais',
          description: 'Pacote completo de tratamentos para máxima revitalização dos fios.',
          price: 200.00,
          isActive: true,
          order: 5
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadPromotions = async () => {
    try {
      const response = await fetch('/api/promotions')
      if (!response.ok) {
        throw new Error('Erro ao carregar promoções')
      }
      const data = await response.json()
      setPromotions(data)
    } catch (error) {
      console.error('Erro ao carregar promoções:', error)
      setPromotions([])
    }
  }

  // Agrupar serviços por categoria
  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = []
    }
    acc[service.category].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  // Ordenar serviços dentro de cada categoria
  Object.keys(servicesByCategory).forEach(category => {
    servicesByCategory[category].sort((a, b) => a.order - b.order)
  })

  // Categorias dinâmicas baseadas nos serviços carregados
  const categories = Array.from(new Set(services.map(service => service.category))).sort()
  return (
    <LayoutPublic>
      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-16 md:pb-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>
              Nossos Serviços
            </h1>
            <p className="text-lg md:text-xl leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
              Descubra nossa linha completa de serviços profissionais para cuidar dos seus cabelos
            </p>
            
            {/* Divisor visual */}
            <div className="w-24 h-1 bg-[#d34d4c] mx-auto mt-6 md:mt-8"></div>
          </div>
        </div>
      </section>

      {/* Promoções - Seção Dinâmica */}
      {promotions.length > 0 && (
        <section className="py-12 md:py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>
                Promoções Especiais
              </h2>
              <p className="text-lg md:text-xl leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                Ofertas exclusivas para você cuidar dos seus cabelos
              </p>
              
              {/* Divisor visual */}
              <div className="w-24 h-1 bg-[#d34d4c] mx-auto mt-6 md:mt-8"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {promotions.map((promotion) => (
                <div key={promotion._id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
                  {/* Imagem da promoção */}
                  <div className="mb-6">
                    <img
                      src={promotion.imageUrl}
                      alt={promotion.title}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/assents/fotobruna.jpeg'
                      }}
                    />
                  </div>
                  
                  <h3 className="text-2xl font-bold font-heading mb-4" style={{ color: '#f2dcbc' }}>
                    {promotion.title}
                  </h3>
                  <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                    {promotion.description}
                  </p>
                  
                  {/* Botão de ação */}
                  <div className="mt-6">
                    <a 
                      href="/login-cliente"
                      className="bg-[#d34d4c] text-white px-6 py-3 rounded-lg hover:bg-[#b83e3d] transition-all duration-300 transform hover:scale-105 font-medium tracking-wide shadow-md hover:shadow-lg inline-block w-full text-center"
                    >
                      Aproveitar Promoção
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Serviços Dinâmicos */}
      {loading ? (
        <section className="py-12 md:py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-2xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>
              Carregando serviços...
            </div>
          </div>
        </section>
      ) : (
        categories.map((categoryName) => {
          const categoryServices = servicesByCategory[categoryName] || []
          if (categoryServices.length === 0) return null
          
          return (
            <section key={categoryName} className="py-12 md:py-24 relative">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>
                    {categoryName}
                  </h2>
                  <p className="text-lg md:text-xl leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                    {categoryName === 'Avaliação' && 'Primeiro passo para um tratamento personalizado'}
                    {categoryName === 'Cortes & Visagismo' && 'Cortes personalizados que valorizam a beleza natural dos seus fios'}
                    {categoryName === 'Coloração & Transformação' && 'Colorização profissional com produtos de alta qualidade'}
                    {categoryName === 'Finalização & Tratamento' && 'Tratamentos para fortalecer e revitalizar seus cabelos'}
                    {categoryName === 'Terapia Capilar' && 'Tratamentos especializados para saúde capilar'}
                    {categoryName === 'Maquiagem' && 'Maquiagem profissional para realçar sua beleza'}
                    {!['Avaliação', 'Cortes & Visagismo', 'Coloração & Transformação', 'Finalização & Tratamento', 'Terapia Capilar', 'Maquiagem'].includes(categoryName) && 'Serviços profissionais de alta qualidade'}
                  </p>
                  
                  {/* Divisor visual */}
                  <div className="w-24 h-1 bg-[#d34d4c] mx-auto mt-6 md:mt-8"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categoryServices.map((service) => (
                    <div key={service._id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
                      <h3 className="text-2xl font-bold font-heading mb-4" style={{ color: '#f2dcbc' }}>
                        {service.name}
                      </h3>
                      <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                        {service.description}
                      </p>
                      <p className="text-2xl font-light text-[#d34d4c] mt-4">
                        R$ {service.price.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )
        })
      )}



      {/* CTA Section */}
      <section className="py-12 md:py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>
            Pronto para Transformar seus Cabelos?
          </h2>
          <p className="text-lg md:text-xl leading-relaxed font-body mb-8" style={{ color: '#f2dcbc' }}>
            Agende sua consulta e descubra como podemos cuidar dos seus fios com carinho e profissionalismo.
          </p>
          <a 
            href="/login-cliente"
            className="bg-[#d34d4c] text-white px-8 py-4 rounded-lg hover:bg-[#b83e3d] transition-all duration-300 transform hover:scale-105 font-medium tracking-wide shadow-md hover:shadow-lg inline-block"
          >
            Agendar Consulta
          </a>
        </div>
      </section>
    </LayoutPublic>
  )
}


