'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Calendar, Scissors, Sparkles, User, MapPin, Phone, Mail, MessageCircle } from 'lucide-react'
import LayoutPublic from '../../layout-public'

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

// Galeria de imagens dos trabalhos da Bruna
const galleryImages = [
  "/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16.jpeg",
  "/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (1).jpeg",
  "/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (2).jpeg",
  "/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (3).jpeg",
  "/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (4).jpeg",
  "/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (5).jpeg",
  "/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (6).jpeg",
  "/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (7).jpeg",
  "/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (8).jpeg",
  "/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (9).jpeg",
  "/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (10).jpeg",
  "/assents/galeriabruna/WhatsApp Image 2025-08-26 at 20.37.16 (11).jpeg"
]

export default function BrunaPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Auto-play da galeria
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length)
    }, 4000) // Troca a cada 4 segundos

    return () => clearInterval(interval)
  }, [])

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => prev === 0 ? galleryImages.length - 1 : prev - 1)
  }

  return (
    <LayoutPublic>
      {/* Hero Section */}
      <section className="pt-20 pb-12 md:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Foto e Info */}
            <div className="text-center lg:text-left">
              <div className="w-56 h-56 md:w-64 md:h-64 mx-auto lg:mx-0 mb-8 rounded-full overflow-hidden bg-[#d34d4c]">
                <img 
                  src="/assents/fotobruna.jpeg" 
                  alt={`${brunaInfo.name} - ${brunaInfo.title}`} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 font-heading" style={{ color: '#f2dcbc' }}>{brunaInfo.name}</h1>
              <p className="text-lg md:text-xl lg:text-2xl text-[#d34d4c] font-medium mb-6 font-body">{brunaInfo.title}</p>
              <Link 
                href="/login-cliente"
                className="bg-[#d34d4c] text-white px-8 py-4 rounded-lg hover:bg-[#b83e3d] transition-all duration-300 font-medium tracking-wide shadow-md hover:shadow-lg inline-block"
              >
                Agendar com {brunaInfo.name}
              </Link>
            </div>
            
            {/* Bio */}
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>Sobre Mim</h2>
              <p className="text-lg md:text-xl font-body leading-relaxed mb-6" style={{ color: '#f2dcbc' }}>
                {brunaInfo.bio}
              </p>
              <p className="text-base md:text-lg font-body leading-relaxed" style={{ color: '#f2dcbc' }}>
                Nós prezamos sempre pela saúde do cabelo, não fazemos químicas como alisamentos, relaxamentos, botox, selagem e etc. Trabalhamos essencialmente com a KeuneHaircosmetics, que é renomada globalmente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="py-12 md:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>Serviços Especializados</h2>
            <p className="text-lg md:text-xl font-body max-w-2xl mx-auto" style={{ color: '#f2dcbc' }}>Conheça os serviços oferecidos pela {brunaInfo.name}</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {brunaInfo.services.map((service, index) => (
              <div key={service.name} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#d34d4c] rounded-full flex items-center justify-center">
                    <Scissors className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-light text-[#d34d4c]">R$ {service.price.toFixed(2)}</span>
                </div>
                <h3 className="text-xl font-bold font-heading mb-3" style={{ color: '#f2dcbc' }}>{service.name}</h3>
                <p className="text-base md:text-lg font-body leading-relaxed mb-4" style={{ color: '#f2dcbc' }}>
                  {service.description}
                </p>
                <Link 
                  href="/login-cliente"
                  className="bg-[#d34d4c] text-white px-4 py-2 rounded-lg hover:bg-[#b83e3d] transition-all duration-300 text-sm font-medium inline-block w-full text-center"
                >
                  Agendar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Galeria */}
      <section className="py-12 md:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>Galeria de Trabalhos</h2>
            <p className="text-lg md:text-xl font-body max-w-2xl mx-auto" style={{ color: '#f2dcbc' }}>Confira alguns dos trabalhos realizados pela {brunaInfo.name}</p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            {/* Imagem Principal */}
            <div className="relative h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-2xl bg-gray-100">
              <img 
                src={galleryImages[currentImageIndex]} 
                alt={`Trabalho ${currentImageIndex + 1} da ${brunaInfo.name}`}
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Controles */}
            <button 
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-[#d34d4c] w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            <button 
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-[#d34d4c] w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
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
                      ? 'bg-[#d34d4c] scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>
            Pronto para Agendar com {brunaInfo.name}?
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

      {/* WhatsApp Fixo */}
      <div className="fixed bottom-6 right-6 z-50">
        <a 
          href="https://wa.me/5519991531394?text=Olá! Gostaria de agendar um horário com a Bruna no Espaço Guapa." 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 cursor-pointer"
          aria-label="WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
        </a>
      </div>
    </LayoutPublic>
  )
}
