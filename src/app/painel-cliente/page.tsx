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

interface ClientData {
  id: number
  name: string
  email: string
  phone: string
  birthDate: string
  address: string
  createdAt: string
}

interface Appointment {
  id: number
  service: string
  professional: string
  date: string
  time: string
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
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

export default function PainelClientePage() {
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
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      service: 'Corte e Tratamento Keune',
      professional: 'Bruna',
      date: '2024-01-15',
      time: '14:00',
      status: 'confirmed',
      price: 198.00
    },
    {
      id: 2,
      service: 'Tratamento Keune SPA',
      professional: 'Cicera',
      date: '2024-01-20',
      time: '10:00',
      status: 'pending',
      price: 120.00
    },
    {
      id: 3,
      service: 'Avaliação Capilar + Corte',
      professional: 'Bruna',
      date: '2024-01-10',
      time: '15:30',
      status: 'completed',
      price: 132.00,
      rating: 5,
      review: 'Excelente atendimento! A Bruna é muito profissional e atenciosa.',
      reviewed: true
    },
    {
      id: 4,
      service: 'Tratamento Natural So Pure',
      professional: 'Cicera',
      date: '2024-01-05',
      time: '11:00',
      status: 'completed',
      price: 140.00,
      reviewed: false
    }
  ])
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      items: [
        { name: 'Shampoo Keune', quantity: 2, price: 45.00 },
        { name: 'Condicionador Keune', quantity: 1, price: 42.00 }
      ],
      total: 132.00,
      status: 'pending',
      createdAt: '2024-01-10'
    }
  ])

  useEffect(() => {
    // Verificar se o cliente está logado
    const isLoggedIn = localStorage.getItem('isClientLoggedIn')
    const loggedInClient = localStorage.getItem('loggedInClient')
    
    if (!isLoggedIn || !loggedInClient) {
      window.location.href = '/login-cliente'
      return
    }

    setClientData(JSON.parse(loggedInClient))
  }, [])

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
  const saveProfileChanges = () => {
    if (clientData && editProfileData) {
      const updatedData = { ...clientData, ...editProfileData }
      setClientData(updatedData)
      // Aqui você poderia fazer uma chamada para a API para salvar no banco
      localStorage.setItem('clientData', JSON.stringify(updatedData))
      setShowEditProfileModal(false)
      alert('Perfil atualizado com sucesso!')
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

    setPasswordLoading(true)

    try {
      const response = await fetch('/api/clients/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
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

  const handleLogout = () => {
    localStorage.removeItem('isClientLoggedIn')
    localStorage.removeItem('loggedInClient')
    window.location.href = '/'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado'
      case 'pending':
        return 'Pendente'
      case 'completed':
        return 'Concluído'
      case 'cancelled':
        return 'Cancelado'
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

  if (!clientData) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D15556] mx-auto mb-4"></div>
          <p className="text-[#006D5B]">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
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
            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">
                Olá, {clientData.name.split(' ')[0]}!
              </span>
              <button
                onClick={handleLogout}
                className="bg-white text-[#D15556] px-4 py-2 rounded-lg hover:bg-[#EED7B6] transition-colors font-medium text-sm"
              >
                <LogOut className="w-4 h-4 inline mr-1" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer para compensar navbar fixa */}
      <div className="h-20"></div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-28">
              {/* Perfil do Cliente */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-[#D15556] rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-medium text-[#006D5B] mb-1">
                  {clientData.name}
                </h3>
                <p className="text-sm text-gray-600">{clientData.email}</p>
              </div>

              {/* Menu de Navegação */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-[#D15556] text-white'
                      : 'text-[#006D5B] hover:bg-[#EED7B6]'
                  }`}
                >
                  <Calendar className="w-5 h-5 inline mr-3" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'appointments'
                      ? 'bg-[#D15556] text-white'
                      : 'text-[#006D5B] hover:bg-[#EED7B6]'
                  }`}
                >
                  <Clock className="w-5 h-5 inline mr-3" />
                  Agendamentos
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-[#D15556] text-white'
                      : 'text-[#006D5B] hover:bg-[#EED7B6]'
                  }`}
                >
                  <Package className="w-5 h-5 inline mr-3" />
                  Pedidos
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'history'
                      ? 'bg-[#D15556] text-white'
                      : 'text-[#006D5B] hover:bg-[#EED7B6]'
                  }`}
                >
                  <Eye className="w-5 h-5 inline mr-3" />
                  Histórico
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-[#D15556] text-white'
                      : 'text-[#006D5B] hover:bg-[#EED7B6]'
                  }`}
                >
                  <Settings className="w-5 h-5 inline mr-3" />
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
                <h2 className="text-2xl font-light text-[#006D5B] mb-6">
                  Dashboard
                </h2>

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
                  {appointments.filter(a => a.status === 'confirmed').length > 0 ? (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-[#006D5B]">
                            {appointments.filter(a => a.status === 'confirmed')[0].service}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {appointments.filter(a => a.status === 'confirmed')[0].professional}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(appointments.filter(a => a.status === 'confirmed')[0].date)} às {formatTime(appointments.filter(a => a.status === 'confirmed')[0].time)}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Confirmado
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">Nenhum agendamento confirmado.</p>
                  )}
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
                  <Link
                    href="/agendamento"
                    className="bg-[#D15556] text-white px-4 py-2 rounded-lg hover:bg-[#c04546] transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Novo Agendamento
                  </Link>
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
    </div>
  )
}
