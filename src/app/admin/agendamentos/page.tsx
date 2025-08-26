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
  AlertTriangle
} from 'lucide-react'

// Dados mockados para demonstração
const mockAppointments = [
  {
    id: 1,
    clientName: "Maria Silva",
    service: "Corte Feminino",
    professional: "Ana Carolina",
    professionalId: "ana",
    date: "2024-01-15",
    startTime: "09:00",
    endTime: "10:00",
    status: "CONFIRMED",
    price: 45.00,
    notes: "Corte com franja"
  },
  {
    id: 2,
    clientName: "João Santos",
    service: "Corte Masculino",
    professional: "Carlos Eduardo",
    professionalId: "carlos",
    date: "2024-01-15",
    startTime: "10:00",
    endTime: "10:45",
    status: "SCHEDULED",
    price: 35.00,
    notes: "Corte tradicional"
  },
  {
    id: 3,
    clientName: "Ana Costa",
    service: "Coloração",
    professional: "Mariana Silva",
    professionalId: "mariana",
    date: "2024-01-15",
    startTime: "11:00",
    endTime: "13:00",
    status: "CONFIRMED",
    price: 80.00,
    notes: "Retoque de raiz"
  },
  {
    id: 4,
    clientName: "Pedro Lima",
    service: "Barba",
    professional: "Carlos Eduardo",
    professionalId: "carlos",
    date: "2024-01-15",
    startTime: "14:00",
    endTime: "14:30",
    status: "SCHEDULED",
    price: 25.00,
    notes: "Barba completa"
  },
  {
    id: 5,
    clientName: "Carla Ferreira",
    service: "Hidratação",
    professional: "Ana Carolina",
    professionalId: "ana",
    date: "2024-01-15",
    startTime: "15:00",
    endTime: "16:00",
    status: "CONFIRMED",
    price: 50.00,
    notes: "Tratamento profundo"
  },
  {
    id: 6,
    clientName: "Juliana Costa",
    service: "Maquiagem Social",
    professional: "Juliana Costa",
    professionalId: "juliana",
    date: "2024-01-15",
    startTime: "16:30",
    endTime: "17:30",
    status: "SCHEDULED",
    price: 80.00,
    notes: "Para evento"
  },
  {
    id: 7,
    clientName: "Fernanda Santos",
    service: "Mechas",
    professional: "Mariana Silva",
    professionalId: "mariana",
    date: "2024-01-15",
    startTime: "09:00",
    endTime: "11:30",
    status: "CONFIRMED",
    price: 120.00,
    notes: "Mechas californianas"
  },
  {
    id: 8,
    clientName: "Roberto Silva",
    service: "Corte Masculino",
    professional: "Carlos Eduardo",
    professionalId: "carlos",
    date: "2024-01-15",
    startTime: "16:00",
    endTime: "16:45",
    status: "SCHEDULED",
    price: 35.00,
    notes: "Corte moderno"
  },
  {
    id: 9,
    clientName: "Patrícia Lima",
    service: "Hidratação",
    professional: "Juliana Costa",
    professionalId: "juliana",
    date: "2024-01-15",
    startTime: "14:30",
    endTime: "15:30",
    status: "CONFIRMED",
    price: 50.00,
    notes: "Tratamento capilar"
  },
  {
    id: 10,
    clientName: "Marcos Oliveira",
    service: "Barba",
    professional: "Carlos Eduardo",
    professionalId: "carlos",
    date: "2024-01-15",
    startTime: "11:00",
    endTime: "11:30",
    status: "SCHEDULED",
    price: 25.00,
    notes: "Barba tradicional"
  }
]

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
  CANCELLED: 'bg-red-100 text-red-800 border-red-200'
}

