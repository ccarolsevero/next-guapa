'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  Scissors,
  Palette,
  Sparkles,
  Star,
  Eye,
  Edit,
  Trash,
  Filter,
  Search,
  AlertTriangle,
  Clock3
} from 'lucide-react'
// import { useToast } from '@/contexts/ToastContext'

interface Appointment {
  _id: string
  clientName: string
  clientPhone: string
  clientId: string
  service: string
  professional: string
  professionalId: string
  date: string
  startTime: string
  endTime: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'PENDING' | 'IN_PROGRESS' | 'PAID' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  price: number
  notes?: string
  customLabels?: Array<{
    id: number
    name: string
    color: string
  }>
}

const timeSlots = [
  "08:00", "08:15", "08:30", "08:45", "09:00", "09:15", "09:30", "09:45",
  "10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45",
  "12:00", "12:15", "12:30", "12:45", "13:00", "13:15", "13:30", "13:45",
  "14:00", "14:15", "14:30", "14:45", "15:00", "15:15", "15:30", "15:45",
  "16:00", "16:15", "16:30", "16:45", "17:00", "17:15", "17:30", "17:45",
  "18:00", "18:15", "18:30", "18:45", "19:00"
]

const isLunchTime = (time: string) => {
  return time === '13:00' || time === '13:15' || time === '13:30' || time === '13:45'
}

// Cores para cada profissional
const getProfessionalColor = (professionalName: string) => {
  const colors: Record<string, string> = {
    'Bruna Canovas': 'bg-[#d34d4c] text-white border-[#d34d4c]', // Vermelho terracota
    'Vitória Uliani': 'bg-[#f2dcbc] text-[#022b28] border-[#f2dcbc]', // Bege claro
    'Cicera Canovas': 'bg-[#022b28] text-white border-[#022b28]', // Verde escuro
    'Ellen Souza': 'bg-[#8c5459] text-white border-[#8c5459]' // Rosa acinzentado
  }
  return colors[professionalName] || 'bg-gray-200 text-gray-900 border-gray-400'
}

// Cores baseadas no status (paleta do site)
const getStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    'SCHEDULED': 'bg-green-50 text-[#006D5B] border-green-200', // Agendado - verde claro
    'CONFIRMED': 'bg-green-100 text-[#006D5B] border-green-300', // Confirmado - verde médio
    'PENDING': 'bg-amber-50 text-amber-800 border-amber-200', // Aguardando - amarelo claro
    'PAID': 'bg-red-50 text-[#D15556] border-red-200', // Pago - vermelho claro
    'CANCELLED': 'bg-gray-50 text-gray-700 border-gray-200', // Cancelado - cinza claro
    'NO_SHOW': 'bg-gray-100 text-gray-800 border-gray-300', // Faltou - cinza médio
    'IN_PROGRESS': 'bg-green-100 text-[#006D5B] border-green-300', // Em Atendimento (caso ainda exista)
    'COMPLETED': 'bg-red-100 text-[#D15556] border-red-300' // Finalizado (caso ainda exista)
  }
  return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
}

// Calcular duração em intervalos de 15 minutos
const getDurationInSlots = (startTime: string, endTime: string) => {
  if (!startTime || !endTime) return 1
  try {
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)
    const diffMs = end.getTime() - start.getTime()
    const diffMinutes = diffMs / (1000 * 60)
    return Math.max(1, Math.ceil(diffMinutes / 15)) // Mínimo 1 slot
  } catch (error) {
    return 1
  }
}

// Verificar se um horário está dentro de um agendamento
const isTimeInAppointment = (time: string, appointment: Appointment) => {
  if (!appointment || !appointment.startTime || !appointment.endTime) return false
  const timeMinutes = timeToMinutes(time)
  const startMinutes = timeToMinutes(appointment.startTime)
  const endMinutes = timeToMinutes(appointment.endTime)
  return timeMinutes >= startMinutes && timeMinutes < endMinutes
}

// Converter horário para minutos
const timeToMinutes = (time: string) => {
  if (!time) return 0
  try {
    const [hours, minutes] = time.split(':').map(Number)
    return (hours || 0) * 60 + (minutes || 0)
  } catch (error) {
    return 0
  }
}

const serviceIcons = {
  "Corte Feminino": Scissors,
  "Corte Masculino": Scissors,
  "Coloração": Palette,
  "Hidratação": Sparkles,
  "Maquiagem Social": Star,
  "Barba": Scissors
}

const statusColors = {
  SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200',
  CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
  COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  NO_SHOW: 'bg-yellow-100 text-yellow-800 border-yellow-200'
}

