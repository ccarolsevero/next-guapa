'use client'

import { useState } from 'react'
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
  BarChart3
} from 'lucide-react'

// Mock data para finanças
const mockFinancialData = {
  // Receitas dos últimos 6 meses
  revenue: [
    { month: 'Jul', amount: 8500 },
    { month: 'Ago', amount: 9200 },
    { month: 'Set', amount: 7800 },
    { month: 'Out', amount: 10500 },
    { month: 'Nov', amount: 9800 },
    { month: 'Dez', amount: 12000 }
  ],
  
  // Despesas dos últimos 6 meses
  expenses: [
    { month: 'Jul', amount: 3200 },
    { month: 'Ago', amount: 3400 },
    { month: 'Set', amount: 3100 },
    { month: 'Out', amount: 3800 },
    { month: 'Nov', amount: 3600 },
    { month: 'Dez', amount: 4200 }
  ],
  
  // Pagamentos recentes
  recentPayments: [
    {
      id: 1,
      clientName: "Maria Silva",
      service: "Corte Feminino",
      amount: 45.00,
      method: "PIX",
      date: "2024-01-15",
      status: "PAID"
    },
    {
      id: 2,
      clientName: "João Santos",
      service: "Corte Masculino",
      amount: 35.00,
      method: "CASH",
      date: "2024-01-15",
      status: "PAID"
    },
    {
      id: 3,
      clientName: "Ana Costa",
      service: "Coloração",
      amount: 80.00,
      method: "CREDIT_CARD",
      date: "2024-01-14",
      status: "PAID"
    },
    {
      id: 4,
      clientName: "Pedro Lima",
      service: "Barba",
      amount: 25.00,
      method: "PIX",
      date: "2024-01-14",
      status: "PENDING"
    },
    {
      id: 5,
      clientName: "Carla Ferreira",
      service: "Hidratação",
      amount: 50.00,
      method: "CASH",
      date: "2024-01-13",
      status: "PAID"
    }
  ],
  
  // Métodos de pagamento
  paymentMethods: [
    { method: "PIX", count: 45, amount: 2250 },
    { method: "CASH", count: 38, amount: 1900 },
    { method: "CREDIT_CARD", count: 32, amount: 1600 },
    { method: "DEBIT_CARD", count: 25, amount: 1250 }
  ]
}

export default function FinanceiroPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months')
  const [selectedStatus, setSelectedStatus] = useState('all')

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getTotalRevenue = () => {
    return mockFinancialData.revenue.reduce((sum, item) => sum + item.amount, 0)
  }

  const getTotalExpenses = () => {
    return mockFinancialData.expenses.reduce((sum, item) => sum + item.amount, 0)
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

  const filteredPayments = mockFinancialData.recentPayments.filter(payment => {
    return selectedStatus === 'all' || payment.status === selectedStatus
  })

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
          
          <button className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(getTotalRevenue())}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Despesas Totais</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(getTotalExpenses())}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Lucro Total</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(getTotalProfit())}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Margem de Lucro</p>
              <p className="text-2xl font-semibold text-gray-900">
                {((getTotalProfit() / getTotalRevenue()) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Receita vs Despesas */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita vs Despesas</h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {mockFinancialData.revenue.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-200 rounded-t-lg relative group">
                {/* Receita */}
                <div 
                  className="bg-green-500 rounded-t-lg transition-all duration-300 group-hover:bg-green-600"
                  style={{ height: `${(item.amount / 12000) * 120}px` }}
                ></div>
                {/* Despesa */}
                <div 
                  className="bg-red-500 transition-all duration-300 group-hover:bg-red-600"
                  style={{ height: `${(mockFinancialData.expenses[index].amount / 12000) * 120}px` }}
                ></div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <div>Receita: {formatCurrency(item.amount)}</div>
                  <div>Despesa: {formatCurrency(mockFinancialData.expenses[index].amount)}</div>
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-2">{item.month}</div>
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

      {/* Métodos de Pagamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pagamento</h3>
          <div className="space-y-4">
            {mockFinancialData.paymentMethods.map((method, index) => {
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
                      {((method.amount / getTotalRevenue()) * 100).toFixed(1)}%
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
            {mockFinancialData.revenue.slice(-3).map((item, index) => {
              const expense = mockFinancialData.expenses[index + 3]
              const profit = item.amount - expense.amount
              return (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{item.month}</span>
                    <span className={`font-semibold ${profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(profit)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Receita: {formatCurrency(item.amount)} | Despesa: {formatCurrency(expense.amount)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
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
      </div>
    </div>
  )
}
