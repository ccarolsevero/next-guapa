'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Scissors, Palette, Sparkles, Star, Clock, MapPin, Phone, DollarSign } from 'lucide-react'
import { useEffect } from 'react'

const services = [
  {
    category: "Consultoria",
    icon: Star,
    items: [
      { name: "Avaliação", price: 60, duration: 30, description: "Conversa com a profissional para avaliar seu cabelo e a possibilidade de realizar um procedimento" },
      { name: "Consultoria de Corte", price: 198, duration: 60, description: "Consultoria de visagismo analisa linhas e traços do seu rosto" },
    ]
  },
  {
    category: "Cortes",
    icon: Scissors,
    items: [
      { name: "Corte", price: 132, duration: 60, description: "Corte retira pontas ressecadas e ajuda no crescimento dos fios" },
      { name: "Corte Infantil", price: 66, duration: 30, description: "Corte realizado somente em crianças de até 6 anos" },
      { name: "Retoque de Corte", price: 66, duration: 30, description: "Retoque apenas de cortes feitos aqui, até 60 dias do último corte" },
    ]
  },
  {
    category: "Coloração",
    icon: Palette,
    items: [
      { name: "Back To Natural - G", price: 319, duration: 180, description: "Técnica exclusiva da Keune que repigmenta cabelos loiros no tom desejado" },
      { name: "Back To Natural - P", price: 231, duration: 150, description: "Técnica exclusiva da Keune que repigmenta cabelos loiros no tom desejado" },
      { name: "Cobertura de Brancos (Tinta Color)", price: 121, duration: 90, description: "Retiche de raiz para cobertura de cabelos grisalhos" },
      { name: "Cobertura de Brancos (So Pure)", price: 143, duration: 90, description: "Cobertura com Keune So Pure, coloração livre de amônia e parabeno" },
      { name: "Iluminado G (Cabelo Longo)", price: 715, duration: 240, description: "Iluminado com efeito de queimado de sol, feito SEM pó descolorante" },
      { name: "Iluminado M (Abaixo do Ombro)", price: 605, duration: 210, description: "Iluminado com efeito de queimado de sol, feito SEM pó descolorante" },
      { name: "Iluminado P (Até o Ombro)", price: 500, duration: 180, description: "Iluminado com efeito de queimado de sol, feito SEM pó descolorante" },
      { name: "Iluminado PP (Cabelos Curtinhos)", price: 390, duration: 150, description: "Iluminado com efeito de queimado de sol, feito SEM pó descolorante" },
      { name: "Mechas Coloridas", price: 250, duration: 180, description: "Blocos de mechas localizadas, coloridas ou platinadas" },
      { name: "Mechas Invertidas", price: 220, duration: 150, description: "Técnica para escurecer cabelos claros ou disfarçar cabelos grisalhos" },
    ]
  },
  {
    category: "Combo",
    icon: Sparkles,
    items: [
      { name: "Combo: Consultoria, Corte e Tratamento", price: 264, duration: 120, description: "Consultoria de visagismo, corte e tratamento KEUNE CreamBath SPA Vital Nutrition" },
      { name: "Corte e Tratamento Keune", price: 198, duration: 90, description: "Corte desejado, tratamento premium Keune Care e finalização ao natural" },
    ]
  },
  {
    category: "Finalização",
    icon: Star,
    items: [
      { name: "Finalização", price: 77, duration: 45, description: "Higienização e finalização com difusor ou escova" },
    ]
  }
]

