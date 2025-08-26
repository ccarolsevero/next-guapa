'use client'

import Link from 'next/link'
import { Calendar, Scissors, Sparkles, MessageCircle, X, User, MapPin, Phone, Mail, Package } from 'lucide-react'
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

  // Array das seções em ordem
  const sections = ['inicio', 'servicos', 'equipe', 'produtos', 'depoimentos', 'contato']

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
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
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
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#F5F0E8' }}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D15556] rounded-full blur-3xl"
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
        <header className="bg-[#D15556] border-b border-[#c04546] fixed top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <img 
                    src="/assents/logonavbar.svg" 
                    alt="Espaço Guapa" 
                    style={{ 
                      height: '60px', 
                      width: 'auto'
                    }}
                  />
                </Link>
              </div>
              <nav className="hidden md:flex space-x-12">
                <button 
                  onClick={() => smoothScrollTo('inicio')}
                  className="text-white hover:text-[#EED7B6] transition-colors font-medium cursor-pointer"
                >
                  Início
                </button>
                <button 
                  onClick={() => smoothScrollTo('servicos')}
                  className="text-white hover:text-[#EED7B6] transition-colors font-medium cursor-pointer"
                >
                  Serviços
                </button>
                <Link href="/profissionais" className="text-white hover:text-[#EED7B6] transition-colors font-medium">
                  Nosso Time
                </Link>
                <Link href="/produtos" className="text-white hover:text-[#EED7B6] transition-colors font-medium">
                  Produtos
                </Link>
                <button 
                  onClick={() => smoothScrollTo('contato')}
                  className="text-white hover:text-[#EED7B6] transition-colors font-medium cursor-pointer"
                >
                  Contato
                </button>
              </nav>
              <Link 
                href="/login-cliente"
                className="bg-white text-[#D15556] px-8 py-3 rounded-lg hover:bg-[#EED7B6] transition-colors font-medium tracking-wide"
              >
                Agendar
              </Link>
            </div>
          </div>
        </header>

        {/* Spacer para compensar navbar fixa */}
        <div className="h-20"></div>

        {/* Hero Section */}
        <section id="inicio" className={`py-32 relative transition-all duration-1000 ${
          animatedSections.has('inicio') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-6xl font-light mb-8" style={{ color: '#006D5B' }}>
                Espaço Guapa
              </h1>
              <p className="text-xl text-[#006D5B] mb-8 max-w-3xl mx-auto leading-relaxed font-medium">
                Somos um salão especializado em cabelos naturais. Eu, Bruna cabeleireira visagista, realizo consultoria, corte, cores dos mais variados tipos, desde iluminados, loiros até coloridos fantasia. Cicera Canovas é nossa tricoterapeuta que realiza tratamentos de couro cabeludo e fios totalmente naturalistas, sem o uso de nenhum tipo de química.
              </p>
              <p className="text-lg text-[#006D5B] mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
                Nós prezamos sempre pela saúde do cabelo, não fazemos químicas como alisamentos, relaxamentos, botox, selagem e etc. Trabalhamos essencialmente com a KeuneHaircosmetics, que é renomada globalmente. Se você se identifica com nosso trabalho, será uma grande prazer te atender, bem-vinda!
              </p>
              <Link 
                href="/login-cliente"
                className="bg-[#D15556] text-white px-8 py-4 rounded-lg hover:bg-[#c04546] transition-all duration-300 transform hover:scale-105 font-medium tracking-wide shadow-md hover:shadow-lg"
              >
                Agendar Horário
              </Link>
            </div>
          </div>
        </section>

        {/* Serviços Destaque */}
        <section id="servicos" className={`py-32 relative transition-all duration-1000 ${
          animatedSections.has('servicos') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-light text-[#006D5B] mb-6">Nossos Serviços</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Cuidamos de você com carinho e profissionalismo</p>
              <div className="w-24 h-1 bg-[#006D5B] mx-auto mt-8"></div>
            </div>
            
            {/* Carrossel de Serviços */}
            <div className="relative">
              {/* Container com scroll horizontal */}
              <div id="services-carousel" className="flex gap-6 overflow-x-auto scrollbar-hide pb-6 snap-x snap-mandatory">
                {servicosEspacoGuapa.map((servico, index) => (
                  <div 
                    key={servico.id} 
                    className={`bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 flex-shrink-0 w-80 snap-start border-l-4 border-[#006D5B] ${
                      animatedSections.has('servicos') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                    }`} 
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-[#006D5B] rounded-full flex items-center justify-center">
                        {servico.id <= 3 && <MessageCircle className="w-6 h-6 text-white" />}
                        {servico.id > 3 && servico.id <= 6 && <Sparkles className="w-6 h-6 text-white" />}
                        {servico.id > 6 && <Scissors className="w-6 h-6 text-white" />}
                      </div>
                      <span className="text-xl font-light text-[#D15556]">R$ {servico.price.toFixed(2)}</span>
                    </div>
                    <h3 className="text-xl font-light text-[#006D5B] mb-3">{servico.name}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {servico.description}
                    </p>
                    <Link 
                      href="/login-cliente"
                      className="bg-[#D15556] text-white px-4 py-2 rounded-lg hover:bg-[#c04546] transition-all duration-300 text-sm font-medium"
                    >
                      Agendar
                    </Link>
                  </div>
                ))}
              </div>
              
              {/* Indicadores de scroll */}
              <div className="flex justify-center mt-8 space-x-2">
                {Array.from({ length: Math.ceil(servicosEspacoGuapa.length / 4) }).map((_, index) => (
                  <button
                    key={index}
                    className="w-3 h-3 rounded-full bg-gray-300 hover:bg-[#006D5B] transition-colors"
                    onClick={() => {
                      const container = document.getElementById('services-carousel')
                      if (container) {
                        const cardWidth = 320 // w-80 + gap-6
                        container.scrollTo({
                          left: index * cardWidth * 4, // 4 cards por vez
                          behavior: 'smooth'
                        })
                      }
                    }}
                  />
                ))}
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Link 
                href="/servicos"
                className="inline-flex items-center px-8 py-3 border-2 border-[#D15556] text-[#D15556] font-medium hover:bg-[#D15556] hover:text-white transition-all duration-300 transform hover:scale-105 rounded-lg"
              >
                Ver Todos os Serviços
                <Scissors className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Profissionais */}
        <section id="equipe" className={`py-32 relative transition-all duration-1000 ${
          animatedSections.has('equipe') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-light text-[#006D5B] mb-6">Nosso Time</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Profissionais experientes e dedicados</p>
              <div className="w-24 h-1 bg-[#006D5B] mx-auto mt-8"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div className={`bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 ${
                animatedSections.has('equipe') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`} style={{ transitionDelay: '200ms' }}>
                <div className="text-center mb-6">
                  <div className="w-32 h-32 bg-[#006D5B] rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-light text-[#006D5B] mb-2">Bruna</h3>
                  <p className="text-[#D15556] font-medium">Cabeleireira Visagista</p>
                </div>
                <p className="text-gray-600 leading-relaxed text-center">
                  Especialista em consultoria de visagismo, cortes e colorações dos mais variados tipos. 
                  Trabalha com técnicas modernas mantendo sempre a saúde dos fios.
                </p>
                <div className="mt-6 flex justify-center">
                  <Link 
                    href="/profissionais/bruna"
                    className="bg-[#D15556] text-white px-6 py-2 rounded-lg hover:bg-[#c04546] transition-all duration-300 font-medium"
                  >
                    Saiba Mais
                  </Link>
                </div>
              </div>
              
              <div className={`bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 ${
                animatedSections.has('equipe') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`} style={{ transitionDelay: '400ms' }}>
                <div className="text-center mb-6">
                  <div className="w-32 h-32 bg-[#006D5B] rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-light text-[#006D5B] mb-2">Cicera Canovas</h3>
                  <p className="text-[#D15556] font-medium">Tricoterapeuta</p>
                </div>
                <p className="text-gray-600 leading-relaxed text-center">
                  Especialista em tratamentos naturais do couro cabeludo e fios. 
                  Utiliza técnicas 100% naturalistas, sem química, priorizando a saúde capilar.
                </p>
                <div className="mt-6 flex justify-center">
                  <Link 
                    href="/profissionais/cicera"
                    className="bg-[#D15556] text-white px-6 py-2 rounded-lg hover:bg-[#c04546] transition-all duration-300 font-medium"
                  >
                    Saiba Mais
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Produtos */}
        <section id="produtos" className={`py-32 relative transition-all duration-1000 ${
          animatedSections.has('produtos') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-light text-[#006D5B] mb-6">Nossa Lojinha</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Produtos profissionais para cuidar dos seus cabelos</p>
              <div className="w-24 h-1 bg-[#006D5B] mx-auto mt-8"></div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {/* Produto 1 */}
              <div className={`bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 ${
                animatedSections.has('produtos') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`} style={{ transitionDelay: '100ms' }}>
                <div className="w-16 h-16 bg-[#D15556] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-light text-[#006D5B] mb-2 text-center">Shampoo Keune</h3>
                <p className="text-gray-600 text-sm text-center mb-4">
                  Shampoo profissional para todos os tipos de cabelo
                </p>
                <p className="text-2xl font-light text-[#D15556] text-center mb-4">R$ 45,00</p>
                <Link 
                  href="/produtos"
                  className="block w-full bg-[#D15556] text-white text-center py-2 rounded-lg hover:bg-[#c04546] transition-all duration-300 font-medium"
                >
                  Comprar
                </Link>
              </div>

              {/* Produto 2 */}
              <div className={`bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 ${
                animatedSections.has('produtos') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`} style={{ transitionDelay: '200ms' }}>
                <div className="w-16 h-16 bg-[#D15556] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-light text-[#006D5B] mb-2 text-center">Condicionador Keune</h3>
                <p className="text-gray-600 text-sm text-center mb-4">
                  Condicionador hidratante para cabelos saudáveis
                </p>
                <p className="text-2xl font-light text-[#D15556] text-center mb-4">R$ 42,00</p>
                <Link 
                  href="/produtos"
                  className="block w-full bg-[#D15556] text-white text-center py-2 rounded-lg hover:bg-[#c04546] transition-all duration-300 font-medium"
                >
                  Comprar
                </Link>
              </div>

              {/* Produto 3 */}
              <div className={`bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 ${
                animatedSections.has('produtos') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`} style={{ transitionDelay: '300ms' }}>
                <div className="w-16 h-16 bg-[#D15556] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-light text-[#006D5B] mb-2 text-center">Máscara Keune</h3>
                <p className="text-gray-600 text-sm text-center mb-4">
                  Máscara de reparação profunda para cabelos danificados
                </p>
                <p className="text-2xl font-light text-[#D15556] text-center mb-4">R$ 65,00</p>
                <Link 
                  href="/produtos"
                  className="block w-full bg-[#D15556] text-white text-center py-2 rounded-lg hover:bg-[#c04546] transition-all duration-300 font-medium"
                >
                  Comprar
                </Link>
              </div>
            </div>
            
            <div className="text-center">
              <Link 
                href="/produtos"
                className="inline-flex items-center px-8 py-3 border-2 border-[#D15556] text-[#D15556] font-medium hover:bg-[#D15556] hover:text-white transition-all duration-300 transform hover:scale-105 rounded-lg"
              >
                Ver Todos os Produtos
                <Package className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section id="depoimentos" className={`py-32 relative transition-all duration-1000 ${
          animatedSections.has('depoimentos') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-light text-[#006D5B] mb-6">Depoimentos</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">O que nossas clientes dizem sobre nós</p>
              <div className="w-24 h-1 bg-[#006D5B] mx-auto mt-8"></div>
            </div>
            
            {/* Carrossel de Depoimentos */}
            <div className="relative">
              {/* Container com scroll horizontal */}
              <div id="testimonials-carousel" className="flex gap-6 overflow-x-auto scrollbar-hide pb-6 snap-x snap-mandatory">
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={testimonial.id} 
                    className={`bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 flex-shrink-0 w-80 snap-start ${
                      animatedSections.has('depoimentos') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                    }`} 
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-[#006D5B] rounded-full mr-4"></div>
                      <div>
                        <h4 className="font-medium text-[#006D5B]">{testimonial.name}</h4>
                        <p className="text-sm text-gray-500">{testimonial.period}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 italic">
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
        <section id="contato" className={`py-32 relative transition-all duration-1000 ${
          animatedSections.has('contato') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-light text-[#006D5B] mb-6">Entre em Contato</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Estamos aqui para cuidar de você</p>
              <div className="w-24 h-1 bg-[#006D5B] mx-auto mt-8"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className={`bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 ${
                animatedSections.has('contato') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`} style={{ transitionDelay: '100ms' }}>
                <div className="w-12 h-12 bg-[#006D5B] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-[#006D5B] mb-2">Endereço</h3>
                <p className="text-gray-600">Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP</p>
              </div>
              
              <div className={`bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 ${
                animatedSections.has('contato') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`} style={{ transitionDelay: '250ms' }}>
                <div className="w-12 h-12 bg-[#006D5B] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-[#006D5B] mb-2">Telefone</h3>
                <p className="text-gray-600">(11) 99999-9999</p>
              </div>
              
              <div className={`bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 ${
                animatedSections.has('contato') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`} style={{ transitionDelay: '400ms' }}>
                <div className="w-12 h-12 bg-[#006D5B] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-[#006D5B] mb-2">Email</h3>
                <p className="text-gray-600">contato@espacoguapa.com</p>
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
