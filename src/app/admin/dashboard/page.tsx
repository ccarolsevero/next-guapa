'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Bell, 
  Clock, 
  Package, 
  User, 
  ChevronDown, 
  ChevronUp,
  Eye,
  EyeOff,
  RefreshCw,
  ShoppingCart,
  Scissors,
  Plus,
  X,
  Printer,
  CreditCard,
  Banknote,
  CheckCircle,
  Minus
} from 'lucide-react'
import { useNotifications } from '../../../hooks/useNotifications'
import NotificationAlert from '../../../components/NotificationAlert'

// Interfaces para tipagem
interface Professional {
  id: string
  name: string
  role: string
}

interface CashierData {
  date: string
  professionalId: string
  revenueData: {
    professionalId: string
    professionalName: string
    totalRevenue: number
    totalServices: number
    totalProducts: number
    count: number
  }[]
  totals: {
    totalRevenue: number
    totalServices: number
    totalProducts: number
    totalCount: number
  }
  professionals: Professional[]
}

interface Notification {
  id: string
  type: 'appointment' | 'product_reservation'
  title: string
  message: string
  time: string
  data: any
}

interface NotificationsData {
  notifications: Notification[]
  unreadCount: number
  lastUpdate: string
}

interface Cashier {
  _id: string
  responsibleId: string
  status: 'OPEN' | 'CLOSED'
  openedAt: string
  closedAt?: string
  initialCash: number
  finalCash?: number
  responsible?: Professional
  movements?: CashierMovement[]
  paymentTotals?: PaymentTotal[]
  totalWithdrawals?: number
  totalSupplies?: number
}

interface CashierMovement {
  _id: string
  cashierId: string
  type: 'WITHDRAWAL' | 'SUPPLY'
  amount: number
  description: string
  createdAt: string
  createdBy: string
}

interface PaymentTotal {
  _id: string
  total: number
  count: number
}

interface Appointment {
  _id: string
  clientName: string
  clientPhone: string
  professionalId: string
  professionalName: string
  serviceId: string
  serviceName: string
  date: string
  time: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  paymentStatus: 'pending' | 'partial' | 'paid'
  signalPaid: boolean
  totalValue: number
  signalValue?: number
  signalPaidAt?: string
  notes?: string
  createdAt: string
}

