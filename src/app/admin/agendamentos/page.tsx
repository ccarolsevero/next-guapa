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
  Grid3X3,
  CalendarDays,
  Clock3
} from 'lucide-react'

interface Appointment {
  _id: string
  clientName: string
  service: string
  professional: string
  professionalId: string
  date: string
  startTime: string
  endTime: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  price: number
  notes?: string
}

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"
]

const isLunchTime = (time: string) => {
  return time === '13:00' || time === '13:30'
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
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Buscar dados da API
  useEffect(() => {
    fetchAppointments()
    fetchProfessionals()
  }, [selectedDate, filterStatus])

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

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const getWeekDates = () => {
    const dates = []
    const startOfWeek = new Date(selectedDate)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const getMonthDates = () => {
    const dates = []
    const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
    
    // Adicionar dias do mês anterior para completar a primeira semana
    const startOfWeek = new Date(startOfMonth)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    
    for (let i = 0; i < 42; i++) { // 6 semanas x 7 dias
      const date = new Date(startOfWeek)
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    return dates
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

  const renderDayView = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="border-b border-gray-200">
        <div className="px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Agenda do Dia</h3>
          <p className="text-sm text-gray-600">
            {getAppointmentsForDate(selectedDate).length} agendamentos para hoje
          </p>
        </div>
      </div>

      {/* Cabeçalho dos Profissionais */}
      <div className="border-b border-gray-200">
        <div className={`grid gap-4 p-4 bg-gray-50`} style={{ gridTemplateColumns: `200px repeat(${professionals.length}, 1fr)` }}>
          <div className="text-sm font-medium text-gray-900">Horário</div>
          {professionals.map((professional) => (
            <div key={professional._id} className="text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#D15556] text-white">
                {professional.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aviso de Horário de Almoço */}
      <div className="bg-orange-50 border-b border-orange-200">
        <div className="px-6 py-2">
          <div className="flex items-center justify-center text-sm text-orange-800">
            <span className="mr-2">🍽️</span>
            <span className="font-medium">Horário de Almoço: 13:00 - 14:00</span>
            <span className="ml-2">🍽️</span>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[600px]">
        <div className="grid grid-cols-1">
          {timeSlots.map((time) => (
            <div key={time} className="border-b border-gray-100">
              <div className={`grid gap-4 p-4`} style={{ gridTemplateColumns: `200px repeat(${professionals.length}, 1fr)` }}>
                {/* Horário */}
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-900">{time}</div>
                </div>
                
                {/* Colunas dos Profissionais */}
                {professionals.map((professional) => {
                  const appointments = getAppointmentsForTimeSlot(time, professional._id)
                  const hasAppointments = appointments.length > 0
                  
                  return (
                    <div key={professional._id} className={`min-h-[60px] ${hasAppointments ? 'bg-pink-50' : ''}`}>
                      {isLunchTime(time) ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="bg-orange-100 border border-orange-200 rounded-lg p-2 text-center">
                            <div className="text-xs font-medium text-orange-800">🍽️ Almoço</div>
                            <div className="text-xs text-orange-600">13:00 - 14:00</div>
                          </div>
                        </div>
                      ) : hasAppointments ? (
                        <div className="space-y-2">
                          {appointments.map((appointment) => {
                            const IconComponent = serviceIcons[appointment.service as keyof typeof serviceIcons] || Scissors
                            return (
                              <div
                                key={appointment._id}
                                className={`p-2 rounded-lg border ${statusColors[appointment.status]} shadow-sm`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-start justify-between">
                                    <IconComponent className="w-4 h-4 mt-0.5 text-pink-600 flex-shrink-0" />
                                    <div className="flex space-x-1 ml-1">
                                      <Link
                                        href={`/admin/agendamentos/${appointment._id}`}
                                        className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                        title="Ver detalhes"
                                      >
                                        <Eye className="w-3 h-3" />
                                      </Link>
                                      <Link
                                        href={`/admin/agendamentos/${appointment._id}/editar`}
                                        className="p-1 text-green-600 hover:text-green-800 transition-colors"
                                        title="Editar agendamento"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </Link>
                                      <button 
                                        onClick={() => handleDeleteAppointment(appointment._id)}
                                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                        title="Excluir agendamento"
                                      >
                                        <Trash className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="text-xs font-medium text-gray-900 truncate">
                                    {appointment.clientName}
                                  </div>
                                  <div className="text-xs text-gray-600 truncate">
                                    {appointment.service}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {appointment.startTime} - {appointment.endTime}
                                  </div>
                                  <div className="text-xs font-medium text-gray-900">
                                    R$ {appointment.price.toFixed(2)}
                                  </div>
                                  <span className={`inline-block px-1 py-0.5 text-xs rounded-full ${statusColors[appointment.status]}`}>
                                    {getStatusText(appointment.status)}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic h-full flex items-center justify-center">
                          Disponível
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderWeekView = () => {
    const weekDates = getWeekDates()
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Vista Semanal</h3>
            <p className="text-sm text-gray-600">
              {weekDates[0].toLocaleDateString('pt-BR')} - {weekDates[6].toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Cabeçalho dos Dias */}
        <div className="border-b border-gray-200">
          <div className="grid grid-cols-8 gap-4 p-4 bg-gray-50">
            <div className="text-sm font-medium text-gray-900">Horário</div>
            {weekDates.map((date, index) => (
              <div key={index} className="text-center">
                <div className={`text-sm font-medium ${date.toDateString() === new Date().toDateString() ? 'text-pink-600' : 'text-gray-900'}`}>
                  {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </div>
                <div className={`text-xs ${date.toDateString() === new Date().toDateString() ? 'text-pink-600' : 'text-gray-600'}`}>
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto max-h-[600px]">
          <div className="grid grid-cols-1">
            {timeSlots.map((time) => (
              <div key={time} className="border-b border-gray-100">
                <div className="grid grid-cols-8 gap-4 p-4">
                  {/* Horário */}
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">{time}</div>
                  </div>
                  
                  {/* Colunas dos Dias */}
                  {weekDates.map((date, dateIndex) => {
                    const dayAppointments = getAppointmentsForDate(date).filter(apt => apt.startTime === time)
                    const isToday = date.toDateString() === new Date().toDateString()
                    const isLunch = isLunchTime(time)
                    
                    return (
                      <div key={dateIndex} className={`min-h-[60px] ${isToday ? 'bg-pink-50' : ''}`}>
                        {isLunch ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="bg-orange-100 border border-orange-200 rounded-lg p-1 text-center">
                              <div className="text-xs text-orange-800">🍽️</div>
                            </div>
                          </div>
                        ) : dayAppointments.length > 0 ? (
                          <div className="space-y-1">
                            {dayAppointments.slice(0, 2).map((appointment) => (
                              <div
                                key={appointment._id}
                                className={`p-1 rounded border ${statusColors[appointment.status]} text-xs`}
                                title={`${appointment.clientName} - ${appointment.service}`}
                              >
                                <div className="truncate font-medium">{appointment.clientName}</div>
                                <div className="truncate text-gray-600">{appointment.service}</div>
                              </div>
                            ))}
                            {dayAppointments.length > 2 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{dayAppointments.length - 2} mais
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 italic h-full flex items-center justify-center">
                            -
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderMonthView = () => {
    const monthDates = getMonthDates()
    const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">{monthName}</h3>
          </div>
        </div>

        {/* Cabeçalho dos Dias da Semana */}
        <div className="border-b border-gray-200">
          <div className="grid grid-cols-7 gap-1 p-4 bg-gray-50">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-900">
                {day}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 p-4">
          {monthDates.map((date, index) => {
            const dayAppointments = getAppointmentsForDate(date)
            const isCurrentMonth = date.getMonth() === selectedDate.getMonth()
            const isToday = date.toDateString() === new Date().toDateString()
            const isSelected = date.toDateString() === selectedDate.toDateString()
            
            return (
              <div
                key={index}
                className={`min-h-[80px] p-2 border border-gray-200 ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'ring-2 ring-pink-500' : ''} ${
                  isSelected ? 'bg-pink-100' : ''
                }`}
                onClick={() => setSelectedDate(date)}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                } ${isToday ? 'text-pink-600' : ''}`}>
                  {date.getDate()}
                </div>
                
                {isCurrentMonth && dayAppointments.length > 0 && (
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map((appointment) => (
                      <div
                        key={appointment._id}
                        className={`p-1 rounded text-xs ${statusColors[appointment.status]} truncate`}
                        title={`${appointment.clientName} - ${appointment.service}`}
                      >
                        {appointment.clientName}
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayAppointments.length - 3} mais
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#006D5B]">Agenda</h1>
            <p className="mt-2 text-sm text-gray-700">
              Gerencie todos os agendamentos do salão
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Link
              href="/admin/agendamentos/novo"
              className="bg-[#D15556] text-white px-4 py-2 rounded-lg hover:bg-[#c04546] transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Link>
          </div>
        </div>

        {/* Controles da Agenda */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Navegação de Data */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateDate('prev')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {viewMode === 'day' && formatDate(selectedDate)}
                    {viewMode === 'week' && `Semana de ${formatShortDate(selectedDate)}`}
                    {viewMode === 'month' && selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </h2>
                  <button
                    onClick={goToToday}
                    className="text-sm text-[#D15556] hover:text-[#c04546]"
                  >
                    Ir para hoje
                  </button>
                </div>
                
                <button
                  onClick={() => navigateDate('next')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Modos de Visualização */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('day')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'day' 
                      ? 'bg-[#D15556] text-white' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  title="Vista Diária"
                >
                  <Clock3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'week' 
                      ? 'bg-[#D15556] text-white' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  title="Vista Semanal"
                >
                  <CalendarDays className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'month' 
                      ? 'bg-[#D15556] text-white' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  title="Vista Mensal"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>

              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-4">
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
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
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
          <>
            {viewMode === 'day' && renderDayView()}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'month' && renderMonthView()}
          </>
        )}

        {/* Resumo do Dia */}
        {viewMode === 'day' && (
          <div className={`mt-6 grid gap-6`} style={{ gridTemplateColumns: `repeat(${professionals.length + 1}, 1fr)` }}>
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
                      <p className="text-sm font-medium text-gray-600">{professional.name}</p>
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
        )}

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
      </div>
    </div>
  )
}