export default function AgendamentosPage() {
  // Toast functions - só disponíveis no cliente
  const showSuccess = (title: string, message?: string) => {
    if (typeof window !== 'undefined') {
      // Usar react-hot-toast diretamente no cliente
      const { toast } = require('react-hot-toast')
      toast.success(message ? `${title}: ${message}` : title)
    }
  }
  
  const showError = (title: string, message?: string) => {
    if (typeof window !== 'undefined') {
      // Usar react-hot-toast diretamente no cliente
      const { toast } = require('react-hot-toast')
      toast.error(message ? `${title}: ${message}` : title)
    }
  }
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [hoveredAppointment, setHoveredAppointment] = useState<Appointment | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'reserva' | 'informacoes'>('reserva')
  const [editingAppointment, setEditingAppointment] = useState<Partial<Appointment>>({})
  const [customLabels, setCustomLabels] = useState([
    { id: 1, name: 'NOVA', color: 'bg-green-200 text-green-800', selected: false },
    { id: 2, name: '100%Pg', color: 'bg-blue-500 text-white', selected: false },
    { id: 3, name: 'R$50', color: 'bg-black text-white', selected: false },
    { id: 4, name: '30%', color: 'bg-pink-500 text-white', selected: false }
  ])
  const [showCustomLabelModal, setShowCustomLabelModal] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('bg-gray-500')
  const [clientData, setClientData] = useState<any>(null)
  const [appointmentServices, setAppointmentServices] = useState<Array<{
    id: string
    service: string
    professional: string
    duration: number
    startTime: string
    endTime: string
    price: number
  }>>([])
  const [availableServices, setAvailableServices] = useState<any[]>([])
  const [existingComanda, setExistingComanda] = useState<any>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all')
  const [showProfessionalDropdown, setShowProfessionalDropdown] = useState(false)

  // Buscar dados da API
  useEffect(() => {
    fetchAppointments()
    fetchProfessionals()
    fetchServices()
  }, [selectedDate, filterStatus])

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfessionalDropdown) {
        const target = event.target as Element
        if (!target.closest('.professional-dropdown')) {
          setShowProfessionalDropdown(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showProfessionalDropdown])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const dateStr = selectedDate.toISOString().split('T')[0]
      const params = new URLSearchParams({
        date: dateStr,
        ...(filterStatus !== 'all' && { status: filterStatus })
      })
      
      const response = await fetch(`/api/appointments?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      } else {
        console.error('Erro ao buscar agendamentos')
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfessionals = async () => {
    try {
      const response = await fetch('/api/professionals')
      if (response.ok) {
        const data = await response.json()
        setProfessionals(data)
      } else {
        console.error('Erro ao buscar profissionais')
      }
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setAvailableServices(data)
      } else {
        console.error('Erro ao buscar serviços')
      }
    } catch (error) {
      console.error('Erro ao buscar serviços:', error)
    }
  }

  const checkExistingComanda = async (appointment: Appointment) => {
    try {
      const response = await fetch(`/api/comandas?clientId=${appointment.clientId}&professionalId=${appointment.professionalId}`)
      if (response.ok) {
        const data = await response.json()
        // Verificar se existe comanda em atendimento para este cliente e profissional
        const activeComanda = data.comandas?.find((comanda: any) => 
          comanda.status === 'em_atendimento' && 
          comanda.clientId._id === appointment.clientId &&
          comanda.professionalId._id === appointment.professionalId
        )
        setExistingComanda(activeComanda || null)
      }
    } catch (error) {
      console.error('Erro ao verificar comanda existente:', error)
      setExistingComanda(null)
    }
  }

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return appointments.filter(apt => apt.date.split('T')[0] === dateStr)
  }

  const getAppointmentsForTimeSlot = (time: string, professionalId?: string) => {
    let appointments = getAppointmentsForDate(selectedDate).filter(apt => apt.startTime === time)
    if (professionalId) {
      appointments = appointments.filter(apt => apt.professionalId === professionalId)
    }
    return appointments
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'short', 
      day: '2-digit',
      month: '2-digit'
    })
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'Agendado'
      case 'CONFIRMED': return 'Confirmado'
      case 'COMPLETED': return 'Concluído'
      case 'CANCELLED': return 'Cancelado'
      case 'NO_SHOW': return 'Não Compareceu'
      default: return status
    }
  }


  const goToToday = () => {
    setSelectedDate(new Date())
  }


  const handleDeleteAppointment = (appointmentId: string) => {
    setAppointmentToDelete(appointmentId)
    setShowDeleteModal(true)
  }

  const confirmDeleteAppointment = async () => {
    if (appointmentToDelete) {
      try {
        const response = await fetch(`/api/appointments/${appointmentToDelete}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setAppointments(prev => prev.filter(apt => apt._id !== appointmentToDelete))
          setShowDeleteModal(false)
          setAppointmentToDelete(null)
        } else {
          console.error('Erro ao excluir agendamento')
        }
      } catch (error) {
        console.error('Erro ao excluir agendamento:', error)
      }
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setAppointmentToDelete(null)
  }

  const handleEditAppointment = async (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setEditingAppointment({
      ...appointment,
      date: appointment.date.split('T')[0], // Converter para formato de input date
    })
    setShowEditModal(true)
    setActiveTab('reserva')
    
    // Buscar dados completos do cliente
    await fetchClientData(appointment.clientPhone)
    
    // Verificar se já existe uma comanda para este agendamento
    await checkExistingComanda(appointment)
    
    // Carregar etiquetas salvas se existirem
    if ((appointment as any).customLabels) {
      const savedLabels = (appointment as any).customLabels
      setCustomLabels(prev => prev.map(label => ({
        ...label,
        selected: savedLabels.some((saved: any) => saved.id === label.id)
      })))
    }
  }

  const fetchClientData = async (phone: string) => {
    try {
      const response = await fetch(`/api/clients?phone=${phone}`)
      if (response.ok) {
        const data = await response.json()
        if (data.length > 0) {
          setClientData(data[0])
        } else {
          setClientData(null)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do cliente:', error)
      setClientData(null)
    }
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setSelectedAppointment(null)
    setEditingAppointment({})
    setClientData(null)
    setActiveTab('reserva')
  }

  const handleSaveAppointment = async () => {
    if (!selectedAppointment) return

    try {
      const selectedLabels = customLabels.filter(label => label.selected)
      console.log('🏷️ Etiquetas selecionadas:', selectedLabels)
      
      const updatedData = {
        ...editingAppointment,
        date: editingAppointment.date ? new Date(editingAppointment.date).toISOString() : selectedAppointment.date,
        customLabels: selectedLabels
      }
      
      console.log('💾 Dados para salvar:', updatedData)

      const response = await fetch(`/api/appointments/${selectedAppointment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        const updatedAppointment = await response.json()
        console.log('✅ Agendamento atualizado:', updatedAppointment)
        
        // Atualizar o selectedAppointment com os dados atualizados
        setSelectedAppointment(updatedAppointment)
        
        // Atualizar editingAppointment para refletir as mudanças nos campos de input
        setEditingAppointment({
          ...updatedAppointment,
          date: updatedAppointment.date.split('T')[0], // Manter formato de input date
        })

        // Re-inicializar customLabels com base nas etiquetas salvas
        setCustomLabels(prev => prev.map(label => ({
          ...label,
          selected: updatedAppointment.customLabels?.some((saved: any) => saved.id === label.id) || false
        })))
        
        // Atualizar a lista de agendamentos
        await fetchAppointments()
        
        // Mostrar toast de sucesso
        showSuccess(
          'Agendamento salvo com sucesso!',
          'As informações da reserva foram atualizadas.'
        )
        
        // Não fechar o modal automaticamente para mostrar as alterações
        console.log('Agendamento atualizado com sucesso!')
      } else {
        const error = await response.json()
        console.error('❌ Erro ao atualizar agendamento:', error)
        
        // Mostrar toast de erro
        showError(
          'Erro ao salvar agendamento',
          error.message || 'Ocorreu um erro inesperado. Tente novamente.'
        )
      }
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error)
      
      // Mostrar toast de erro
      showError(
        'Erro ao salvar agendamento',
        'Ocorreu um erro inesperado. Verifique sua conexão e tente novamente.'
      )
    }
  }

  const handleLabelToggle = (labelId: number) => {
    setCustomLabels(prev => prev.map(label => 
      label.id === labelId ? { ...label, selected: !label.selected } : label
    ))
  }

  // Funções para gerenciar serviços do agendamento
  const addService = () => {
    const newService = {
      id: Date.now().toString(),
      service: '',
      professional: '',
      duration: 60,
      startTime: '',
      endTime: '',
      price: 0
    }
    setAppointmentServices(prev => [...prev, newService])
  }

  const removeService = (serviceId: string) => {
    setAppointmentServices(prev => prev.filter(service => service.id !== serviceId))
  }

  const updateService = (serviceId: string, field: string, value: any) => {
    setAppointmentServices(prev => 
      prev.map(service => 
        service.id === serviceId 
          ? { 
              ...service, 
              [field]: field === 'price' || field === 'duration' ? Number(value) || 0 : value 
            }
          : service
      )
    )
  }

  const calculateEndTime = (startTime: string, duration: number) => {
    if (!startTime) return ''
    try {
      const [hours, minutes] = startTime.split(':').map(Number)
      const startDate = new Date()
      startDate.setHours(hours, minutes, 0, 0)
      const endDate = new Date(startDate.getTime() + duration * 60000)
      return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
    } catch (error) {
      return ''
    }
  }

  const handleOpenComanda = async () => {
    if (!selectedAppointment) return

    try {
      // Preparar dados da comanda baseados no agendamento
      const comandaData = {
        clientId: selectedAppointment.clientId,
        professionalId: selectedAppointment.professionalId,
        status: 'em_atendimento',
        servicos: appointmentServices.map(service => ({
          servicoId: '', // Será preenchido se necessário
          nome: service.service,
          preco: Number(service.price) || 0, // Garantir que é número
          price: Number(service.price) || 0, // Campo adicional para compatibilidade
          quantidade: 1, // Quantidade padrão
          profissional: service.professional,
          duracao: service.duration,
          horarioInicio: service.startTime,
          horarioFim: service.endTime
        })),
        produtos: [],
        observacoes: selectedAppointment.notes || '',
        valorTotal: appointmentServices.reduce((total, service) => total + (Number(service.price) || 0), 0)
      }

      console.log('🔄 Criando comanda com dados:', comandaData)
      console.log('🔍 appointmentServices:', appointmentServices)
      console.log('🔍 selectedAppointment:', selectedAppointment)

      const response = await fetch('/api/comandas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(comandaData),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Comanda criada:', result)
        
        showSuccess(
          'Comanda aberta com sucesso!',
          'A comanda foi criada com os dados do agendamento.'
        )
        
        // Atualizar estado da comanda existente
        setExistingComanda(result.comanda)
        
        // Fechar modal e atualizar lista
        setSelectedAppointment(null)
        fetchAppointments()
      } else {
        const error = await response.json()
        console.error('❌ Erro ao criar comanda:', error)
        showError(
          'Erro ao abrir comanda',
          error.message || 'Ocorreu um erro inesperado. Tente novamente.'
        )
      }
    } catch (error) {
      console.error('❌ Erro ao abrir comanda:', error)
      showError(
        'Erro ao abrir comanda',
        'Ocorreu um erro inesperado. Verifique sua conexão e tente novamente.'
      )
    }
  }

  // Inicializar serviços quando um agendamento é selecionado
  useEffect(() => {
    if (selectedAppointment) {
      // Inicializar com o serviço atual do agendamento
      const initialService = {
        id: '1',
        service: selectedAppointment.service,
        professional: selectedAppointment.professional,
        duration: 60, // Valor padrão
        startTime: selectedAppointment.startTime,
        endTime: selectedAppointment.endTime,
        price: Number(selectedAppointment.price) || 0 // Garantir que é número
      }
      setAppointmentServices([initialService])
    } else {
      setAppointmentServices([])
    }
  }, [selectedAppointment])

  const handleCreateCustomLabel = () => {
    if (newLabelName.trim()) {
      const newLabel = {
        id: Date.now(),
        name: newLabelName.trim(),
        color: newLabelColor,
        selected: false
      }
      setCustomLabels(prev => [...prev, newLabel])
      setNewLabelName('')
      setNewLabelColor('bg-gray-500')
      setShowCustomLabelModal(false)
    }
  }

  const colorOptions = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-gray-500',
    'bg-red-200 text-red-800', 'bg-blue-200 text-blue-800', 'bg-green-200 text-green-800',
    'bg-yellow-200 text-yellow-800', 'bg-purple-200 text-purple-800', 'bg-pink-200 text-pink-800'
  ]

  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(selectedDate)
    
    if (!professionals || professionals.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Carregando profissionais...</p>
        </div>
      )
    }

    // Filtrar profissionais baseado na seleção (mobile)
    const displayProfessionals = selectedProfessional === 'all' 
      ? professionals 
      : professionals.filter(prof => prof._id === selectedProfessional)
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden relative">
        {/* Header com botões - Desktop */}
        <div className="hidden lg:block border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-[#D15556] text-white rounded-lg hover:bg-[#c04546] transition-colors text-sm font-medium"
              >
                Hoje
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                Bloquear Horário
              </button>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {formatDate(selectedDate)}
            </h3>
          </div>
        </div>

        {/* Header Mobile - Mais compacto */}
        <div className="lg:hidden border-b border-gray-200 p-3 relative overflow-visible">
          <div className="text-center mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              {formatDate(selectedDate)}
            </h3>
          </div>
          
          {/* Seletor de Profissional (Mobile) */}
          <div className="relative professional-dropdown">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Selecionar Profissional:
            </label>
            <button
              onClick={() => setShowProfessionalDropdown(!showProfessionalDropdown)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent bg-white text-gray-900 text-sm text-left flex items-center justify-between"
              style={{ color: '#000000' }}
            >
              <span>
                {selectedProfessional === 'all' 
                  ? 'Todos os Profissionais' 
                  : professionals.find(p => p._id === selectedProfessional)?.name || 'Selecionar'
                }
              </span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Customizado */}
            {showProfessionalDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedProfessional('all')
                    setShowProfessionalDropdown(false)
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center ${
                    selectedProfessional === 'all' ? 'bg-gray-100 text-[#D15556]' : 'text-gray-900'
                  }`}
                >
                  <span className="flex-1">Todos os Profissionais</span>
                  {selectedProfessional === 'all' && (
                    <svg className="w-4 h-4 text-[#D15556]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                {professionals.map((professional) => (
                  <button
                    key={professional._id}
                    onClick={() => {
                      setSelectedProfessional(professional._id)
                      setShowProfessionalDropdown(false)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center ${
                      selectedProfessional === professional._id ? 'bg-gray-100 text-[#D15556]' : 'text-gray-900'
                    }`}
                  >
                    <span className="flex-1">{professional.name}</span>
                    {selectedProfessional === professional._id && (
                      <svg className="w-4 h-4 text-[#D15556]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cabeçalho dos Profissionais (Desktop) */}
        <div className="hidden lg:block border-b border-gray-200">
          <div className={`grid gap-1 p-2`} style={{ gridTemplateColumns: `120px repeat(${professionals.length}, 1fr)` }}>
            <div className="text-sm font-medium text-gray-900 p-2 flex items-center justify-center">Horário</div>
            {professionals.map((professional) => (
              <div key={professional._id} className="text-center p-2">
                <div className={`flex flex-col items-center p-3 rounded-lg shadow-sm ${
                  professional.name === 'Bruna Canovas' ? 'bg-[#d34d4c] text-white' :
                  professional.name === 'Vitória Uliani' ? 'bg-[#f2dcbc] text-[#022b28]' :
                  professional.name === 'Cicera Canovas' ? 'bg-[#022b28] text-white' :
                  professional.name === 'Ellen Souza' ? 'bg-[#8c5459] text-white' :
                  'bg-gray-600 text-white'
                }`}>
                  {/* Foto do profissional */}
                  <div className="w-8 h-8 rounded-full bg-white/20 mb-2 flex items-center justify-center overflow-hidden">
                    {professional.name === 'Bruna Canovas' ? (
                      <img src="/assents/fotobruna.jpeg" alt="Bruna" className="w-full h-full object-cover" />
                    ) : professional.name === 'Cicera Canovas' ? (
                      <img src="/assents/ciceraperfil.jpeg" alt="Cicera" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/30 flex items-center justify-center text-xs font-bold">
                        {professional.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-medium text-center leading-tight">
                    {professional.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grade de horários usando CSS Grid */}
        <div className="overflow-y-auto max-h-[600px] lg:max-h-[600px]">
          {/* Desktop: Grade completa */}
          <div 
            className="hidden lg:grid gap-1 p-1"
            style={{ 
              gridTemplateColumns: `120px repeat(${professionals.length}, 1fr)`,
              gridTemplateRows: `repeat(${timeSlots.length}, 40px)`
            }}
          >
            {/* Cabeçalho dos horários */}
            {timeSlots.map((time, index) => (
              <div 
                key={`time-${time}`} 
                className="flex items-center justify-center p-2 border-b border-gray-100"
                style={{ gridRow: index + 1, gridColumn: 1 }}
              >
                <div className="text-sm font-medium text-gray-900">{time}</div>
              </div>
            ))}
            
            {/* Blocos de almoço */}
            {professionals.map((professional, profIndex) => {
              const lunchStartIndex = timeSlots.findIndex(time => time === '13:00')
              if (lunchStartIndex === -1) return null
              
              return (
                <div
                  key={`lunch-${professional._id}`}
                  className="bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-300 rounded-lg p-3 text-center flex items-center justify-center shadow-sm"
                  style={{
                    gridRow: `${lunchStartIndex + 2} / span 4`, // +2 porque row 1 é o header
                    gridColumn: profIndex + 2
                  }}
                >
                  <div className="text-sm text-orange-800 font-bold">🍽️ Almoço</div>
                </div>
              )
            })}
            
            {/* Agendamentos */}
            {dayAppointments.map((appointment) => {
              const startIndex = timeSlots.findIndex(time => time === appointment.startTime)
              const durationSlots = getDurationInSlots(appointment.startTime, appointment.endTime)
              const professionalIndex = professionals.findIndex(prof => prof._id === appointment.professionalId)
              
              if (startIndex === -1 || professionalIndex === -1) return null
              
              return (
                <div
                  key={appointment._id}
                  className={`p-3 rounded-lg border-2 shadow-md cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${getStatusColor(appointment.status)}`}
                  style={{
                    gridRow: `${startIndex + 2} / span ${durationSlots}`, // +2 porque row 1 é o header
                    gridColumn: professionalIndex + 2
                  }}
                  onClick={() => handleEditAppointment(appointment)}
                  onMouseEnter={(e) => {
                    setHoveredAppointment(appointment)
                    setTooltipPosition({ x: e.clientX, y: e.clientY })
                  }}
                  onMouseLeave={() => setHoveredAppointment(null)}
                >
                  <div className="space-y-1 h-full flex flex-col justify-between">
                    <div className="text-xs font-bold opacity-90">
                      {appointment.startTime}
                    </div>
                    <div className="text-xs truncate leading-tight opacity-90">
                      {appointment.service}
                    </div>
                    {/* Etiquetas selecionadas */}
                    {appointment.customLabels && appointment.customLabels.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {appointment.customLabels.map((label: any) => (
                          <span
                            key={label.id}
                            className={`px-1.5 py-0.5 rounded text-xs font-medium ${label.color} opacity-90`}
                          >
                            {label.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-xs truncate leading-tight opacity-90 font-medium">
                      {appointment.clientName}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile: Lista vertical com uma coluna */}
          <div className="lg:hidden">
            {displayProfessionals.map((professional) => (
              <div key={professional._id} className="mb-4">
                {/* Cabeçalho do profissional no mobile - mais compacto */}
                <div className="bg-gray-50 p-2 border-b border-gray-200 sticky top-0 z-10">
                  <div className={`flex items-center p-2 rounded-lg shadow-sm ${
                    professional.name === 'Bruna Canovas' ? 'bg-[#d34d4c] text-white' :
                    professional.name === 'Vitória Uliani' ? 'bg-[#f2dcbc] text-[#022b28]' :
                    professional.name === 'Cicera Canovas' ? 'bg-[#022b28] text-white' :
                    professional.name === 'Ellen Souza' ? 'bg-[#8c5459] text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {/* Foto do profissional */}
                    <div className="w-8 h-8 rounded-full bg-white/20 mr-2 flex items-center justify-center overflow-hidden">
                      {professional.name === 'Bruna Canovas' ? (
                        <img src="/assents/fotobruna.jpeg" alt="Bruna" className="w-full h-full object-cover" />
                      ) : professional.name === 'Cicera Canovas' ? (
                        <img src="/assents/ciceraperfil.jpeg" alt="Cicera" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/30 flex items-center justify-center text-xs font-bold">
                          {professional.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-medium">
                      {professional.name}
                    </div>
                  </div>
                </div>

                {/* Lista de horários para este profissional - com scroll e altura proporcional */}
                <div className="p-2 max-h-[400px] overflow-y-auto">
                  <div className="space-y-0">
                    {timeSlots.map((time, index) => {
                      const appointmentsAtTime = dayAppointments.filter(apt => 
                        apt.startTime === time && apt.professionalId === professional._id
                      )
                      
                      // Verificar se é horário de almoço - só renderizar no primeiro horário
                      if (isLunchTime(time) && time === '13:00') {
                        return (
                          <div
                            key={`lunch-${professional._id}`}
                            className="bg-gradient-to-br from-orange-100 to-orange-200 border border-orange-300 rounded-lg p-2 text-center flex items-center justify-center shadow-sm mb-1"
                            style={{ height: '240px' }} // 4 slots de 15min = 240px
                          >
                            <div className="text-sm text-orange-800 font-bold">🍽️ Almoço</div>
                          </div>
                        )
                      }
                      
                      // Pular os outros horários de almoço (13:15, 13:30, 13:45) pois já foram renderizados no bloco único
                      if (isLunchTime(time) && time !== '13:00') {
                        return null
                      }

                      if (appointmentsAtTime.length === 0) {
                        return (
                          <div
                            key={`empty-${time}-${professional._id}`}
                            className="h-15 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs mb-1"
                            style={{ height: '60px' }}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{time}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-gray-300">Livre</span>
                            </div>
                          </div>
                        )
                      }

                      return appointmentsAtTime.map((appointment) => {
                        const durationSlots = getDurationInSlots(appointment.startTime, appointment.endTime)
                        const heightInPx = Math.max(60, durationSlots * 60) // 60px por slot de 15min
                        
                        return (
                          <div
                            key={appointment._id}
                            className={`p-2 rounded-lg border shadow-md cursor-pointer transition-all hover:shadow-lg mb-1 ${getStatusColor(appointment.status)}`}
                            style={{ height: `${heightInPx}px` }}
                            onClick={() => handleEditAppointment(appointment)}
                          >
                            <div className="h-full flex flex-col justify-between">
                              <div className="flex items-center justify-between">
                                <div className="text-xs font-bold opacity-90">
                                  {appointment.startTime}
                                </div>
                                <div className="text-xs font-bold opacity-90">
                                  {appointment.endTime}
                                </div>
                              </div>
                              
                              <div className="flex-1 flex flex-col justify-center">
                                <div className="text-sm font-medium opacity-90 mb-1">
                                  {appointment.service}
                                </div>
                                
                                {/* Etiquetas selecionadas */}
                                {appointment.customLabels && appointment.customLabels.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-1">
                                    {appointment.customLabels.map((label: any) => (
                                      <span
                                        key={label.id}
                                        className={`px-1 py-0.5 rounded text-xs font-medium ${label.color} opacity-90`}
                                      >
                                        {label.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                
                                <div className="text-sm font-medium opacity-90">
                                  {appointment.clientName}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {hoveredAppointment && (
          <div
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm"
            style={{
              left: `${tooltipPosition.x + 10}px`,
              top: `${tooltipPosition.y - 10}px`,
              pointerEvents: 'none',
              transform: 'translateY(-100%)'
            }}
          >
            {/* Cabeçalho com data/hora e nome */}
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-900">
                {showEditModal && editingAppointment.date 
                  ? new Date(editingAppointment.date).toLocaleDateString('pt-BR') 
                  : new Date(hoveredAppointment.date).toLocaleDateString('pt-BR')
                } às {showEditModal && editingAppointment.startTime 
                  ? editingAppointment.startTime 
                  : hoveredAppointment.startTime
                }
              </div>
              <div className="text-lg font-semibold text-gray-900 mt-1">
                {hoveredAppointment.clientName}
              </div>
            </div>

            {/* Informações do agendamento */}
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">Profissional:</span> {hoveredAppointment.professional}
              </div>
              <div>
                <span className="font-medium">Serviço:</span> {hoveredAppointment.service}
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">Status:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[hoveredAppointment.status]}`}>
                  {getStatusText(hoveredAppointment.status)}
                </span>
              </div>
              {hoveredAppointment.customLabels && hoveredAppointment.customLabels.length > 0 && (
                <div>
                  <span className="font-medium">Etiquetas:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {hoveredAppointment.customLabels.map((label: any) => (
                      <span
                        key={label.id}
                        className={`px-2 py-1 rounded text-xs font-medium ${label.color}`}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {hoveredAppointment.notes && (
                <div>
                  <span className="font-medium">Obs:</span>
                  <div className="mt-1 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    {hoveredAppointment.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Seta apontando para baixo */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200"></div>
            </div>
          </div>
        )}
      </div>
    )
  }


  const renderSideCalendar = () => {
    const today = new Date()
    const currentMonth = selectedDate.getMonth()
    const currentYear = selectedDate.getFullYear()
    
    // Primeiro dia do mês
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    
    // Dias do mês anterior para completar a primeira semana
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const calendarDays = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      calendarDays.push(date)
    }
    
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex space-x-1">
            <button
              onClick={() => {
                const newDate = new Date(selectedDate)
                newDate.setMonth(newDate.getMonth() - 1)
                setSelectedDate(newDate)
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const newDate = new Date(selectedDate)
                newDate.setMonth(newDate.getMonth() + 1)
                setSelectedDate(newDate)
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
            <div key={index} className="text-center text-xs font-medium text-gray-500 p-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Dias do calendário */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const dayAppointments = getAppointmentsForDate(date)
            const isCurrentMonth = date.getMonth() === currentMonth
            const isToday = date.toDateString() === today.toDateString()
            const isSelected = date.toDateString() === selectedDate.toDateString()
            
            return (
              <button
                key={index}
                onClick={() => {
                  setSelectedDate(date)
                  setViewMode('day')
                }}
                className={`h-8 w-8 text-xs rounded transition-colors ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                } ${
                  isToday ? 'bg-[#D15556] text-white font-semibold' : 
                  isSelected ? 'bg-[#006D5B] text-white font-semibold' :
                  'hover:bg-gray-100'
                } ${
                  dayAppointments.length > 0 && !isToday && !isSelected ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
        
        {/* Legenda */}
        <div className="mt-4 space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#D15556] rounded"></div>
            <span>Hoje</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#006D5B] rounded"></div>
            <span>Selecionado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
            <span>Com agendamentos</span>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-[#F5F0E8] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#006D5B]">Agenda</h1>
            <p className="mt-2 text-sm text-gray-700">
              Gerencie todos os agendamentos do salão
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/admin/agendamentos/novo"
              className="bg-[#D15556] text-white px-4 py-2 rounded-lg hover:bg-[#c04546] transition-colors flex items-center justify-center w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Link>
          </div>
        </div>

        {/* Controles da Agenda */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Seletor de Data - Sempre visível */}
              <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Selecionar Data:
                  </label>
                  <input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent bg-white text-gray-900"
                    style={{ color: '#000000' }}
                  />
                </div>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 bg-[#D15556] text-white rounded-lg hover:bg-[#c04546] transition-colors text-sm font-medium"
                >
                  Hoje
                </button>
              </div>

              {/* Modo de Visualização - Oculto em telas muito pequenas */}
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('day')}
                  className="p-2 rounded-lg transition-colors bg-[#D15556] text-white"
                  title="Vista Diária"
                >
                  <Clock3 className="w-4 h-4" />
                </button>
              </div>

              {/* Filtros - Simplificados em mobile */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Busca - Sempre visível */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
                    style={{ color: '#000000' }}
                  />
                </div>
                
                {/* Status - Oculto em telas muito pequenas */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="hidden sm:block px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
                >
                  <option value="all">Todos os Status</option>
                  <option value="SCHEDULED">Agendado</option>
                  <option value="CONFIRMED">Confirmado</option>
                  <option value="COMPLETED">Concluído</option>
                  <option value="CANCELLED">Cancelado</option>
                  <option value="NO_SHOW">Não Compareceu</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D15556]"></div>
          </div>
        )}

        {/* Agenda */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Calendário Lateral - Oculto no mobile */}
            <div className="hidden lg:block lg:col-span-1">
              {renderSideCalendar()}
            </div>
            
            {/* Agenda Principal */}
            <div className="lg:col-span-3">
              {renderDayView()}
            </div>
          </div>
        )}

        {/* Resumo do Dia - Apenas Desktop */}
        <div className="hidden lg:block mt-6">
          <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${professionals.length + 1}, 1fr)` }}>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Agendamentos</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {getAppointmentsForDate(selectedDate).length}
                  </p>
                </div>
              </div>
            </div>

            {professionals.map((professional) => {
              const professionalAppointments = getAppointmentsForDate(selectedDate).filter(apt => apt.professionalId === professional._id)
              return (
                <div key={professional._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#D15556] text-white">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Profissional</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {professionalAppointments.length}
                      </p>
                      <p className="text-xs text-gray-500">
                        R$ {professionalAppointments.reduce((sum, apt) => sum + apt.price, 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Modal de Confirmação de Exclusão */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Confirmar Exclusão
                    </h3>
                    <p className="text-sm text-gray-600">
                      Tem certeza que deseja excluir este agendamento?
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Esta ação não pode ser desfeita. O agendamento será removido permanentemente.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDeleteAppointment}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição de Agendamento */}
        {showEditModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden mx-2 sm:mx-4">
              {/* Header do Modal */}
              <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab('reserva')}
                    className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      activeTab === 'reserva'
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Reserva
                  </button>
                  <button
                    onClick={() => setActiveTab('informacoes')}
                    className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      activeTab === 'informacoes'
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Informações
                  </button>
                </div>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(95vh-100px)] sm:max-h-[calc(90vh-120px)]">
                {activeTab === 'reserva' ? (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Informações do Cliente */}
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                        <div className="flex-1">
                          <div className="text-xs sm:text-sm text-gray-600 mb-2">
                            <span className="font-medium">Cliente:</span>{' '}
                            <Link 
                              href={`/admin/clientes/${clientData?._id || 'novo'}`}
                              className="text-blue-600 underline hover:text-blue-800 transition-colors"
                            >
                              {clientData?.name || selectedAppointment.clientName}
                            </Link>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 mb-2">
                            <span className="font-medium">Celular:</span>{' '}
                            <a 
                              href={`https://wa.me/55${selectedAppointment.clientPhone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800 transition-colors"
                            >
                              {selectedAppointment.clientPhone}
                            </a>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {existingComanda ? (
                            <Link
                              href={`/admin/comandas/${existingComanda._id}`}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
                            >
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>Ver Comanda</span>
                            </Link>
                          ) : (
                            <button
                              onClick={handleOpenComanda}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
                            >
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              <span>Abrir Comanda</span>
                            </button>
                          )}
                        </div>
                      </div>
                      {clientData?.birthDate && (
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Data de Nascimento:</span>{' '}
                          <span>{new Date(clientData.birthDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                      {clientData?.createdAt && (
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Cliente desde:</span>{' '}
                          <span>{new Date(clientData.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                      {selectedAppointment.notes && (
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Observações:</span>
                          <div className="mt-1 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                            {selectedAppointment.notes}
                          </div>
                        </div>
                      )}
                      {selectedAppointment.customLabels && selectedAppointment.customLabels.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Etiquetas:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedAppointment.customLabels.map((label: any) => (
                              <span
                                key={label.id}
                                className={`px-2 py-1 rounded text-xs font-medium ${label.color}`}
                              >
                                {label.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Data */}
                    <div className="flex items-center space-x-4">
                      <label className="text-sm font-medium text-gray-700">Data:</label>
                      <input
                        type="date"
                        value={editingAppointment.date || selectedAppointment.date.split('T')[0]}
                        onChange={(e) => setEditingAppointment({...editingAppointment, date: e.target.value})}
                        className="px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium"
                      />
                      <button className="text-blue-600 underline text-sm">Recorrência...</button>
                      <button 
                        onClick={() => {
                          const phoneNumber = selectedAppointment.clientPhone.replace(/\D/g, '') // Remove caracteres não numéricos
                          const whatsappUrl = `https://wa.me/55${phoneNumber}`
                          window.open(whatsappUrl, '_blank')
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                        <span>Enviar WhatsApp</span>
                      </button>
                    </div>

                    {/* Tabela de Serviços */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[500px] sm:min-w-[600px]">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serviço</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profissional</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tempo</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Início</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fim</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor (R$)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointmentServices.map((service, index) => (
                            <tr key={service.id}>
                              <td className="px-4 py-3">
                                <select 
                                  value={service.service}
                                  onChange={(e) => {
                                    const selectedService = availableServices.find(s => s.name === e.target.value)
                                    updateService(service.id, 'service', e.target.value)
                                    if (selectedService) {
                                      updateService(service.id, 'price', selectedService.price)
                                      updateService(service.id, 'duration', selectedService.duration)
                                    }
                                  }}
                                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium"
                                >
                                  <option value="">Selecione um serviço</option>
                                  {availableServices.map((s) => (
                                    <option key={s._id} value={s.name}>
                                      {s.name} - R$ {s.price.toFixed(2)}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <select 
                                  value={service.professional}
                                  onChange={(e) => updateService(service.id, 'professional', e.target.value)}
                                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium"
                                >
                                  <option value="">Selecione um profissional</option>
                                  {professionals.map((prof) => (
                                    <option key={prof._id} value={prof.name}>
                                      {prof.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  value={service.duration}
                                  onChange={(e) => {
                                    const duration = parseInt(e.target.value) || 0
                                    updateService(service.id, 'duration', duration)
                                    if (service.startTime) {
                                      const endTime = calculateEndTime(service.startTime, duration)
                                      updateService(service.id, 'endTime', endTime)
                                    }
                                  }}
                                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="time"
                                  value={service.startTime}
                                  onChange={(e) => {
                                    updateService(service.id, 'startTime', e.target.value)
                                    if (service.duration) {
                                      const endTime = calculateEndTime(e.target.value, service.duration)
                                      updateService(service.id, 'endTime', endTime)
                                    }
                                  }}
                                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="time"
                                  value={service.endTime}
                                  onChange={(e) => updateService(service.id, 'endTime', e.target.value)}
                                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={service.price}
                                  onChange={(e) => updateService(service.id, 'price', parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium"
                                />
                              </td>
                              <td className="px-4 py-3">
                                {appointmentServices.length > 1 && (
                                  <button
                                    onClick={() => removeService(service.id)}
                                    className="text-red-600 hover:text-red-800 p-1"
                                    title="Remover serviço"
                                  >
                                    <Trash className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button 
                        onClick={addService}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar serviço</span>
                      </button>
                      <label className="flex items-center text-sm text-gray-600">
                        <input type="checkbox" className="mr-2" />
                        Forçar Encaixe
                      </label>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-3 block">Status:</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'Agendado', value: 'SCHEDULED', color: 'bg-teal-100 text-teal-800' },
                          { label: 'Confirmado', value: 'CONFIRMED', color: 'bg-blue-100 text-blue-800' },
                          { label: 'Aguardando', value: 'PENDING', color: 'bg-yellow-100 text-yellow-800' },
                          { label: 'Pago', value: 'PAID', color: 'bg-red-100 text-red-800' },
                          { label: 'Cancelado', value: 'CANCELLED', color: 'bg-gray-100 text-gray-800' },
                          { label: 'Faltou', value: 'NO_SHOW', color: 'bg-gray-200 text-gray-900' }
                        ].map((status) => (
                          <label
                            key={status.value}
                            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${status.color} ${
                              (editingAppointment.status || selectedAppointment.status) === status.value ? 'ring-2 ring-gray-400' : ''
                            }`}
                          >
                            <input
                              type="radio"
                              name="status"
                              value={status.value}
                              checked={(editingAppointment.status || selectedAppointment.status) === status.value}
                              onChange={(e) => setEditingAppointment({...editingAppointment, status: e.target.value})}
                              className="sr-only"
                            />
                            {status.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Etiquetas Customizadas */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-3 block">Etiqueta Customizada:</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {customLabels.map((label) => (
                          <label key={label.id} className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={label.selected}
                              onChange={() => handleLabelToggle(label.id)}
                              className="sr-only"
                            />
                            <div className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                              label.selected 
                                ? label.color + ' ring-2 ring-offset-2 ring-purple-500' 
                                : label.color + ' opacity-50 hover:opacity-75'
                            }`}>
                              <div className={`w-3 h-3 rounded-full ${
                                label.selected ? 'bg-white' : 'bg-gray-400'
                              }`}></div>
                              <span>{label.name}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                      <button
                        onClick={() => setShowCustomLabelModal(true)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        + Editar etiqueta customizada
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Auditoria */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Auditoria</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Data de Criação:</span> {new Date(selectedAppointment.createdAt).toLocaleString('pt-BR')}
                        </div>
                        <div>
                          <span className="font-medium">Última Atualização:</span> {new Date(selectedAppointment.updatedAt).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>

                    {/* Etiquetas */}
                    {selectedAppointment.customLabels && selectedAppointment.customLabels.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Etiquetas</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedAppointment.customLabels.map((label: any) => (
                            <span
                              key={label.id}
                              className={`px-3 py-1 rounded-full text-sm font-medium ${label.color}`}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Observações */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Observações</h3>
                      <textarea
                        rows={6}
                        placeholder="Adicione observações sobre este agendamento..."
                        className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium resize-none"
                        value={editingAppointment.notes || selectedAppointment.notes || ''}
                        onChange={(e) => setEditingAppointment(prev => ({ ...prev, notes: e.target.value }))}
                      />
                      <div className="text-right text-sm text-gray-500 mt-1">
                        {(editingAppointment.notes || selectedAppointment.notes || '').length}/255
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer do Modal */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-3 sm:p-6 pb-4 sm:pb-8 border-t border-gray-200">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveAppointment}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Etiquetas Customizadas */}
        {showCustomLabelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
              <div className="p-4 sm:p-6 pb-6 sm:pb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Criar Nova Etiqueta</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Etiqueta
                    </label>
                    <input
                      type="text"
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      placeholder="Ex: VIP, Desconto, etc."
                      className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:border-purple-500 focus:outline-none bg-white text-gray-900 font-medium"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cor
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewLabelColor(color)}
                          className={`w-8 h-8 rounded-full ${color} ${
                            newLabelColor === color ? 'ring-2 ring-offset-2 ring-purple-500' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6 mb-4">
                  <button
                    onClick={() => setShowCustomLabelModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateCustomLabel}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Criar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}