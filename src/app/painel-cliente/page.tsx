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
  Eye
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
                              <button className="text-[#D15556] hover:text-[#c04546] mr-3">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-[#D15556] hover:text-[#c04546]">
                                <Edit className="w-4 h-4" />
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
                              <button className="text-[#D15556] hover:text-[#c04546]">
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
                    <button className="bg-[#D15556] text-white px-6 py-3 rounded-lg hover:bg-[#c04546] transition-colors font-medium">
                      <Edit className="w-4 h-4 inline mr-2" />
                      Editar Perfil
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
