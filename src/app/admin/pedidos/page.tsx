'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Eye, CheckCircle, Clock, XCircle, Search, Filter } from 'lucide-react'

// Mock data para pedidos
const orders = [
  {
    id: '1',
    clientName: 'Maria Silva',
    clientEmail: 'maria@email.com',
    clientPhone: '(11) 99999-9999',
    totalAmount: 136.00,
    status: 'PENDING',
    statusText: 'Pendente',
    createdAt: '2024-01-15T10:30:00',
    items: [
      { name: 'Shampoo Profissional Hidratação', quantity: 1, price: 38.00 },
      { name: 'Máscara Capilar Reconstrução', quantity: 2, price: 49.00 }
    ],
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    notes: 'Entregar antes das 18h'
  },
  {
    id: '2',
    clientName: 'João Santos',
    clientEmail: 'joao@email.com',
    clientPhone: '(11) 88888-8888',
    totalAmount: 85.00,
    status: 'CONFIRMED',
    statusText: 'Confirmado',
    createdAt: '2024-01-14T15:45:00',
    items: [
      { name: 'Escova Profissional Térmica', quantity: 1, price: 85.00 }
    ],
    address: 'Av. Paulista, 456',
    city: 'São Paulo',
    state: 'SP',
    notes: ''
  },
  {
    id: '3',
    clientName: 'Ana Costa',
    clientEmail: 'ana@email.com',
    clientPhone: '(11) 77777-7777',
    totalAmount: 99.00,
    status: 'PREPARING',
    statusText: 'Preparando',
    createdAt: '2024-01-14T09:15:00',
    items: [
      { name: 'Kit Maquiagem Completo', quantity: 1, price: 99.00 }
    ],
    address: 'Rua Augusta, 789',
    city: 'São Paulo',
    state: 'SP',
    notes: 'Produto frágil, embalar com cuidado'
  },
  {
    id: '4',
    clientName: 'Carlos Eduardo',
    clientEmail: 'carlos@email.com',
    clientPhone: '(11) 66666-6666',
    totalAmount: 65.00,
    status: 'READY',
    statusText: 'Pronto',
    createdAt: '2024-01-13T14:20:00',
    items: [
      { name: 'Creme de Tratamento Sem Enxágue', quantity: 1, price: 65.00 }
    ],
    address: 'Rua Consolação, 321',
    city: 'São Paulo',
    state: 'SP',
    notes: ''
  },
  {
    id: '5',
    clientName: 'Fernanda Lima',
    clientEmail: 'fernanda@email.com',
    clientPhone: '(11) 55555-5555',
    totalAmount: 87.00,
    status: 'DELIVERED',
    statusText: 'Entregue',
    createdAt: '2024-01-12T11:30:00',
    items: [
      { name: 'Condicionador Nutrição Intensa', quantity: 1, price: 50.00 },
      { name: 'Shampoo Anticaspa', quantity: 1, price: 42.00 }
    ],
    address: 'Rua Oscar Freire, 654',
    city: 'São Paulo',
    state: 'SP',
    notes: ''
  }
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <Clock className="w-4 h-4 text-yellow-600" />
    case 'CONFIRMED':
      return <CheckCircle className="w-4 h-4 text-blue-600" />
    case 'PREPARING':
      return <ShoppingBag className="w-4 h-4 text-purple-600" />
    case 'READY':
      return <CheckCircle className="w-4 h-4 text-orange-600" />
    case 'DELIVERED':
      return <CheckCircle className="w-4 h-4 text-green-600" />
    case 'CANCELLED':
      return <XCircle className="w-4 h-4 text-red-600" />
    default:
      return <Clock className="w-4 h-4 text-gray-600" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800'
    case 'PREPARING':
      return 'bg-purple-100 text-purple-800'
    case 'READY':
      return 'bg-orange-100 text-orange-800'
    case 'DELIVERED':
      return 'bg-green-100 text-green-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function PedidosAdminPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showOrderDetails, setShowOrderDetails] = useState<string | null>(null)

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.clientPhone.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Estatísticas
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length
  const confirmedOrders = orders.filter(o => o.status === 'CONFIRMED').length
  const preparingOrders = orders.filter(o => o.status === 'PREPARING').length
  const readyOrders = orders.filter(o => o.status === 'READY').length
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length
  const totalRevenue = orders.filter(o => o.status === 'DELIVERED').reduce((sum, o) => sum + o.totalAmount, 0)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    // Implementar atualização de status
    console.log('Atualizar status do pedido:', orderId, 'para:', newStatus)
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Pedidos</h1>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmados</p>
                <p className="text-2xl font-bold text-gray-900">{confirmedOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Preparando</p>
                <p className="text-2xl font-bold text-gray-900">{preparingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Prontos</p>
                <p className="text-2xl font-bold text-gray-900">{readyOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Entregues</p>
                <p className="text-2xl font-bold text-gray-900">{deliveredOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita</p>
                <p className="text-2xl font-bold text-gray-900">R$ {totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  style={{ color: '#000000' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                style={{ color: '#000000' }}
              >
                <option value="all">Todos os status</option>
                <option value="PENDING">Pendente</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="PREPARING">Preparando</option>
                <option value="READY">Pronto</option>
                <option value="DELIVERED">Entregue</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                Exportar Relatório
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Pedidos */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                      <div className="text-sm text-gray-500">{order.items.length} item(ns)</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.clientName}</div>
                        <div className="text-sm text-gray-500">{order.clientPhone}</div>
                        <div className="text-sm text-gray-500">{order.clientEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        R$ {order.totalAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.statusText}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowOrderDetails(showOrderDetails === order.id ? null : order.id)}
                          className="text-pink-600 hover:text-pink-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {order.status === 'CONFIRMED' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                        )}
                        {order.status === 'PREPARING' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'READY')}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {order.status === 'READY' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detalhes do Pedido */}
        {showOrderDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Detalhes do Pedido</h2>
                  <button
                    onClick={() => setShowOrderDetails(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {(() => {
                  const order = orders.find(o => o.id === showOrderDetails)
                  if (!order) return null

                  return (
                    <div className="space-y-6">
                      {/* Informações do Cliente */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações do Cliente</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Nome</p>
                              <p className="font-medium">{order.clientName}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Telefone</p>
                              <p className="font-medium">{order.clientPhone}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Email</p>
                              <p className="font-medium">{order.clientEmail}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Data do Pedido</p>
                              <p className="font-medium">{formatDate(order.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Endereço */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Endereço de Entrega</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="font-medium">{order.address}</p>
                          <p className="text-gray-600">{order.city}, {order.state}</p>
                        </div>
                      </div>

                      {/* Itens do Pedido */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Itens do Pedido</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="space-y-3">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-gray-600">Quantidade: {item.quantity}</p>
                                </div>
                                <p className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                            ))}
                            <div className="border-t pt-3 mt-3">
                              <div className="flex justify-between items-center font-bold">
                                <span>Total:</span>
                                <span className="text-lg">R$ {order.totalAmount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Observações */}
                      {order.notes && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Observações</h3>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p>{order.notes}</p>
                          </div>
                        </div>
                      )}

                      {/* Status */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Status do Pedido</h3>
                        <div className="flex items-center">
                          {getStatusIcon(order.status)}
                          <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.statusText}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        )}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum pedido encontrado</p>
            <p className="text-gray-400">Tente ajustar os filtros de busca</p>
          </div>
        )}
      </div>
    </div>
  )
}
