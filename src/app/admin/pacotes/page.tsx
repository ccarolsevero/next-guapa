'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash, Search, DollarSign, Clock, TrendingUp, Package } from 'lucide-react'

interface Service {
  _id: string
  id: string
  name: string
  price: number
}

interface PackageItem {
  _id: string
  id: string
  name: string
  description: string
  validityDays: number
  services: Array<{
    serviceId: string
    name: string
    price: number
  }>
  originalPrice: number
  discountedPrice: number
  discount: number
  commission: string
  availableOnline: boolean
  availableInSystem: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function PacotesPage() {
  const [packages, setPackages] = useState<PackageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)

  // Carregar pacotes da API
  const loadPackages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/packages')
      if (!response.ok) {
        throw new Error('Erro ao carregar pacotes')
      }
      const data = await response.json()
      setPackages(data)
    } catch (error) {
      console.error('Erro ao carregar pacotes:', error)
      alert('Erro ao carregar pacotes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPackages()
  }, [])

  const filteredPackages = packages.filter(packageItem => {
    const matchesSearch = packageItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         packageItem.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = showInactive ? true : packageItem.isActive

    return matchesSearch && matchesStatus
  })

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este pacote?')) {
      try {
        const response = await fetch(`/api/packages/${id}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          // Recarregar a lista de pacotes
          await loadPackages()
          alert('Pacote excluído com sucesso!')
        } else {
          const error = await response.json()
          alert(`Erro ao excluir pacote: ${error.error}`)
        }
      } catch (error) {
        console.error('Erro ao excluir pacote:', error)
        alert('Erro ao excluir pacote')
      }
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getCommissionLabel = (commission: string) => {
    switch (commission) {
      case 'comissao-valor-integral':
        return 'Comissão Valor Integral'
      case 'comissao-valor-desconto':
        return 'Comissão Valor Desconto'
      case 'sem-comissao':
        return 'Sem Comissão'
      default:
        return 'Não definido'
    }
  }

  const getAvailabilityLabel = (packageItem: PackageItem) => {
    const labels = []
    if (packageItem.availableOnline) labels.push('Online')
    if (packageItem.availableInSystem) labels.push('Sistema')
    return labels.join(' / ') || 'Nenhum'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pacotes de Serviços</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie os pacotes de serviços oferecidos pelo salão
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/pacotes/novo"
            className="bg-[#D15556] text-white px-4 py-2 rounded-lg hover:bg-[#c04546] transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Pacote
          </Link>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Buscar pacotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              style={{ color: '#000000' }}
            />
          </div>
          
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="h-4 w-4 text-[#D15556] focus:ring-[#D15556] border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Mostrar inativos</span>
            </label>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Package className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Pacotes</p>
              <p className="text-2xl font-semibold text-gray-900">{packages.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pacotes Ativos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {packages.filter(p => p.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Preço Médio</p>
              <p className="text-2xl font-semibold text-gray-900">
                {packages.length > 0 ? formatCurrency(packages.reduce((sum, p) => sum + p.discountedPrice, 0) / packages.length) : 'R$ 0,00'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <Clock className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Validade Média</p>
              <p className="text-2xl font-semibold text-gray-900">
                {packages.length > 0 ? Math.round(packages.reduce((sum, p) => sum + p.validityDays, 0) / packages.length) : 0} dias
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Pacotes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Pacotes ({filteredPackages.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pacote
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Validade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serviços
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preços
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comissão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disponibilidade
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
              {filteredPackages.map((packageItem) => (
                <tr key={packageItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{packageItem.name}</div>
                      <div className="text-sm text-gray-500">{packageItem.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {packageItem.validityDays} dias
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="max-w-xs">
                      {packageItem.services.map((service, index) => (
                        <div key={index} className="text-xs text-gray-600">
                          • {service.name}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div>
                      <div className="text-sm text-gray-500 line-through">
                        {formatCurrency(packageItem.originalPrice)}
                      </div>
                      <div className="text-lg font-bold text-[#D15556]">
                        {formatCurrency(packageItem.discountedPrice)}
                      </div>
                      {packageItem.discount > 0 && (
                        <div className="text-xs text-green-600">
                          -{packageItem.discount}%
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getCommissionLabel(packageItem.commission)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getAvailabilityLabel(packageItem)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      packageItem.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {packageItem.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/pacotes/editar/${packageItem.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar pacote"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(packageItem.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir pacote"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
