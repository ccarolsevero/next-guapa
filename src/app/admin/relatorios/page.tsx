'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Download,
  Filter,
  CalendarDays,
  PieChart,
  Activity
} from 'lucide-react'

// Mock data para relatórios
const mockData = {
  // Dados financeiros dos últimos 6 meses
  financialData: [
    { month: 'Jul', revenue: 8500, expenses: 3200, profit: 5300 },
    { month: 'Ago', revenue: 9200, expenses: 3400, profit: 5800 },
    { month: 'Set', revenue: 7800, expenses: 3100, profit: 4700 },
    { month: 'Out', revenue: 10500, expenses: 3800, profit: 6700 },
    { month: 'Nov', revenue: 9800, expenses: 3600, profit: 6200 },
    { month: 'Dez', revenue: 12000, expenses: 4200, profit: 7800 }
  ],
  
  // Serviços mais vendidos
  topServices: [
    { name: 'Corte Feminino', count: 45, revenue: 2025 },
    { name: 'Coloração', count: 32, revenue: 2560 },
    { name: 'Hidratação', count: 28, revenue: 1400 },
    { name: 'Corte Masculino', count: 25, revenue: 875 },
    { name: 'Maquiagem Social', count: 18, revenue: 1440 }
  ],
  
  // Profissionais mais ativos
  topProfessionals: [
    { name: 'Ana Carolina', appointments: 65, revenue: 3200 },
    { name: 'Mariana Silva', appointments: 58, revenue: 2800 },
    { name: 'Carlos Eduardo', appointments: 42, revenue: 1500 },
    { name: 'Juliana Costa', appointments: 38, revenue: 1800 }
  ],
  
  // Clientes mais fiéis
  topClients: [
    { name: 'Maria Silva', visits: 12, totalSpent: 850 },
    { name: 'João Santos', visits: 10, totalSpent: 720 },
    { name: 'Ana Costa', visits: 8, totalSpent: 650 },
    { name: 'Pedro Lima', visits: 7, totalSpent: 580 },
    { name: 'Carla Ferreira', visits: 6, totalSpent: 520 }
  ],
  
  // Agendamentos por status
  appointmentsByStatus: [
    { status: 'Confirmado', count: 85, percentage: 65 },
    { status: 'Agendado', count: 25, percentage: 19 },
    { status: 'Concluído', count: 15, percentage: 12 },
    { status: 'Cancelado', count: 5, percentage: 4 }
  ]
}

