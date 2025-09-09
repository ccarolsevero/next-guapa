'use client'

import Link from 'next/link'
import { Calendar, Scissors, Sparkles, MessageCircle, X, User, MapPin, Phone, Mail, Package, Star, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { MessageCircle as WhatsAppIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSiteSettings } from '@/hooks/useSiteSettings'

// Dados reais dos serviços do Espaço Guapa
const servicosEspacoGuapa = [
  {
    id: 1,
    name: "Cortes que Celebram a Natureza do Cabelo",
    price: 0,
    description: "Cada corte é pensado para valorizar o movimento, a textura e a forma única dos seus fios sem desrespeitar sua essência. Sempre buscando alinhar a praticidade do dia a dia com a potência dos cabelos naturais."
  },
  {
    id: 2,
    name: "Colorimetria Criativa",
    price: 0,
    description: "Trabalhamos com colorações, loiros, iluminados e cores fantasia com cuidado máximo, evitando processos que comprometam a saúde capilar. Sempre buscando a melhor manutenção para a sua rotina, alinhada com as cores que representam sua personalidade"
  },
  {
    id: 3,
    name: "Tratamentos Naturais Tricoterapêuticos",
    price: 0,
    description: "Técnicas especiais que cuidam especialmente do couro cabeludo, mas também do comprimento, com fórmulas naturais e sem uso de química. Realizados com a linha Keune So Pure, o resultado: cabelo mais forte, saudável e com brilho natural."
  }
]

interface Service {
  _id: string
  name: string
  category: string
  description: string
  price: number
  isActive: boolean
  order: number
  isFeatured: boolean
}

interface Product {
  _id: string
  name: string
  price: number
  description: string
  imageUrl?: string
  isActive: boolean
  isFeatured: boolean
  discount?: number
  originalPrice?: number
}

interface HomePhoto {
  id: string
  imageUrl: string
  order: number
}

// Dados reais dos depoimentos
const testimonials = [
  {
    id: 1,
    name: "Maria Silva",
    period: "Cliente há 2 anos",
    text: "Adorei o resultado! A Bruna é muito profissional e atenciosa. Meu cabelo ficou lindo e saudável. Recomendo demais!"
  },
  {
    id: 2,
    name: "Ana Santos",
    period: "Cliente há 1 ano",
    text: "O tratamento com a Cicera transformou meu cabelo. Agora está muito mais forte e brilhoso! Super feliz com o resultado."
  },
  {
    id: 3,
    name: "Julia Costa",
    period: "Cliente há 6 meses",
    text: "A consultoria foi incrível! Agora entendo melhor como cuidar do meu cabelo natural. A Bruna é uma fofa!"
  },
  {
    id: 4,
    name: "Fernanda Lima",
    period: "Cliente há 1 ano",
    text: "Mudei completamente meu visual! A busca pelo cabelo natural foi uma jornada incrível. Obrigada, Espaço Guapa!"
  },
  {
    id: 5,
    name: "Carolina Oliveira",
    period: "Cliente há 3 meses",
    text: "Primeira vez que fiz um tratamento sem química. A Cicera é incrível! Meu cabelo nunca esteve tão saudável."
  },
  {
    id: 6,
    name: "Beatriz Almeida",
    period: "Cliente há 8 meses",
    text: "Avaliação super detalhada! A Bruna entendeu perfeitamente o que eu queria. Resultado acima das expectativas."
  },
  {
    id: 7,
    name: "Larissa Mendes",
    period: "Cliente há 1 ano",
    text: "Tratamentos naturais que realmente funcionam! A Cicera tem a fórmula perfeita. Meu cabelo mudou completamente!"
  },
  {
    id: 8,
    name: "Gabriela Souza",
    period: "Cliente há 4 meses",
    text: "Ambiente acolhedor e profissionais super competentes. O Espaço Guapa é exatamente como o nome diz!"
  }
]

interface Professional {
  _id: string
  name: string
  title: string
  email: string
  phone: string
  shortDescription: string
  fullDescription: string
  services: string[]
  featuredServices: string[]
  profileImage: string
  gallery: string[]
  isActive: boolean
  isFeatured: boolean
}

export default function HomePage() {
  const { client, isLoggedIn, logout, loading: authLoading } = useAuth()
  const { settings } = useSiteSettings()
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [homePhotos, setHomePhotos] = useState<HomePhoto[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [featuredServices, setFeaturedServices] = useState<Service[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Carregar fotos estáticas da home e profissionais
  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar fotos da home do banco de dados
        const homeGalleryResponse = await fetch('/api/home-gallery')
        if (homeGalleryResponse.ok) {
          const homeGalleryData = await homeGalleryResponse.json()
          // Filtrar apenas fotos ativas e ordenar por ordem
          const activePhotos = homeGalleryData
            .filter((photo: any) => photo.isActive)
            .sort((a: any, b: any) => a.order - b.order)
          setHomePhotos(activePhotos)
        } else {
          console.error('Erro ao carregar galeria da home')
          // Fallback para fotos estáticas se a API falhar
          const fallbackPhotos = [
            { id: '1', imageUrl: '/assents/fotoslidehome/WhatsApp Image 2025-08-26 at 20.47.05.jpeg', order: 1 },
            { id: '2', imageUrl: '/assents/fotoslidehome/WhatsApp Image 2025-08-26 at 20.47.05 (1).jpeg', order: 2 },
            { id: '3', imageUrl: '/assents/fotoslidehome/WhatsApp Image 2025-08-26 at 20.47.05 (2).jpeg', order: 3 },
            { id: '4', imageUrl: '/assents/fotoslidehome/WhatsApp Image 2025-08-26 at 20.47.05 (3).jpeg', order: 4 },
          ]
          setHomePhotos(fallbackPhotos)
        }

        // Carregar profissionais do banco
        const response = await fetch('/api/professionals')
        if (response.ok) {
          const data = await response.json()
          setProfessionals(data)
        }

        // Carregar serviços em destaque do banco
        const servicesResponse = await fetch('/api/services')
        if (servicesResponse.ok) {
          const allServices = await servicesResponse.json()
          const featured = allServices.filter((service: Service) => service.isFeatured && service.isActive)
          setFeaturedServices(featured)
        }

        // Carregar produtos em destaque do banco
        const productsResponse = await fetch('/api/products?isFeatured=true&isActive=true')
        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          setFeaturedProducts(productsData.products || [])
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Auto slide para as fotos da home
  useEffect(() => {
    if (homePhotos.length === 0) return

    const interval = setInterval(() => {
      nextSlide()
    }, 4000) // Muda a cada 4 segundos

    return () => clearInterval(interval)
  }, [homePhotos])

  const openModal = (product: Product) => {
    setSelectedProduct(product)
    setShowOrderModal(true)
  }

  const closeModal = () => {
    setShowOrderModal(false)
    setSelectedProduct(null)
  }

  // Funções para controlar o slide
  const nextSlide = () => {
    if (homePhotos.length === 0) return
    setCurrentSlide((prev) => (prev + 1) % homePhotos.length)
  }

  const prevSlide = () => {
    if (homePhotos.length === 0) return
    setCurrentSlide((prev) => (prev - 1 + homePhotos.length) % homePhotos.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  // Função simples para scroll suave
  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      const offset = 120 // Altura da navbar + margem extra
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }


  // Se ainda está carregando, mostrar loading
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#022b28' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D15556] mx-auto mb-4"></div>
          <p className="text-[#f2dcbc]">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Skip Links para acessibilidade */}
      <div className="sr-only focus-within:not-sr-only">
        <a 
          href="#main-content" 
          className="absolute top-4 left-4 bg-[#d34d4c] text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-white"
        >
          Pular para o conteúdo principal
        </a>
        <a 
          href="#navigation" 
          className="absolute top-4 left-48 bg-[#d34d4c] text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-white"
        >
          Pular para a navegação
        </a>
      </div>
      
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#022b28' }}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8c5459] rounded-full blur-3xl"
            style={{
              animation: 'float1 8s ease-in-out infinite',
              animationDelay: '0s'
            }}
          ></div>
          <div 
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#EED7B6] rounded-full blur-3xl"
            style={{
              animation: 'float2 10s ease-in-out infinite',
              animationDelay: '2s'
            }}
          ></div>
          <div 
            className="absolute top-1/2 right-1/3 w-64 h-64 bg-[#006D5B] rounded-full blur-3xl"
            style={{
              animation: 'float3 12s ease-in-out infinite',
              animationDelay: '4s'
            }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">

        {/* Header */}
        <header className="border-b border-[#e6d1b8] fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: 'rgba(245, 240, 232, 0.95)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-2 sm:py-3 lg:py-4">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <img 
                    src="/assents/logonavbarg.svg" 
                    alt="Espaço Guapa" 
                    className="h-12 sm:h-16 md:h-20 lg:h-24 xl:h-[120px] w-auto transition-all duration-300"
                    style={{ 
                      filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(332deg) brightness(86%) contrast(101%)'
                    }}
                  />
                </Link>
              </div>
              <nav className="hidden lg:flex space-x-6 xl:space-x-8 2xl:space-x-12">
                <button 
                  onClick={() => smoothScrollTo('inicio')}
                  className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium cursor-pointer"
                >
                  Início
                </button>
                <button 
                  onClick={() => smoothScrollTo('sobre')}
                  className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium cursor-pointer"
                >
                  Sobre
                </button>
                <Link 
                  href="/servicos"
                  className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium"
                >
                  Serviços
                </Link>
                <Link 
                  href="/profissionais"
                  className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium"
                >
                  Nosso Time
                </Link>
                <Link 
                  href="/produtos"
                  className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium"
                >
                  Produtos
                </Link>
                <button 
                  onClick={() => smoothScrollTo('contato')}
                  className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium cursor-pointer"
                >
                  Contato
                </button>
              </nav>
              <div className="flex items-center space-x-3 md:space-x-0">
                {isLoggedIn ? (
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Link 
                      href="/painel-cliente"
                      className="text-[#d34d4c] font-medium text-sm hidden xl:block hover:text-[#b83e3d] transition-colors cursor-pointer"
                    >
                      Olá, {client?.name}
                    </Link>
                    <button
                      onClick={logout}
                      className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium text-sm"
                    >
                      Sair
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/login-cliente"
                    className="bg-[#d34d4c] text-white px-4 md:px-8 py-2 md:py-3 rounded-lg hover:bg-[#b83e3d] transition-colors font-medium tracking-wide text-sm md:text-base"
                  >
                    Agendar
                  </Link>
                )}
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden text-[#d34d4c] p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <nav className="lg:hidden bg-white/95 border-t border-[#e6d1b8] absolute top-full left-0 right-0 z-50">
              <div className="px-4 py-4 space-y-2">
                <button 
                  onClick={() => {
                    smoothScrollTo('inicio')
                    setIsMobileMenuOpen(false)
                  }}
                  className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium cursor-pointer text-left py-2 w-full"
                >
                  Início
                </button>
                <button 
                  onClick={() => {
                    smoothScrollTo('sobre')
                    setIsMobileMenuOpen(false)
                  }}
                  className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium cursor-pointer text-left py-2 w-full"
                >
                  Sobre
                </button>
                <Link 
                  href="/servicos"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium text-left py-2 block"
                >
                  Serviços
                </Link>
                <Link 
                  href="/profissionais"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium text-left py-2 block"
                >
                  Nosso Time
                </Link>
                <Link 
                  href="/produtos"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium text-left py-2 block"
                >
                  Produtos
                </Link>
                <button 
                  onClick={() => {
                    smoothScrollTo('contato')
                    setIsMobileMenuOpen(false)
                  }}
                  className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium cursor-pointer text-left py-2 w-full"
                >
                  Contato
                </button>
                {isLoggedIn ? (
                  <div className="space-y-3 mt-4">
                    <Link 
                      href="/painel-cliente"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-[#d34d4c] font-medium text-sm text-center block hover:text-[#b83e3d] transition-colors py-2"
                    >
                      Olá, {client?.name}
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium text-sm w-full text-center py-2"
                    >
                      Sair
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/login-cliente"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="bg-[#d34d4c] text-white px-6 py-3 rounded-lg hover:bg-[#b83e3d] transition-colors font-medium tracking-wide text-center mt-4 block"
                  >
                    Agendar
                  </Link>
                )}
              </div>
            </nav>
          )}
        </header>

        {/* Spacer para compensar navbar fixa */}
        <div className="h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32"></div>


        {isMobileMenuOpen && (
                      <div className="lg:hidden fixed top-16 left-0 right-0 z-50 bg-[#f2dcbc] border-b border-[#e6d1b8] shadow-lg">
            <nav className="flex flex-col space-y-4 p-6">
              <button 
                onClick={() => {
                  smoothScrollTo('inicio')
                  setIsMobileMenuOpen(false)
                }}
                className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium cursor-pointer text-left py-2"
              >
                Início
              </button>
              <button 
                onClick={() => {
                  smoothScrollTo('sobre')
                  setIsMobileMenuOpen(false)
                }}
                className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium cursor-pointer text-left py-2"
              >
                Sobre
              </button>
              <Link 
                href="/servicos" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium text-left py-2"
              >
                Serviços
              </Link>
              <Link 
                href="/profissionais" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium text-left py-2"
              >
                Nosso Time
              </Link>
              <Link 
                href="/produtos" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium text-left py-2"
              >
                Produtos
              </Link>
              <button 
                onClick={() => {
                  smoothScrollTo('contato')
                  setIsMobileMenuOpen(false)
                }}
                className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium cursor-pointer text-left py-2"
              >
                Contato
              </button>
              <Link 
                href="/login-cliente"
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-[#d34d4c] text-white px-6 py-3 rounded-lg hover:bg-[#b83e3d] transition-colors font-medium tracking-wide text-center mt-4"
              >
                Agendar
              </Link>
            </nav>
          </div>
        )}

        {/* Hero Section */}
        <section id="inicio" className="py-0 md:-mt-4 md:pb-16 relative transition-all duration-1000" role="banner" aria-label="Seção inicial do site">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Texto à esquerda */}
              <div className="text-left order-1 md:order-1 md:col-span-1">
                <div style={{ lineHeight: '0.8' }}>
                  <img 
                    src="/assents/LogoPrincipal_semfundo.svg" 
                    alt="Espaço Guapa" 
                    className="max-w-xs md:max-w-md mx-auto md:mx-0"
                    style={{ marginBottom: '0', display: 'block', marginTop: '0', paddingBottom: '0' }}
                  />
                  <p className="text-2xl md:text-4xl mb-4 md:mb-8 leading-none font-medium font-heading text-center md:text-left" style={{ color: '#f2dcbc', marginTop: '-80px' }}>
                    Um salão que não parece salão. Sua beleza natural e criativa.
                  </p>
                </div>
                <p className="text-base md:text-lg mb-6 md:mb-12 leading-relaxed font-medium text-center md:text-left" style={{ color: '#f2dcbc' }}>
                  Bem vinda ao Espaço Guapa! Onde sua beleza natural é respeitada, e os seus desejos criativos atendidos. Somos o primeiro salão visagista especialista em cabelos livres de química em Leme.
                </p>
                <div className="text-center md:text-left mb-8 md:mb-0">
                  <Link 
                    href={isLoggedIn ? "/agendamento" : "/login-cliente"}
                    className="bg-[#D15556] text-white px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-[#c04546] transition-all duration-300 transform hover:scale-105 font-medium tracking-wide shadow-md hover:shadow-lg inline-block"
                  >
                    Agendar Horário
                  </Link>
                </div>
              </div>
              
              {/* Carrossel de Fotos à direita */}
              <div className="flex justify-center md:justify-end order-2 md:order-2 md:col-span-1 md:mt-24">
                <div className="relative w-full max-w-lg">
                  {/* Container do carrossel */}
                  <div className="relative overflow-hidden rounded-lg shadow-2xl">
                    {homePhotos.length > 0 ? (
                      <div 
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{ 
                          transform: `translateX(-${currentSlide * (100 / homePhotos.length)}%)`,
                          width: `${homePhotos.length * 100}%`
                        }}
                      >
                        {homePhotos.map((photo, index) => (
                          <div 
                            key={photo.id} 
                            className="w-full"
                            style={{ width: `${100 / homePhotos.length}%` }}
                          >
                            <img 
                              src={photo.imageUrl} 
                              alt={`Espaço Guapa - Slide ${index + 1}`} 
                              className="w-full h-auto object-cover"
                              style={{ maxHeight: '400px', width: '100%' }}
                              onError={(e) => {
                                console.log('Erro ao carregar imagem:', photo.imageUrl);
                                e.currentTarget.style.display = 'none';
                              }}
                              onLoad={(e) => {
                                console.log('Imagem carregada com sucesso:', photo.imageUrl);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                        <p className="text-gray-500">Nenhuma foto disponível</p>
                      </div>
                    )}
                  </div>

                  {/* Botões de navegação */}
                  {homePhotos.length > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                        aria-label="Foto anterior"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                        aria-label="Próxima foto"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      {/* Indicadores */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {homePhotos.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentSlide ? 'bg-white' : 'bg-white/50'
                            }`}
                            aria-label={`Ir para foto ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção Sobre Nós */}
        <main id="main-content" role="main">
        <section id="sobre" className="py-8 md:py-16 relative transition-all duration-1000" aria-label="Sobre o Espaço Guapa">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 md:mb-12 font-heading" style={{ color: '#f2dcbc' }}>
              Sobre Nós
            </h2>
            <p className="text-lg md:text-xl leading-relaxed font-body mb-0" style={{ color: '#f2dcbc' }}>
              Somos um jovem salão, idealizado pela cabeleireira visagista Bruna Canovas (<a href="https://www.instagram.com/brudoscabelos/" target="_blank" rel="noopener noreferrer" className="text-[#d34d4c] hover:underline">@brudoscabelos</a>) que inaugurou em janeiro de 2021 seu primeiro espaço. Cresceu, ganhou forças com a parceria de uma equipe alinhada e hoje existe como o Espaço Guapa, um salão que vai além da beleza puramente pela estética, mas que se conecta com intenção em cada atendimento, que é exclusivo.
              <br /><br />
              Aqui, atendemos com hora agendada, sem esperas e encaixes, respeitamos seu tempo e a sua confiança no nosso trabalho.
              <br /><br />
              E sob o olhar atencioso das nossas cabeleireiras, unimos visagismo, consultoria capilar, cortes personalizados e colorimetria, tudo com consciência e respeito à saúde capilar. A tricoterapeuta naturalista Cícera Canovas complementa esse cuidado com tratamentos naturais especializados que fortalecem e revitalizam o couro cabeludo, sem abrir mão da saúde do seu cabelo. Trabalhamos com produtos da Keune Haircosmetics, referência mundial em qualidade e inovação.
            </p>
          </div>
        </section>

        {/* Serviços Destaque */}
        <section id="servicos-home" className="py-6 md:py-12 relative transition-all duration-1000" aria-label="Serviços em destaque">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 font-heading" style={{ color: '#f2dcbc' }}>Nossos Serviços</h2>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>Cuidamos de você com carinho e profissionalismo</p>
              <div className="w-24 h-1 bg-[#006D5B] mx-auto mt-6 md:mt-8"></div>
            </div>
            
            {/* Cards dos Serviços Estáticos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
              {servicosEspacoGuapa.map((service, index) => (
                <div 
                  key={service.id}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 border border-white/20" 
                >
                  <div className="text-center mb-4 md:mb-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-[#d34d4c] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                      {service.name.includes('Cortes que Celebram a Natureza do Cabelo') ? (
                        <Scissors className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      ) : service.name.includes('Colorimetria Criativa') ? (
                        <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      ) : (
                        <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      )}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold font-heading mb-3 md:mb-4" style={{ color: '#f2dcbc' }}>
                      {service.name}
                    </h3>
                  </div>
                  <p className="text-base md:text-lg font-body leading-relaxed text-center" style={{ color: '#f2dcbc' }}>
                    {service.description}
                  </p>
                  {/* Removido o preço pois os novos serviços não têm preço definido */}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Profissionais */}
        <section id="equipe" className="py-12 md:py-16 relative transition-all duration-1000" aria-label="Nossa equipe de profissionais">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 font-heading" style={{ color: '#f2dcbc' }}>Nosso Time</h2>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>Profissionais experientes e dedicados</p>
              <div className="w-24 h-1 bg-[#d34d4c] mx-auto mt-6 md:mt-8"></div>
            </div>
            
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {professionals.map((professional, index) => (
                <div 
                  key={professional._id} 
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20" 
                  style={{ transitionDelay: `${(index + 1) * 200}ms` }}
                >
                  <div className="text-center mb-4 md:mb-6">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto mb-3 md:mb-4 overflow-hidden">
                      <img 
                        src={professional.profileImage} 
                        alt={professional.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/assents/fotobruna.jpeg'
                        }}
                      />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold font-heading mb-2" style={{ color: '#f2dcbc' }}>{professional.name}</h3>
                    <p className="text-[#d34d4c] font-medium font-body">{professional.title}</p>
                  </div>
                  <p className="text-base md:text-lg leading-relaxed text-center font-body" style={{ color: '#f2dcbc' }}>
                    {professional.shortDescription}
                  </p>
                  
                  {/* Serviços em Destaque */}
                  {professional.featuredServices && professional.featuredServices.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap justify-center gap-2">
                        {professional.featuredServices.map((service, serviceIndex) => (
                          <span 
                            key={serviceIndex}
                            className="bg-[#d34d4c] text-white px-3 py-1 rounded-full text-xs font-medium"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 md:mt-6 flex justify-center">
                    <Link 
                      href={`/profissionais/${professional.name
                        .split(' ')[0] // Pega apenas o primeiro nome
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
                        .replace(/[^a-z0-9]/g, '') // Remove caracteres especiais
                      }`}
                      className="bg-[#d34d4c] text-white px-4 md:px-6 py-2 rounded-lg hover:bg-[#b83e3d] transition-all duration-300 font-medium"
                    >
                      Saiba Mais
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Parceiros */}
        <section id="parceiros" className="py-16 relative transition-all duration-1000" aria-label="Nossos parceiros">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>Nossos Parceiros</h2>
              <p className="text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>No nosso salão, a qualidade faz parte da rotina. Utilizamos exclusivamente Keune Haircosmetics, reconhecida mundialmente por seus ingredientes de alta performance e respeito à fibra capilar. Essa parceria reflete nosso compromisso com a excelência e resultados reais.</p>
              <div className="w-24 h-1 bg-[#d34d4c] mx-auto mt-8"></div>
            </div>
            
            <div className="flex justify-center items-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
                <div className="text-center">
                  <div className="mb-6">
                    <div className="h-24 w-24 mx-auto mb-4 flex items-center justify-center">
                      <img 
                        src="/assents/keunehome.png" 
                        alt="Keune Haircosmetics" 
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/assents/fotobruna.jpeg'
                        }}
                      />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold font-heading mb-4" style={{ color: '#f2dcbc' }}>
                    Keune Haircosmetics
                  </h3>
                  <p className="text-lg leading-relaxed font-body mb-6" style={{ color: '#f2dcbc' }}>
                    Referência global em produtos profissionais para cabelos. Utilizamos a linha Keune So Pure, 
                    livre de amônia e parabeno, para garantir tratamentos naturais e saudáveis.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <span className="bg-[#d34d4c] text-white px-4 py-2 rounded-full text-sm font-medium">
                      Produtos Naturais
                    </span>
                    <span className="bg-[#d34d4c] text-white px-4 py-2 rounded-full text-sm font-medium">
                      Sem Química
                    </span>
                    <span className="bg-[#d34d4c] text-white px-4 py-2 rounded-full text-sm font-medium">
                      Qualidade Profissional
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Produtos */}
        <section id="produtos" className="py-16 relative transition-all duration-1000" aria-label="Nossos produtos">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>Nossa Lojinha</h2>
              <p className="text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>Produtos profissionais para cuidar dos seus cabelos</p>
              <div className="w-24 h-1 bg-[#d34d4c] mx-auto mt-8"></div>
            </div>
            
            {featuredProducts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {featuredProducts.slice(0, 3).map((product, index) => (
                  <div key={product._id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 border border-white/20" style={{ transitionDelay: `${(index + 1) * 100}ms` }}>
                    <div className="w-16 h-16 bg-[#d34d4c] rounded-full mx-auto mb-4 flex items-center justify-center">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-8 h-8 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <Package className={`w-8 h-8 text-white ${product.imageUrl ? 'hidden' : ''}`} />
                    </div>
                    <h3 className="text-xl font-bold font-heading mb-2 text-center" style={{ color: '#f2dcbc' }}>{product.name}</h3>
                    <p className="text-lg font-body text-center mb-4" style={{ color: '#f2dcbc' }}>
                      {product.description}
                    </p>
                    <div className="text-center mb-4">
                      {product.discount && product.discount > 0 ? (
                        <div>
                          <p className="text-lg line-through text-gray-400">R$ {product.originalPrice?.toFixed(2) || product.price.toFixed(2)}</p>
                          <p className="text-2xl font-light text-[#d34d4c]">R$ {(product.price * (1 - product.discount / 100)).toFixed(2)}</p>
                          <span className="text-sm text-[#d34d4c] font-medium">-{product.discount}% OFF</span>
                        </div>
                      ) : (
                        <p className="text-2xl font-light text-[#d34d4c]">R$ {product.price.toFixed(2)}</p>
                      )}
                    </div>
                    <Link 
                      href="/produtos"
                      className="block w-full bg-[#d34d4c] text-white text-center py-2 rounded-lg hover:bg-[#b83e3d] transition-all duration-300 font-medium"
                    >
                      Comprar
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="col-span-full text-center py-12">
                <Package className="w-16 h-16 text-[#d34d4c] mx-auto mb-4" />
                <p className="text-lg text-[#f2dcbc]">Nenhum produto em destaque no momento.</p>
                <p className="text-sm text-[#f2dcbc] mt-2">Acesse nossa loja para ver todos os produtos.</p>
              </div>
            )}
            
            <div className="text-center mt-12">
              <Link 
                href="/produtos"
                className="inline-flex items-center px-8 py-3 border-2 border-[#f2dcbc] text-[#f2dcbc] font-medium hover:bg-[#f2dcbc] hover:text-[#022b28] transition-all duration-300 transform hover:scale-105 rounded-lg"
              >
                Veja mais produtos
                <Package className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Agendamento */}
        <section id="agendamento" className="py-16 relative transition-all duration-1000" aria-label="Agendamento de serviços">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>Agendamento</h2>
              <p className="text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>Agende seu horário. Estamos no coração de Leme-SP.</p>
              <div className="w-24 h-1 bg-[#d34d4c] mx-auto mt-8"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Informações do endereço */}
              <div className="text-center md:text-left" style={{ transitionDelay: '200ms' }}>
                <div className="mb-8">
                  <h3 className="text-3xl font-bold font-heading mb-6" style={{ color: '#f2dcbc' }}>
                    Nosso Endereço
                  </h3>
                  <p className="text-xl font-body leading-relaxed" style={{ color: '#f2dcbc' }}>
                    Rua Dr. Gonçalves da Cunha, 682, Centro, Leme – SP.
                  </p>
                </div>
                
                <Link 
                  href={isLoggedIn ? "/agendamento" : "/login-cliente"}
                  className="inline-flex items-center px-8 py-4 bg-[#d34d4c] text-white font-medium hover:bg-[#b83e3d] transition-all duration-300 transform hover:scale-105 rounded-lg shadow-md hover:shadow-lg"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Agendar Horário
                </Link>
              </div>
              
              {/* Mapa do Google */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20" style={{ transitionDelay: '400ms' }}>
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold font-heading mb-2" style={{ color: '#f2dcbc' }}>
                    Onde nos encontrar
                  </h3>
                </div>
                <div className="w-full h-64 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.0523!2d-47.3897!3d-22.1856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDExJzA4LjIiUyA0N8KwMjMnMjMuMCJX!5e0!3m2!1spt-BR!2sbr!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização do Espaço Guapa"
                  ></iframe>
                </div>
                <div className="text-center mt-4">
                  <p className="text-sm font-body" style={{ color: '#f2dcbc' }}>
                    Clique no mapa para abrir no Google Maps
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section id="depoimentos" className="py-16 relative transition-all duration-1000" aria-label="Depoimentos de clientes">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>Depoimentos</h2>
              <p className="text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>O que nossas clientes dizem sobre nós</p>
              <div className="w-24 h-1 bg-[#d34d4c] mx-auto mt-8"></div>
            </div>
            
            {/* Carrossel de Depoimentos */}
            <div className="relative">
              {/* Container com scroll horizontal */}
              <div id="testimonials-carousel" className="flex gap-6 overflow-x-auto scrollbar-hide pb-6 snap-x snap-mandatory">
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={testimonial.id} 
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 flex-shrink-0 w-80 snap-start border border-white/20" 
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-[#d34d4c] rounded-full mr-4"></div>
                      <div>
                        <h4 className="font-medium font-heading" style={{ color: '#f2dcbc' }}>{testimonial.name}</h4>
                        <p className="text-sm font-body" style={{ color: '#f2dcbc' }}>{testimonial.period}</p>
                      </div>
                    </div>
                    <p className="font-body italic" style={{ color: '#f2dcbc' }}>
                      &ldquo;{testimonial.text}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Indicadores de scroll */}
              <div className="flex justify-center mt-8 space-x-2">
                {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, index) => (
                  <button
                    key={index}
                    className="w-3 h-3 rounded-full bg-gray-300 hover:bg-[#006D5B] transition-colors"
                    onClick={() => {
                      const container = document.getElementById('testimonials-carousel')
                      if (container) {
                        const cardWidth = 320 // w-80 + gap-6
                        container.scrollTo({
                          left: index * cardWidth * 3, // 3 cards por vez
                          behavior: 'smooth'
                        })
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contato */}
        <section id="contato" className="py-16 relative transition-all duration-1000" aria-label="Informações de contato">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>Entre em Contato</h2>
              <p className="text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>Estamos aqui para cuidar de você</p>
              <div className="w-24 h-1 bg-[#d34d4c] mx-auto mt-8"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 border border-white/20" style={{ transitionDelay: '100ms' }}>
                <div className="w-12 h-12 bg-[#d34d4c] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold font-heading mb-2" style={{ color: '#f2dcbc' }}>Endereço</h3>
                <p className="text-lg font-body" style={{ color: '#f2dcbc' }}>Rua Dr. Gonçalves da Cunha, 682 – Centro, Leme - SP</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 border border-white/20" style={{ transitionDelay: '250ms' }}>
                <div className="w-12 h-12 bg-[#d34d4c] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold font-heading mb-2" style={{ color: '#f2dcbc' }}>Telefone / WhatsApp</h3>
                <p className="text-lg font-body" style={{ color: '#f2dcbc' }}>+55 19 99153-1394</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 border border-white/20" style={{ transitionDelay: '400ms' }}>
                <div className="w-12 h-12 bg-[#d34d4c] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <WhatsAppIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold font-heading mb-2" style={{ color: '#f2dcbc' }}>Redes Sociais</h3>
                <div className="flex justify-center space-x-4 mt-4">
                  <a href="https://instagram.com/espaco_guapa" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#d34d4c] rounded-full flex items-center justify-center hover:bg-[#b83e3d] transition-colors">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href={`https://wa.me/${settings?.whatsapp || '5519991531394'}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#d34d4c] rounded-full flex items-center justify-center hover:bg-[#b83e3d] transition-colors">
                    <WhatsAppIcon className="w-5 h-5 text-white" />
                  </a>
                  <a href="https://facebook.com/espacoguapa" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#d34d4c] rounded-full flex items-center justify-center hover:bg-[#b83e3d] transition-colors">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        </main>

        {/* Footer */}
        <footer id="footer" className="text-gray-900 py-8 md:py-16 border-t border-[#D15556] relative" style={{ backgroundColor: 'rgba(245, 240, 232, 0.95)' }} role="contentinfo" aria-label="Rodapé do site">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 md:gap-12">
              <div>
                <h4 className="text-lg font-medium mb-6">Links Rápidos</h4>
                <ul className="space-y-3">
                  <li><Link href="/servicos" className="text-gray-600 hover:text-[#D15556] transition-all duration-300">Serviços</Link></li>
                  <li><Link href="/profissionais" className="text-gray-600 hover:text-[#D15556] transition-all duration-300">Profissionais</Link></li>
                  <li><Link href="/agendamento" className="text-gray-600 hover:text-[#D15556] transition-all duration-300">Agendamento</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-medium mb-6">Contato</h4>
                <div className="space-y-3 text-gray-600">
                  <p>Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP</p>
                  <div className="flex space-x-4">
                    <a href={`https://wa.me/${settings?.whatsapp || '5519991531394'}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-500 transition-colors">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                    </a>
                    <a href="https://instagram.com/espaco_guapa" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-500 transition-colors">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-[#EED7B6] mt-6 md:mt-12 pt-4 md:pt-8 text-center text-gray-600">
              <p>&copy; 2024 Espaço Guapa. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>



        {/* WhatsApp Fixo */}
        <div className="fixed bottom-6 right-6 z-50">
          <a 
            href={`https://wa.me/${settings?.whatsapp || '5519991531394'}?text=Olá! Gostaria de agendar um horário no Espaço Guapa.`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 cursor-pointer"
            aria-label="WhatsApp"
          >
            <WhatsAppIcon className="w-7 h-7" />
          </a>
        </div>

        {/* Modal de Pedido Rápido */}
        {showOrderModal && selectedProduct && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="modal-title"
          >
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 id="modal-title" className="text-2xl font-light text-[#D15556]">Pedido Rápido</h3>
                <button 
                  onClick={closeModal} 
                  className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D15556] rounded-md p-1"
                  aria-label="Fechar modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-6">
                <h4 className="text-xl font-light text-[#006D5B] mb-2">{selectedProduct.name}</h4>
                <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                <p className="text-2xl font-light text-[#D15556]">R$ {selectedProduct.price.toFixed(2)}</p>
              </div>
              <div className="flex justify-end">
                <Link 
                  href="/agendamento"
                  className="bg-[#D15556] text-white px-8 py-3 rounded-lg hover:bg-[#c04546] transition-all duration-300 transform hover:scale-105 font-medium tracking-wide shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#D15556]"
                  aria-label="Agendar serviço"
                >
                  Agendar
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes float1 {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          33% {
            transform: translateY(-30px) translateX(10px) scale(1.05);
          }
          66% {
            transform: translateY(-15px) translateX(-5px) scale(1.02);
          }
        }
        
        @keyframes float2 {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          33% {
            transform: translateY(-25px) translateX(-15px) scale(1.03);
          }
          66% {
            transform: translateY(-10px) translateX(5px) scale(1.01);
          }
        }
        
        @keyframes float3 {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          33% {
            transform: translateY(-20px) translateX(8px) scale(1.04);
          }
          66% {
            transform: translateY(-8px) translateX(-3px) scale(1.02);
          }
        }

        /* Estilos para scroll suave */
        html {
          scroll-behavior: smooth;
        }

        body {
          overflow-x: hidden;
        }

        /* Desabilitar scroll padrão durante animações */
        body.scrolling {
          overflow: hidden;
        }

        /* Indicadores de seção */
        .section-indicator {
          transition: all 0.3s ease;
        }

        .section-indicator.active {
          background-color: #D15556;
          transform: scale(1.25);
        }

        /* Esconder scrollbar */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Snap scroll para carrossel */
        .snap-x {
          scroll-snap-type: x mandatory;
        }

        .snap-start {
          scroll-snap-align: start;
        }

        /* Melhorar transição do carrossel */
        .overflow-x-auto {
          scroll-behavior: smooth;
          transition: scroll-left 0.3s ease;
        }
      `}</style>
    </div>
  )
}
