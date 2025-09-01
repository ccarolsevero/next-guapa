'use client'

import LayoutPublic from '../layout-public'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Professional {
  _id: string
  name: string
  title: string
  shortDescription: string
  fullDescription: string
  services: string[]
  profileImage: string
  gallery: string[]
  isActive: boolean
  isFeatured: boolean
}

export default function ProfissionaisPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfessionals()
  }, [])

  const loadProfessionals = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/professionals')
      if (!response.ok) {
        throw new Error('Erro ao carregar profissionais')
      }
      const data = await response.json()
      // Filtrar apenas profissionais ativos
      const activeProfessionals = data.filter((prof: Professional) => prof.isActive)
      setProfessionals(activeProfessionals)
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error)
      // Fallback para dados estáticos
      setProfessionals([
        {
          _id: 'bruna',
          name: 'Bruna',
          title: 'Cabeleireira Visagista',
          shortDescription: 'Especialista em consultoria de visagismo, cortes e colorações dos mais variados tipos.',
          fullDescription: 'Especialista em consultoria de visagismo, cortes e colorações dos mais variados tipos. Trabalha com técnicas modernas mantendo sempre a saúde dos fios.',
          services: ['Avaliação Capilar', 'Consultoria/Corte', 'Corte', 'Iluminado P', 'Coloração Keune'],
          profileImage: '/assents/fotobruna.jpeg',
          gallery: [],
          isActive: true,
          isFeatured: true
        },
        {
          _id: 'cicera',
          name: 'Cicera Canovas',
          title: 'Terapeuta Capilar Naturalista',
          shortDescription: 'Terapeuta capilar naturalista, trata de todas as disfunções do couro cabeludo com procedimentos não invasivos e naturalistas.',
          fullDescription: 'Terapeuta capilar naturalista, trata de todas as disfunções do couro cabeludo com procedimentos não invasivos e naturalistas como queda capilar, dermatites, caspa, coceiras, descamação, psoríase, etc.',
          services: ['Hidratação Natural', 'Reconstrução Capilar', 'Limpeza de Couro Cabeludo', 'Tratamento Anti-Queda'],
          profileImage: '/assents/ciceraperfil.jpeg',
          gallery: [],
          isActive: true,
          isFeatured: false
        }
      ])
    } finally {
      setLoading(false)
    }
  }
  return (
    <LayoutPublic>
      {/* Hero Section */}
      <section className="pt-24 pb-12 md:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>
              Nosso Time
            </h1>
            <p className="text-lg md:text-xl leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
              Conheça os profissionais que cuidam dos seus cabelos com carinho e expertise
            </p>
          </div>
        </div>
      </section>

      {/* Profissionais */}
      <section className="-py-4 md:py-0 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d34d4c] mx-auto mb-4"></div>
              <p className="text-[#f2dcbc]">Carregando profissionais...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {professionals.map((professional) => (
                <div key={professional._id} className="bg-white/10 backdrop-blur-sm rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
                  <div className="text-center mb-8">
                    <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden">
                      {professional.profileImage ? (
                        <img 
                          src={professional.profileImage} 
                          alt={`${professional.name} - ${professional.title}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/assents/fotobruna.jpeg'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-[#d34d4c] flex items-center justify-center">
                          <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3 className="text-3xl font-bold font-heading mb-2" style={{ color: '#f2dcbc' }}>{professional.name}</h3>
                    <p className="text-[#d34d4c] font-medium font-body mb-4">{professional.title}</p>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-lg leading-relaxed text-center font-body" style={{ color: '#f2dcbc' }}>
                      {professional.shortDescription}
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-xl font-bold font-heading mb-4 text-center" style={{ color: '#f2dcbc' }}>
                      Especialidades
                    </h4>
                    <div className="flex flex-wrap justify-center gap-2">
                      {professional.services.slice(0, 3).map((service: string, index: number) => (
                        <span 
                          key={index}
                          className="bg-[#d34d4c] text-white px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {service}
                        </span>
                      ))}
                      {professional.services.length > 3 && (
                        <span className="text-[#f2dcbc] text-sm">
                          +{professional.services.length - 3} mais
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Link 
                      href={`/profissionais/${professional.name
                        .split(' ')[0] // Pega apenas o primeiro nome
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
                        .replace(/[^a-z0-9]/g, '') // Remove caracteres especiais
                      }`}
                      className="bg-[#d34d4c] text-white px-6 py-3 rounded-lg hover:bg-[#b83e3d] transition-all duration-300 font-medium inline-block"
                    >
                      Ver Perfil Completo
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>
            Pronta para Ser Atendida?
          </h2>
          <p className="text-lg md:text-xl leading-relaxed font-body mb-8" style={{ color: '#f2dcbc' }}>
            Agende sua consulta e descubra qual profissional é ideal para o seu caso.
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


