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
    'Bruna Canovas': 'bg-purple-100 text-purple-800 border-purple-200',
    'Vitória Uliani': 'bg-orange-100 text-orange-800 border-orange-200', 
    'Cicera Canovas': 'bg-green-100 text-green-800 border-green-200',
    'Ellen Souza': 'bg-blue-100 text-blue-800 border-blue-200'
  }
  return colors[professionalName] || 'bg-gray-100 text-gray-800 border-gray-200'
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
  const [hoveredAppointment, setHoveredAppointment] = useState<Appointment | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

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

  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(selectedDate)
    
    if (!professionals || professionals.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Carregando profissionais...</p>
        </div>
      )
    }
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header com botões */}
        <div className="border-b border-gray-200 p-4">
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

        {/* Cabeçalho dos Profissionais */}
        <div className="border-b border-gray-200">
          <div className={`grid gap-1 p-2`} style={{ gridTemplateColumns: `120px repeat(${professionals.length}, 1fr)` }}>
            <div className="text-sm font-medium text-gray-900 p-2">Horário</div>
            {professionals.map((professional) => (
              <div key={professional._id} className="text-center p-2">
                <div className={`inline-flex items-center px-3 py-2 rounded text-sm font-medium text-white ${
                  professional.name === 'Bruna Canovas' ? 'bg-purple-600' :
                  professional.name === 'Vitória Uliani' ? 'bg-orange-600' :
                  professional.name === 'Cicera Canovas' ? 'bg-green-600' :
                  professional.name === 'Ellen Souza' ? 'bg-blue-600' :
                  'bg-gray-600'
                }`}>
                  {professional.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grade de horários */}
        <div className="overflow-y-auto max-h-[600px]">
          <div className="grid grid-cols-1">
            {timeSlots.map((time) => (
              <div key={time} className="border-b border-gray-100">
                <div className={`grid gap-1 p-1`} style={{ gridTemplateColumns: `120px repeat(${professionals.length}, 1fr)` }}>
                  {/* Horário */}
                  <div className="flex items-center justify-center p-2">
                    <div className="text-sm font-medium text-gray-900">{time}</div>
                  </div>
                  
                  {/* Colunas dos Profissionais */}
                  {professionals.map((professional) => {
                    // Encontrar o agendamento que começa neste horário
                    const startingAppointment = dayAppointments.find(apt => 
                      apt.professionalId === professional._id && 
                      apt.startTime === time
                    )
                    
                    // Verificar se este horário está ocupado por um agendamento em andamento
                    const ongoingAppointment = dayAppointments.find(apt => 
                      apt.professionalId === professional._id && 
                      isTimeInAppointment(time, apt) &&
                      apt.startTime !== time // Não é o início do agendamento
                    )
                    
                    // Verificar se é horário de almoço (13:00-13:45)
                    const isLunchPeriod = time >= '13:00' && time <= '13:45'
                    
                    return (
                      <div key={professional._id} className="min-h-[40px] p-1 relative">
                        {isLunchPeriod && time === '13:00' ? (
                          // Bloco de almoço que ocupa todo o período - usar position absolute para se estender
                          <div 
                            className="absolute top-0 left-1 right-1 bg-orange-100 border border-orange-200 rounded p-2 text-center flex items-center justify-center z-10"
                            style={{
                              height: `${4 * 40}px` // 4 slots de 15min = 1 hora
                            }}
                          >
                            <div className="text-xs text-orange-800 font-medium">🍽️ Almoço</div>
                          </div>
                        ) : isLunchPeriod ? (
                          // Espaço vazio durante o almoço (já ocupado pelo bloco acima)
                          <div className="h-full"></div>
                        ) : startingAppointment ? (
                          // Bloco de agendamento que se estende pela duração - usar position absolute
                          <div
                            className={`absolute top-0 left-1 right-1 p-2 rounded border shadow-sm cursor-pointer transition-all hover:shadow-md z-10 ${getProfessionalColor(startingAppointment.professional)}`}
                            style={{
                              height: `${Math.max(40, getDurationInSlots(startingAppointment.startTime, startingAppointment.endTime) * 40)}px`
                            }}
                            onMouseEnter={(e) => {
                              setHoveredAppointment(startingAppointment)
                              setTooltipPosition({ x: e.clientX, y: e.clientY })
                            }}
                            onMouseLeave={() => setHoveredAppointment(null)}
                          >
                            <div className="space-y-1">
                              <div className="text-xs font-semibold">
                                {startingAppointment.startTime}
                              </div>
                              <div className="text-xs font-medium truncate">
                                {startingAppointment.clientName}
                              </div>
                              <div className="text-xs truncate">
                                {startingAppointment.service}
                              </div>
                            </div>
                          </div>
                        ) : ongoingAppointment ? (
                          // Horário ocupado por agendamento em andamento (não é o início)
                          <div className="h-full"></div>
                        ) : (
                          // Espaço vazio disponível
                          <div className="h-full border border-transparent hover:border-gray-200 rounded transition-colors"></div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {hoveredAppointment && (
          <div
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs"
            style={{
              left: `${tooltipPosition.x + 10}px`,
              top: `${tooltipPosition.y - 10}px`,
              pointerEvents: 'none'
            }}
          >
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600">Serviço:</span>
                <p className="text-sm text-gray-900">{hoveredAppointment.service}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${statusColors[hoveredAppointment.status]}`}>
                  {getStatusText(hoveredAppointment.status)}
                </span>
              </div>
              {hoveredAppointment.notes && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Obs:</span>
                  <p className="text-sm text-gray-900">{hoveredAppointment.notes}</p>
                </div>
              )}
              <div className="flex space-x-2 pt-2">
                <Link
                  href={`/admin/agendamentos/${hoveredAppointment._id}`}
                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Ver detalhes
                </Link>
                <Link
                  href={`/admin/agendamentos/${hoveredAppointment._id}/editar`}
                  className="text-xs text-green-600 hover:text-green-800 transition-colors"
                >
                  Editar
                </Link>
                <button 
                  onClick={() => handleDeleteAppointment(hoveredAppointment._id)}
                  className="text-xs text-red-600 hover:text-red-800 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

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
                className={`min-h-[80px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'ring-2 ring-pink-500' : ''} ${
                  isSelected ? 'bg-pink-100' : ''
                }`}
                onClick={() => {
                  setSelectedDate(date)
                  setViewMode('day')
                }}
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Calendário Lateral */}
            <div className="lg:col-span-1">
              {renderSideCalendar()}
            </div>
            
            {/* Agenda Principal */}
            <div className="lg:col-span-3">
              {viewMode === 'day' && renderDayView()}
              {viewMode === 'week' && renderWeekView()}
              {viewMode === 'month' && renderMonthView()}
            </div>
          </div>
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