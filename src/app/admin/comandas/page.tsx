'use client'

import { useState } from 'react'
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

// Mock data para comandas
const mockComandas = [
  {
    id: 1,
    clientName: "Maria Silva",
    clientPhone: "(11) 99999-1234",
    professionalName: "Ana Carolina",
    startedAt: "2024-01-15 14:00",
    status: "em_atendimento",
    services: [
      { id: 1, name: "Corte Feminino", price: 45.00, quantity: 1 },
      { id: 2, name: "Hidratação", price: 50.00, quantity: 1 }
    ],
    products: [
      { id: 1, name: "Shampoo Profissional", price: 35.00, quantity: 1 },
      { id: 2, name: "Máscara Hidratante", price: 28.00, quantity: 1 }
    ],
    total: 158.00,
    duration: 120
  },
  {
    id: 2,
    clientName: "Joana Costa",
    clientPhone: "(11) 99999-5678",
    professionalName: "Mariana Silva",
    startedAt: "2024-01-15 15:30",
    status: "em_atendimento",
    services: [
      { id: 3, name: "Coloração", price: 80.00, quantity: 1 }
    ],
    products: [],
    total: 80.00,
    duration: 120
  },
  {
    id: 3,
    clientName: "Fernanda Santos",
    clientPhone: "(11) 99999-9012",
    professionalName: "Juliana Costa",
    startedAt: "2024-01-15 16:00",
    status: "aguardando",
    services: [
      { id: 6, name: "Maquiagem Social", price: 80.00, quantity: 1 }
    ],
    products: [],
    total: 80.00,
    duration: 60
  }
]

const statusColors = {
  aguardando: "bg-yellow-100 text-yellow-800",
  em_atendimento: "bg-blue-100 text-blue-800",
  finalizado: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800"
}

const statusLabels = {
  aguardando: "Aguardando",
  em_atendimento: "Em Atendimento",
  finalizado: "Finalizado",
  cancelado: "Cancelado"
}

export default function ComandasPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')

  const filteredComandas = mockComandas.filter(comanda => {
    const matchesSearch = comanda.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comanda.professionalName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'todos' || comanda.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getTotalComandas = () => mockComandas.length
  const getComandasAtivas = () => mockComandas.filter(c => c.status === 'em_atendimento' || c.status === 'aguardando').length
  const getTotalFaturado = () => mockComandas.filter(c => c.status === 'finalizado').reduce((sum, c) => sum + c.total, 0)

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
              <option value="aguardando">Aguardando</option>
              <option value="em_atendimento">Em Atendimento</option>
              <option value="finalizado">Finalizado</option>
              <option value="cancelado">Cancelado</option>
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
                <tr key={comanda.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{comanda.clientName}</div>
                      <div className="text-sm text-gray-500">{comanda.clientPhone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{comanda.professionalName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{comanda.startedAt}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[comanda.status as keyof typeof statusColors]}`}>
                      {statusLabels[comanda.status as keyof typeof statusLabels]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {comanda.services.length + comanda.products.length} itens
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    R$ {comanda.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/comandas/${comanda.id}`}
                        className="text-black hover:text-gray-600 transition-colors"
                      >
                        Visualizar
                      </Link>
                      <Link
                        href={`/admin/comandas/${comanda.id}/editar`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Editar
                      </Link>
                      {comanda.status !== 'finalizado' && (
                        <Link
                          href={`/admin/comandas/${comanda.id}/finalizar`}
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma comanda encontrada</h3>
          <p className="text-gray-600">Não há comandas que correspondam aos filtros aplicados.</p>
        </div>
      )}
    </div>
  )
}
