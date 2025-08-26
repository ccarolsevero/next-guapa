'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, User, Phone, Mail, CheckCircle } from 'lucide-react'

const services = [
  { id: 1, name: "Avaliação", price: 60.00, duration: 30 },
  { id: 2, name: "Back To Natural - g", price: 385.00, duration: 120 },
  { id: 3, name: "Back To Natural - m", price: 319.00, duration: 120 },
  { id: 4, name: "Back To Natural - p", price: 231.00, duration: 120 },
  { id: 5, name: "Cobertura de Brancos (Tinta Color Keune)", price: 121.00, duration: 90 },
  { id: 6, name: "Cobertura de Brancos (Tinta So Pure - Keune)", price: 143.00, duration: 90 },
  { id: 7, name: "Combo Consultoria, Corte e Tratamento Keune", price: 264.00, duration: 120 },
  { id: 8, name: "Consultoria/Corte", price: 198.00, duration: 90 },
  { id: 9, name: "Corte", price: 132.00, duration: 60 },
  { id: 10, name: "Corte e Tratamento Keune", price: 198.00, duration: 90 },
  { id: 11, name: "Corte Infantil", price: 66.00, duration: 45 },
  { id: 12, name: "Finalização", price: 77.00, duration: 30 },
  { id: 13, name: "Iluminado g (Cabelo Longo)", price: 715.00, duration: 150 },
  { id: 14, name: "Iluminado m (Abaixo do Ombro)", price: 605.00, duration: 120 },
  { id: 15, name: "Iluminado p (Até o Ombro)", price: 500.00, duration: 90 },
  { id: 16, name: "Iluminado Pp (Cabelos Curtinhos)", price: 390.00, duration: 60 },
  { id: 17, name: "Mechas Coloridas", price: 250.00, duration: 120 },
  { id: 18, name: "Mechas Invertidas", price: 220.00, duration: 90 },
  { id: 19, name: "Retoque de Corte", price: 66.00, duration: 30 },
]

const professionals = [
  { id: 1, name: "Bruna", specialties: "Cabeleireira Visagista" },
  { id: 2, name: "Cicera Canovas", specialties: "Tricoterapeuta" },
]

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"
]

export default function AgendamentoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    professional: '',
    date: '',
    time: '',
    notes: ''
  })
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null)

  useEffect(() => {
    // Pegar parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search)
    const serviceParam = urlParams.get('service')
    const professionalParam = urlParams.get('professional')
    
    if (serviceParam) {
      const service = services.find(s => s.name === serviceParam)
      if (service) {
        setFormData(prev => ({ ...prev, service: service.name }))
        setSelectedService(service)
      }
    }
    
    if (professionalParam) {
      const professional = professionals.find(p => p.name === professionalParam)
      if (professional) {
        setFormData(prev => ({ ...prev, professional: professional.name }))
        setSelectedProfessional(professional)
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleServiceSelect = (service: any) => {
    setSelectedService(service)
    setFormData(prev => ({ ...prev, service: service.name }))
  }

  const handleProfessionalSelect = (professional: any) => {
    setSelectedProfessional(professional)
    setFormData(prev => ({ ...prev, professional: professional.name }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui você faria a chamada para a API
    console.log('Dados do agendamento:', formData)
    setStep(3) // Mostrar confirmação
  }

  const getNextAvailableDate = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F0E8' }}>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-[#006D5B] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#006D5B] mb-4">Agendamento Confirmado!</h2>
            <p className="text-gray-700 mb-6 font-medium">
              Seu agendamento foi realizado com sucesso. Entraremos em contato em breve para confirmar os detalhes.
            </p>
            <div className="bg-[#F5F0E8] p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-[#006D5B] mb-2">Resumo do Agendamento:</h3>
              <p className="text-sm text-gray-700 font-medium"><strong>Serviço:</strong> {formData.service}</p>
              <p className="text-sm text-gray-700 font-medium"><strong>Profissional:</strong> {formData.professional}</p>
              <p className="text-sm text-gray-700 font-medium"><strong>Data:</strong> {formData.date}</p>
              <p className="text-sm text-gray-700 font-medium"><strong>Horário:</strong> {formData.time}</p>
            </div>
            <Link 
              href="/"
              className="bg-[#D15556] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#c04546] transition-colors"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E8' }}>
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
              href="/agendamento"
              className="bg-white text-[#D15556] px-8 py-3 rounded-lg hover:bg-[#EED7B6] transition-colors font-medium tracking-wide"
            >
              Agendar
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer para compensar navbar fixa */}
      <div className="h-20"></div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step >= 1 ? 'text-[#D15556]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#D15556] text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2 font-semibold">Dados Pessoais</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-[#D15556]' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-[#D15556]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#D15556] text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 font-semibold">Agendamento</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#006D5B] mb-4">
              Agende seu <span className="text-[#D15556]">Horário</span>
            </h1>
            <p className="text-xl text-gray-700 font-medium">
              Preencha os dados abaixo para agendar seu horário
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-semibold text-[#006D5B] mb-6">Dados Pessoais</h2>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent bg-white text-black font-medium"
                      style={{ color: '#000000' }}
                      placeholder="Digite seu nome completo"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent bg-white text-black font-medium"
                      style={{ color: '#000000' }}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent bg-white text-black font-medium"
                    style={{ color: '#000000' }}
                    placeholder="seu@email.com"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!formData.name || !formData.phone}
                    className="bg-[#D15556] text-white px-6 py-2 rounded-lg hover:bg-[#c04546] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-semibold text-[#006D5B] mb-6">Escolha seu Serviço e Horário</h2>
                
                {/* Serviços */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-[#006D5B] mb-4">Serviços Disponíveis</h3>
                  <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => handleServiceSelect(service)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedService?.id === service.id
                            ? 'border-[#D15556] bg-[#F5F0E8]'
                            : 'border-gray-200 hover:border-[#D15556]'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-[#006D5B]">{service.name}</h4>
                            <p className="text-sm text-gray-600 font-medium">{service.duration} min</p>
                          </div>
                          <span className="text-[#D15556] font-bold">R$ {service.price.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Profissionais */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-[#006D5B] mb-4">Escolha o Profissional</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {professionals.map((professional) => (
                      <div
                        key={professional.id}
                        onClick={() => handleProfessionalSelect(professional)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedProfessional?.id === professional.id
                            ? 'border-[#D15556] bg-[#F5F0E8]'
                            : 'border-gray-200 hover:border-[#D15556]'
                        }`}
                      >
                        <h4 className="font-bold text-[#006D5B]">{professional.name}</h4>
                        <p className="text-sm text-gray-600 font-medium">{professional.specialties}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data e Horário */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Data *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      min={getNextAvailableDate()}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent bg-white text-black font-medium"
                      style={{ color: '#000000' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Horário *
                    </label>
                    <select
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent bg-white text-black font-medium"
                      style={{ color: '#000000' }}
                    >
                      <option value="">Selecione um horário</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Observações */}
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent bg-white text-black font-medium"
                    style={{ color: '#000000' }}
                    placeholder="Alguma observação especial ou preferência..."
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-gray-600 hover:text-gray-800 transition-colors font-semibold"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedService || !selectedProfessional || !formData.date || !formData.time}
                    className="bg-[#D15556] text-white px-6 py-2 rounded-lg hover:bg-[#c04546] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
                  >
                    Confirmar Agendamento
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

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
    </div>
  )
}


