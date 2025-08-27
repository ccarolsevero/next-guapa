'use client'

import Link from 'next/link'
import { Calendar, Scissors, Sparkles, MessageCircle, X, User, MapPin, Phone, Mail, Package, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import { MessageCircle as WhatsAppIcon } from 'lucide-react'

// Dados reais dos serviços do Espaço Guapa
const servicosEspacoGuapa = [
  {
    id: 1,
    name: "Avaliação",
    price: 60.00,
    description: "Conversa com a profissional para avaliar seu cabelo e a possibilidade de realizar um procedimento ou não."
  },
  {
    id: 2,
    name: "Back To Natural - G",
    price: 319.00,
    description: "Técnica exclusiva da Keune que repigmenta cabelos loiros no tom desejado, sem avermelhar e priorizando a saúde dos fios."
  },
  {
    id: 3,
    name: "Back To Natural - P",
    price: 231.00,
    description: "Técnica exclusiva da Keune que repigmenta cabelos loiros no tom desejado, sem avermelhar e priorizando a saúde dos fios."
  }
]

interface Product {
  id: number
  name: string
  price: number
  description: string
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

export default function HomePage() {
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [animatedSections, setAnimatedSections] = useState<Set<string>>(new Set())
  const [currentSection, setCurrentSection] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Array das seções em ordem
  const sections = ['inicio', 'sobre', 'servicos', 'equipe', 'parceiros', 'produtos', 'agendamento', 'depoimentos', 'contato']

  // Função para ir para a próxima seção
  const goToNextSection = () => {
    if (isScrolling) return
    
    setIsScrolling(true)
    
    // Verificar se estamos na última seção ou próximo do footer
    if (currentSection === sections.length - 1) {
      // Se estiver na última seção, permitir scroll normal para o footer
      setIsScrolling(false)
      return
    }
    
    const nextSectionIndex = currentSection + 1
    const nextSectionId = sections[nextSectionIndex]
    
    setCurrentSection(nextSectionIndex)
    smoothScrollTo(nextSectionId)
    
    setTimeout(() => {
      setIsScrolling(false)
    }, 1000)
  }

  // Função para ir para a seção anterior
  const goToPreviousSection = () => {
    if (isScrolling) return
    
    setIsScrolling(true)
    
    const prevSectionIndex = currentSection === 0 ? sections.length - 1 : currentSection - 1
    const prevSectionId = sections[prevSectionIndex]
    
    setCurrentSection(prevSectionIndex)
    smoothScrollTo(prevSectionId)
    
    setTimeout(() => {
      setIsScrolling(false)
    }, 1000)
  }

  // Função para scroll suave
  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      const offset = 80 // Altura da navbar
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  // Detectar scroll do usuário
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout

    const handleScroll = (e: WheelEvent) => {
      // Verificar se o usuário está próximo do final da página (footer)
      const scrollPosition = window.scrollY + window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const footerThreshold = documentHeight - 200 // 200px antes do final
      
      if (scrollPosition >= footerThreshold) {
        // Se estiver próximo do footer, permitir scroll normal
        return
      }

      e.preventDefault()
      
      if (isScrolling) return
      
      // Determinar direção do scroll
      if (e.deltaY > 0) {
        // Scroll para baixo
        goToNextSection()
      } else {
        // Scroll para cima
        goToPreviousSection()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Verificar se o usuário está próximo do final da página
      const scrollPosition = window.scrollY + window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const footerThreshold = documentHeight - 200 // 200px antes do final
      
      if (scrollPosition >= footerThreshold) {
        return // Permitir navegação normal no footer
      }

      if (isScrolling) return
      
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        goToNextSection()
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        goToPreviousSection()
      }
    }

    // Adicionar event listeners
    const container = document.body
    container.addEventListener('wheel', handleScroll, { passive: false })
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      container.removeEventListener('wheel', handleScroll)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentSection, isScrolling])

  // Intersection Observer para animações
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id
            setAnimatedSections(prev => new Set(prev).add(sectionId))
            
            // Atualizar seção atual baseado no que está visível
            const sectionIndex = sections.indexOf(sectionId)
            if (sectionIndex !== -1) {
              setCurrentSection(sectionIndex)
            }
          }
        })
      },
      {
        threshold: 0.5, // Anima quando 50% da seção está visível
        rootMargin: '0px'
      }
    )

    // Observar todas as seções principais
    const sectionElements = document.querySelectorAll('section[id]')
    sectionElements.forEach(section => {
      observer.observe(section)
    })

    // Cleanup
    return () => {
      sectionElements.forEach(section => {
        observer.unobserve(section)
      })
    }
  }, [])

  const openModal = (product: Product) => {
    setSelectedProduct(product)
    setShowOrderModal(true)
  }

  const closeModal = () => {
    setShowOrderModal(false)
    setSelectedProduct(null)
  }

  // Obter os 3 serviços mais populares para destacar
  const servicosDestaque = [
    servicosEspacoGuapa.find(s => s.name === "Avaliação"),
    servicosEspacoGuapa.find(s => s.name === "Back To Natural - P"),
    servicosEspacoGuapa.find(s => s.name === "Corte")
  ].filter(Boolean) as Product[]

  return (
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
            <div className="flex justify-between items-center py-0">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <img 
                    src="/assents/logonavbarg.svg" 
                    alt="Espaço Guapa" 
                    style={{ 
                      height: '120px', 
                      width: 'auto',
                      filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(332deg) brightness(86%) contrast(101%)'
                    }}
                  />
                </Link>
              </div>
              <nav className="hidden md:flex space-x-12">
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
                <button 
                  onClick={() => smoothScrollTo('servicos')}
                  className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium cursor-pointer"
                >
                  Serviços
                </button>
                <Link href="/profissionais" className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium">
                  Nosso Time
                </Link>
                <Link href="/produtos" className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium">
                  Produtos
                </Link>
                <button 
                  onClick={() => smoothScrollTo('contato')}
                  className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium cursor-pointer"
                >
                  Contato
                </button>
              </nav>
              
              {/* Menu Mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-[#d34d4c] p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <Link 
                href="/login-cliente"
                className="bg-[#d34d4c] text-white px-8 py-3 rounded-lg hover:bg-[#b83e3d] transition-colors font-medium tracking-wide"
              >
                Agendar
              </Link>
            </div>
          </div>
        </header>

        {/* Spacer para compensar navbar fixa */}
        <div className="h-20"></div>

        {/* Menu Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed top-20 left-0 right-0 z-40 bg-[#f2dcbc] border-b border-[#e6d1b8] shadow-lg">
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
              <button 
                onClick={() => {
                  smoothScrollTo('servicos')
                  setIsMobileMenuOpen(false)
                }}
                className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium cursor-pointer text-left py-2"
              >
                Serviços
              </button>
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
        <section id="inicio" className={`py-12 md:py-24 relative transition-all duration-1000 ${
          animatedSections.has('inicio') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Texto à esquerda */}
              <div className="text-left order-2 md:order-1">
                <div style={{ lineHeight: '0.8' }}>
                  <img 
                    src="/assents/LogoPrincipal_semfundo.svg" 
                    alt="Espaço Guapa" 
                    className="max-w-xs md:max-w-md mx-auto md:mx-0"
                    style={{ marginBottom: '0', display: 'block', marginTop: '0', paddingBottom: '0' }}
                  />
                  <p className="text-2xl md:text-4xl mb-4 md:mb-8 leading-none font-medium font-heading text-center md:text-left" style={{ color: '#f2dcbc', marginTop: '-80px' }}>
                    Beleza é liberdade. Belo é ser livre.
                  </p>
                </div>
                <p className="text-base md:text-lg mb-6 md:mb-12 leading-relaxed font-medium text-center md:text-left" style={{ color: '#f2dcbc' }}>
                  Bem-vinda ao Espaço Guapa – onde a beleza natural dos seus cabelos é respeitada e valorizada. Aqui, você encontra um refúgio de cuidado, com tratamentos sem química que respeitam cada fio e preservam a saúde do couro cabeludo.
                </p>
                <div className="text-center md:text-left">
                  <Link 
                    href="/login-cliente"
                    className="bg-[#D15556] text-white px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-[#c04546] transition-all duration-300 transform hover:scale-105 font-medium tracking-wide shadow-md hover:shadow-lg inline-block"
                  >
                    Agendar Horário
                  </Link>
                </div>
              </div>
              
              {/* Imagem à direita */}
              <div className="flex justify-center md:justify-end order-1 md:order-2">
                <div className="relative">
                  <img 
                    src="/assents/fotohomeguapa.jpeg" 
                    alt="Espaço Guapa - Salão de Beleza" 
                    className="rounded-lg shadow-2xl max-w-full h-auto"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção Sobre Nós */}
        <section id="sobre" className={`py-12 md:py-24 relative transition-all duration-1000 ${
          animatedSections.has('sobre') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 md:mb-12 font-heading" style={{ color: '#f2dcbc' }}>
              Sobre Nós
            </h2>
            <p className="text-lg md:text-xl leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
              No Espaço Guapa, nossa missão é ajudar você a descobrir e expressar a beleza natural dos seus cabelos. Sob o olhar atencioso das nossas cabeleireiras, unimos consultoria capilar, cortes personalizados e colorimetria, tudo com consciência e respeito à fibra capilar. A tricoterapeuta naturalista Cícera Canovas complementa esse cuidado com tratamentos naturais especializados que fortalecem e revitalizam desde a raiz, sem abrir mão da saúde do seu cabelo. Trabalhamos com produtos da Keune Haircosmetics, referência em qualidade e inovação.
            </p>
          </div>
        </section>

        {/* Serviços Destaque */}
        <section id="servicos" className={`py-12 md:py-16 relative transition-all duration-1000 ${
          animatedSections.has('servicos') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 font-heading" style={{ color: '#f2dcbc' }}>Nossos Serviços</h2>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>Cuidamos de você com carinho e profissionalismo</p>
              <div className="w-24 h-1 bg-[#006D5B] mx-auto mt-6 md:mt-8"></div>
            </div>
            
            {/* Cards dos Serviços Principais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
              {/* Card Cortes */}
              <div 
                className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 border border-white/20 ${
                  animatedSections.has('servicos') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`} 
                style={{ transitionDelay: '0ms' }}
              >
                <div className="text-center mb-4 md:mb-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-[#d34d4c] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Scissors className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold font-heading mb-3 md:mb-4" style={{ color: '#f2dcbc' }}>
                    Cortes que Celebram a Natureza do Cabelo
                  </h3>
                </div>
                <p className="text-base md:text-lg font-body leading-relaxed text-center" style={{ color: '#f2dcbc' }}>
                  Cada corte é pensado para valorizar o movimento, a textura e a forma única dos seus fios sem desrespeitar sua essência. Sempre buscando alinhar a praticidade do dia a dia com a potência dos cabelos naturais.
                </p>
              </div>

              {/* Card Coloração */}
              <div 
                className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 border border-white/20 ${
                  animatedSections.has('servicos') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`} 
                style={{ transitionDelay: '200ms' }}
              >
                <div className="text-center mb-4 md:mb-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-[#d34d4c] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold font-heading mb-3 md:mb-4" style={{ color: '#f2dcbc' }}>
                    Colorimetria Criativa
                  </h3>
                </div>
                <p className="text-base md:text-lg font-body leading-relaxed text-center" style={{ color: '#f2dcbc' }}>
                  Trabalhamos com colorações, loiros, iluminados e cores fantasia com cuidado máximo, evitando processos que comprometam a saúde capilar. Sempre buscando a melhor manutenção para a sua rotina, alinhada com as cores que representam sua personalidade.
                </p>
              </div>

              {/* Card Tratamentos */}
              <div 
                className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 border border-white/20 ${
                  animatedSections.has('servicos') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`} 
                style={{ transitionDelay: '400ms' }}
              >
                <div className="text-center mb-4 md:mb-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-[#d34d4c] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Star className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold font-heading mb-3 md:mb-4" style={{ color: '#f2dcbc' }}>
                    Tratamentos Naturais Tricoterapêuticos
                  </h3>
                </div>
                <p className="text-base md:text-lg font-body leading-relaxed text-center" style={{ color: '#f2dcbc' }}>
                  Técnicas especiais que cuidam especialmente do couro cabeludo, mas também do comprimento, com fórmulas naturais e sem uso de química. Realizados com a linha Keune So Pure, o resultado: cabelo mais forte, saudável e com brilho natural.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Profissionais */}
        <section id="equipe" className={`py-12 md:py-16 relative transition-all duration-1000 ${
          animatedSections.has('equipe') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 font-heading" style={{ color: '#f2dcbc' }}>Nosso Time</h2>
              <p className="text-base md:text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>Profissionais experientes e dedicados</p>
              <div className="w-24 h-1 bg-[#d34d4c] mx-auto mt-6 md:mt-8"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20 ${
                animatedSections.has('equipe') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`} style={{ transitionDelay: '200ms' }}>
                <div className="text-center mb-4 md:mb-6">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto mb-3 md:mb-4 overflow-hidden">
                    <img 
                      src="/assents/fotobruna.jpeg" 
                      alt="Bruna - Cabeleireira Visagista" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold font-heading mb-2" style={{ color: '#f2dcbc' }}>Bruna</h3>
                  <p className="text-[#d34d4c] font-medium font-body">Cabeleireira Visagista</p>
                </div>
                <p className="text-base md:text-lg leading-relaxed text-center font-body" style={{ color: '#f2dcbc' }}>
                  Especialista em consultoria de visagismo, cortes e colorações dos mais variados tipos. 
                  Trabalha com técnicas modernas mantendo sempre a saúde dos fios.
                </p>
                <div className="mt-4 md:mt-6 flex justify-center">
                  <Link 
                    href="/profissionais/bruna"
                    className="bg-[#d34d4c] text-white px-4 md:px-6 py-2 rounded-lg hover:bg-[#b83e3d] transition-all duration-300 font-medium"
                  >
                    Saiba Mais
                  </Link>
                </div>
              </div>
              
              <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20 ${
                animatedSections.has('equipe') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`} style={{ transitionDelay: '400ms' }}>
                <div className="text-center mb-4 md:mb-6">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center">
                    <User className="w-12 h-12 md:w-16 md:h-16 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold font-heading mb-2" style={{ color: '#f2dcbc' }}>Cicera Canovas</h3>
                  <p className="text-[#d34d4c] font-medium font-body">Tricoterapeuta</p>
                </div>
                <p className="text-base md:text-lg leading-relaxed text-center font-body" style={{ color: '#f2dcbc' }}>
                  Especialista em tratamentos naturais do couro cabeludo e fios. 
                  Utiliza técnicas 100% naturalistas, sem química, priorizando a saúde capilar.
                </p>
                <div className="mt-4 md:mt-6 flex justify-center">
                  <Link 
                    href="/profissionais/cicera"
                    className="bg-[#d34d4c] text-white px-4 md:px-6 py-2 rounded-lg hover:bg-[#b83e3d] transition-all duration-300 font-medium"
                  >
                    Saiba Mais
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Parceiros */}
        <section id="parceiros" className={`py-16 relative transition-all duration-1000 ${
          animatedSections.has('parceiros') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>Nossos Parceiros</h2>
              <p className="text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>No nosso salão, a qualidade faz parte da rotina. Utilizamos exclusivamente Keune Haircosmetics, reconhecida mundialmente por seus ingredientes de alta performance e respeito à fibra capilar. Essa parceria reflete nosso compromisso com a excelência e resultados reais.</p>
              <div className="w-24 h-1 bg-[#d34d4c] mx-auto mt-8"></div>
            </div>
            
            <div className="flex justify-center items-center">
              <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20 ${
                animatedSections.has('parceiros') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <div className="text-center">
                  <div className="mb-6">
                    <img 
                      src="/assents/keune-logo.png" 
                      alt="Keune Haircosmetics" 
                      className="h-24 mx-auto mb-4"
                      onError={(e) => {
                        // Fallback se a imagem não existir
                        e.currentTarget.style.display = 'none';
                      }}
                    />
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
        <section id="produtos" className={`py-16 relative transition-all duration-1000 ${
          animatedSections.has('produtos') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>Nossa Lojinha</h2>
              <p className="text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>Produtos profissionais para cuidar dos seus cabelos</p>
              <div className="w-24 h-1 bg-[#d34d4c] mx-auto mt-8"></div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {/* Produto 1 */}
              <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 border border-white/20 ${
                animatedSections.has('produtos') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`} style={{ transitionDelay: '100ms' }}>
                <div className="w-16 h-16 bg-[#d34d4c] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-2 text-center" style={{ color: '#f2dcbc' }}>Shampoo Keune</h3>
                <p className="text-lg font-body text-center mb-4" style={{ color: '#f2dcbc' }}>
                  Shampoo profissional para todos os tipos de cabelo
                </p>
                <p className="text-2xl font-light text-[#d34d4c] text-center mb-4">R$ 45,00</p>
                <Link 
                  href="/produtos"
                  className="block w-full bg-[#d34d4c] text-white text-center py-2 rounded-lg hover:bg-[#b83e3d] transition-all duration-300 font-medium"
                >
                  Comprar
                </Link>
              </div>

              {/* Produto 2 */}
              <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 border border-white/20 ${
                animatedSections.has('produtos') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`} style={{ transitionDelay: '200ms' }}>
                <div className="w-16 h-16 bg-[#d34d4c] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-2 text-center" style={{ color: '#f2dcbc' }}>Condicionador Keune</h3>
                <p className="text-lg font-body text-center mb-4" style={{ color: '#f2dcbc' }}>
                  Condicionador hidratante para cabelos saudáveis
                </p>
                <p className="text-2xl font-light text-[#d34d4c] text-center mb-4">R$ 42,00</p>
                <Link 
                  href="/produtos"
                  className="block w-full bg-[#d34d4c] text-white text-center py-2 rounded-lg hover:bg-[#b83e3d] transition-all duration-300 font-medium"
                >
                  Comprar
                </Link>
              </div>

              {/* Produto 3 */}
              <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 border border-white/20 ${
                animatedSections.has('produtos') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`} style={{ transitionDelay: '300ms' }}>
                <div className="w-16 h-16 bg-[#d34d4c] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-2 text-center" style={{ color: '#f2dcbc' }}>Máscara Keune</h3>
                <p className="text-lg font-body text-center mb-4" style={{ color: '#f2dcbc' }}>
                  Máscara de reparação profunda para cabelos danificados
                </p>
                <p className="text-2xl font-light text-[#d34d4c] text-center mb-4">R$ 65,00</p>
                <Link 
                  href="/produtos"
                  className="block w-full bg-[#d34d4c] text-white text-center py-2 rounded-lg hover:bg-[#b83e3d] transition-all duration-300 font-medium"
                >
                  Comprar
                </Link>
              </div>
            </div>
            
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
        <section id="agendamento" className={`py-16 relative transition-all duration-1000 ${
          animatedSections.has('agendamento') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>Agendamento</h2>
              <p className="text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>Agende seu horário. Estamos no coração de Leme-SP.</p>
              <div className="w-24 h-1 bg-[#d34d4c] mx-auto mt-8"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Informações do endereço */}
              <div className={`text-center md:text-left ${
                animatedSections.has('agendamento') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`} style={{ transitionDelay: '200ms' }}>
                <div className="mb-8">
                  <h3 className="text-3xl font-bold font-heading mb-6" style={{ color: '#f2dcbc' }}>
                    Nosso Endereço
                  </h3>
                  <p className="text-xl font-body leading-relaxed" style={{ color: '#f2dcbc' }}>
                    Rua Dr. Gonçalves da Cunha, 682, Centro, Leme – SP.
                  </p>
                </div>
                
                <Link 
                  href="/login-cliente"
                  className="inline-flex items-center px-8 py-4 bg-[#d34d4c] text-white font-medium hover:bg-[#b83e3d] transition-all duration-300 transform hover:scale-105 rounded-lg shadow-md hover:shadow-lg"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Agendar Horário
                </Link>
              </div>
              
              {/* Mapa do Google */}
              <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20 ${
                animatedSections.has('agendamento') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`} style={{ transitionDelay: '400ms' }}>
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
        <section id="depoimentos" className={`py-16 relative transition-all duration-1000 ${
          animatedSections.has('depoimentos') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
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
                    className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 flex-shrink-0 w-80 snap-start border border-white/20 ${
                      animatedSections.has('depoimentos') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                    }`} 
                    style={{ transitionDelay: `${index * 100}ms` }}
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
        <section id="contato" className={`py-16 relative transition-all duration-1000 ${
          animatedSections.has('contato') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>Entre em Contato</h2>
              <p className="text-lg leading-relaxed font-body" style={{ color: '#f2dcbc' }}>Estamos aqui para cuidar de você</p>
              <div className="w-24 h-1 bg-[#d34d4c] mx-auto mt-8"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 border border-white/20 ${
                animatedSections.has('contato') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`} style={{ transitionDelay: '100ms' }}>
                <div className="w-12 h-12 bg-[#d34d4c] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold font-heading mb-2" style={{ color: '#f2dcbc' }}>Endereço</h3>
                <p className="text-lg font-body" style={{ color: '#f2dcbc' }}>Rua Dr. Gonçalves da Cunha, 682 – Centro, Leme — SP</p>
              </div>
              
              <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 border border-white/20 ${
                animatedSections.has('contato') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`} style={{ transitionDelay: '250ms' }}>
                <div className="w-12 h-12 bg-[#d34d4c] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold font-heading mb-2" style={{ color: '#f2dcbc' }}>Telefone / WhatsApp</h3>
                <p className="text-lg font-body" style={{ color: '#f2dcbc' }}>+55 19 99153-1394</p>
              </div>
              
              <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 border border-white/20 ${
                animatedSections.has('contato') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`} style={{ transitionDelay: '400ms' }}>
                <div className="w-12 h-12 bg-[#d34d4c] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <WhatsAppIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold font-heading mb-2" style={{ color: '#f2dcbc' }}>Redes Sociais</h3>
                <div className="flex justify-center space-x-4 mt-4">
                  <a href="https://instagram.com/espacoguapa" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#d34d4c] rounded-full flex items-center justify-center hover:bg-[#b83e3d] transition-colors">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href="https://wa.me/5519991531394" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#d34d4c] rounded-full flex items-center justify-center hover:bg-[#b83e3d] transition-colors">
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

        {/* Footer */}
        <footer id="footer" className="text-gray-900 py-16 border-t border-[#D15556] relative" style={{ backgroundColor: 'rgba(245, 240, 232, 0.95)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12">
              <div>
                <h3 className="text-2xl font-light text-gray-900 mb-6">Espaço Guapa</h3>
                <p className="text-gray-600 leading-relaxed">
                  Transformando vidas através da beleza e autoestima.
                </p>
              </div>
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
                  <p>(11) 99999-9999</p>
                  <p>contato@espacoguapa.com</p>
                </div>
              </div>
            </div>
            <div className="border-t border-[#EED7B6] mt-12 pt-8 text-center text-gray-600">
              <p>&copy; 2024 Espaço Guapa. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>

        {/* Indicadores de Seção */}
        <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
          <div className="flex flex-col space-y-3">
            {sections.map((section, index) => (
              <button
                key={section}
                onClick={() => {
                  setCurrentSection(index)
                  smoothScrollTo(section)
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSection === index 
                    ? 'bg-[#D15556] scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                title={`Ir para ${section}`}
              />
            ))}
          </div>
        </div>

        {/* WhatsApp Fixo */}
        <div className="fixed bottom-6 right-6 z-50">
          <a 
            href="https://wa.me/5511999999999?text=Olá! Gostaria de agendar um horário no Espaço Guapa." 
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-light text-[#D15556]">Pedido Rápido</h3>
                <button onClick={closeModal} className="text-gray-600 hover:text-gray-900">
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
                  className="bg-[#D15556] text-white px-8 py-3 rounded-lg hover:bg-[#c04546] transition-all duration-300 transform hover:scale-105 font-medium tracking-wide shadow-md hover:shadow-lg"
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
