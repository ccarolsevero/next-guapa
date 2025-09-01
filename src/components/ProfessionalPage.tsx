'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Calendar, Scissors, Sparkles, User, MapPin, Phone, Mail, MessageCircle } from 'lucide-react'
import LayoutPublic from '../app/layout-public'

interface Service {
  _id: string
  name: string
  category: string
  description: string
  price: number
  isActive: boolean
  order: number
}

interface Professional {
  _id: string
  name: string
  title: string
  email: string
  phone: string
  shortDescription: string
  fullDescription: string
  services: string[]
  profileImage: string
  gallery: string[]
  isActive: boolean
  isFeatured: boolean
}

interface ProfessionalPageProps {
  professionalName: string
}

export default function ProfessionalPage({ professionalName }: ProfessionalPageProps) {
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [professionalServices, setProfessionalServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    loadProfessional()
  }, [professionalName])

  useEffect(() => {
    if (professional) {
      loadProfessionalServices()
    }
  }, [professional])

  // Auto-play da galeria
  useEffect(() => {
    if (professional?.gallery && professional.gallery.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % professional.gallery.length)
      }, 4000) // Troca a cada 4 segundos

      return () => clearInterval(interval)
    }
  }, [professional])

  const loadProfessional = async () => {
    try {
      setLoading(true)
      console.log('Carregando profissional:', professionalName)
      const response = await fetch(`/api/professionals/${professionalName}`)
      if (!response.ok) {
        throw new Error('Profissional não encontrado')
      }
      const data = await response.json()
      console.log('Dados carregados:', data)
      setProfessional(data)
    } catch (error) {
      console.error('Erro ao carregar profissional:', error)
      setProfessional(null)
    } finally {
      setLoading(false)
    }
  }

  const loadProfessionalServices = async () => {
    if (!professional?.services) {
      console.log('❌ Profissional não tem serviços ou services é undefined')
      console.log('Professional completo:', professional)
      return
    }
    
    console.log('🔍 Carregando serviços para:', professional.name)
    console.log('📋 Serviços da profissional:', professional.services)
    console.log('📋 Tipo de services:', typeof professional.services)
    console.log('📋 Array?', Array.isArray(professional.services))
    
    try {
      const response = await fetch('/api/services')
      console.log('📡 Resposta da API de serviços:', response.status, response.ok)
      
      if (response.ok) {
        const allServices = await response.json()
        console.log('📊 Todos os serviços disponíveis:', allServices.length)
        console.log('📊 Primeiros 3 serviços:', allServices.slice(0, 3).map(s => s.name))
        
        // Filtrar serviços que correspondem aos nomes da profissional
        const filteredServices = allServices.filter((service: Service) => {
          const isIncluded = professional.services.includes(service.name)
          console.log(`🔍 Serviço "${service.name}" está incluído? ${isIncluded}`)
          return isIncluded
        })
        
        console.log('✅ Serviços filtrados encontrados:', filteredServices.length)
        console.log('✅ Serviços filtrados:', filteredServices.map(s => s.name))
        
        setProfessionalServices(filteredServices)
      } else {
        console.error('❌ Erro na resposta da API de serviços:', response.status)
        const errorText = await response.text()
        console.error('❌ Texto do erro:', errorText)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar serviços:', error)
    }
  }

  const nextImage = () => {
    if (professional?.gallery) {
      setCurrentImageIndex((prev) => (prev + 1) % professional.gallery.length)
    }
  }

  const prevImage = () => {
    if (professional?.gallery) {
      setCurrentImageIndex((prev) => prev === 0 ? professional.gallery.length - 1 : prev - 1)
    }
  }

  if (loading) {
    return (
      <LayoutPublic>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#d34d4c] mx-auto mb-4"></div>
            <p className="text-[#f2dcbc] text-lg">Carregando...</p>
          </div>
        </div>
      </LayoutPublic>
    )
  }

  if (!professional) {
    return (
      <LayoutPublic>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#f2dcbc] text-lg">Profissional não encontrado</p>
          </div>
        </div>
      </LayoutPublic>
    )
  }

  return (
    <LayoutPublic>
      {/* Hero Section */}
      <section className="pt-20 pb-12 md:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Foto e Info */}
            <div className="text-center lg:text-left">
              <div className="w-56 h-56 md:w-64 md:h-64 mx-auto lg:mx-0 mb-8 rounded-full overflow-hidden">
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
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 font-heading" style={{ color: '#f2dcbc' }}>{professional.name}</h1>
              <p className="text-lg md:text-xl lg:text-2xl text-[#d34d4c] font-medium mb-6 font-body">{professional.title}</p>
              <Link 
                href="/login-cliente"
                className="bg-[#d34d4c] text-white px-8 py-4 rounded-lg hover:bg-[#b83e3d] transition-all duration-300 font-medium tracking-wide shadow-md hover:shadow-lg inline-block"
              >
                Agendar com {professional.name}
              </Link>
            </div>
            
            {/* Bio */}
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>Sobre Mim</h2>
              <p className="text-lg md:text-xl font-body leading-relaxed mb-6" style={{ color: '#f2dcbc' }}>
                {professional.fullDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="py-12 md:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>Tratamentos Especializados</h2>
            <p className="text-lg md:text-xl font-body max-w-2xl mx-auto" style={{ color: '#f2dcbc' }}>Conheça os tratamentos oferecidos pela {professional.name}</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {professionalServices.length > 0 ? (
              professionalServices.map((service, index) => (
                <div key={service._id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-[#d34d4c] rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
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
              ))
            ) : (
              <div className="col-span-full text-center">
                <p className="text-[#f2dcbc] text-lg">Carregando serviços...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Galeria */}
      <section className="py-12 md:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>Galeria de Trabalhos</h2>
            <p className="text-lg md:text-xl font-body max-w-2xl mx-auto" style={{ color: '#f2dcbc' }}>Confira alguns dos tratamentos realizados pela {professional.name}</p>
          </div>
          
          {professional.gallery && professional.gallery.length > 0 ? (
            <div className="relative max-w-4xl mx-auto">
              {/* Imagem Principal */}
              <div className="relative h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-2xl">
                <img 
                  src={professional.gallery[currentImageIndex]} 
                  alt={`Trabalho ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain bg-[#006D5B]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/assents/fotobruna.jpeg'
                  }}
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
                {professional.gallery.map((_, index) => (
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
          ) : (
            <div className="text-center">
              <p className="text-[#f2dcbc] text-lg">Galeria não disponível</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>
            Pronto para Agendar com {professional.name}?
          </h2>
          <p className="text-lg md:text-xl leading-relaxed font-body mb-8" style={{ color: '#f2dcbc' }}>
            Agende sua consulta e descubra como podemos cuidar dos seus fios com tratamentos naturais e eficazes.
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
          href={`https://wa.me/5519991531394?text=Olá! Gostaria de agendar um horário com a ${professional.name} no Espaço Guapa.`}
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
