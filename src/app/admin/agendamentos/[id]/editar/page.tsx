'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash, Calendar, Clock, User, Scissors, Palette, Sparkles, Star } from 'lucide-react'
import TagSelector from '@/components/TagSelector'
import { Tag } from '@/components/Tag'

// Mock data - em produção viria do banco de dados
const mockAppointment = {
  id: 1,
  clientName: "Maria Silva",
  clientId: "client-1",
  service: "Corte Feminino",
  serviceId: "service-1",
  professional: "Ana Carolina",
  professionalId: "ana",
  date: "2024-01-15",
  startTime: "09:00",
  endTime: "10:00",
  status: "CONFIRMED",
  price: 45.00,
  notes: "Corte com franja",
  tags: [
    { id: 'first-visit', name: 'Primeira Visita', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-200' },
    { id: 'coloring', name: 'Coloração', color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-800', borderColor: 'border-purple-200' }
  ]
}

const mockClients = [
  { id: "client-1", name: "Maria Silva", email: "maria@email.com", phone: "(11) 99999-9999" },
  { id: "client-2", name: "João Santos", email: "joao@email.com", phone: "(11) 88888-8888" },
  { id: "client-3", name: "Ana Costa", email: "ana@email.com", phone: "(11) 77777-7777" },
  { id: "client-4", name: "Pedro Lima", email: "pedro@email.com", phone: "(11) 66666-6666" },
  { id: "client-5", name: "Carla Ferreira", email: "carla@email.com", phone: "(11) 55555-5555" }
]

const mockServices = [
  { id: "service-1", name: "Corte Feminino", price: 45.00, duration: 60 },
  { id: "service-2", name: "Corte Masculino", price: 35.00, duration: 45 },
  { id: "service-3", name: "Coloração", price: 80.00, duration: 120 },
  { id: "service-4", name: "Hidratação", price: 50.00, duration: 60 },
  { id: "service-5", name: "Maquiagem Social", price: 80.00, duration: 60 },
  { id: "service-6", name: "Barba", price: 25.00, duration: 30 }
]

const mockProfessionals = [
  { id: 'ana', name: 'Ana Carolina', color: 'bg-pink-100', textColor: 'text-pink-800' },
  { id: 'mariana', name: 'Mariana Silva', color: 'bg-purple-100', textColor: 'text-purple-800' },
  { id: 'carlos', name: 'Carlos Eduardo', color: 'bg-blue-100', textColor: 'text-blue-800' },
  { id: 'juliana', name: 'Juliana Costa', color: 'bg-green-100', textColor: 'text-green-800' }
]

const statusOptions = [
  { value: 'SCHEDULED', label: 'Agendado', color: 'bg-blue-100 text-blue-800' },
  { value: 'CONFIRMED', label: 'Confirmado', color: 'bg-green-100 text-green-800' },
  { value: 'COMPLETED', label: 'Concluído', color: 'bg-gray-100 text-gray-800' },
  { value: 'CANCELLED', label: 'Cancelado', color: 'bg-red-100 text-red-800' }
]

export default function EditarAgendamentoPage() {
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.id as string

  const [formData, setFormData] = useState({
    clientId: '',
    serviceId: '',
    professionalId: '',
    date: '',
    startTime: '',
    endTime: '',
    status: '',
    price: 0,
    notes: ''
  })

  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchClient, setSearchClient] = useState('')
  const [filteredClients, setFilteredClients] = useState(mockClients)

  useEffect(() => {
    // Simular carregamento do agendamento
    if (appointmentId) {
      setFormData({
        clientId: mockAppointment.clientId,
        serviceId: mockAppointment.serviceId,
        professionalId: mockAppointment.professionalId,
        date: mockAppointment.date,
        startTime: mockAppointment.startTime,
        endTime: mockAppointment.endTime,
        status: mockAppointment.status,
        price: mockAppointment.price,
        notes: mockAppointment.notes
      })
      setSelectedTags(mockAppointment.tags)
    }
  }, [appointmentId])

  useEffect(() => {
    // Filtrar clientes baseado na busca
    const filtered = mockClients.filter(client =>
      client.name.toLowerCase().includes(searchClient.toLowerCase()) ||
      client.email.toLowerCase().includes(searchClient.toLowerCase()) ||
      client.phone.includes(searchClient)
    )
    setFilteredClients(filtered)
  }, [searchClient])

  const handleServiceChange = (serviceId: string) => {
    const service = mockServices.find(s => s.id === serviceId)
    if (service) {
      setFormData(prev => ({
        ...prev,
        serviceId,
        price: service.price
      }))
      
      // Calcular horário de fim baseado na duração
      if (formData.startTime) {
        const startTime = new Date(`2000-01-01T${formData.startTime}`)
        const endTime = new Date(startTime.getTime() + service.duration * 60000)
        const endTimeString = endTime.toTimeString().slice(0, 5)
        setFormData(prev => ({ ...prev, endTime: endTimeString }))
      }
    }
  }

  const handleStartTimeChange = (startTime: string) => {
    setFormData(prev => ({ ...prev, startTime }))
    
    // Recalcular horário de fim se serviço estiver selecionado
    if (formData.serviceId) {
      const service = mockServices.find(s => s.id === formData.serviceId)
      if (service) {
        const startTimeDate = new Date(`2000-01-01T${startTime}`)
        const endTime = new Date(startTimeDate.getTime() + service.duration * 60000)
        const endTimeString = endTime.toTimeString().slice(0, 5)
        setFormData(prev => ({ ...prev, endTime: endTimeString }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Agendamento atualizado:', {
        ...formData,
        tags: selectedTags
      })
      
      router.push('/admin/agendamentos')
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      setIsLoading(true)
      try {
        // Simular exclusão
        await new Promise(resolve => setTimeout(resolve, 1000))
        router.push('/admin/agendamentos')
      } catch (error) {
        console.error('Erro ao excluir:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const selectedClient = mockClients.find(c => c.id === formData.clientId)
  const selectedService = mockServices.find(s => s.id === formData.serviceId)
  const selectedProfessional = mockProfessionals.find(p => p.id === formData.professionalId)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/agendamentos"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Agendamento</h1>
            <p className="mt-2 text-sm text-gray-700">
              Modifique os detalhes do agendamento
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Trash className="w-4 h-4 mr-2" />
            Excluir
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informações do Cliente */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Cliente
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Cliente
              </label>
              <input
                type="text"
                placeholder="Digite o nome, email ou telefone..."
                value={searchClient}
                onChange={(e) => setSearchClient(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                style={{ color: '#000000' }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => setFormData(prev => ({ ...prev, clientId: client.id }))}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.clientId === client.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium text-gray-900">{client.name}</div>
                  <div className="text-sm text-gray-600">{client.email}</div>
                  <div className="text-sm text-gray-500">{client.phone}</div>
                </div>
              ))}
            </div>

            {selectedClient && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <div className="font-medium text-green-900">Cliente Selecionado</div>
                    <div className="text-sm text-green-700">
                      {selectedClient.name} • {selectedClient.email} • {selectedClient.phone}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Serviço e Profissional */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Scissors className="w-5 h-5 mr-2" />
              Serviço
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecionar Serviço
                </label>
                <select
                  value={formData.serviceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Selecione um serviço</option>
                  {mockServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - R$ {service.price.toFixed(2)} ({service.duration}min)
                    </option>
                  ))}
                </select>
              </div>

              {selectedService && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-blue-900">{selectedService.name}</div>
                      <div className="text-sm text-blue-700">
                        Duração: {selectedService.duration} minutos
                      </div>
                    </div>
                    <div className="text-lg font-bold text-blue-900">
                      R$ {selectedService.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profissional
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecionar Profissional
                </label>
                <select
                  value={formData.professionalId}
                  onChange={(e) => setFormData(prev => ({ ...prev, professionalId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Selecione um profissional</option>
                  {mockProfessionals.map((professional) => (
                    <option key={professional.id} value={professional.id}>
                      {professional.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProfessional && (
                <div className={`border rounded-lg p-4 ${selectedProfessional.color}`}>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full ${selectedProfessional.color} flex items-center justify-center mr-3`}>
                      <span className={`text-sm font-bold ${selectedProfessional.textColor}`}>
                        {selectedProfessional.name.charAt(0)}
                      </span>
                    </div>
                    <div className={`font-medium ${selectedProfessional.textColor}`}>
                      {selectedProfessional.name}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data e Horário */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Data e Horário
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horário de Início
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horário de Fim
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          {formData.startTime && formData.endTime && (
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-center text-sm text-gray-700">
                <Clock className="w-4 h-4 mr-2" />
                <span>
                  Duração: {(() => {
                    const start = new Date(`2000-01-01T${formData.startTime}`)
                    const end = new Date(`2000-01-01T${formData.endTime}`)
                    const diff = end.getTime() - start.getTime()
                    const minutes = Math.floor(diff / 60000)
                    return `${minutes} minutos`
                  })()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Status e Preço */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
            
            <div className="space-y-3">
              {statusOptions.map((status) => (
                <label key={status.value} className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value={status.value}
                    checked={formData.status === status.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="mr-3"
                  />
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preço</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags de Classificação</h2>
          
          <TagSelector
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            maxTags={5}
          />
        </div>

        {/* Observações */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Observações</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionais
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              placeholder="Digite observações sobre o agendamento..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Resumo */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Agendamento</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Cliente:</span>
                <span className="font-medium">{selectedClient?.name || 'Não selecionado'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Serviço:</span>
                <span className="font-medium">{selectedService?.name || 'Não selecionado'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Profissional:</span>
                <span className="font-medium">{selectedProfessional?.name || 'Não selecionado'}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Data:</span>
                <span className="font-medium">{formData.date || 'Não definida'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Horário:</span>
                <span className="font-medium">
                  {formData.startTime && formData.endTime 
                    ? `${formData.startTime} - ${formData.endTime}`
                    : 'Não definido'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor:</span>
                <span className="font-medium">R$ {formData.price.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {selectedTags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center mb-2">
                <span className="text-gray-600 mr-2">Tags:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag.id}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tag.bgColor} ${tag.textColor} ${tag.borderColor} border`}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/agendamentos"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          
          <button
            type="submit"
            disabled={isLoading}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}