export default function AgendamentosPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [appointments, setAppointments] = useState(mockAppointments)
  const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const professionals = [
  { id: 'ana', name: 'Ana Carolina', color: 'bg-pink-100', textColor: 'text-pink-800' },
  { id: 'mariana', name: 'Mariana Silva', color: 'bg-purple-100', textColor: 'text-purple-800' },
  { id: 'carlos', name: 'Carlos Eduardo', color: 'bg-blue-100', textColor: 'text-blue-800' },
  { id: 'juliana', name: 'Juliana Costa', color: 'bg-green-100', textColor: 'text-green-800' }
]

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return appointments.filter(apt => apt.date === dateStr)
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'Agendado'
      case 'CONFIRMED': return 'Confirmado'
      case 'COMPLETED': return 'Concluído'
      case 'CANCELLED': return 'Cancelado'
      default: return status
    }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const handleDeleteAppointment = (appointmentId: number) => {
    setAppointmentToDelete(appointmentId)
    setShowDeleteModal(true)
  }

  const confirmDeleteAppointment = async () => {
    if (appointmentToDelete) {
      // Em produção, aqui seria feita a chamada para a API
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentToDelete))
      setShowDeleteModal(false)
      setAppointmentToDelete(null)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setAppointmentToDelete(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie todos os agendamentos do salão
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            href="/admin/agendamentos/novo"
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center"
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
                  {formatDate(selectedDate)}
                </h2>
                <button
                  onClick={goToToday}
                  className="text-sm text-pink-600 hover:text-pink-700"
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

                         {/* Filtros */}
             <div className="flex flex-col sm:flex-row gap-4">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                 <input
                   type="text"
                   placeholder="Buscar cliente..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                   style={{ color: '#000000' }}
                 />
               </div>
               
               <select
                 value={filterStatus}
                 onChange={(e) => setFilterStatus(e.target.value)}
                 className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
               >
                 <option value="all">Todos os Status</option>
                 <option value="SCHEDULED">Agendado</option>
                 <option value="CONFIRMED">Confirmado</option>
                 <option value="COMPLETED">Concluído</option>
                 <option value="CANCELLED">Cancelado</option>
               </select>
             </div>
          </div>
        </div>
      </div>

      {/* Agenda Diária */}
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
          <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50">
            <div className="text-sm font-medium text-gray-900">Horário</div>
            {professionals.map((professional) => (
              <div key={professional.id} className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${professional.color} ${professional.textColor}`}>
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
                <div className="grid grid-cols-5 gap-4 p-4">
                  {/* Horário */}
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">{time}</div>
                  </div>
                  
                  {/* Colunas dos Profissionais */}
                  {professionals.map((professional) => {
                    const appointments = getAppointmentsForTimeSlot(time, professional.id)
                    const hasAppointments = appointments.length > 0
                    
                    return (
                      <div key={professional.id} className={`min-h-[60px] ${hasAppointments ? 'bg-pink-50' : ''}`}>
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
                                  key={appointment.id}
                                  className={`p-2 rounded-lg border ${statusColors[appointment.status as keyof typeof statusColors]} shadow-sm`}
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-start justify-between">
                                      <IconComponent className="w-4 h-4 mt-0.5 text-pink-600 flex-shrink-0" />
                                      <div className="flex space-x-1 ml-1">
                                        <Link
                                          href={`/admin/agendamentos/${appointment.id}`}
                                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                          title="Ver detalhes"
                                        >
                                          <Eye className="w-3 h-3" />
                                        </Link>
                                        <Link
                                          href={`/admin/agendamentos/${appointment.id}/editar`}
                                          className="p-1 text-green-600 hover:text-green-800 transition-colors"
                                          title="Editar agendamento"
                                        >
                                          <Edit className="w-3 h-3" />
                                        </Link>
                                        <button 
                                          onClick={() => handleDeleteAppointment(appointment.id)}
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
                                    <span className={`inline-block px-1 py-0.5 text-xs rounded-full ${statusColors[appointment.status as keyof typeof statusColors]}`}>
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

      {/* Resumo do Dia */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-6">
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
          const professionalAppointments = getAppointmentsForDate(selectedDate).filter(apt => apt.professionalId === professional.id)
          return (
            <div key={professional.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${professional.color} ${professional.textColor}`}>
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
  )
}
