'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  User, 
  DollarSign,
  ShoppingBag,
  Calendar,
  Play
} from 'lucide-react'

interface Comanda {
  _id: string
  clientId: {
    _id: string
    name: string
    phone: string
    email: string
  }
  professionalId: {
    _id: string
    name: string
  }
  status: 'em_atendimento' | 'finalizada' | 'cancelada'
  dataInicio: string
  dataFim?: string
  servicos: Array<{
    servicoId: string
    nome: string
    preco: number
    quantidade: number
  }>
  produtos: Array<{
    produtoId: string
    nome: string
    preco: number
    quantidade: number
    vendidoPor: string
  }>
  observacoes: string
  valorTotal: number
  createdAt: string
  updatedAt: string
}

const statusColors = {
  em_atendimento: "bg-blue-100 text-blue-800",
  finalizada: "bg-green-100 text-green-800",
  cancelada: "bg-red-100 text-red-800"
}

const statusLabels = {
  em_atendimento: "Em Atendimento",
  finalizada: "Finalizada",
  cancelada: "Cancelada"
}

export default function ComandasPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [comandas, setComandas] = useState<Comanda[]>([])
  const [loading, setLoading] = useState(true)

  // Buscar comandas do banco
  useEffect(() => {
    const fetchComandas = async () => {
      try {
        setLoading(true)
        console.log('🔄 Buscando comandas do banco...')
        
        const response = await fetch('/api/comandas')
        console.log('📡 Resposta da API de comandas:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('📊 Comandas recebidas:', data.comandas?.length || 0)
          setComandas(data.comandas || [])
        } else {
          console.error('❌ Erro na API de comandas:', response.status)
          const errorText = await response.text()
          console.error('❌ Detalhes do erro:', errorText)
        }
      } catch (error) {
        console.error('❌ Erro ao buscar comandas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchComandas()
  }, [])

  const filteredComandas = comandas.filter(comanda => {
    const matchesSearch = comanda.clientId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comanda.professionalId.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'todos' || comanda.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getTotalComandas = () => comandas.length
  const getComandasAtivas = () => comandas.filter(c => c.status === 'em_atendimento').length
  const getTotalFaturado = () => comandas.filter(c => c.status === 'finalizada').reduce((sum, c) => sum + c.valorTotal, 0)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando comandas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-900">Comandas</h1>
          <p className="text-gray-600">Gerencie as comandas ativas dos clientes</p>
        </div>
        <Link
          href="/admin/comandas/nova"
          className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors font-medium tracking-wide"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Nova Comanda
        </Link>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-gray-50 border border-gray-100">
              <ShoppingBag className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Comandas</p>
              <p className="text-2xl font-light text-gray-900">{getTotalComandas()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 border border-blue-100">
              <Play className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Comandas Ativas</p>
              <p className="text-2xl font-light text-gray-900">{getComandasAtivas()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 border border-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Faturado Hoje</p>
              <p className="text-2xl font-light text-gray-900">R$ {getTotalFaturado().toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-orange-50 border border-orange-100">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
              <p className="text-2xl font-light text-gray-900">75 min</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por cliente ou profissional..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white text-black focus:ring-0 focus:border-black transition-colors"
                style={{ color: '#000000' }}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 bg-white text-black focus:ring-0 focus:border-black transition-colors"
              style={{ color: '#000000' }}
            >
              <option value="todos">Todos os Status</option>
              <option value="em_atendimento">Em Atendimento</option>
              <option value="finalizada">Finalizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Comandas */}
      <div className="bg-white border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profissional
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Início
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Itens
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredComandas.map((comanda) => (
                <tr key={comanda._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{comanda.clientId.name}</div>
                      <div className="text-sm text-gray-500">{comanda.clientId.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{comanda.professionalId.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatDate(comanda.dataInicio)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[comanda.status]}`}>
                      {statusLabels[comanda.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {comanda.servicos.length + comanda.produtos.length} itens
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    R$ {comanda.valorTotal.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/comandas/${comanda._id}`}
                        className="text-black hover:text-gray-600 transition-colors"
                      >
                        Visualizar
                      </Link>
                      {comanda.status !== 'finalizada' && (
                        <Link
                          href={`/admin/atendimentos/finalizar/${comanda._id}`}
                          className="text-green-600 hover:text-green-800 transition-colors"
                        >
                          Finalizar
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredComandas.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {comandas.length === 0 ? 'Nenhuma comanda encontrada' : 'Nenhuma comanda corresponde aos filtros'}
          </h3>
          <p className="text-gray-600">
            {comandas.length === 0 
              ? 'Crie sua primeira comanda para começar a gerenciar os atendimentos.' 
              : 'Tente ajustar os filtros de busca ou status.'
            }
          </p>
        </div>
      )}
    </div>
  )
}
