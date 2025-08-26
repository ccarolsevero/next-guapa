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
  Sparkles
} from 'lucide-react'

// Dados mockados para demonstração
const mockClientData = {
  id: 1,
  name: "Maria Silva",
  email: "maria.silva@email.com",
  phone: "(11) 99999-0001",
  birthDate: "1985-03-15",
      address: "Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP",
  notes: "Cliente fiel, sempre pontual. Prefere horários da tarde. Alérgica a alguns produtos.",
  totalAppointments: 12,
  totalSpent: 850.00,
  averageTicket: 70.83,
  lastVisit: "2024-01-10",
  firstVisit: "2023-03-15",
  favoriteServices: [
    { name: "Corte Feminino", count: 5, totalSpent: 225.00 },
    { name: "Coloração", count: 3, totalSpent: 240.00 },
    { name: "Hidratação", count: 4, totalSpent: 200.00 }
  ],
  appointments: [
    {
      id: 1,
      date: "2024-01-10",
      service: "Corte Feminino",
      professional: "Ana Carolina",
      status: "COMPLETED",
      price: 45.00,
      notes: "Corte com franja"
    },
    {
      id: 2,
      date: "2023-12-20",
      service: "Coloração",
      professional: "Mariana Silva",
      status: "COMPLETED",
      price: 80.00,
      notes: "Retoque de raiz"
    },
    {
      id: 3,
      date: "2023-12-05",
      service: "Hidratação",
      professional: "Fernanda Santos",
      status: "COMPLETED",
      price: 50.00,
      notes: "Tratamento profundo"
    },
    {
      id: 4,
      date: "2023-11-15",
      service: "Corte Feminino",
      professional: "Ana Carolina",
      status: "COMPLETED",
      price: 45.00,
      notes: "Manutenção do corte"
    }
  ],
  payments: [
    {
      id: 1,
      date: "2024-01-10",
      amount: 45.00,
      method: "PIX",
      status: "PAID"
    },
    {
      id: 2,
      date: "2023-12-20",
      amount: 80.00,
      method: "CREDIT_CARD",
      status: "PAID"
    },
    {
      id: 3,
      date: "2023-12-05",
      amount: 50.00,
      method: "CASH",
      status: "PAID"
    }
  ]
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
  const [client, setClient] = useState(mockClientData)
  const [activeTab, setActiveTab] = useState('overview')

  const getAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/admin/clientes"
          className="flex items-center text-pink-600 hover:text-pink-700 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para Clientes
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-600">Detalhes completos do cliente</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/admin/clientes/${client.id}/historico`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Histórico
            </Link>
            <Link
              href={`/admin/clientes/${client.id}/editar`}
              className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Cliente
            </Link>
            <Link
              href={`/admin/agendamentos/novo?client=${client.id}`}
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
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-pink-600">
                  {client.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{client.name}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{client.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{client.address}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{getAge(client.birthDate)} anos</span>
                  </div>
                </div>
              </div>
            </div>
            
            {client.notes && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Observações</h3>
                <p className="text-gray-600">{client.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de Visitas</span>
                <span className="font-semibold text-gray-900">{client.totalAppointments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Valor Total Gasto</span>
                <span className="font-semibold text-green-600">R$ {client.totalSpent.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ticket Médio</span>
                <span className="font-semibold text-gray-900">R$ {client.averageTicket.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Primeira Visita</span>
                <span className="font-semibold text-gray-900">{new Date(client.firstVisit).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Última Visita</span>
                <span className="font-semibold text-gray-900">{new Date(client.lastVisit).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Serviços Favoritos</h3>
            <div className="space-y-3">
              {client.favoriteServices.map((service, index) => {
                const IconComponent = serviceIcons[service.name as keyof typeof serviceIcons] || Scissors
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <IconComponent className="w-4 h-4 text-pink-600 mr-2" />
                      <span className="text-sm text-gray-700">{service.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{service.count}x</div>
                      <div className="text-xs text-gray-500">R$ {service.totalSpent.toFixed(2)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'appointments'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Agendamentos ({client.appointments.length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-pink-500 text-pink-600'
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimos Agendamentos</h3>
                <div className="space-y-3">
                  {client.appointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{appointment.service}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(appointment.date).toLocaleDateString('pt-BR')} • {appointment.professional}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">R$ {appointment.price.toFixed(2)}</div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status === 'COMPLETED' ? 'Concluído' : appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimos Pagamentos</h3>
                <div className="space-y-3">
                  {client.payments.slice(0, 3).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          {getPaymentMethodIcon(payment.method)} {payment.method}
                        </div>
                        <div className="text-sm text-gray-500">
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
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Serviço
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profissional
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Observações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {client.appointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          R$ {appointment.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {appointment.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Método
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {client.payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(payment.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <span className="mr-2">{getPaymentMethodIcon(payment.method)}</span>
                            {payment.method}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          R$ {payment.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Pago
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


