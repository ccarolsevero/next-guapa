'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, Eye, CheckCircle, Clock, XCircle, Search, Filter } from 'lucide-react'

interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
  discount?: number
  originalPrice?: number
}

interface CustomerInfo {
  name: string
  email: string
  phone: string
  address?: string
  notes?: string
}

interface Order {
  _id: string
  orderNumber: string
  customerInfo: CustomerInfo
  items: OrderItem[]
  total: number
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled'
  paymentMethod: string
  pickupDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4 text-yellow-600" />
    case 'confirmed':
      return <CheckCircle className="w-4 h-4 text-blue-600" />
    case 'ready':
      return <CheckCircle className="w-4 h-4 text-orange-600" />
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-600" />
    case 'cancelled':
      return <XCircle className="w-4 h-4 text-red-600" />
    default:
      return <Clock className="w-4 h-4 text-gray-600" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'confirmed':
      return 'bg-blue-100 text-blue-800'
    case 'ready':
      return 'bg-orange-100 text-orange-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pendente'
    case 'confirmed':
      return 'Confirmado'
    case 'ready':
      return 'Pronto'
    case 'completed':
      return 'Entregue'
    case 'cancelled':
      return 'Cancelado'
    default:
      return 'Pendente'
  }
}

export default function PedidosAdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showOrderDetails, setShowOrderDetails] = useState<string | null>(null)

  // Buscar pedidos da API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/orders')
        if (response.ok) {
          const data = await response.json()
          setOrders(data.orders || [])
        } else {
          console.error('Erro ao buscar pedidos:', response.statusText)
        }
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerInfo.phone.includes(searchTerm) ||
                         order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Estatísticas
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const confirmedOrders = orders.filter(o => o.status === 'confirmed').length
  const readyOrders = orders.filter(o => o.status === 'ready').length
  const completedOrders = orders.filter(o => o.status === 'completed').length
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length
  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        // Atualizar a lista de pedidos
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus as any }
              : order
          )
        )
      } else {
        console.error('Erro ao atualizar status do pedido')
      }
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </div>
    )
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
                <p className="text-2xl font-bold text-gray-900">{completedOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelados</p>
                <p className="text-2xl font-bold text-gray-900">{cancelledOrders}</p>
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
                  placeholder="Buscar por cliente ou número do pedido..."
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
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmado</option>
                <option value="ready">Pronto</option>
                <option value="completed">Entregue</option>
                <option value="cancelled">Cancelado</option>
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
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                      <div className="text-sm text-gray-500">{order.items.length} item(ns)</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.customerInfo.name}</div>
                        <div className="text-sm text-gray-500">{order.customerInfo.phone}</div>
                        <div className="text-sm text-gray-500">{order.customerInfo.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        R$ {order.total.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowOrderDetails(showOrderDetails === order._id ? null : order._id)}
                          className="text-pink-600 hover:text-pink-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'confirmed')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'ready')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {order.status === 'ready' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'completed')}
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
                  const order = orders.find(o => o._id === showOrderDetails)
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
                              <p className="font-medium text-gray-900">{order.customerInfo.name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Telefone</p>
                              <p className="font-medium text-gray-900">{order.customerInfo.phone}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Email</p>
                              <p className="font-medium text-gray-900">{order.customerInfo.email}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Data do Pedido</p>
                              <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Endereço */}
                      {order.customerInfo.address && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Endereço de Entrega</h3>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="font-medium text-gray-900">{order.customerInfo.address}</p>
                          </div>
                        </div>
                      )}

                      {/* Itens do Pedido */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Itens do Pedido</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="space-y-3">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-900">{item.name}</p>
                                  <p className="text-sm text-gray-600">Quantidade: {item.quantity}</p>
                                  {item.discount && (
                                    <p className="text-sm text-green-600">Desconto: {item.discount}%</p>
                                  )}
                                </div>
                                <p className="font-medium text-gray-900">R$ {(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                            ))}
                            <div className="border-t pt-3 mt-3">
                              <div className="flex justify-between items-center font-bold">
                                <span className="text-gray-900">Total:</span>
                                <span className="text-lg text-gray-900">R$ {order.total.toFixed(2)}</span>
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
                            <p className="text-gray-900">{order.notes}</p>
                          </div>
                        </div>
                      )}

                      {/* Status */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Status do Pedido</h3>
                        <div className="flex items-center mb-4">
                          {getStatusIcon(order.status)}
                          <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        
                        {/* Ações do Pedido */}
                        <div className="space-y-4">
                          <h4 className="text-md font-semibold text-gray-900 mb-3">Marcar Etapas:</h4>
                          
                          <div className="space-y-3">
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={order.status !== 'pending'}
                                onChange={() => {
                                  if (order.status === 'pending') {
                                    updateOrderStatus(order._id, 'confirmed')
                                  } else if (order.status === 'confirmed') {
                                    updateOrderStatus(order._id, 'pending')
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                              <span className="text-gray-900 font-medium">Confirmado</span>
                            </label>
                            
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={order.status === 'ready' || order.status === 'completed'}
                                onChange={() => {
                                  if (order.status === 'confirmed') {
                                    updateOrderStatus(order._id, 'ready')
                                  } else if (order.status === 'ready' || order.status === 'completed') {
                                    updateOrderStatus(order._id, 'confirmed')
                                  }
                                }}
                                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                              />
                              <span className="text-gray-900 font-medium">Pago</span>
                            </label>
                            
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={order.status === 'completed'}
                                onChange={() => {
                                  if (order.status === 'ready') {
                                    updateOrderStatus(order._id, 'completed')
                                  } else if (order.status === 'completed') {
                                    updateOrderStatus(order._id, 'ready')
                                  }
                                }}
                                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                              />
                              <span className="text-gray-900 font-medium">Retirado</span>
                            </label>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            {order.status === 'cancelled' ? (
                              <button
                                onClick={() => updateOrderStatus(order._id, 'pending')}
                                className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                              >
                                Reativar Pedido
                              </button>
                            ) : (
                              <button
                                onClick={() => updateOrderStatus(order._id, 'cancelled')}
                                className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                              >
                                Cancelar Pedido
                              </button>
                            )}
                          </div>
                          
                          {order.status !== 'completed' && order.status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                updateOrderStatus(order._id, 'cancelled')
                                setShowOrderDetails(null)
                              }}
                              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 mt-4"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Cancelar Pedido</span>
                            </button>
                          )}
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
