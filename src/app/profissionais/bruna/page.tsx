'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Calendar, Scissors, Sparkles, User, MapPin, Phone, Mail, MessageCircle } from 'lucide-react'

// Dados da Bruna
const brunaInfo = {
  name: "Bruna",
  title: "Cabeleireira Visagista",
  bio: "Especialista em cabelos naturais com mais de 8 anos de experiência em consultoria de visagismo, cortes e colorações dos mais variados tipos. Trabalha com técnicas modernas mantendo sempre a saúde dos fios, desde iluminados e loiros até coloridos fantasia.",
  services: [
    { name: "Avaliação", price: 60.00, description: "Conversa com a profissional para avaliar seu cabelo" },
    { name: "Consultoria/Corte", price: 198.00, description: "Consultoria de visagismo + corte personalizado" },
    { name: "Corte", price: 132.00, description: "Corte de cabelo com manutenção das pontas" },
    { name: "Corte e Tratamento Keune", price: 198.00, description: "Corte + tratamento premium Keune Care" },
    { name: "Back To Natural - P", price: 231.00, description: "Repigmentação de cabelos loiros" },
    { name: "Back To Natural - M", price: 319.00, description: "Repigmentação de cabelos loiros (médio)" },
    { name: "Back To Natural - G", price: 385.00, description: "Repigmentação de cabelos loiros (grande)" },
    { name: "Iluminado P", price: 500.00, description: "Iluminado para cabelos até o ombro" },
    { name: "Iluminado M", price: 605.00, description: "Iluminado para cabelos abaixo do ombro" },
    { name: "Iluminado G", price: 715.00, description: "Iluminado para cabelos longos" },
    { name: "Mechas Coloridas", price: 250.00, description: "Mechas localizadas coloridas ou platinadas" },
    { name: "Coloração Keune", price: 121.00, description: "Cobertura de brancos com Tinta Color Keune" }
  ]
}

// Galeria de imagens (exemplos - você pode substituir pelos URLs reais)
const galleryImages = [
  "/assents/bruna-work-1.jpg",
  "/assents/bruna-work-2.jpg", 
  "/assents/bruna-work-3.jpg",
  "/assents/bruna-work-4.jpg",
  "/assents/bruna-work-5.jpg",
  "/assents/bruna-work-6.jpg"
]

export default function BrunaPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [animatedSections, setAnimatedSections] = useState<Set<string>>(new Set())

  // Auto-play da galeria
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length)
    }, 4000) // Troca a cada 4 segundos

    return () => clearInterval(interval)
  }, [])

  // Intersection Observer para animações
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id
            setAnimatedSections(prev => new Set(prev).add(sectionId))
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    const sections = document.querySelectorAll('section[id]')
    sections.forEach(section => {
      observer.observe(section)
    })

    return () => {
      sections.forEach(section => {
        observer.unobserve(section)
      })
    }
  }, [])

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => prev === 0 ? galleryImages.length - 1 : prev - 1)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#022b28' }}>
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
              <Link href="/" className="text-white hover:text-[#EED7B6] transition-colors font-medium">
                Início
              </Link>
              <Link href="/servicos" className="text-white hover:text-[#EED7B6] transition-colors font-medium">
                Serviços
              </Link>
              <Link href="/profissionais" className="text-white hover:text-[#EED7B6] transition-colors font-medium">
                Nosso Time
              </Link>
              <Link href="/produtos" className="text-white hover:text-[#EED7B6] transition-colors font-medium">
                Produtos
              </Link>
              
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
      <section id="hero" className={`py-32 relative transition-all duration-1000 ${
        animatedSections.has('hero') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Foto e Info */}
            <div className="text-center lg:text-left">
              <div className="w-64 h-64 mx-auto lg:mx-0 mb-8 rounded-full overflow-hidden bg-[#006D5B]">
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-32 h-32 text-white" />
                </div>
              </div>
              <h1 className="text-5xl font-light text-[#006D5B] mb-4">{brunaInfo.name}</h1>
              <p className="text-2xl text-[#D15556] font-medium mb-6">{brunaInfo.title}</p>
              <Link 
                href="/login-cliente"
                className="bg-[#D15556] text-white px-8 py-3 rounded-lg hover:bg-[#c04546] transition-all duration-300 font-medium"
              >
                Agendar com {brunaInfo.name}
              </Link>
            </div>
            
            {/* Bio */}
            <div>
              <h2 className="text-3xl font-light text-[#006D5B] mb-6">Sobre Mim</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                {brunaInfo.bio}
              </p>
              <p className="text-gray-700 leading-relaxed">
                Nós prezamos sempre pela saúde do cabelo, não fazemos químicas como alisamentos, relaxamentos, botox, selagem e etc. Trabalhamos essencialmente com a KeuneHaircosmetics, que é renomada globalmente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className={`py-32 relative transition-all duration-1000 ${
        animatedSections.has('servicos') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-light text-[#006D5B] mb-6">Serviços Especializados</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Conheça os serviços oferecidos pela {brunaInfo.name}</p>
            <div className="w-24 h-1 bg-[#006D5B] mx-auto mt-8"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {brunaInfo.services.map((service, index) => (
              <div key={service.name} className={`bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 border-l-4 border-[#006D5B] ${
                animatedSections.has('servicos') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`} style={{ transitionDelay: `${index * 100}ms` }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#006D5B] rounded-full flex items-center justify-center">
                    <Scissors className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-light text-[#D15556]">R$ {service.price.toFixed(2)}</span>
                </div>
                <h3 className="text-xl font-light text-[#006D5B] mb-3">{service.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {service.description}
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
        </div>
      </section>

      {/* Galeria */}
      <section id="galeria" className={`py-32 relative transition-all duration-1000 ${
        animatedSections.has('galeria') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-light text-[#006D5B] mb-6">Galeria de Trabalhos</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Confira alguns dos trabalhos realizados pela {brunaInfo.name}</p>
            <div className="w-24 h-1 bg-[#006D5B] mx-auto mt-8"></div>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            {/* Imagem Principal */}
            <div className="relative h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-2xl">
              <div className="w-full h-full bg-[#006D5B] flex items-center justify-center">
                <span className="text-white text-lg">Imagem {currentImageIndex + 1} de {galleryImages.length}</span>
              </div>
            </div>
            
            {/* Controles */}
            <button 
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-[#006D5B] w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            <button 
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-[#006D5B] w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
            
            {/* Indicadores */}
            <div className="flex justify-center mt-6 space-x-2">
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentImageIndex === index 
                      ? 'bg-[#D15556] scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-gray-900 py-16 border-t border-[#D15556] relative" style={{ backgroundColor: 'rgba(245, 240, 232, 0.95)' }}>
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

      {/* WhatsApp Fixo */}
      <div className="fixed bottom-6 right-6 z-50">
        <a 
          href="https://wa.me/5511999999999?text=Olá! Gostaria de agendar um horário com a Bruna no Espaço Guapa." 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 cursor-pointer"
          aria-label="WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
        </a>
      </div>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        body {
          overflow-x: hidden;
        }
      `}</style>
    </div>
  )
}
