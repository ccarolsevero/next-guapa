'use client'

import LayoutPublic from '../layout-public'
import Link from 'next/link'

const professionals = [
  {
    id: 'bruna',
    name: 'Bruna',
    title: 'Cabeleireira Visagista',
    description: 'Especialista em consultoria de visagismo, cortes e colorações dos mais variados tipos. Trabalha com técnicas modernas mantendo sempre a saúde dos fios.',
    image: '/assents/fotobruna.jpeg',
    specialties: ['Consultoria de Visagismo', 'Cortes Personalizados', 'Colorações']
  },
  {
    id: 'cicera',
    name: 'Cicera Canovas',
    title: 'Tricoterapeuta',
    description: 'Especialista em tratamentos naturais do couro cabeludo e fios. Utiliza técnicas 100% naturalistas, sem química, priorizando a saúde capilar.',
    image: null, // Placeholder icon
    specialties: ['Tratamentos Naturais', 'Saúde do Couro Cabeludo', 'Tricoterapia']
  }
]

export default function ProfissionaisPage() {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {professionals.map((professional) => (
              <div key={professional.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
                <div className="text-center mb-8">
                  <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden">
                    {professional.image ? (
                      <img 
                        src={professional.image} 
                        alt={`${professional.name} - ${professional.title}`} 
                        className="w-full h-full object-cover"
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
                    {professional.description}
                  </p>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-xl font-bold font-heading mb-4 text-center" style={{ color: '#f2dcbc' }}>
                    Especialidades
                  </h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {professional.specialties.map((specialty, index) => (
                      <span 
                        key={index}
                        className="bg-[#d34d4c] text-white px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="text-center">
                  <Link 
                    href={`/profissionais/${professional.id}`}
                    className="bg-[#d34d4c] text-white px-6 py-3 rounded-lg hover:bg-[#b83e3d] transition-all duration-300 font-medium inline-block"
                  >
                    Ver Perfil Completo
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>
            Pronto para Ser Atendida?
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


