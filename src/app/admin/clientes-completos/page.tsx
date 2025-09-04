'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  CheckCircle,
  Star,
  Filter,
  Search
} from 'lucide-react'

interface CompleteClient {
  _id: string
  name: string
  email: string
  phone: string
  birthDate?: string
  address: string
  onboardingCompletedAt: string
  createdAt: string
  age?: number
}

export default function ClientesCompletosPage() {
  const [clients, setClients] = useState<CompleteClient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'age'>('date')

  useEffect(() => {
    fetchCompleteClients()
  }, [])

  const fetchCompleteClients = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/clients/complete-profiles')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar clientes')
      }
      
      const data = await response.json()
      setClients(data.clients)
    } catch (error) {
      console.error('Erro ao carregar clientes completos:', error)
      alert('Erro ao carregar clientes. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAge = (age: number) => {
    return `${age} anos`
  }

  const filteredAndSortedClients = clients
    .filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'age':
          return (b.age || 0) - (a.age || 0)
        case 'date':
        default:
          return new Date(b.onboardingCompletedAt).getTime() - new Date(a.onboardingCompletedAt).getTime()
      }
    })

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D15556] mx-auto mb-4"></div>
            <p className="text-[#006D5B]">Carregando clientes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-[#D15556] rounded-lg flex items-center justify-center mr-4">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#006D5B]">
              Clientes com Perfil Completo
            </h1>
            <p className="text-gray-600">
              Clientes que completaram o cadastro no painel
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Clientes</p>
                <p className="text-2xl font-bold text-[#006D5B]">{clients.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Este Mês</p>
                <p className="text-2xl font-bold text-[#006D5B]">
                  {clients.filter(client => {
                    const clientDate = new Date(client.onboardingCompletedAt)
                    const now = new Date()
                    return clientDate.getMonth() === now.getMonth() && 
                           clientDate.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-[#D15556]">
                  {clients.length > 0 ? '100%' : '0%'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
            >
              <option value="date">Mais Recentes</option>
              <option value="name">Nome A-Z</option>
              <option value="age">Idade</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredAndSortedClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente com perfil completo'}
            </h3>
            <p className="text-gray-400">
              {searchTerm ? 'Tente ajustar os filtros de busca' : 'Os clientes aparecerão aqui após completarem o cadastro'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#D15556] text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium">Cliente</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Contato</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Idade</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Endereço</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Completou em</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Cliente desde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedClients.map((client) => (
                  <tr key={client._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-[#D15556] rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-medium text-sm">
                            {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-500">ID: {client._id.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {client.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {client.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {client.age ? formatAge(client.age) : 'Não informado'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {client.address}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(client.onboardingCompletedAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(client.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
