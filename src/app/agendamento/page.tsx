'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, User, Phone, Mail, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'


const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"
]

export default function AgendamentoPage() {
  const { isLoggedIn, client } = useAuth()
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
  const [professionals, setProfessionals] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [availableTimes, setAvailableTimes] = useState<string[]>(timeSlots)
  const [loading, setLoading] = useState(false)
  const [showDateTimeModal, setShowDateTimeModal] = useState(false)

  // Carregar profissionais do banco
  useEffect(() => {
    const loadProfessionals = async () => {
      try {
        const response = await fetch('/api/professionals')
        if (response.ok) {
          const data = await response.json()
          setProfessionals(data)
        }
      } catch (error) {
        console.error('Erro ao carregar profissionais:', error)
      }
    }
    loadProfessionals()
  }, [])

  // Carregar serviços quando um profissional for selecionado
  useEffect(() => {
    if (selectedProfessional) {
      const loadServices = async () => {
        try {
          const response = await fetch(`/api/services?professionalId=${selectedProfessional._id}`)
          if (response.ok) {
            const data = await response.json()
            setServices(data)
          }
        } catch (error) {
          console.error('Erro ao carregar serviços:', error)
        }
      }
      loadServices()
    }
  }, [selectedProfessional])

  // Carregar horários disponíveis quando data e profissional forem selecionados
  useEffect(() => {
    if (formData.date && selectedProfessional) {
      const loadAvailableTimes = async () => {
        try {
          const response = await fetch(`/api/appointments/available-times?date=${formData.date}&professionalId=${selectedProfessional._id}`)
          if (response.ok) {
            const data = await response.json()
            setAvailableTimes(data.availableTimes || [])
          } else {
            setAvailableTimes(timeSlots)
          }
        } catch (error) {
          console.error('Erro ao carregar horários disponíveis:', error)
          setAvailableTimes(timeSlots)
        }
      }
      loadAvailableTimes()
    } else {
      setAvailableTimes(timeSlots)
    }
  }, [formData.date, selectedProfessional])

  useEffect(() => {
    // Se o cliente estiver logado, preencher dados automaticamente
    if (isLoggedIn && client) {
      setFormData(prev => ({
        ...prev,
        name: client.name,
        email: client.email || '',
        phone: client.phone
      }))
      // Clientes logados começam na etapa 1 (escolha do profissional)
      setStep(1)
    }

    // Pegar parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search)
    const serviceParam = urlParams.get('service')
    const professionalParam = urlParams.get('professional')
    
    if (professionalParam && professionals.length > 0) {
      const professional = professionals.find(p => p.name === professionalParam)
      if (professional) {
        setFormData(prev => ({ ...prev, professional: professional.name }))
        setSelectedProfessional(professional)
      }
    }
    
    if (serviceParam && services.length > 0) {
      const service = services.find(s => s.name === serviceParam)
      if (service) {
        setFormData(prev => ({ ...prev, service: service.name }))
        setSelectedService(service)
      }
    }
  }, [isLoggedIn, client, professionals, services])

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
    // Limpar serviço selecionado quando trocar de profissional
    setSelectedService(null)
    setFormData(prev => ({ ...prev, service: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Calcular horário de fim baseado na duração do serviço
      const startTime = formData.time
      const duration = selectedService?.duration || 60
      const [hours, minutes] = startTime.split(':').map(Number)
      const startDate = new Date()
      startDate.setHours(hours, minutes, 0, 0)
      const endDate = new Date(startDate.getTime() + duration * 60000)
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
      
      const appointmentData = {
        clientName: formData.name,
        clientPhone: formData.phone,
        clientEmail: formData.email,
        clientId: isLoggedIn && client ? client._id : null, // Adicionar clientId se logado
        service: formData.service,
        professional: formData.professional,
        professionalId: selectedProfessional?._id?.toString() || '',
        date: formData.date,
        startTime: formData.time,
        endTime: endTime,
        duration: duration,
        price: selectedService?.price || 0,
        notes: formData.notes,
        status: 'SCHEDULED'
      }
      
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      })
      
      if (response.ok) {
        setShowDateTimeModal(false) // Fechar modal
        setStep(3) // Mostrar confirmação
      } else {
        const errorData = await response.json()
        alert(`Erro ao agendar: ${errorData.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro ao agendar:', error)
      alert('Erro ao processar agendamento. Tente novamente.')
    }
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
          <div className="flex items-center justify-center">
            <div className={`flex items-center ${step >= 1 ? 'text-[#D15556]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#D15556] text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2 font-semibold">Profissional</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-[#D15556]' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-[#D15556]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#D15556] text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 font-semibold">Serviço</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#006D5B] mb-4">
              {isLoggedIn ? (
                <>Olá, {client?.name}! <span className="text-[#D15556]">Agende seu Horário</span></>
              ) : (
                <>Agende seu <span className="text-[#D15556]">Horário</span></>
              )}
            </h1>
            <p className="text-xl text-gray-700 font-medium">
              {isLoggedIn 
                ? "Escolha seu profissional, serviço e horário preferido"
                : "Preencha os dados abaixo para agendar seu horário"
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
            {/* Etapa 1: Dados Pessoais (apenas para não logados) */}
            {step === 1 && !isLoggedIn && (
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

            {/* Etapa 1: Escolha do Profissional (para logados) ou Etapa 2 (para não logados) */}
            {((step === 1 && isLoggedIn) || (step === 2 && !isLoggedIn)) && (
              <div>
                <h2 className="text-2xl font-semibold text-[#006D5B] mb-6">Escolha o Profissional</h2>
                
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {professionals.map((professional) => (
                    <div
                      key={professional._id}
                      onClick={() => handleProfessionalSelect(professional)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedProfessional?._id === professional._id
                          ? 'border-[#D15556] bg-[#F5F0E8]'
                          : 'border-gray-200 hover:border-[#D15556]'
                      }`}
                    >
                      <h4 className="font-bold text-[#006D5B]">{professional.name}</h4>
                      <p className="text-sm text-gray-600 font-medium">{professional.title}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  {!isLoggedIn && (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-gray-600 hover:text-gray-800 transition-colors font-semibold"
                    >
                      Voltar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setStep(isLoggedIn ? 2 : 3)}
                    disabled={!selectedProfessional}
                    className="bg-[#D15556] text-white px-6 py-2 rounded-lg hover:bg-[#c04546] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}

            {/* Etapa 2: Escolha do Serviço (para logados) ou Etapa 3 (para não logados) */}
            {((step === 2 && isLoggedIn) || (step === 3 && !isLoggedIn)) && (
              <div>
                <h2 className="text-2xl font-semibold text-[#006D5B] mb-6">Escolha o Serviço</h2>
                
                {selectedProfessional && (
                  <div className="mb-4 p-3 bg-[#F5F0E8] rounded-lg">
                    <p className="text-sm text-[#006D5B] font-medium">
                      Profissional selecionado: <strong>{selectedProfessional.name}</strong>
                    </p>
                  </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto mb-8">
                  {services.map((service) => (
                    <div
                      key={service._id}
                      onClick={() => handleServiceSelect(service)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedService?._id === service._id
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

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(isLoggedIn ? 1 : 2)}
                    className="text-gray-600 hover:text-gray-800 transition-colors font-semibold"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDateTimeModal(true)}
                    disabled={!selectedService}
                    className="bg-[#D15556] text-white px-6 py-2 rounded-lg hover:bg-[#c04546] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
                  >
                    Escolher Data e Horário
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>
      </div>

      {/* Modal de Data e Horário */}
      {showDateTimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-[#006D5B]">Escolher Data e Horário</h3>
                <button 
                  onClick={() => setShowDateTimeModal(false)}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Resumo da Seleção */}
              <div className="mb-6 p-4 bg-[#F5F0E8] rounded-lg">
                <h4 className="font-semibold text-[#006D5B] mb-2">Resumo do Agendamento</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Profissional:</span>
                    <p className="text-gray-700">{selectedProfessional?.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Serviço:</span>
                    <p className="text-gray-700">{selectedService?.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Duração:</span>
                    <p className="text-gray-700">{selectedService?.duration} minutos</p>
                  </div>
                  <div>
                    <span className="font-medium">Valor:</span>
                    <p className="text-[#D15556] font-semibold">R$ {selectedService?.price?.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Formulário de Data e Horário */}
              <form onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent bg-white text-black font-medium"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent bg-white text-black font-medium"
                      style={{ color: '#000000' }}
                    >
                      <option value="">Selecione um horário</option>
                      {availableTimes.length > 0 ? (
                        availableTimes.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))
                      ) : (
                        <option value="" disabled>Nenhum horário disponível para esta data</option>
                      )}
                    </select>
                    {formData.date && availableTimes.length === 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        Não há horários disponíveis para esta data. Tente outra data.
                      </p>
                    )}
                  </div>
                </div>

                {/* Observações */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Observações (opcional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent bg-white text-black font-medium"
                    style={{ color: '#000000' }}
                    placeholder="Alguma observação especial ou preferência..."
                  />
                </div>

                {/* Botões */}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setShowDateTimeModal(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-semibold"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.date || !formData.time}
                    className="bg-[#D15556] text-white px-8 py-3 rounded-lg hover:bg-[#c04546] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
                  >
                    Confirmar Agendamento
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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


