'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash, 
  Phone, 
  Mail, 
  Calendar,
  DollarSign,
  Star,
  Users,
  Upload,
  Download,
  BarChart3,
  TrendingUp
} from 'lucide-react'

// Interface atualizada para MongoDB
interface Client {
  _id: string
  name: string
  email: string | null
  phone: string
  address: string | null
  birthDate: string | null
  notes: string | null
  profileComplete: boolean
  onboardingRequired: boolean
  firstAccess: boolean
  profileCompletionDate: string | null
  createdAt: string
  updatedAt: string
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [isLoading, setIsLoading] = useState(true)
  const [showAnalytics, setShowAnalytics] = useState(false)

  // Carregar clientes do banco de dados
  useEffect(() => {
    const loadClients = async () => {
      try {
        setIsLoading(true)
        console.log('Carregando clientes do banco de dados...')
        const response = await fetch('/api/clients')
        if (!response.ok) {
          throw new Error('Erro ao carregar clientes')
        }
        const data = await response.json()
        console.log('Clientes carregados do banco:', data.length)
        setClients(data)
      } catch (error) {
        console.error('Erro ao carregar clientes:', error)
        setClients([])
      } finally {
        setIsLoading(false)
      }
    }
    
    loadClients()
  }, [])

  const filteredAndSortedClients = clients
    .filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      client.phone.includes(searchTerm)
    )
    .sort((a, b) => {
      let aValue: string | Date, bValue: string | Date
      
      switch (sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'createdAt':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        case 'phone':
          aValue = a.phone
          bValue = b.phone
          break
        default:
          aValue = a.name
          bValue = b.name
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const handleDelete = async (id: string) => {
    if (confirm(`Tem certeza que deseja excluir o cliente ${clients.find(c => c._id === id)?.name || 'desconhecido'}?`)) {
      try {
        console.log('Tentando excluir cliente com ID:', id)
        
        const response = await fetch(`/api/clients/${id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          console.log('Cliente excluído com sucesso, atualizando lista...')
          setClients(prevClients => prevClients.filter(client => client._id !== id))
          alert('Cliente excluído com sucesso!')
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao excluir cliente')
        }
      } catch (error) {
        console.error('Erro ao excluir cliente:', error)
        alert(`Erro ao excluir cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }
    }
  }

  // Análises
  const totalClients = clients.length
  const clientsThisMonth = clients.filter(client => {
    const clientDate = new Date(client.createdAt)
    const now = new Date()
    return clientDate.getMonth() === now.getMonth() && clientDate.getFullYear() === now.getFullYear()
  }).length

  const clientsWithEmail = clients.filter(client => client.email).length
  const clientsWithAddress = clients.filter(client => client.address).length
  const clientsPendingOnboarding = clients.filter(client => client.onboardingRequired).length

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando clientes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie todos os clientes do salão ({totalClients} clientes)
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {showAnalytics ? 'Ocultar' : 'Mostrar'} Análises
          </button>
          <Link
            href="/admin/clientes/importar-flexivel"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar Clientes
          </Link>
          <Link
            href="/admin/clientes/novo"
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Link>
        </div>
      </div>

      {/* Análises */}
      {showAnalytics && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Análise de Clientes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600">Total de Clientes</p>
                    <p className="text-2xl font-bold text-blue-900">{totalClients}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600">Este Mês</p>
                    <p className="text-2xl font-bold text-green-900">{clientsThisMonth}</p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Mail className="w-8 h-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-600">Com Email</p>
                    <p className="text-2xl font-bold text-yellow-900">{clientsWithEmail}</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Phone className="w-8 h-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-600">Com Endereço</p>
                    <p className="text-2xl font-bold text-purple-900">{clientsWithAddress}</p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-orange-600">Pendente Onboarding</p>
                    <p className="text-2xl font-bold text-orange-900">{clientsPendingOnboarding}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="name">Ordenar por Nome</option>
                <option value="createdAt">Ordenar por Data de Cadastro</option>
                <option value="phone">Ordenar por Telefone</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Endereço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data de Cadastro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'Nenhum cliente encontrado com esses critérios.' : 'Nenhum cliente cadastrado ainda.'}
                  </td>
                </tr>
              ) : (
                filteredAndSortedClients.map((client) => (
                  <tr key={client._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-pink-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-500">ID: {client._id.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {client.email || 'Email não informado'}
                        </div>
                        <div className="flex items-center mt-1">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {client.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.address || 'Endereço não informado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(client.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.onboardingRequired ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          ⏳ Onboarding Pendente
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✅ Perfil Completo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/clientes/${client._id}`}
                          className="text-pink-600 hover:text-pink-900"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/clientes/${client._id}/editar`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(client._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
