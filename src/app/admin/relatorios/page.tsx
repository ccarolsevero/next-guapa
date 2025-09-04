'use client'

import { useState, useEffect } from 'react'
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
  Activity,
  Loader2
} from 'lucide-react'

interface ReportData {
  financial?: {
    revenue: Array<{
      _id: { year: number; month: number }
      totalRevenue: number
      totalCommissions: number
      count: number
    }>
    expenses: Array<{
      _id: { year: number; month: number }
      totalExpenses: number
    }>
  }
  clients?: {
    topClients: Array<{
      name: string
      totalSpent: number
      visits: number
    }>
    stats: {
      totalClients: number
      newClients: number
    }
  }
  services?: {
    topServices: Array<{
      name: string
      count: number
      totalRevenue: number
    }>
  }
  professionals?: {
    topProfessionals: Array<{
      name: string
      appointments: number
      revenue: number
      commissions: number
    }>
  }
  appointments?: {
    byStatus: Array<{
      status: string
      count: number
      percentage: number
    }>
    total: number
  }
}

export default function RelatoriosPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months')
  const [selectedReport, setSelectedReport] = useState('financial')
  const [isLoading, setIsLoading] = useState(false)
  const [reportData, setReportData] = useState<ReportData>({})
  const [loadingData, setLoadingData] = useState(true)

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

  // Carregar dados dos relatórios
  useEffect(() => {
    const loadReportData = async () => {
      setLoadingData(true)
      try {
        const response = await fetch(`/api/reports?period=${selectedPeriod}&type=${selectedReport}`)
        if (response.ok) {
          const data = await response.json()
          setReportData(data)
        } else {
          console.error('Erro ao carregar dados dos relatórios')
        }
      } catch (error) {
        console.error('Erro ao carregar dados dos relatórios:', error)
      } finally {
        setLoadingData(false)
      }
    }

    loadReportData()
  }, [selectedPeriod, selectedReport])

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
    if (!reportData.financial?.revenue) return 0
    return reportData.financial.revenue.reduce((sum, item) => sum + item.totalRevenue, 0)
  }

  const getTotalExpenses = () => {
    if (!reportData.financial?.expenses) return 0
    return reportData.financial.expenses.reduce((sum, item) => sum + item.totalExpenses, 0)
  }

  const getTotalProfit = () => {
    return getTotalRevenue() - getTotalExpenses()
  }

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return months[month - 1] || ''
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-[#006D5B]">Relatórios</h1>
          <p className="mt-2 text-sm text-gray-600">
            Análise completa dos dados do salão
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent bg-white text-gray-900"
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
            className="bg-[#D15556] text-white px-4 py-2 rounded-lg hover:bg-[#b83e3d] transition-colors flex items-center disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            {isLoading ? 'Exportando...' : 'Exportar PDF'}
          </button>
        </div>
      </div>

      {/* Filtros de Relatórios */}
      <div className="bg-white rounded-lg shadow p-6 mb-8" style={{ backgroundColor: 'rgba(245, 240, 232, 0.95)' }}>
        <h2 className="text-lg font-semibold text-[#006D5B] mb-4 flex items-center">
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
                    ? 'border-[#D15556] bg-[#D15556] text-white'
                    : 'border-gray-300 hover:border-[#D15556] bg-white text-gray-700 hover:text-[#D15556]'
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
                {loadingData ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(getTotalRevenue())}
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
                {loadingData ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(getTotalProfit())}
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
                {loadingData ? <Loader2 className="w-6 h-6 animate-spin" /> : reportData.clients?.stats?.totalClients || 0}
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
              <p className="text-sm font-medium text-gray-600">Total Agendamentos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loadingData ? <Loader2 className="w-6 h-6 animate-spin" /> : reportData.appointments?.total || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loadingData && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#D15556]" />
          <span className="ml-2 text-gray-600">Carregando dados...</span>
        </div>
      )}

      {/* Relatório Financeiro */}
      {selectedReport === 'financial' && !loadingData && (
        <div className="space-y-8">
          {/* Gráfico de Receita */}
          {reportData.financial?.revenue && reportData.financial.revenue.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#006D5B] mb-4">Receita Mensal</h3>
              <div className="h-64 flex items-end justify-between space-x-2">
                {reportData.financial.revenue.map((item, index) => {
                  const maxRevenue = Math.max(...reportData.financial!.revenue.map(r => r.totalRevenue))
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-gray-200 rounded-t-lg relative group">
                        <div 
                          className="bg-[#D15556] rounded-t-lg transition-all duration-300 group-hover:bg-[#b83e3d]"
                          style={{ height: `${(item.totalRevenue / maxRevenue) * 200}px` }}
                        ></div>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {formatCurrency(item.totalRevenue)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        {getMonthName(item._id.month)}/{item._id.year}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Resumo Financeiro Detalhado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#006D5B] mb-4">Resumo Financeiro</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">Receita Total</span>
                  <span className="font-semibold text-green-600">{formatCurrency(getTotalRevenue())}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-gray-700">Despesas Total</span>
                  <span className="font-semibold text-red-600">{formatCurrency(getTotalExpenses())}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">Lucro Líquido</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(getTotalProfit())}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#006D5B] mb-4">Estatísticas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Margem de Lucro</span>
                  <span className="font-semibold text-green-600">
                    {getTotalRevenue() > 0 ? ((getTotalProfit() / getTotalRevenue()) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Receita Média/Mês</span>
                  <span className="font-semibold text-gray-900">
                    {reportData.financial?.revenue ? formatCurrency(getTotalRevenue() / reportData.financial.revenue.length) : formatCurrency(0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total de Comandas</span>
                  <span className="font-semibold text-gray-900">
                    {reportData.financial?.revenue ? reportData.financial.revenue.reduce((sum, item) => sum + item.count, 0) : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Relatório de Clientes */}
      {selectedReport === 'clients' && !loadingData && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#006D5B] mb-4">Clientes Mais Fiéis</h3>
              <div className="space-y-3">
                {reportData.clients?.topClients?.map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-[#D15556] rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">{client.name.charAt(0)}</span>
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
                )) || <p className="text-gray-500 text-center py-4">Nenhum dado disponível</p>}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#006D5B] mb-4">Estatísticas de Clientes</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">Total de Clientes</span>
                  <span className="font-semibold text-blue-600">{reportData.clients?.stats?.totalClients || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">Novos Clientes (Período)</span>
                  <span className="font-semibold text-green-600">{reportData.clients?.stats?.newClients || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-700">Clientes Ativos</span>
                  <span className="font-semibold text-purple-600">{reportData.clients?.topClients?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Relatório de Serviços */}
      {selectedReport === 'services' && !loadingData && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-[#006D5B] mb-4">Serviços Mais Vendidos</h3>
            <div className="space-y-4">
              {reportData.services?.topServices?.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#D15556] rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-600">{service.count} agendamentos</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatCurrency(service.totalRevenue)}</div>
                    <div className="text-sm text-gray-600">Receita total</div>
                  </div>
                </div>
              )) || <p className="text-gray-500 text-center py-4">Nenhum dado disponível</p>}
            </div>
          </div>
        </div>
      )}

      {/* Relatório de Profissionais */}
      {selectedReport === 'professionals' && !loadingData && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-[#006D5B] mb-4">Performance dos Profissionais</h3>
            <div className="space-y-4">
              {reportData.professionals?.topProfessionals?.map((professional, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#D15556] rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold">{index + 1}</span>
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
              )) || <p className="text-gray-500 text-center py-4">Nenhum dado disponível</p>}
            </div>
          </div>
        </div>
      )}

      {/* Relatório de Agendamentos */}
      {selectedReport === 'appointments' && !loadingData && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#006D5B] mb-4">Status dos Agendamentos</h3>
              <div className="space-y-4">
                {reportData.appointments?.byStatus?.map((status, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full mr-3" style={{
                        backgroundColor: ['#10B981', '#3B82F6', '#6B7280', '#EF4444'][index % 4]
                      }}></div>
                      <span className="text-gray-700">{status.status}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{status.count}</div>
                      <div className="text-sm text-gray-600">{status.percentage}%</div>
                    </div>
                  </div>
                )) || <p className="text-gray-500 text-center py-4">Nenhum dado disponível</p>}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#006D5B] mb-4">Resumo de Agendamentos</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">Total de Agendamentos</span>
                  <span className="font-semibold text-green-600">{reportData.appointments?.total || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">Período Selecionado</span>
                  <span className="font-semibold text-blue-600">{periods.find(p => p.value === selectedPeriod)?.label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem quando não há dados */}
      {!loadingData && Object.keys(reportData).length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum dado encontrado</h3>
          <p className="text-gray-600">Não há dados disponíveis para o período selecionado.</p>
        </div>
      )}
    </div>
  )
}