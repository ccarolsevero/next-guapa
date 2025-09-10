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
  const [step, setStep] = useState(0)
  const [selectedServices, setSelectedServices] = useState<any[]>([])
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null)
  const [professionals, setProfessionals] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [availableTimes, setAvailableTimes] = useState<string[]>(timeSlots)
  const [loading, setLoading] = useState(false)
  const [showDateTimeModal, setShowDateTimeModal] = useState(false)
  const [appointmentId, setAppointmentId] = useState<string | null>(null)
  const [paymentLink, setPaymentLink] = useState<string | null>(null)
  const [signalValue, setSignalValue] = useState<number>(0)

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
      // Clientes logados também começam na etapa 0 (informações sobre pagamento)
      // Só executa se ainda estiver no step inicial
      if (step === 0) {
        setStep(0)
      }
    }
  }, [isLoggedIn, client])

  // useEffect separado para parâmetros da URL
  useEffect(() => {
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
        setSelectedServices([service])
        // Não definir horário automaticamente, deixar o usuário escolher
      }
    }
  }, [professionals, services])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleServiceSelect = (service: any) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s._id === service._id)
      if (isSelected) {
        // Remove o serviço se já estiver selecionado
        return prev.filter(s => s._id !== service._id)
      } else {
        // Adiciona o serviço se não estiver selecionado
        return [...prev, service]
      }
    })
  }

  const handleProfessionalSelect = (professional: any) => {
    setSelectedProfessional(professional)
    setFormData(prev => ({ ...prev, professional: professional.name }))
    // Limpar serviços selecionados quando trocar de profissional
    setSelectedServices([])
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      // Calcular horário de fim baseado na duração total dos serviços
      const startTime = formData.time
      const totalDuration = selectedServices.reduce((total, service) => total + (service.duration || 60), 0)
      const [hours, minutes] = startTime.split(':').map(Number)
      const startDate = new Date()
      startDate.setHours(hours, minutes, 0, 0)
      const endDate = new Date(startDate.getTime() + totalDuration * 60000)
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`

      const totalPrice = selectedServices.reduce((total, service) => total + (service.price || 0), 0)
      const servicesNames = selectedServices.map(service => service.name).join(' + ')
      
      const appointmentData = {
        clientName: formData.name,
        clientPhone: formData.phone,
        clientEmail: formData.email,
        clientId: isLoggedIn && client ? client._id : null,
        service: servicesNames,
        services: selectedServices,
        professional: formData.professional,
        professionalId: selectedProfessional?._id?.toString() || '',
        date: formData.date,
        startTime: formData.time,
        endTime: endTime,
        duration: totalDuration,
        price: totalPrice,
        notes: formData.notes,
        status: 'SCHEDULED'
      }
      
      // Criar o agendamento
      const appointmentResponse = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      })
      
      if (!appointmentResponse.ok) {
        const errorData = await appointmentResponse.json()
        throw new Error(errorData.error || 'Erro ao criar agendamento')
      }
      
      const appointmentResult = await appointmentResponse.json()
      setAppointmentId(appointmentResult.appointmentId)
      
      // Criar link de pagamento para o sinal
      const paymentResponse = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: appointmentResult.appointmentId,
          services: selectedServices
        }),
      })
      
      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json()
        throw new Error(errorData.error || 'Erro ao criar link de pagamento')
      }
      
      const paymentResult = await paymentResponse.json()
      setPaymentLink(paymentResult.paymentLink)
      setSignalValue(paymentResult.signalValue)
      
      setShowDateTimeModal(false)
      setStep(4) // Mostrar página de pagamento
      
    } catch (error) {
      console.error('Erro ao agendar:', error)
      alert(`Erro ao processar agendamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
    }
  }

  const getNextAvailableDate = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Etapa 0: Informações sobre pagamento
  if (step === 0) {
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

        {/* Conteúdo Principal */}
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
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#D15556] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">R$</span>
                </div>
                
                <h2 className="text-2xl font-bold text-[#006D5B] mb-6">Informações sobre Pagamento</h2>
                
                <div className="bg-[#F5F0E8] p-6 rounded-lg mb-8">
                  <p className="text-lg text-gray-700 mb-4 font-medium">
                    Para realizar um agendamento, é necessário realizar o pagamento de <strong className="text-[#D15556]">30% do valor do serviço escolhido</strong>.
                  </p>
                  <p className="text-gray-700 font-medium">
                    Após definir seu horário, você será redirecionada a uma página de pagamento.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-8">
                  <h3 className="font-semibold text-blue-800 mb-2">Como funciona:</h3>
                  <ul className="text-left text-blue-700 space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">1.</span>
                      Escolha seu profissional e serviço
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">2.</span>
                      Defina data e horário disponível
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">3.</span>
                      Pague o sinal de 30% para confirmar
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">4.</span>
                      Pague o restante no dia do atendimento
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="bg-[#D15556] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#c04546] transition-colors text-lg"
                >
                  Entendi, Continuar
                </button>
              </div>
            </div>
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

  // Página de pagamento (step 4)
  if (step === 4) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F0E8' }}>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#D15556] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">R$</span>
            </div>
            <h2 className="text-2xl font-bold text-[#006D5B] mb-4">Pagamento do Sinal</h2>
            <p className="text-gray-700 mb-6 font-medium">
              Para confirmar seu agendamento, é necessário o pagamento do sinal de 30% do valor do serviço.
            </p>
            
            <div className="bg-[#F5F0E8] p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-[#006D5B] mb-3">Resumo do Agendamento:</h3>
              <p className="text-sm text-gray-700 font-medium"><strong>Profissional:</strong> {formData.professional}</p>
              <p className="text-sm text-gray-700 font-medium"><strong>Data:</strong> {formData.date}</p>
              
              <div className="mt-3">
                <p className="text-sm text-gray-700 font-medium mb-2"><strong>Serviços:</strong></p>
                <div className="space-y-1">
                  {selectedServices.map((service) => (
                    <p key={service._id} className="text-sm text-gray-600">
                      • {service.name} - {service.duration} min - {formatCurrency(service.price)}
                    </p>
                  ))}
                </div>
                <p className="text-sm text-gray-700 font-medium mt-2">
                  <strong>Horário:</strong> {formData.time} (Duração total: {selectedServices.reduce((total, service) => total + service.duration, 0)} min)
                </p>
              </div>
              
              <div className="border-t border-gray-300 mt-3 pt-3">
                <p className="text-sm text-gray-700 font-medium"><strong>Valor Total:</strong> {formatCurrency(selectedServices.reduce((total, service) => total + service.price, 0))}</p>
                <p className="text-lg font-bold text-[#D15556]"><strong>Sinal (30%):</strong> {formatCurrency(signalValue)}</p>
              </div>
            </div>

            {paymentLink ? (
              <div className="space-y-4">
                <a
                  href={paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#D15556] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#c04546] transition-colors inline-block"
                >
                  Pagar Sinal Agora
                </a>
                <p className="text-xs text-gray-500">
                  Você será redirecionado para uma página segura de pagamento
                </p>
                <button
                  onClick={() => setStep(5)}
                  className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Já Paguei - Verificar Status
                </button>
              </div>
            ) : signalValue > 0 ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <p className="text-green-800 font-medium">Agendamento Confirmado!</p>
                  </div>
                  <p className="text-green-700 text-sm mt-2">
                    Modo desenvolvimento ativo - Sicoob não configurado. O agendamento foi confirmado automaticamente.
                  </p>
                </div>
                <button
                  onClick={() => setStep(5)}
                  className="w-full bg-[#D15556] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#c04546] transition-colors"
                >
                  Ver Confirmação
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D15556] mx-auto mb-4"></div>
                <p className="text-gray-600">Preparando link de pagamento...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Página de confirmação final (step 5)
  if (step === 5) {
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
              <p className="text-sm text-gray-700 font-medium"><strong>Profissional:</strong> {formData.professional}</p>
              <p className="text-sm text-gray-700 font-medium"><strong>Data:</strong> {formData.date}</p>
              
              <div className="mt-2">
                <p className="text-sm text-gray-700 font-medium mb-1"><strong>Serviços:</strong></p>
                <div className="space-y-1">
                  {selectedServices.map((service) => (
                    <p key={service._id} className="text-sm text-gray-600">
                      • {service.name} - {service.duration} min - {formatCurrency(service.price)}
                    </p>
                  ))}
                </div>
                <p className="text-sm text-gray-700 font-medium mt-2">
                  <strong>Horário:</strong> {formData.time} (Duração total: {selectedServices.reduce((total, service) => total + service.duration, 0)} min)
                </p>
              </div>
            </div>
            <Link 
              href={isLoggedIn ? "/painel-cliente" : "/"}
              className="bg-[#D15556] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#c04546] transition-colors"
            >
              {isLoggedIn ? "Ir para o Painel" : "Voltar ao Início"}
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
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className={`flex items-center ${step >= 1 ? 'text-[#D15556]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#D15556] text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2 font-semibold">Profissional</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-[#D15556]' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-[#D15556]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#D15556] text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 font-semibold">Serviço</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-[#D15556]' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-[#D15556]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-[#D15556] text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2 font-semibold">Pagamento</span>
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
                <h2 className="text-2xl font-semibold text-[#006D5B] mb-6">Escolha os Serviços</h2>
                <p className="text-gray-600 mb-4 font-medium">Você pode selecionar múltiplos serviços para o mesmo agendamento</p>
                
                {selectedProfessional && (
                  <div className="mb-4 p-3 bg-[#F5F0E8] rounded-lg">
                    <p className="text-sm text-[#006D5B] font-medium">
                      Profissional selecionado: <strong>{selectedProfessional.name}</strong>
                    </p>
                  </div>
                )}
                
                {/* Resumo dos serviços selecionados */}
                {selectedServices.length > 0 && (
                  <div className="mb-6 p-4 bg-[#F5F0E8] rounded-lg">
                    <h3 className="font-semibold text-[#006D5B] mb-3">Serviços Selecionados:</h3>
                    <div className="space-y-2">
                      {selectedServices.map((service) => (
                        <div key={service._id} className="flex justify-between items-center">
                          <div>
                            <span className="font-medium text-gray-700">{service.name}</span>
                            <span className="text-sm text-gray-600 ml-2">({service.duration} min)</span>
                          </div>
                          <span className="text-[#D15556] font-bold">R$ {service.price.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t border-gray-300 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#006D5B]">Total:</span>
                          <span className="text-lg font-bold text-[#D15556]">
                            R$ {selectedServices.reduce((total, service) => total + service.price, 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Sinal (30%):</span>
                          <span className="font-bold text-[#D15556]">
                            R$ {(selectedServices.reduce((total, service) => total + service.price, 0) * 0.3).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto mb-8">
                  {services.map((service) => {
                    const isSelected = selectedServices.some(s => s._id === service._id)
                    return (
                    <div
                      key={service._id}
                      onClick={() => handleServiceSelect(service)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          isSelected
                          ? 'border-[#D15556] bg-[#F5F0E8]'
                          : 'border-gray-200 hover:border-[#D15556]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            <div className={`w-5 h-5 border-2 rounded mr-3 mt-0.5 ${
                              isSelected 
                                ? 'bg-[#D15556] border-[#D15556]' 
                                : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                        <div>
                          <h4 className="font-bold text-[#006D5B]">{service.name}</h4>
                          <p className="text-sm text-gray-600 font-medium">{service.duration} min</p>
                            </div>
                        </div>
                        <span className="text-[#D15556] font-bold">R$ {service.price.toFixed(2)}</span>
                      </div>
                    </div>
                    )
                  })}
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
                    disabled={selectedServices.length === 0}
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
                <h4 className="font-semibold text-[#006D5B] mb-3">Resumo do Agendamento</h4>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Profissional:</span>
                    <p className="text-gray-700">{selectedProfessional?.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Data:</span>
                    <p className="text-gray-700">{formData.date}</p>
                  </div>
                  <div>
                    <span className="font-medium">Serviços:</span>
                    <div className="mt-1 space-y-1">
                      {selectedServices.map((service) => (
                        <p key={service._id} className="text-gray-700 text-sm">
                          • {service.name} - {service.duration} min - R$ {service.price.toFixed(2)}
                        </p>
                      ))}
                  </div>
                  </div>
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Duração Total:</span>
                      <span className="text-gray-700">{selectedServices.reduce((total, service) => total + service.duration, 0)} minutos</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Valor Total:</span>
                      <span className="text-[#D15556] font-semibold">R$ {selectedServices.reduce((total, service) => total + service.price, 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Sinal (30%):</span>
                      <span className="text-[#D15556] font-bold">R$ {(selectedServices.reduce((total, service) => total + service.price, 0) * 0.3).toFixed(2)}</span>
                    </div>
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
                      Horário de Início *
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
                    {formData.time && selectedServices.length > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        Duração total: {selectedServices.reduce((total, service) => total + service.duration, 0)} minutos
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


