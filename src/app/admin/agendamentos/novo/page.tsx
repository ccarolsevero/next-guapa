'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, User, Phone, Mail, Plus, X } from 'lucide-react'

interface Professional {
  _id: string
  name: string
  specialties: string[]
  photo?: string
}

interface Service {
  _id: string
  name: string
  price: number
  duration: number
  professionalId: string
}

interface Client {
  _id: string
  name: string
  phone: string
  email?: string
  birthDate?: string
}

const timeSlots = [
  "08:00", "08:15", "08:30", "08:45", "09:00", "09:15", "09:30", "09:45",
  "10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45",
  "12:00", "12:15", "12:30", "12:45", "13:00", "13:15", "13:30", "13:45",
  "14:00", "14:15", "14:30", "14:45", "15:00", "15:15", "15:30", "15:45",
  "16:00", "16:15", "16:30", "16:45", "17:00", "17:15", "17:30", "17:45",
  "18:00", "18:15", "18:30", "18:45", "19:00"
]

export default function NovoAgendamentoPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    service: '',
    professional: '',
    professionalId: '',
    date: '',
    startTime: '',
    endTime: '',
    price: 0,
    notes: '',
    status: 'SCHEDULED' as const
  })
  
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showClientSearch, setShowClientSearch] = useState(false)
  const [clientSearchTerm, setClientSearchTerm] = useState('')

  // Carregar profissionais
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

  // Carregar clientes
  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await fetch('/api/clients')
        if (response.ok) {
          const data = await response.json()
          setClients(data)
        }
      } catch (error) {
        console.error('Erro ao carregar clientes:', error)
      }
    }
    loadClients()
  }, [])

  // Carregar serviços quando profissional for selecionado
  useEffect(() => {
    if (formData.professionalId) {
      const loadServices = async () => {
        try {
          const response = await fetch(`/api/services?professionalId=${formData.professionalId}`)
          if (response.ok) {
            const data = await response.json()
            setServices(data)
          }
        } catch (error) {
          console.error('Erro ao carregar serviços:', error)
        }
      }
      loadServices()
    } else {
      setServices([])
    }
  }, [formData.professionalId])

  // Carregar horários disponíveis
  useEffect(() => {
    if (formData.date && formData.professionalId) {
      const loadAvailableTimes = async () => {
        try {
          const response = await fetch(`/api/appointments/available-times?date=${formData.date}&professionalId=${formData.professionalId}`)
          if (response.ok) {
            const data = await response.json()
            setAvailableTimes(data.availableTimes || [])
          }
        } catch (error) {
          console.error('Erro ao carregar horários disponíveis:', error)
          setAvailableTimes(timeSlots)
        }
      }
      loadAvailableTimes()
    }
  }, [formData.date, formData.professionalId])

  const handleProfessionalChange = (professionalId: string) => {
    const professional = professionals.find(p => p._id === professionalId)
    setFormData(prev => ({
      ...prev,
      professionalId,
      professional: professional?.name || '',
      service: '',
      price: 0
    }))
  }

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s._id === serviceId)
    if (service) {
      setFormData(prev => ({
        ...prev,
        service: service.name,
        price: service.price
      }))
    }
  }

  const handleTimeChange = (time: string) => {
    const service = services.find(s => s._id === formData.service)
    if (service) {
      const [hours, minutes] = time.split(':').map(Number)
      const startDate = new Date()
      startDate.setHours(hours, minutes, 0, 0)
      const endDate = new Date(startDate.getTime() + service.duration * 60000)
      const endTime = endDate.toTimeString().slice(0, 5)
      
      setFormData(prev => ({
        ...prev,
        startTime: time,
        endTime
      }))
    }
  }

  const handleClientSelect = (client: Client) => {
    setFormData(prev => ({
      ...prev,
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email || ''
    }))
    setShowClientSearch(false)
    setClientSearchTerm('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const appointmentData = {
        ...formData,
        date: new Date(formData.date).toISOString()
      }

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      })

      if (response.ok) {
        router.push('/admin/agendamentos')
      } else {
        const error = await response.json()
        alert(`Erro ao criar agendamento: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      alert('Erro ao criar agendamento')
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.phone.includes(clientSearchTerm)
  )

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/agendamentos"
              className="flex items-center text-[#006D5B] hover:text-[#004d42] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Link>
            <h1 className="text-3xl font-bold text-[#006D5B]">Novo Agendamento</h1>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Cliente *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, clientName: e.target.value }))
                    setShowClientSearch(e.target.value.length > 0)
                    setClientSearchTerm(e.target.value)
                  }}
                  placeholder="Digite o nome do cliente"
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:border-[#D15556] focus:outline-none bg-white text-gray-900 font-medium"
                  required
                />
                {showClientSearch && filteredClients.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredClients.map((client) => (
                      <div
                        key={client._id}
                        onClick={() => handleClientSelect(client)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-semibold text-gray-900">{client.name}</div>
                        <div className="text-sm text-gray-700">{client.phone}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Telefone *
              </label>
              <input
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                placeholder="(11) 99999-9999"
                className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:border-[#D15556] focus:outline-none bg-white text-gray-900 font-medium"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                placeholder="cliente@email.com"
                className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:border-[#D15556] focus:outline-none bg-white text-gray-900 font-medium"
              />
            </div>

            {/* Profissional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profissional *
              </label>
              <select
                value={formData.professionalId}
                onChange={(e) => handleProfessionalChange(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:border-[#D15556] focus:outline-none bg-white text-gray-900 font-medium"
                required
              >
                <option value="">Selecione um profissional</option>
                {professionals.map((professional) => (
                  <option key={professional._id} value={professional._id}>
                    {professional.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Serviço */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serviço *
              </label>
              <select
                value={formData.service}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:border-[#D15556] focus:outline-none bg-white text-gray-900 font-medium"
                required
                disabled={!formData.professionalId}
              >
                <option value="">Selecione um serviço</option>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.name} - R$ {service.price.toFixed(2)} ({service.duration}min)
                  </option>
                ))}
              </select>
            </div>

            {/* Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Data *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:border-[#D15556] focus:outline-none bg-white text-gray-900 font-medium"
                required
              />
            </div>

            {/* Horário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Horário *
              </label>
              <select
                value={formData.startTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:border-[#D15556] focus:outline-none bg-white text-gray-900 font-medium"
                required
                disabled={!formData.date || !formData.professionalId}
              >
                <option value="">Selecione um horário</option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Adicione observações sobre este agendamento..."
                rows={4}
                className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:border-[#D15556] focus:outline-none bg-white text-gray-900 font-medium resize-none"
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-4 pt-6">
              <Link
                href="/admin/agendamentos"
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#D15556] text-white rounded-lg hover:bg-[#c04546] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Agendamento
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