export default function DashboardPage() {
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [cashierData, setCashierData] = useState<CashierData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfessionalDropdown, setShowProfessionalDropdown] = useState(false)
  
  // Usar o hook de notificações
  const { 
    notifications, 
    unreadCount, 
    playNotificationSound, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications()
  
  // Estados para alertas
  const [activeAlerts, setActiveAlerts] = useState<any[]>([])
  
  // Estados do caixa
  const [openCashiers, setOpenCashiers] = useState<Cashier[]>([])
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null)
  const [showOpenCashierModal, setShowOpenCashierModal] = useState(false)
  const [showCloseCashierModal, setShowCloseCashierModal] = useState(false)
  const [showMovementModal, setShowMovementModal] = useState(false)
  const [movementType, setMovementType] = useState<'WITHDRAWAL' | 'SUPPLY'>('WITHDRAWAL')
  const [movementAmount, setMovementAmount] = useState('')
  const [movementDescription, setMovementDescription] = useState('')
  const [initialCash, setInitialCash] = useState('')
  
  // Estados para agendamentos
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(false)

  // Buscar agendamentos recentes
  const fetchRecentAppointments = async () => {
    setLoadingAppointments(true)
    try {
      const response = await fetch('/api/appointments?limit=10&sortBy=createdAt&sortOrder=desc')
      if (response.ok) {
        const data = await response.json()
        setRecentAppointments(data.appointments || [])
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
    } finally {
      setLoadingAppointments(false)
    }
  }

  // Marcar sinal como pago
  const markSignalAsPaid = async (appointmentId: string) => {
    try {
      const appointment = recentAppointments.find(apt => apt._id === appointmentId)
      if (!appointment) return

      // Calcular 30% do valor do serviço
      const signalValue = appointment.totalValue * 0.3

      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signalPaid: true,
          signalValue: signalValue,
          signalPaidAt: new Date().toISOString()
        })
      })

      if (response.ok) {
        // Atualizar a lista local
        setRecentAppointments(prev => 
          prev.map(apt => 
            apt._id === appointmentId 
              ? { 
                  ...apt, 
                  signalPaid: true, 
                  signalValue: signalValue,
                  paymentStatus: 'partial' as const 
                }
              : apt
          )
        )
      } else {
        alert('Erro ao marcar sinal como pago')
      }
    } catch (error) {
      console.error('Erro ao marcar sinal como pago:', error)
      alert('Erro ao marcar sinal como pago')
    }
  }

  // Buscar dados da caixa
  const fetchCashierData = async () => {
    try {
      const response = await fetch(`/api/dashboard/cashier?professionalId=${selectedProfessional}&date=${selectedDate}`)
      if (response.ok) {
        const data = await response.json()
        setCashierData(data)
      }
    } catch (error) {
      console.error('Erro ao buscar dados da caixa:', error)
    }
  }

  // Buscar caixas abertos
  const fetchOpenCashiers = async () => {
    try {
      const response = await fetch('/api/cashier')
      if (response.ok) {
        const data = await response.json()
        setOpenCashiers(data)
      }
    } catch (error) {
      console.error('Erro ao buscar caixas abertos:', error)
    }
  }

  // Abrir novo caixa
  const openCashier = async () => {
    try {
      const response = await fetch('/api/cashier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responsibleId: selectedProfessional,
          initialCash: parseFloat(initialCash) || 0
        })
      })

      if (response.ok) {
        setShowOpenCashierModal(false)
        setInitialCash('')
        fetchOpenCashiers()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao abrir caixa')
      }
    } catch (error) {
      console.error('Erro ao abrir caixa:', error)
      alert('Erro ao abrir caixa')
    }
  }

  // Fechar caixa
  const closeCashier = async () => {
    if (!selectedCashier) return

    try {
      const response = await fetch(`/api/cashier/${selectedCashier._id}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          finalCash: 0, // Será calculado automaticamente
          finalCheck: 0,
          notes: 'Caixa fechado'
        })
      })

      if (response.ok) {
        setShowCloseCashierModal(false)
        setSelectedCashier(null)
        fetchOpenCashiers()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao fechar caixa')
      }
    } catch (error) {
      console.error('Erro ao fechar caixa:', error)
      alert('Erro ao fechar caixa')
    }
  }

  // Adicionar movimentação (sangria/suprimento)
  const addMovement = async () => {
    if (!selectedCashier || !movementAmount || !movementDescription) return

    try {
      const response = await fetch(`/api/cashier/${selectedCashier._id}/movements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: movementType,
          amount: parseFloat(movementAmount),
          description: movementDescription
        })
      })

      if (response.ok) {
        setShowMovementModal(false)
        setMovementAmount('')
        setMovementDescription('')
        fetchOpenCashiers()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao adicionar movimentação')
      }
    } catch (error) {
      console.error('Erro ao adicionar movimentação:', error)
      alert('Erro ao adicionar movimentação')
    }
  }

  // Função para mostrar alerta visual
  const showAlert = (notification: any) => {
    const alertId = Date.now().toString()
    setActiveAlerts(prev => [...prev, { ...notification, alertId }])
    
    // Remover alerta após 5 segundos
    setTimeout(() => {
      setActiveAlerts(prev => prev.filter(alert => alert.alertId !== alertId))
    }, 5000)
  }

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchCashierData(), fetchOpenCashiers(), fetchRecentAppointments()])
      setLoading(false)
    }
    loadData()
  }, [selectedProfessional, selectedDate])

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-4 h-4 text-blue-500" />
      case 'product_reservation':
        return <ShoppingCart className="w-4 h-4 text-green-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D15556]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
        <h1 className="text-3xl font-light text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Painel de controle e caixa do Espaço Guapa</p>
      </div>

          {/* Notificações */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-[#D15556] transition-colors"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Dropdown de Notificações */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">Notificações</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-2">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className="p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-start space-x-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatTime(notification.time)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>Nenhuma notificação</p>
                    </div>
                  )}
                </div>
            </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Caixas em Aberto */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-lg">
        <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-gray-900">Caixas em Aberto</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    fetchOpenCashiers()
                    playNotificationSound()
                  }}
                  className="p-2 text-gray-400 hover:text-[#D15556] transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowOpenCashierModal(true)}
                  className="px-4 py-2 bg-[#D15556] text-white rounded-lg hover:bg-[#c04546] transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Abrir Caixa</span>
                </button>
              </div>
            </div>
      </div>

        <div className="p-6">
            {openCashiers.length > 0 ? (
              <div className="space-y-4">
                {openCashiers.map((cashier) => (
                  <div key={cashier._id} className="border border-gray-200 rounded-lg p-6">
                    {/* Header do Caixa */}
                    <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-[#EED7B6] rounded-full flex items-center justify-center mr-4">
                        <User className="w-6 h-6 text-[#D15556]" />
                      </div>
                      <div>
                          <h3 className="font-medium text-gray-900">{cashier.responsible?.name || 'Profissional'}</h3>
                          <p className="text-sm text-gray-600">{cashier.responsible?.role || 'Profissional'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCashier(cashier)
                            setShowMovementModal(true)
                          }}
                          className="px-3 py-1 text-sm bg-[#EED7B6] text-[#D15556] rounded-lg hover:bg-[#D15556] hover:text-white transition-colors flex items-center space-x-1"
                        >
                          <DollarSign className="w-3 h-3" />
                          <span>Movimentação</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCashier(cashier)
                            setShowCloseCashierModal(true)
                          }}
                          className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors flex items-center space-x-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Fechar Caixa</span>
                        </button>
                      </div>
                    </div>

                    {/* Informações do Caixa */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-sm">
                      <div>
                        <p className="text-gray-800 font-medium">Abertura:</p>
                        <p className="text-gray-900 font-semibold">{new Date(cashier.openedAt).toLocaleString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium">Valor Inicial (Dinheiro):</p>
                        <p className="text-gray-900 font-semibold">R$ {cashier.initialCash.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium">Status:</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Aberto
                        </span>
                      </div>
                    </div>

                    {/* Sangrias e Suprimentos */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Sangrias e Suprimentos</h4>
                      {cashier.movements && cashier.movements.length > 0 ? (
                        <div className="space-y-2">
                          {cashier.movements.map((movement) => (
                            <div key={movement._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                {movement.type === 'WITHDRAWAL' ? (
                                  <Minus className="w-4 h-4 text-red-500" />
                                ) : (
                                  <Plus className="w-4 h-4 text-green-500" />
                                )}
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {movement.type === 'WITHDRAWAL' ? 'Sangria' : 'Suprimento'}
                                  </p>
                                  <p className="text-xs text-gray-800">{movement.description}</p>
                                </div>
                </div>
                          <div className="text-right">
                                <p className={`text-sm font-medium ${
                                  movement.type === 'WITHDRAWAL' ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {movement.type === 'WITHDRAWAL' ? '-' : '+'}R$ {movement.amount.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(movement.createdAt).toLocaleString('pt-BR')}
                                </p>
                        </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-700 text-sm font-medium">Nenhuma movimentação</p>
                      )}
                      </div>

                    {/* Total em Caixa */}
                    <div className="bg-gradient-to-r from-[#EED7B6] to-[#D15556] p-4 rounded-lg text-white">
                      <h4 className="font-medium mb-3">Total em Caixa</h4>
                      
                      {/* Cálculo das movimentações */}
                      {(() => {
                        const totalWithdrawals = cashier.movements?.filter(m => m.type === 'WITHDRAWAL').reduce((sum, m) => sum + m.amount, 0) || 0
                        const totalSupplies = cashier.movements?.filter(m => m.type === 'SUPPLY').reduce((sum, m) => sum + m.amount, 0) || 0
                        const currentCash = cashier.initialCash + totalSupplies - totalWithdrawals
                        
                        return (
                          <>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                              <div>
                                <p className="opacity-90">Dinheiro Inicial:</p>
                                <p className="font-semibold">R$ {cashier.initialCash.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="opacity-90">+ Suprimentos:</p>
                                <p className="font-semibold text-green-200">+R$ {totalSupplies.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="opacity-90">- Sangrias:</p>
                                <p className="font-semibold text-red-200">-R$ {totalWithdrawals.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="opacity-90">Dinheiro Atual:</p>
                                <p className="font-semibold">R$ {currentCash.toFixed(2)}</p>
                              </div>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-white/20">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">TOTAL EM CAIXA:</span>
                                <span className="text-lg font-bold">R$ {currentCash.toFixed(2)}</span>
                              </div>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum caixa aberto</h3>
                <p className="text-gray-600 mb-4">Abra um caixa para começar a trabalhar</p>
                <button
                  onClick={() => setShowOpenCashierModal(true)}
                  className="px-6 py-3 bg-[#D15556] text-white rounded-lg hover:bg-[#c04546] transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  <span>Abrir Primeiro Caixa</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feed de Atividades */}
        <div className="bg-white border border-gray-100 rounded-lg">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-medium text-gray-900">Atividades Recentes</h2>
            <p className="text-sm text-gray-600 mt-1">Últimas movimentações do site</p>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.slice(0, 10).map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTime(notification.time)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma atividade recente</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Novos Agendamentos */}
      <div className="mt-8 bg-white border border-gray-100 rounded-lg">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium text-gray-900">Novos Agendamentos</h2>
              <p className="text-sm text-gray-600 mt-1">Gerencie os pagamentos de sinal</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchRecentAppointments}
                className="p-2 text-gray-400 hover:text-[#D15556] transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <Link 
                href="/admin/agendamentos/novo"
                className="px-4 py-2 bg-[#D15556] text-white rounded-lg hover:bg-[#c04546] transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Agendamento</span>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {loadingAppointments ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D15556]"></div>
            </div>
          ) : recentAppointments.length > 0 ? (
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div key={appointment._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-[#EED7B6] rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-[#D15556]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{appointment.clientName}</h3>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-600">{appointment.clientPhone}</span>
                          </div>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-600">
                              <Calendar className="w-4 h-4 inline mr-1" />
                              {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                            </span>
                            <span className="text-sm text-gray-600">
                              <Scissors className="w-4 h-4 inline mr-1" />
                              {appointment.serviceName}
                            </span>
                            <span className="text-sm text-gray-600">
                              <User className="w-4 h-4 inline mr-1" />
                              {appointment.professionalName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          R$ {appointment.totalValue.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Sinal: R$ {appointment.signalValue ? appointment.signalValue.toFixed(2) : (appointment.totalValue * 0.3).toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {appointment.signalPaid ? (
                          <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            <CheckCircle className="w-4 h-4" />
                            <span>Sinal Pago</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => markSignalAsPaid(appointment._id)}
                            className="flex items-center space-x-1 px-3 py-1 bg-[#D15556] text-white rounded-full text-sm hover:bg-[#c04546] transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Marcar Sinal</span>
                          </button>
                        )}
                        
                        <Link
                          href={`/admin/agendamentos/${appointment._id}`}
                          className="p-2 text-gray-400 hover:text-[#D15556] transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        <strong>Observações:</strong> {appointment.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento recente</h3>
              <p className="text-gray-600 mb-4">Os novos agendamentos aparecerão aqui</p>
              <Link
                href="/admin/agendamentos/novo"
                className="px-6 py-3 bg-[#D15556] text-white rounded-lg hover:bg-[#c04546] transition-colors flex items-center space-x-2 mx-auto w-fit"
              >
                <Plus className="w-5 h-5" />
                <span>Criar Primeiro Agendamento</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Modal - Abrir Caixa */}
      {showOpenCashierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Abrir Caixa</h3>
              <button
                onClick={() => setShowOpenCashierModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profissional Responsável
                </label>
                <select
                  value={selectedProfessional}
                  onChange={(e) => setSelectedProfessional(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent bg-white text-gray-900"
                  style={{ color: '#000000' }}
                >
                  <option value="">Selecionar Profissional</option>
                  {cashierData?.professionals.map((professional) => (
                    <option key={professional.id} value={professional.id}>
                      {professional.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Inicial (Dinheiro)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={initialCash}
                  onChange={(e) => setInitialCash(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent bg-white text-gray-900"
                  style={{ color: '#000000' }}
                  placeholder="0,00"
                />
              </div>
              
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowOpenCashierModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={openCashier}
                disabled={!selectedProfessional}
                className="px-4 py-2 bg-[#D15556] text-white rounded-lg hover:bg-[#c04546] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Abrir Caixa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Fechar Caixa */}
      {showCloseCashierModal && selectedCashier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Fechar Caixa</h3>
              <button
                onClick={() => setShowCloseCashierModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Tem certeza que deseja fechar o caixa de <strong>{selectedCashier.responsible?.name}</strong>?
              </p>
              
              {/* Mostrar cálculo do caixa */}
              {(() => {
                const totalWithdrawals = selectedCashier.movements?.filter(m => m.type === 'WITHDRAWAL').reduce((sum, m) => sum + m.amount, 0) || 0
                const totalSupplies = selectedCashier.movements?.filter(m => m.type === 'SUPPLY').reduce((sum, m) => sum + m.amount, 0) || 0
                const currentCash = selectedCashier.initialCash + totalSupplies - totalWithdrawals
                
                return (
                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <p className="text-sm font-medium text-gray-800 mb-2">Resumo do Caixa:</p>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>Dinheiro Inicial:</span>
                        <span>R$ {selectedCashier.initialCash.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>+ Suprimentos:</span>
                        <span className="text-green-600">+R$ {totalSupplies.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>- Sangrias:</span>
                        <span className="text-red-600">-R$ {totalWithdrawals.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-1">
                        <span>Total Final:</span>
                        <span>R$ {currentCash.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )
              })()}
              
              <p className="text-xs text-gray-500">
                Esta ação não pode ser desfeita.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCloseCashierModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={closeCashier}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Fechar Caixa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Movimentação */}
      {showMovementModal && selectedCashier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Movimentação</h3>
              <button
                onClick={() => setShowMovementModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Tipo de Movimentação
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="WITHDRAWAL"
                      checked={movementType === 'WITHDRAWAL'}
                      onChange={(e) => setMovementType(e.target.value as 'WITHDRAWAL')}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-900">Sangria</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="SUPPLY"
                      checked={movementType === 'SUPPLY'}
                      onChange={(e) => setMovementType(e.target.value as 'SUPPLY')}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-900">Suprimento</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent bg-white text-gray-900"
                  style={{ color: '#000000' }}
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Descrição
                </label>
                <textarea
                  value={movementDescription}
                  onChange={(e) => setMovementDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent bg-white text-gray-900"
                  style={{ color: '#000000' }}
                  rows={3}
                  placeholder="Descreva a movimentação..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowMovementModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={addMovement}
                disabled={!movementAmount || !movementDescription}
                className="px-4 py-2 bg-[#D15556] text-white rounded-lg hover:bg-[#c04546] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alertas de Notificação */}
      {activeAlerts.map((alert) => (
        <NotificationAlert
          key={alert.alertId}
          notification={alert}
          onClose={() => setActiveAlerts(prev => prev.filter(a => a.alertId !== alert.alertId))}
        />
      ))}
    </div>
  )
}