export default function ServicosPage() {
  useEffect(() => {
    // Animações de entrada no scroll
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
        }
      })
    }, observerOptions)

    // Observar elementos para animação
    const animatedElements = document.querySelectorAll('.animate-on-scroll')
    animatedElements.forEach(el => observer.observe(el))

    return () => {
      animatedElements.forEach(el => observer.unobserve(el))
    }
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#022b28' }}>
      {/* Header */}
      <header className="bg-[#f2dcbc] border-b border-[#e6d1b8] fixed top-0 left-0 right-0 z-50">
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
              <Link href="/" className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium">
                Início
              </Link>
              <Link href="/servicos" className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium">
                Serviços
              </Link>
              <Link href="/profissionais" className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium">
                Nosso Time
              </Link>
              <Link href="/produtos" className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium">
                Produtos
              </Link>
            </nav>
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

      {/* Hero Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 animate-on-scroll">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl font-light font-heading mb-8 leading-tight animate-on-scroll" style={{ color: '#f2dcbc' }}>
            Nossos
            <br />
            <span className="font-light font-heading">Serviços</span>
          </h1>
        </div>
      </section>

      {/* Descrições dos Serviços */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-20">
            {/* Cortes */}
            <div className="text-center animate-on-scroll">
              <h3 className="text-3xl font-bold font-heading mb-6" style={{ color: '#f2dcbc' }}>
                Cortes que Celebram a Natureza do Cabelo
              </h3>
              <p className="text-lg font-body leading-relaxed" style={{ color: '#f2dcbc' }}>
                Cada corte é pensado para valorizar o movimento, a textura e a forma única dos seus fios sem desrespeitar sua essência. Sempre buscando alinhar a praticidade do dia a dia com a potência dos cabelos naturais.
              </p>
            </div>

            {/* Coloração */}
            <div className="text-center animate-on-scroll">
              <h3 className="text-3xl font-bold font-heading mb-6" style={{ color: '#f2dcbc' }}>
                Colorimetria Criativa
              </h3>
              <p className="text-lg font-body leading-relaxed" style={{ color: '#f2dcbc' }}>
                Trabalhamos com colorações, loiros, iluminados e cores fantasia com cuidado máximo, evitando processos que comprometam a saúde capilar. Sempre buscando a melhor manutenção para a sua rotina, alinhada com as cores que representam sua personalidade.
              </p>
            </div>

            {/* Tratamentos */}
            <div className="text-center animate-on-scroll">
              <h3 className="text-3xl font-bold font-heading mb-6" style={{ color: '#f2dcbc' }}>
                Tratamentos Naturais Tricoterapêuticos
              </h3>
              <p className="text-lg font-body leading-relaxed" style={{ color: '#f2dcbc' }}>
                Técnicas especiais que cuidam especialmente do couro cabeludo, mas também do comprimento, com fórmulas naturais e sem uso de química. Realizados com a linha Keune So Pure, o resultado: cabelo mais forte, saudável e com brilho natural.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {services.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-24 animate-on-scroll">
              <div className="text-center mb-16 animate-on-scroll">
                <div className="w-24 h-24 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-500 transform hover:scale-110">
                  <category.icon className="w-12 h-12 text-gray-600 transition-all duration-500" />
                </div>
                <h2 className="text-4xl font-light font-heading mb-4 animate-on-scroll" style={{ color: '#f2dcbc' }}>{category.category}</h2>
                <p className="text-gray-600 text-lg animate-on-scroll font-body">Serviços especializados em {category.category.toLowerCase()}</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.items.map((service, serviceIndex) => (
                  <div key={serviceIndex} className="bg-white border border-gray-100 p-8 hover:border-black transition-all duration-300 group transform hover:scale-105 animate-on-scroll shadow-md hover:shadow-lg">
                    <h3 className="text-xl font-light text-gray-900 mb-4">{service.name}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center text-gray-500">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-sm">{service.duration} min</span>
                      </div>
                      <div className="flex items-center text-[#D15556] font-medium">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span>R$ {service.price.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/login-cliente?service=${encodeURIComponent(service.name)}`}
                      className="w-full bg-[#D15556] text-white py-3 px-4 font-medium hover:bg-[#c04546] transition-all duration-300 text-center block tracking-wide rounded-lg transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      Agendar
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-[#EED7B6]/20 animate-on-scroll">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-light text-gray-900 mb-6 animate-on-scroll">
            Pronto para se transformar?
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-on-scroll">
            Agende seu horário e descubra a melhor versão de você!
          </p>
          <Link 
            href="/login-cliente"
            className="bg-[#D15556] text-white px-12 py-4 text-lg font-medium hover:bg-[#c04546] transition-all duration-300 transform hover:scale-105 tracking-wide rounded-lg shadow-md hover:shadow-lg animate-on-scroll"
          >
            Agendar
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-gray-900 py-16 border-t border-[#D15556]" style={{ backgroundColor: '#F5F0E8' }}>
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

      <style jsx>{`
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease-out;
        }
        
        .animate-on-scroll.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        
        .animate-on-scroll:nth-child(odd) {
          transition-delay: 0.1s;
        }
        
        .animate-on-scroll:nth-child(even) {
          transition-delay: 0.2s;
        }
        
        .animate-on-scroll:nth-child(3n) {
          transition-delay: 0.3s;
        }
      `}</style>
    </div>
  )
}


