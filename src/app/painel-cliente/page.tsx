'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Package, 
  Clock, 
  User, 
  LogOut, 
  Settings, 
  Star,
  MapPin,
  Phone,
  Mail,
  Edit,
  Plus,
  Eye,
  X
} from 'lucide-react'
import { useAuth, AuthProvider } from '@/contexts/AuthContext'
import OnboardingModal from '@/components/OnboardingModal'

interface ClientData {
  id?: string
  _id?: string
  name: string
  email: string
  phone: string
  birthDate: string
  address: string
  createdAt: string
  onboardingCompleted?: boolean
  onboardingRequired?: boolean
}

interface Appointment {
  id: number
  service: string
  professional: string
  date: string
  time: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'confirmed' | 'pending' | 'completed' | 'cancelled'
  price: number
  rating?: number
  review?: string
  reviewed?: boolean
}

interface Order {
  id: number
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  createdAt: string
}

function PainelClienteContent() {
  const { client, logout } = useAuth()
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [editProfileData, setEditProfileData] = useState<Partial<ClientData>>({})
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Verificar se o cliente está logado
        const isLoggedIn = localStorage.getItem('isClientLoggedIn')
        const loggedInClient = localStorage.getItem('loggedInClient')
        
        if (!isLoggedIn || !loggedInClient) {
          window.location.href = '/login-cliente'
          return
        }

        const clientInfo = JSON.parse(loggedInClient)
        setClientData(clientInfo)
        
        // Buscar dados do dashboard do banco
        const clientId = clientInfo.id || clientInfo._id
        console.log('🔍 Buscando dashboard para clientId:', clientId)
        
        const response = await fetch(`/api/clients/dashboard?clientId=${clientId}`)
        
        if (!response.ok) {
          throw new Error('Erro ao carregar dados do dashboard')
        }
        
        const data = await response.json()
        console.log('📊 Dados recebidos do dashboard:', data.client)
        console.log('📅 Data de nascimento:', {
          birthDate: data.client.birthDate,
          birthDateType: typeof data.client.birthDate
        })
        
        // Atualizar dados do cliente com informações do banco
        setClientData(data.client)
        setAppointments(data.appointments)
        setOrders(data.orders)
        
        // Buscar recomendações do cliente
        try {
          const recomendacoesResponse = await fetch(`/api/recomendacoes?clientId=${clientId}`)
          if (recomendacoesResponse.ok) {
            const recomendacoesData = await recomendacoesResponse.json()
            setRecommendations(recomendacoesData.recomendacoes || [])
            console.log('📊 Recomendações carregadas:', recomendacoesData.recomendacoes?.length || 0)
          }
        } catch (error) {
          console.log('⚠️ Erro ao carregar recomendações:', error)
        }
        
        // Verificar se precisa completar onboarding
        console.log('🔍 Verificando onboarding:', {
          onboardingCompleted: data.client.onboardingCompleted,
          onboardingRequired: data.client.onboardingRequired,
          isCompleteProfile: data.client.isCompleteProfile
        })
        
        // Mostrar onboarding para todos que não têm perfil completo
        if (data.client && !data.client.isCompleteProfile) {
          console.log('✅ Mostrando modal de onboarding - perfil não completo')
          setShowOnboarding(true)
        } else {
          console.log('❌ Perfil já completo - não mostrar onboarding')
        }
        
        console.log('📊 Dashboard data loaded:', {
          appointments: data.appointments.length,
          orders: data.orders.length,
          stats: data.stats,
          needsOnboarding: !data.client.onboardingCompleted
        })
        
      } catch (error) {
        console.error('❌ Erro ao carregar dados do dashboard:', error)
        // Em caso de erro, manter dados básicos do localStorage
        const loggedInClient = localStorage.getItem('loggedInClient')
        if (loggedInClient) {
          setClientData(JSON.parse(loggedInClient))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Recarregar dados quando a aba ganha foco (para sincronizar com mudanças do admin)
  useEffect(() => {
    const handleFocus = () => {
      if (clientData) {
        fetchDashboardData()
      }
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && clientData) {
        fetchDashboardData()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [clientData])

  // Função para recarregar dados (pode ser chamada manualmente)
  const fetchDashboardData = async () => {
    try {
      // Verificar se o cliente está logado
      const isLoggedIn = localStorage.getItem('isClientLoggedIn')
      const loggedInClient = localStorage.getItem('loggedInClient')
      
      if (!isLoggedIn || !loggedInClient) {
        window.location.href = '/login-cliente'
        return
      }

      const clientInfo = JSON.parse(loggedInClient)
      setClientData(clientInfo)
      
      // Buscar dados do dashboard do banco
      const clientId = clientInfo.id || clientInfo._id
      console.log('🔄 Recarregando dashboard para clientId:', clientId)
      
      const response = await fetch(`/api/clients/dashboard?clientId=${clientId}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar dados do dashboard')
      }
      
      const data = await response.json()
      console.log('📊 Dados atualizados do dashboard:', data.client)
      
      // Atualizar dados do cliente com informações do banco
      setClientData(data.client)
      setAppointments(data.appointments)
      setOrders(data.orders)
      
    } catch (error) {
      console.error('❌ Erro ao recarregar dados do dashboard:', error)
    }
  }

  // Função para abrir modal de avaliação
  const openReviewModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setReviewRating(appointment.rating || 0)
    setReviewText(appointment.review || '')
    setShowReviewModal(true)
  }

  // Função para salvar avaliação
  const saveReview = () => {
    if (!selectedAppointment) return

    const updatedAppointments = appointments.map(apt => 
      apt.id === selectedAppointment.id 
        ? { 
            ...apt, 
            rating: reviewRating, 
            review: reviewText,
            reviewed: true
          }
        : apt
    )
    
    setAppointments(updatedAppointments)
    setShowReviewModal(false)
    setSelectedAppointment(null)
    setReviewRating(0)
    setReviewText('')
    
    // Salvar no localStorage (simulando banco de dados)
    localStorage.setItem('clientAppointments', JSON.stringify(updatedAppointments))
  }

  // Função para renderizar estrelas
  const renderStars = (rating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, index) => (
      <button
        key={index}
        onClick={interactive ? () => setReviewRating(index + 1) : undefined}
        className={`text-2xl ${interactive ? 'cursor-pointer' : ''} ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </button>
    ))
  }

  // Função para abrir detalhes do agendamento
  const openAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowAppointmentModal(true)
  }

  // Função para abrir detalhes do pedido
  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderModal(true)
  }

  // Função para abrir modal de edição de perfil
  const openEditProfileModal = () => {
    if (clientData) {
      console.log('Dados do cliente para edição:', {
        birthDate: clientData.birthDate,
        birthDateType: typeof clientData.birthDate
      })
      setEditProfileData({
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        birthDate: clientData.birthDate,
        address: clientData.address
      })
      setShowEditProfileModal(true)
    }
  }

  // Função para salvar alterações do perfil
  const saveProfileChanges = async () => {
    const clientId = clientData?.id || clientData?._id
    
    if (!clientId || !editProfileData) {
      alert('Erro: Dados do cliente não encontrados')
      return
    }

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editProfileData)
      })

      const data = await response.json()

      if (response.ok) {
        // Atualizar dados do cliente localmente
        const updatedData = { ...clientData, ...editProfileData }
        setClientData(updatedData)
        
        // Atualizar localStorage
        localStorage.setItem('loggedInClient', JSON.stringify(updatedData))
        
        setShowEditProfileModal(false)
        alert('Perfil atualizado com sucesso!')
      } else {
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      alert('Erro ao atualizar perfil. Tente novamente.')
    }
  }

  // Função para alterar senha
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('As senhas não coincidem!')
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres!')
      return
    }

    const clientId = clientData?.id || clientData?._id
    
    if (!clientId) {
      alert('Erro: ID do cliente não encontrado')
      return
    }

    setPasswordLoading(true)

    try {
      const response = await fetch('/api/clients/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          clientId: clientId
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Senha alterada com sucesso!')
        setShowChangePasswordModal(false)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      alert('Erro ao alterar senha. Tente novamente.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleOnboardingComplete = (updatedClient: any) => {
    // Atualizar dados do cliente
    setClientData(updatedClient)
    
    // Atualizar localStorage
    localStorage.setItem('loggedInClient', JSON.stringify(updatedClient))
    
    // Fechar modal
    setShowOnboarding(false)
    
    // Mostrar mensagem de sucesso
    alert('Cadastro completado com sucesso! Agora você tem acesso completo ao painel.')
  }

  const handleLogout = () => {
    // Limpar todos os dados de autenticação
    localStorage.removeItem('isClientLoggedIn')
    localStorage.removeItem('loggedInClient')
    localStorage.removeItem('clientToken')
    
    // Limpar estado local
    setClientData(null)
    setAppointments([])
    setOrders([])
    
    // Redirecionar para a página inicial
    window.location.href = '/'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'NO_SHOW':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'CONFIRMED':
        return 'Confirmado'
      case 'pending':
      case 'SCHEDULED':
        return 'Agendado'
      case 'completed':
      case 'COMPLETED':
        return 'Concluído'
      case 'cancelled':
      case 'CANCELLED':
        return 'Cancelado'
      case 'NO_SHOW':
        return 'Não Compareceu'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  if (loading || !clientData) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D15556] mx-auto mb-4"></div>
          <p className="text-[#006D5B]">Carregando dados do painel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Header */}
      <header className="border-b border-[#e6d1b8] fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: 'rgba(245, 240, 232, 0.95)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2 md:py-4">
            <div className="flex items-center min-w-0 flex-1">
              <Link href="/" className="flex items-center">
                <img 
                  src="/assents/logonavbarg.svg" 
                  alt="Espaço Guapa" 
                  className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto"
                  style={{ 
                    filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(332deg) brightness(86%) contrast(101%)'
                  }}
                />
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <span className="text-[#d34d4c] font-medium text-xs sm:text-sm hidden sm:inline">
                Olá, {client?.name.split(' ')[0]}!
              </span>
              <button
                onClick={handleLogout}
                className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium text-xs sm:text-sm p-2 rounded-md hover:bg-gray-100"
                title="Sair"
              >
                <LogOut className="w-4 h-4 sm:inline mr-1" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer para compensar navbar fixa */}
      <div className="h-16 sm:h-20 md:h-24"></div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 sticky top-24 sm:top-28">
              {/* Perfil do Cliente */}
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#D15556] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-[#006D5B] mb-1 truncate">
                  {clientData.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{clientData.email}</p>
              </div>

              {/* Menu de Navegação */}
              <nav className="space-y-1 sm:space-y-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                    activeTab === 'dashboard'
                      ? 'bg-[#D15556] text-white'
                      : 'text-[#006D5B] hover:bg-[#EED7B6]'
                  }`}
                >
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2 sm:mr-3" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                    activeTab === 'appointments'
                      ? 'bg-[#D15556] text-white'
                      : 'text-[#006D5B] hover:bg-[#EED7B6]'
                  }`}
                >
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2 sm:mr-3" />
                  Agendamentos
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                    activeTab === 'orders'
                      ? 'bg-[#D15556] text-white'
                      : 'text-[#006D5B] hover:bg-[#EED7B6]'
                  }`}
                >
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2 sm:mr-3" />
                  Pedidos
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                    activeTab === 'history'
                      ? 'bg-[#D15556] text-white'
                      : 'text-[#006D5B] hover:bg-[#EED7B6]'
                  }`}
                >
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2 sm:mr-3" />
                  Histórico
                </button>
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                    activeTab === 'recommendations'
                      ? 'bg-[#D15556] text-white'
                      : 'text-[#006D5B] hover:bg-[#EED7B6]'
                  }`}
                >
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2 sm:mr-3" />
                  Recomendações
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                    activeTab === 'profile'
                      ? 'bg-[#D15556] text-white'
                      : 'text-[#006D5B] hover:bg-[#EED7B6]'
                  }`}
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2 sm:mr-3" />
                  Perfil
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-light text-[#006D5B]">
                    Dashboard
                  </h2>
                </div>

                {/* Cards de Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-[#D15556] rounded-lg flex items-center justify-center mr-4">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Agendamentos</p>
                        <p className="text-2xl font-semibold text-[#006D5B]">
                          {appointments.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-[#D15556] rounded-lg flex items-center justify-center mr-4">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Pedidos</p>
                        <p className="text-2xl font-semibold text-[#006D5B]">
                          {orders.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-[#D15556] rounded-lg flex items-center justify-center mr-4">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Desde</p>
                        <p className="text-lg font-semibold text-[#006D5B]">
                          {formatDate(clientData.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Próximo Agendamento */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-medium text-[#006D5B] mb-4">
                    Próximo Agendamento
                  </h3>
                  {(() => {
                    // Buscar próximo agendamento (confirmado ou agendado)
                    const nextAppointment = appointments
                      .filter(a => a.status === 'confirmed' || a.status === 'pending' || a.status === 'SCHEDULED')
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
                    
                    return nextAppointment ? (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-[#006D5B]">
                              {nextAppointment.service}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {nextAppointment.professional}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDate(nextAppointment.date)} às {formatTime(nextAppointment.time)}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            nextAppointment.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800'
                              : nextAppointment.status === 'SCHEDULED' || nextAppointment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {nextAppointment.status === 'SCHEDULED' ? 'Agendado' : 
                             nextAppointment.status === 'confirmed' ? 'Confirmado' :
                             nextAppointment.status === 'pending' ? 'Pendente' : nextAppointment.status}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600">Nenhum agendamento próximo.</p>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* Agendamentos */}
            {activeTab === 'appointments' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-light text-[#006D5B]">
                    Meus Agendamentos
                  </h2>
                  <div className="flex space-x-3">
                    <button
                      onClick={fetchDashboardData}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center"
                      title="Atualizar dados"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Atualizar
                    </button>
                    <Link
                      href="/agendamento"
                      className="bg-[#D15556] text-white px-4 py-2 rounded-lg hover:bg-[#c04546] transition-colors font-medium"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Novo Agendamento
                    </Link>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#D15556] text-white">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-medium">Serviço</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Profissional</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Data</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Horário</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Valor</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {appointments.map((appointment) => (
                          <tr key={appointment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {appointment.service}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {appointment.professional}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {formatDate(appointment.date)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {formatTime(appointment.time)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              R$ {appointment.price.toFixed(2)}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                                {getStatusText(appointment.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button 
                                onClick={() => openAppointmentDetails(appointment)}
                                className="text-[#D15556] hover:text-[#c04546] mr-3"
                                title="Ver detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {appointment.status === 'completed' && !appointment.reviewed && (
                                <button 
                                  onClick={() => openReviewModal(appointment)}
                                  className="text-[#D15556] hover:text-[#c04546]"
                                  title="Avaliar atendimento"
                                >
                                  <Star className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Histórico */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-light text-[#006D5B] mb-6">
                  Histórico de Atendimentos
                </h2>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#D15556] text-white">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-medium">Serviço</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Profissional</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Data</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Valor</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Avaliação</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {appointments.filter(apt => apt.status === 'completed').map((appointment) => (
                          <tr key={appointment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {appointment.service}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {appointment.professional}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {formatDate(appointment.date)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              R$ {appointment.price.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {appointment.reviewed ? (
                                <div className="flex items-center">
                                  {renderStars(appointment.rating || 0)}
                                  {appointment.review && (
                                    <span className="ml-2 text-xs text-gray-500">✓ Avaliado</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">Não avaliado</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button 
                                onClick={() => openAppointmentDetails(appointment)}
                                className="text-[#D15556] hover:text-[#c04546] mr-3"
                                title="Ver detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {!appointment.reviewed && (
                                <button 
                                  onClick={() => openReviewModal(appointment)}
                                  className="text-[#D15556] hover:text-[#c04546]"
                                  title="Avaliar atendimento"
                                >
                                  <Star className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Pedidos */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-light text-[#006D5B]">
                    Meus Pedidos
                  </h2>
                  <Link
                    href="/produtos"
                    className="bg-[#D15556] text-white px-4 py-2 rounded-lg hover:bg-[#c04546] transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Fazer Pedido
                  </Link>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#D15556] text-white">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-medium">Pedido #</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Itens</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Total</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Data</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">
                              #{order.id}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {order.items.length} itens
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              R$ {order.total.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {formatDate(order.createdAt)}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button 
                                onClick={() => openOrderDetails(order)}
                                className="text-[#D15556] hover:text-[#c04546]"
                                title="Ver detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Recomendações */}
            {activeTab === 'recommendations' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-light text-[#006D5B] mb-6">
                  Orientações e Cuidados
                </h2>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="space-y-6">
                    {/* Recomendações dos atendimentos */}
                    <div>
                      <h3 className="text-lg font-medium text-[#006D5B] mb-4 flex items-center">
                        <Star className="w-5 h-5 mr-2" />
                        Orientações dos Atendimentos
                      </h3>
                      
                      {recommendations.length > 0 ? (
                        <div className="space-y-4">
                          {recommendations.slice(0, 2).map((recommendation) => (
                            <div key={recommendation._id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-medium text-[#006D5B]">
                                    {recommendation.titulo}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Profissional: {recommendation.professional?.name || 'Profissional não especificado'}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(recommendation.dataRecomendacao).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                                <div className="flex flex-col space-y-1">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    recommendation.status === 'ativa' ? 'bg-green-100 text-green-800' : 
                                    recommendation.status === 'concluida' ? 'bg-blue-100 text-blue-800' : 
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {recommendation.status === 'ativa' ? 'Ativa' : 
                                     recommendation.status === 'concluida' ? 'Concluída' : 'Cancelada'}
                                  </span>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    recommendation.prioridade === 'alta' ? 'bg-red-100 text-red-800' :
                                    recommendation.prioridade === 'media' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {recommendation.prioridade}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                <p className="text-sm text-blue-800">
                                  <strong>Orientações:</strong> {recommendation.descricao}
                                </p>
                                {recommendation.observacoes && (
                                  <p className="text-sm text-blue-700 mt-2">
                                    <strong>Observações:</strong> {recommendation.observacoes}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-500 mb-2">
                            Nenhuma orientação ainda
                          </h3>
                          <p className="text-gray-400">
                            Suas orientações aparecerão aqui após completar atendimentos.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Link para recomendações detalhadas */}
                    <div className="text-center">
                      <Link
                        href="/painel-cliente/recomendacoes"
                        className="bg-[#D15556] text-white px-6 py-3 rounded-lg hover:bg-[#c04546] transition-colors font-medium inline-flex items-center"
                      >
                        <Star className="w-5 h-5 mr-2" />
                        Ver Todas as Orientações
                        {recommendations.length > 2 && (
                          <span className="ml-2 bg-white text-[#D15556] px-2 py-1 rounded-full text-xs font-bold">
                            +{recommendations.length - 2}
                          </span>
                        )}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Perfil */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-light text-[#006D5B] mb-6">
                  Meu Perfil
                </h2>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#006D5B] mb-2">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        value={clientData.name}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-gray-700 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#006D5B] mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={clientData.email}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-gray-700 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#006D5B] mb-2">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={clientData.phone}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-gray-700 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#006D5B] mb-2">
                        Data de Nascimento
                      </label>
                      <input
                        type="date"
                        value={clientData.birthDate}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-gray-700 rounded-lg"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[#006D5B] mb-2">
                        Endereço
                      </label>
                      <input
                        type="text"
                        value={clientData.address}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-gray-700 rounded-lg"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[#006D5B] mb-2">
                        Cliente desde
                      </label>
                      <input
                        type="text"
                        value={formatDate(clientData.createdAt)}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-gray-700 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={openEditProfileModal}
                        className="bg-[#D15556] text-white px-6 py-3 rounded-lg hover:bg-[#c04546] transition-colors font-medium"
                      >
                        <Edit className="w-4 h-4 inline mr-2" />
                        Editar Perfil
                      </button>
                      <button 
                        onClick={() => setShowChangePasswordModal(true)}
                        className="bg-[#006D5B] text-white px-6 py-3 rounded-lg hover:bg-[#005a4d] transition-colors font-medium"
                      >
                        <Settings className="w-4 h-4 inline mr-2" />
                        Alterar Senha
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Agendamento */}
      {showAppointmentModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-light text-[#D15556]">Detalhes do Agendamento</h3>
              <button 
                onClick={() => setShowAppointmentModal(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-1">Serviço</label>
                <p className="text-gray-700">{selectedAppointment.service}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-1">Profissional</label>
                <p className="text-gray-700">{selectedAppointment.professional}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-1">Data e Hora</label>
                <p className="text-gray-700">{formatDate(selectedAppointment.date)} às {selectedAppointment.time}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-1">Valor</label>
                <p className="text-gray-700">R$ {selectedAppointment.price.toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-1">Status</label>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedAppointment.status)}`}>
                  {getStatusText(selectedAppointment.status)}
                </span>
              </div>
              {selectedAppointment.reviewed && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#006D5B] mb-1">Sua Avaliação</label>
                    <div className="flex items-center mb-2">
                      {renderStars(selectedAppointment.rating || 0)}
                      <span className="ml-2 text-sm text-gray-600">
                        ({selectedAppointment.rating}/5)
                      </span>
                    </div>
                    {selectedAppointment.review && (
                      <p className="text-sm text-gray-600 italic">"{selectedAppointment.review}"</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Pedido */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-light text-[#D15556]">Detalhes do Pedido #{selectedOrder.id}</h3>
              <button 
                onClick={() => setShowOrderModal(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">Itens do Pedido</label>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-200">
                      <div>
                        <p className="font-medium text-gray-700">{item.name}</p>
                        <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                      </div>
                      <p className="text-gray-700">R$ {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[#006D5B]">Total</span>
                  <span className="font-bold text-lg text-[#D15556]">R$ {selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-1">Data do Pedido</label>
                <p className="text-gray-700">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-1">Status</label>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusText(selectedOrder.status)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Avaliação */}
      {showReviewModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-light text-[#D15556]">Avaliar Atendimento</h3>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">Serviço</label>
                <p className="text-gray-700">{selectedAppointment.service} - {selectedAppointment.professional}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">Sua Avaliação</label>
                <div className="flex items-center space-x-2">
                  {renderStars(reviewRating, true)}
                  <span className="text-sm text-gray-600 ml-2">({reviewRating}/5)</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">Comentário (opcional)</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800 placeholder-gray-500"
                  rows={4}
                  placeholder="Conte como foi sua experiência..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveReview}
                  disabled={reviewRating === 0}
                  className="bg-[#D15556] text-white px-6 py-2 rounded-lg hover:bg-[#c04546] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvar Avaliação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Alteração de Senha */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-light text-[#D15556]">Alterar Senha</h3>
              <button 
                onClick={() => setShowChangePasswordModal(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  Senha Atual
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                  placeholder="Digite sua senha atual"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                  placeholder="Digite a nova senha (mín. 6 caracteres)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                  placeholder="Confirme a nova senha"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                  className="bg-[#D15556] text-white px-6 py-2 rounded-lg hover:bg-[#c04546] transition-colors font-medium disabled:opacity-50 flex items-center"
                >
                  {passwordLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Alterando...
                    </>
                  ) : (
                    'Alterar Senha'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Perfil */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-light text-[#D15556]">Editar Perfil</h3>
              <button 
                onClick={() => setShowEditProfileModal(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={editProfileData.name || ''}
                  onChange={(e) => setEditProfileData({...editProfileData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editProfileData.email || ''}
                  onChange={(e) => setEditProfileData({...editProfileData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={editProfileData.phone || ''}
                  onChange={(e) => setEditProfileData({...editProfileData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={editProfileData.birthDate || ''}
                  onChange={(e) => setEditProfileData({...editProfileData, birthDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  Endereço
                </label>
                <input
                  type="text"
                  value={editProfileData.address || ''}
                  onChange={(e) => setEditProfileData({...editProfileData, address: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-800"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveProfileChanges}
                  className="bg-[#D15556] text-white px-6 py-2 rounded-lg hover:bg-[#c04546] transition-colors font-medium"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Onboarding */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
        clientData={clientData}
      />
    </div>
  )
}

export default function PainelClientePage() {
  return <PainelClienteContent />
}
