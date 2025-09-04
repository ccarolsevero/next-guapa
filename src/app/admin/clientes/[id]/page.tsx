'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Star, 
  Clock, 
  TrendingUp,
  Edit,
  Plus,
  Scissors,
  Palette,
  Sparkles,
  Loader2,
  FileText,
  Lightbulb,
  Paperclip
} from 'lucide-react'

interface ClienteData {
  _id: string
  name: string
  email: string
  phone: string
  birthDate?: string
  address?: string
  notes?: string
  idade?: number
  totalAppointments: number
  totalSpent: number
  averageTicket: number
  firstVisit?: string
  lastVisit?: string
  favoriteServices: Array<{
    name: string
    count: number
    totalSpent: number
  }>
  appointments: Array<{
    id: string
    date: string
    service: string
    professional: string
    status: string
    price: number
    notes?: string
  }>
  payments: Array<{
    id: string
    date: string
    amount: number
    method: string
    status: string
  }>
}

const serviceIcons = {
  "Corte Feminino": Scissors,
  "Corte Masculino": Scissors,
  "Coloração": Palette,
  "Hidratação": Sparkles,
  "Mechas": Palette,
  "Maquiagem": Star
}

export default function ClienteDetalhesPage() {
  const params = useParams()
  const [client, setClient] = useState<ClienteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesText, setNotesText] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/clients/${params.id}/detalhes`)
        
        if (!response.ok) {
          throw new Error('Erro ao carregar dados do cliente')
        }
        
        const data = await response.json()
        setClient(data)
        setNotesText(data.notes || '')
      } catch (err) {
        console.error('Erro ao buscar dados do cliente:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchClientData()
    }
  }, [params.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
      case 'SCHEDULED': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'PIX': return '💳'
      case 'CREDIT_CARD': return '💳'
      case 'CASH': return '💰'
      case 'DEBIT_CARD': return '💳'
      default: return '💳'
    }
  }

  const handleSaveNotes = async () => {
    if (!client) return
    
    try {
      setSavingNotes(true)
      
      const response = await fetch(`/api/clients/${client._id}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: notesText }),
      })
      
      if (!response.ok) {
        throw new Error('Erro ao salvar observações')
      }
      
      // Atualizar o estado local
      setClient(prev => prev ? { ...prev, notes: notesText } : null)
      setEditingNotes(false)
      
    } catch (err) {
      console.error('Erro ao salvar observações:', err)
      alert('Erro ao salvar observações. Tente novamente.')
    } finally {
      setSavingNotes(false)
    }
  }

  const handleCancelEdit = () => {
    setNotesText(client?.notes || '')
    setEditingNotes(false)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#D15556]" />
            <span className="text-gray-600">Carregando dados do cliente...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <User className="w-16 h-16 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Erro ao carregar cliente</h2>
            <p className="text-gray-600">{error || 'Cliente não encontrado'}</p>
          </div>
          <Link 
            href="/admin/clientes"
            className="inline-flex items-center text-[#D15556] hover:text-[#B84444]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Clientes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/admin/clientes"
          className="flex items-center text-[#D15556] hover:text-[#B84444] mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para Clientes
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-600">Detalhes completos do cliente</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/admin/clientes/${client._id}/prontuarios`}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              Prontuários
            </Link>
            <Link
              href={`/admin/clientes/${client._id}/recomendacoes`}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Recomendações
            </Link>
            <Link
              href={`/admin/clientes/${client._id}/historico`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Histórico
            </Link>
            <Link
              href={`/admin/clientes/${client._id}/editar`}
              className="bg-[#D15556] text-white px-4 py-2 rounded-lg hover:bg-[#B84444] transition-colors flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Cliente
            </Link>
            <Link
              href={`/admin/agendamentos/novo?client=${client._id}`}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Link>
          </div>
        </div>
      </div>

      {/* Informações Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Card Principal */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6">
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#D15556] to-[#B84444] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{client.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {client.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-[#D15556] mr-2" />
                      <span className="text-gray-700">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-[#D15556] mr-2" />
                      <span className="text-gray-700">{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center col-span-2">
                      <MapPin className="w-4 h-4 text-[#D15556] mr-2" />
                      <span className="text-gray-700">{client.address}</span>
                    </div>
                  )}
                  {client.idade && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-[#D15556] mr-2" />
                      <span className="text-gray-700">{client.idade} anos</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Star className="w-4 h-4 text-[#D15556] mr-2" />
                  Observações
                </h3>
                {!editingNotes && (
                  <button
                    onClick={() => setEditingNotes(true)}
                    className="text-[#D15556] hover:text-[#B84444] transition-colors flex items-center text-sm"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </button>
                )}
              </div>
              
              {editingNotes ? (
                <div className="space-y-3">
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
                    rows={4}
                    placeholder="Digite suas observações sobre o cliente..."
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="px-4 py-2 bg-[#D15556] text-white rounded-lg hover:bg-[#B84444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {savingNotes ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        'Salvar'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed">
                  {client.notes || 'Nenhuma observação registrada.'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-[#D15556] mr-2" />
              Estatísticas
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total de Visitas</span>
                <span className="font-bold text-[#D15556] text-lg">{client.totalAppointments}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700 font-medium">Valor Total Gasto</span>
                <span className="font-bold text-green-600 text-lg">R$ {client.totalSpent.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700 font-medium">Ticket Médio</span>
                <span className="font-bold text-blue-600 text-lg">R$ {client.averageTicket.toFixed(2)}</span>
              </div>
              {client.firstVisit && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Primeira Visita</span>
                  <span className="font-semibold text-gray-900">{new Date(client.firstVisit).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
              {client.lastVisit && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Última Visita</span>
                  <span className="font-semibold text-gray-900">{new Date(client.lastVisit).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="w-5 h-5 text-[#D15556] mr-2" />
              Serviços Favoritos
            </h3>
            <div className="space-y-3">
              {client.favoriteServices.length > 0 ? (
                client.favoriteServices.map((service, index) => {
                  const IconComponent = serviceIcons[service.name as keyof typeof serviceIcons] || Scissors
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <IconComponent className="w-5 h-5 text-[#D15556] mr-3" />
                        <span className="text-sm font-medium text-gray-800">{service.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-[#D15556]">{service.count}x</div>
                        <div className="text-xs text-gray-600">R$ {service.totalSpent.toFixed(2)}</div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Star className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Nenhum serviço registrado ainda</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-[#D15556] text-[#D15556]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'appointments'
                  ? 'border-[#D15556] text-[#D15556]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Agendamentos ({client.appointments.length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'payments'
                  ? 'border-[#D15556] text-[#D15556]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pagamentos ({client.payments.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 text-[#D15556] mr-2" />
                  Últimos Agendamentos
                </h3>
                <div className="space-y-3">
                  {client.appointments.length > 0 ? (
                    client.appointments.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div>
                          <div className="font-medium text-gray-900">{appointment.service}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(appointment.date).toLocaleDateString('pt-BR')} • {appointment.professional}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-[#D15556]">R$ {appointment.price.toFixed(2)}</div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                            {appointment.status === 'COMPLETED' ? 'Concluído' : appointment.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Nenhum agendamento encontrado</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 text-[#D15556] mr-2" />
                  Últimos Pagamentos
                </h3>
                <div className="space-y-3">
                  {client.payments.length > 0 ? (
                    client.payments.slice(0, 3).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div>
                          <div className="font-medium text-gray-900">
                            {getPaymentMethodIcon(payment.method)} {payment.method}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(payment.date).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">R$ {payment.amount.toFixed(2)}</div>
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Pago
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Nenhum pagamento encontrado</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div>
              {client.appointments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Serviço
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Profissional
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Observações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {client.appointments.map((appointment) => (
                        <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {new Date(appointment.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {appointment.service}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {appointment.professional}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                              {appointment.status === 'COMPLETED' ? 'Concluído' : appointment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#D15556]">
                            R$ {appointment.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {appointment.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento encontrado</h3>
                  <p>Este cliente ainda não possui agendamentos registrados.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              {client.payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Método
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {client.payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {new Date(payment.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <span className="mr-2 text-lg">{getPaymentMethodIcon(payment.method)}</span>
                              <span className="capitalize">{payment.method}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                            R$ {payment.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Pago
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pagamento encontrado</h3>
                  <p>Este cliente ainda não possui pagamentos registrados.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