export default function RelatoriosPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months')
  const [selectedReport, setSelectedReport] = useState('financial')
  const [isLoading, setIsLoading] = useState(false)

  const periods = [
    { value: '1month', label: 'Último Mês' },
    { value: '3months', label: 'Últimos 3 Meses' },
    { value: '6months', label: 'Últimos 6 Meses' },
    { value: '1year', label: 'Último Ano' }
  ]

  const reports = [
    { id: 'financial', name: 'Financeiro', icon: DollarSign },
    { id: 'clients', name: 'Clientes', icon: Users },
    { id: 'services', name: 'Serviços', icon: BarChart3 },
    { id: 'professionals', name: 'Profissionais', icon: Activity },
    { id: 'appointments', name: 'Agendamentos', icon: Calendar }
  ]

  const handleExport = (type: string) => {
    setIsLoading(true)
    // Simular exportação
    setTimeout(() => {
      console.log(`Exportando relatório ${type}...`)
      setIsLoading(false)
    }, 2000)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getTotalRevenue = () => {
    return mockData.financialData.reduce((sum, item) => sum + item.revenue, 0)
  }

  const getTotalProfit = () => {
    return mockData.financialData.reduce((sum, item) => sum + item.profit, 0)
  }

  const getAverageTicket = () => {
    const totalAppointments = mockData.topServices.reduce((sum, service) => sum + service.count, 0)
    return totalAppointments > 0 ? getTotalRevenue() / totalAppointments : 0
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="mt-2 text-sm text-gray-700">
            Análise completa dos dados do salão
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => handleExport('pdf')}
            disabled={isLoading}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            {isLoading ? 'Exportando...' : 'Exportar PDF'}
          </button>
        </div>
      </div>

      {/* Filtros de Relatórios */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Tipo de Relatório
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {reports.map((report) => {
            const IconComponent = report.icon
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`p-4 rounded-lg border transition-colors ${
                  selectedReport === report.id
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <IconComponent className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">{report.name}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <DollarSign className="w-6 h-6" />
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
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <TrendingUp className="w-6 h-6" />
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
              <Users className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {mockData.topClients.length + 45}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(getAverageTicket())}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Relatório Financeiro */}
      {selectedReport === 'financial' && (
        <div className="space-y-8">
          {/* Gráfico de Receita */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita Mensal</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {mockData.financialData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-pink-200 rounded-t-lg relative group">
                    <div 
                      className="bg-pink-600 rounded-t-lg transition-all duration-300 group-hover:bg-pink-700"
                      style={{ height: `${(item.revenue / 12000) * 200}px` }}
                    ></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatCurrency(item.revenue)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">{item.month}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo Financeiro Detalhado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita vs Despesas</h3>
              <div className="space-y-4">
                {mockData.financialData.slice(-3).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{item.month}</div>
                      <div className="text-sm text-gray-600">
                        Receita: {formatCurrency(item.revenue)} | Despesas: {formatCurrency(item.expenses)}
                      </div>
                    </div>
                    <div className={`font-bold ${item.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(item.profit)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Lucro</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Margem de Lucro</span>
                  <span className="font-semibold text-green-600">
                    {((getTotalProfit() / getTotalRevenue()) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Receita Média/Mês</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(getTotalRevenue() / mockData.financialData.length)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Lucro Médio/Mês</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(getTotalProfit() / mockData.financialData.length)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Relatório de Clientes */}
      {selectedReport === 'clients' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Clientes Mais Fiéis</h3>
              <div className="space-y-3">
                {mockData.topClients.map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-pink-600 font-bold text-sm">{client.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{client.name}</div>
                        <div className="text-sm text-gray-600">{client.visits} visitas</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatCurrency(client.totalSpent)}</div>
                      <div className="text-sm text-gray-600">Total gasto</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas de Clientes</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">Novos Clientes (Mês)</span>
                  <span className="font-semibold text-blue-600">12</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">Clientes Ativos</span>
                  <span className="font-semibold text-green-600">89</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-700">Taxa de Retorno</span>
                  <span className="font-semibold text-purple-600">78%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-gray-700">Frequência Média</span>
                  <span className="font-semibold text-orange-600">2.3x/mês</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Relatório de Serviços */}
      {selectedReport === 'services' && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Serviços Mais Vendidos</h3>
            <div className="space-y-4">
              {mockData.topServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-pink-600 font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-600">{service.count} agendamentos</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatCurrency(service.revenue)}</div>
                    <div className="text-sm text-gray-600">Receita total</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Relatório de Profissionais */}
      {selectedReport === 'professionals' && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance dos Profissionais</h3>
            <div className="space-y-4">
              {mockData.topProfessionals.map((professional, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-pink-600 font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{professional.name}</div>
                      <div className="text-sm text-gray-600">{professional.appointments} agendamentos</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatCurrency(professional.revenue)}</div>
                    <div className="text-sm text-gray-600">Receita gerada</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Relatório de Agendamentos */}
      {selectedReport === 'appointments' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Agendamentos</h3>
              <div className="space-y-4">
                {mockData.appointmentsByStatus.map((status, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full mr-3" style={{
                        backgroundColor: ['#10B981', '#3B82F6', '#6B7280', '#EF4444'][index]
                      }}></div>
                      <span className="text-gray-700">{status.status}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{status.count}</div>
                      <div className="text-sm text-gray-600">{status.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Taxa de Ocupação</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">Horários Ocupados</span>
                  <span className="font-semibold text-green-600">85%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">Taxa de Cancelamento</span>
                  <span className="font-semibold text-blue-600">4%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-700">Agendamentos/Dia</span>
                  <span className="font-semibold text-purple-600">12.5</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-gray-700">Duração Média</span>
                  <span className="font-semibold text-orange-600">75 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botões de Exportação */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Exportar Relatórios</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => handleExport('pdf')}
            disabled={isLoading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            disabled={isLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Excel
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </button>
        </div>
      </div>
    </div>
  )
}


