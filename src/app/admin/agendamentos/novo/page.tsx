'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Clock, 
  DollarSign, 
  Save, 
  X,
  Search,
  CheckCircle
} from 'lucide-react'

export const dynamic = 'force-dynamic'

// Dados mockados
const mockClients = [
  { id: 1, name: "Maria Silva", phone: "(11) 99999-0001", email: "maria@email.com" },
  { id: 2, name: "João Santos", phone: "(11) 99999-0002", email: "joao@email.com" },
  { id: 3, name: "Ana Costa", phone: "(11) 99999-0003", email: "ana@email.com" },
  { id: 4, name: "Pedro Lima", phone: "(11) 99999-0004", email: "pedro@email.com" },
  { id: 5, name: "Carla Ferreira", phone: "(11) 99999-0005", email: "carla@email.com" }
]

const mockServices = [
  { id: 1, name: "Corte Feminino", price: 45, duration: 60 },
  { id: 2, name: "Corte Masculino", price: 35, duration: 45 },
  { id: 3, name: "Coloração", price: 80, duration: 120 },
  { id: 4, name: "Mechas/Luzes", price: 120, duration: 150 },
  { id: 5, name: "Hidratação", price: 50, duration: 60 },
  { id: 6, name: "Maquiagem Social", price: 80, duration: 60 },
  { id: 7, name: "Maquiagem Noiva", price: 150, duration: 120 },
  { id: 8, name: "Botox Capilar", price: 120, duration: 120 }
]

const mockProfessionals = [
  { id: 1, name: "Ana Carolina", specialties: ["Cortes", "Coloração"] },
  { id: 2, name: "Mariana Silva", specialties: ["Coloração", "Balayage"] },
  { id: 3, name: "Carlos Eduardo", specialties: ["Cortes Masculinos", "Barba"] },
  { id: 4, name: "Juliana Costa", specialties: ["Maquiagem"] },
  { id: 5, name: "Fernanda Santos", specialties: ["Tratamentos"] }
]

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
]

export default function NovoAgendamentoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    clientId: '',
    serviceId: '',
    professionalId: '',
    date: '',
    startTime: '',
    notes: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null)
  const [clientSearch, setClientSearch] = useState('')
  const [showClientList, setShowClientList] = useState(false)

  // Pegar cliente da URL se fornecido
  useEffect(() => {
    const clientParam = searchParams.get('client')
    if (clientParam) {
      const client = mockClients.find(c => c.id.toString() === clientParam)
      if (client) {
        setSelectedClient(client)
        setFormData(prev => ({ ...prev, clientId: client.id.toString() }))
      }
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleClientSelect = (client: any) => {
    setSelectedClient(client)
    setFormData(prev => ({ ...prev, clientId: client.id.toString() }))
    setShowClientList(false)
    setClientSearch('')
  }

  const handleServiceSelect = (service: any) => {
    setSelectedService(service)
    setFormData(prev => ({ ...prev, serviceId: service.id.toString() }))
  }

  const handleProfessionalSelect = (professional: any) => {
    setSelectedProfessional(professional)
    setFormData(prev => ({ ...prev, professionalId: professional.id.toString() }))
  }

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.phone.includes(clientSearch) ||
    client.email.toLowerCase().includes(clientSearch.toLowerCase())
  )

  const getNextAvailableDate = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Aqui você faria a chamada para a API
      console.log('Novo agendamento:', formData)
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirecionar para a agenda
      router.push('/admin/agendamentos')
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/admin/agendamentos"
          className="flex items-center text-pink-600 hover:text-pink-700 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para Agenda
        </Link>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Novo Agendamento</h1>
            <p className="text-gray-600">Agende um novo horário para um cliente</p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Seleção de Cliente */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Cliente *
              </label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar cliente por nome, telefone ou email..."
                    value={clientSearch}
                    onChange={(e) => {
                      setClientSearch(e.target.value)
                      setShowClientList(true)
                    }}
                    onFocus={() => setShowClientList(true)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    style={{ color: '#000000' }}
                  />
                </div>
                
                {showClientList && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredClients.map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => handleClientSelect(client)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{client.name}</div>
                        <div className="text-sm text-gray-500">{client.phone} • {client.email}</div>
                      </button>
                    ))}
                  </div>
                )}
                
                {selectedClient && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-green-900">{selectedClient.name}</div>
                        <div className="text-sm text-green-700">{selectedClient.phone} • {selectedClient.email}</div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Seleção de Serviço */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Serviço *
              </label>
              <select
                name="serviceId"
                value={formData.serviceId}
                onChange={(e) => {
                  handleInputChange(e)
                  const service = mockServices.find(s => s.id.toString() === e.target.value)
                  if (service) handleServiceSelect(service)
                }}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">Selecione um serviço</option>
                {mockServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - R$ {service.price.toFixed(2)} ({service.duration} min)
                  </option>
                ))}
              </select>
            </div>

            {/* Seleção de Profissional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Profissional *
              </label>
              <select
                name="professionalId"
                value={formData.professionalId}
                onChange={(e) => {
                  handleInputChange(e)
                  const professional = mockProfessionals.find(p => p.id.toString() === e.target.value)
                  if (professional) handleProfessionalSelect(professional)
                }}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">Selecione um profissional</option>
                {mockProfessionals.map((professional) => (
                  <option key={professional.id} value={professional.id}>
                    {professional.name} - {professional.specialties.join(', ')}
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
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={getNextAvailableDate()}
                required
                className="w-full px-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                style={{ color: '#000000' }}
              />
            </div>

            {/* Horário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Horário *
              </label>
              <select
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">Selecione um horário</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            {/* Observações */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Informações adicionais sobre o agendamento..."
                style={{ color: '#000000' }}
              />
            </div>
          </div>

          {/* Resumo do Agendamento */}
          {(selectedClient || selectedService || selectedProfessional) && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Resumo do Agendamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {selectedClient && (
                  <div>
                    <span className="font-medium text-gray-700">Cliente:</span>
                    <span className="ml-2 text-gray-900">{selectedClient.name}</span>
                  </div>
                )}
                {selectedService && (
                  <div>
                    <span className="font-medium text-gray-700">Serviço:</span>
                    <span className="ml-2 text-gray-900">{selectedService.name} - R$ {selectedService.price.toFixed(2)}</span>
                  </div>
                )}
                {selectedProfessional && (
                  <div>
                    <span className="font-medium text-gray-700">Profissional:</span>
                    <span className="ml-2 text-gray-900">{selectedProfessional.name}</span>
                  </div>
                )}
                {formData.date && (
                  <div>
                    <span className="font-medium text-gray-700">Data:</span>
                    <span className="ml-2 text-gray-900">{new Date(formData.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
                {formData.startTime && (
                  <div>
                    <span className="font-medium text-gray-700">Horário:</span>
                    <span className="ml-2 text-gray-900">{formData.startTime}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/admin/agendamentos"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isLoading || !selectedClient || !selectedService || !selectedProfessional || !formData.date || !formData.startTime}
              className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


