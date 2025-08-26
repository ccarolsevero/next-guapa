import Link from 'next/link'
import { MapPin, Phone, Mail, Star, Clock, Scissors, Palette, Sparkles } from 'lucide-react'
import Image from 'next/image'

// Mock data para profissionais
const professionals = [
  {
    id: 1,
    name: "Bruna",
    role: "Cabeleireira Visagista",
    specialties: "Cabelos naturais, consultoria, corte, cores variadas, iluminados, loiros, coloridos fantasia",
    experience: "8 anos",
    rating: 5.0,
    reviews: 156,
    email: "bruna@espacoguapa.com",
    phone: "(11) 99999-0001",
    avatar: "/avatar-bruna.jpg",
    description: "Especialista em cabelos naturais e visagismo. Realizo consultoria, corte, cores dos mais variados tipos, desde iluminados, loiros até coloridos fantasia. Trabalho com a Keune Haircosmetics, renomada globalmente.",
    services: ["Consultoria", "Cortes", "Coloração", "Back To Natural", "Iluminados", "Mechas Coloridas"],
    availability: "Segunda a Sábado: 8h - 18h"
  },
  {
    id: 2,
    name: "Cicera Canovas",
    role: "Tricoterapeuta",
    specialties: "Tratamentos de couro cabeludo e fios totalmente naturalistas",
    experience: "12 anos",
    rating: 5.0,
    reviews: 89,
    email: "cicera@espacoguapa.com",
    phone: "(11) 99999-0002",
    avatar: "/avatar-cicera.jpg",
    description: "Tricoterapeuta especializada em tratamentos de couro cabeludo e fios totalmente naturalistas, sem o uso de nenhum tipo de química. Cuido da saúde dos seus cabelos de forma natural e eficaz.",
    services: ["Terapia Capilar", "Tratamentos Naturais", "Saúde do Couro Cabeludo"],
    availability: "Terça a Sexta: 9h - 17h"
  }
]

export default function ProfissionaisPage() {
  return (
    <div className="min-h-screen bg-white">
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
      <section className="py-32 bg-gradient-to-br from-white to-[#EED7B6]/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-light text-gray-900 mb-6">Nosso Time</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Profissionais qualificados e dedicados a transformar sua beleza. 
            Conheça quem faz a diferença no Espaço Guapa.
          </p>
        </div>
      </section>

      {/* Professionals */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light text-gray-900 mb-4">Conheça Nosso Time</h2>
            <p className="text-gray-600">Profissionais experientes e apaixonados pela beleza</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {professionals.map((professional) => (
              <div key={professional.id} className="bg-white border border-gray-100 overflow-hidden hover:border-[#D15556] transition-colors">
                <div className="p-8">
                  <div className="flex items-start space-x-6 mb-6">
                    <div className="w-24 h-24 bg-[#EED7B6] rounded-none flex items-center justify-center">
                      <Scissors className="w-12 h-12 text-[#D15556]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-light text-gray-900 mb-2">{professional.name}</h3>
                      <p className="text-[#D15556] font-medium mb-3">{professional.role}</p>
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm font-medium">{professional.rating}</span>
                          <span className="text-sm text-gray-600 ml-1">({professional.reviews} reviews)</span>
                        </div>
                        <span className="text-sm text-gray-600">• {professional.experience} de experiência</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{professional.specialties}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Serviços Oferecidos:</h4>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {professional.services.map((service, index) => (
                        <span key={index} className="px-3 py-1 bg-[#EED7B6]/50 text-[#D15556] text-sm font-medium">
                          {service}
                        </span>
                      ))}
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-3 text-[#D15556]" />
                        <span>{professional.availability}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-3 text-[#D15556]" />
                        <span>{professional.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-3 text-[#D15556]" />
                        <span>{professional.phone}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Link 
                        href="/login-cliente"
                        className="bg-[#D15556] text-white px-6 py-2 font-medium hover:bg-[#c04546] transition-colors rounded-lg"
                      >
                        Agendar
                      </Link>
                      <button className="border border-[#D15556] text-[#D15556] px-6 py-2 font-medium hover:bg-[#D15556] hover:text-white transition-colors rounded-lg">
                        Saber Mais
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-32 bg-[#EED7B6]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-light text-gray-900 mb-6">
            Pronto para se transformar?
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Agende seu horário e descubra a melhor versão de você!
          </p>
          <Link 
            href="/agendamento"
            className="bg-[#D15556] text-white px-12 py-4 text-lg font-medium hover:bg-[#c04546] transition-all duration-300 transform hover:scale-105 tracking-wide rounded-lg shadow-md hover:shadow-lg"
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
    </div>
  )
}


