'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Banknote, 
  Calendar,
  Plus,
  Download,
  Filter,
  BarChart3,
  Users,
  Package,
  Loader2
} from 'lucide-react'

interface FinancialData {
  revenue: Array<{ month: string; amount: number }>
  expenses: Array<{ month: string; amount: number }>
  recentPayments: Array<{
    id: number
    clientName: string
    service: string
    amount: number
    method: string
    date: string
    status: string
  }>
  paymentMethods: Array<{
    method: string
    count: number
    amount: number
  }>
  comissoesPorProfissional: Array<{
    _id: string
    nome: string
    totalComissao: number
    quantidadeItens: number
    detalhes: Array<{
      tipo: string
      item: string
      valor: number
      comissao: number
      data: string
    }>
  }>
  totals: {
    revenue: number
    expenses: number
    profit: number
    comandas: number
  }
}

export default function FinanceiroPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const periods = [
    { value: '1month', label: 'Último Mês' },
    { value: '3months', label: 'Últimos 3 Meses' },
    { value: '6months', label: 'Últimos 6 Meses' },
    { value: '1year', label: 'Último Ano' }
  ]

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'PAID', label: 'Pago' },
    { value: 'PENDING', label: 'Pendente' },
    { value: 'CANCELLED', label: 'Cancelado' }
  ]

  // Carregar dados financeiros do banco
  const loadFinancialData = async (period: string) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Carregando dados financeiros para período:', period)
      
      const response = await fetch(`/api/financeiro?period=${period}`)
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setFinancialData(result.data)
        console.log('✅ Dados financeiros carregados:', result.data)
      } else {
        throw new Error(result.error || 'Erro ao carregar dados')
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados financeiros:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Carregar dados quando o período mudar
  useEffect(() => {
    loadFinancialData(selectedPeriod)
  }, [selectedPeriod])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getTotalRevenue = () => {
    return financialData?.totals.revenue || 0
  }

  const getTotalExpenses = () => {
    return financialData?.totals.expenses || 0
  }

  const getTotalProfit = () => {
    return getTotalRevenue() - getTotalExpenses()
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'PIX': return DollarSign
      case 'CASH': return Banknote
      case 'CREDIT_CARD': return CreditCard
      case 'DEBIT_CARD': return CreditCard
      default: return DollarSign
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'PIX': return 'PIX'
      case 'CASH': return 'Dinheiro'
      case 'CREDIT_CARD': return 'Cartão de Crédito'
      case 'DEBIT_CARD': return 'Cartão de Débito'
      default: return method
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID': return 'Pago'
      case 'PENDING': return 'Pendente'
      case 'CANCELLED': return 'Cancelado'
      default: return status
    }
  }

  const filteredPayments = financialData?.recentPayments.filter(payment => {
    return selectedStatus === 'all' || payment.status === selectedStatus
  }) || []

  // Dados para gráficos
  const revenue = financialData?.revenue || []
  const expenses = financialData?.expenses || []
  const paymentMethods = financialData?.paymentMethods || []
  const comissoesPorProfissional = financialData?.comissoesPorProfissional || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
          <p className="mt-2 text-sm text-gray-700">
            Controle financeiro completo do salão
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            style={{ color: '#000000' }}
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
          
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-pink-600 mr-3" />
          <span className="text-lg text-gray-600">Carregando dados financeiros...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro ao carregar dados</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <div className="mt-4">
                <button
                  onClick={() => loadFinancialData(selectedPeriod)}
                  className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dados financeiros */}
      {financialData && !loading && (
        <>
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Receita Total</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(getTotalRevenue())}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Comissões</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(getTotalExpenses())}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Lucro Líquido</dt>
                    <dd className={`text-lg font-medium ${getTotalProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(getTotalProfit())}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Comandas</dt>
                    <dd className="text-lg font-medium text-gray-900">{financialData.totals.comandas}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico Receita vs Despesas */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita vs Despesas</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {revenue.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-200 rounded-t-lg relative group">
                    <div 
                      className="bg-green-500 transition-all duration-300 group-hover:bg-green-600"
                      style={{ height: `${(item.amount / Math.max(...revenue.map(r => r.amount), 1)) * 120}px` }}
                    ></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <div>Receita: {formatCurrency(item.amount)}</div>
                      <div>Despesa: {formatCurrency(expenses[index]?.amount || 0)}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">{item.month}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Receita</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Despesa</span>
              </div>
            </div>
          </div>

          {/* Métodos de Pagamento e Resumo Mensal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pagamento</h3>
              <div className="space-y-4">
                {paymentMethods.map((method, index) => {
                  const IconComponent = getPaymentMethodIcon(method.method)
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <IconComponent className="w-5 h-5 text-gray-600 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {getPaymentMethodLabel(method.method)}
                          </div>
                          <div className="text-sm text-gray-600">{method.count} transações</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(method.amount)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getTotalRevenue() > 0 ? ((method.amount / getTotalRevenue()) * 100).toFixed(1) : '0'}%
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Mensal</h3>
              <div className="space-y-4">
                {revenue.slice(-3).map((item, index) => {
                  const expense = expenses[index + 3]
                  const profit = item.amount - (expense?.amount || 0)
                  return (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{item.month}</span>
                        <span className={`font-semibold ${profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(profit)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Receita: {formatCurrency(item.amount)} | Despesa: {formatCurrency(expense?.amount || 0)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Comissões por Profissional */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comissionamento por Profissional</h3>
            {comissoesPorProfissional.length > 0 ? (
              <div className="space-y-4">
                {comissoesPorProfissional.map((profissional, index) => (
                  <div key={profissional._id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-purple-600 mr-3" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{profissional.nome}</h4>
                          <p className="text-sm text-gray-600">{profissional.quantidadeItens} itens vendidos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">
                          {formatCurrency(profissional.totalComissao)}
                        </div>
                        <div className="text-sm text-gray-600">Total de comissões</div>
                      </div>
                    </div>
                    
                    {/* Detalhes das comissões */}
                    <div className="mt-3 space-y-2">
                      {profissional.detalhes.slice(0, 3).map((detalhe, detIndex) => (
                        <div key={detIndex} className="flex justify-between text-sm bg-white p-2 rounded border">
                          <span className="text-gray-700">
                            {detalhe.tipo === 'servico' ? '🪒' : '🧴'} {detalhe.item}
                          </span>
                          <span className="text-gray-600">
                            {formatCurrency(detalhe.comissao)} ({formatCurrency(detalhe.valor)})
                          </span>
                        </div>
                      ))}
                      {profissional.detalhes.length > 3 && (
                        <div className="text-center text-sm text-gray-500 py-2">
                          +{profissional.detalhes.length - 3} itens adicionais
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhuma comissão registrada para este período</p>
              </div>
            )}
          </div>

          {/* Pagamentos Recentes */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Pagamentos Recentes</h3>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-1 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  style={{ color: '#000000' }}
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {filteredPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Serviço
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Método
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.map((payment) => {
                      const IconComponent = getPaymentMethodIcon(payment.method)
                      return (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {payment.clientName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {payment.service}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <IconComponent className="w-4 h-4 text-gray-600 mr-2" />
                              <span className="text-sm text-gray-900">
                                {getPaymentMethodLabel(payment.method)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(payment.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                              {getStatusLabel(payment.status)}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhum pagamento encontrado para este período</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
