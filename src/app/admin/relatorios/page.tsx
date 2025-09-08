'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
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
  servicosMaisVendidos?: {
    topServices: Array<{
      name: string
      count: number
      totalRevenue: number
      avgPrice: number
    }>
    stats: {
      totalRevenue: number
      totalServices: number
      avgPrice: number
      totalAppointments: number
    }
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
  aniversariantes?: Array<{
    name: string
    email: string
    phone: string
    birthDate: string
    age: number
  }>
  clientesAtendidos?: Array<{
    name: string
    email: string
    phone: string
    totalVisits: number
    totalSpent: number
    lastVisit: string
  }>
  todosClientes?: Array<{
    name: string
    email: string
    phone: string
    address: string
    birthDate: string
    createdAt: string
    isCompleteProfile: boolean
  }>
  taxaRetorno?: {
    totalClients: number
    returningClients: number
    returnRate: number
  }
  faixasEtarias?: {
    [key: string]: number
  }
  faturamentoProfissional?: Array<{
    name: string
    totalRevenue: number
    totalComandas: number
    totalCommissions: number
    averageTicket: number
  }>
  servicosRealizados?: Array<{
    name: string
    count: number
    totalRevenue: number
    averagePrice: number
  }>
  produtosVendidos?: Array<{
    name: string
    quantity: number
    totalRevenue: number
    totalDiscount: number
    productCost: number
    totalCost: number
    averagePrice: number
  }>
  resumoProdutos?: {
    receitaTotal: number
    descontos: number
    valorCusto: number
    totalLiquido: number
  }
  comandasAlteradas?: Array<{
    id: string
    clienteNome: string
    profissionalNome: string
    valorTotal: number
    dataFinalizacao: string
    motivoAlteracao: string
  }>
}

export default function RelatoriosPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months')
  const [selectedReport, setSelectedReport] = useState('financial')
  const [selectedCategory, setSelectedCategory] = useState('financeiro')
  const [isLoading, setIsLoading] = useState(false)
  const [reportData, setReportData] = useState<ReportData>({})
  const [loadingData, setLoadingData] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const periods = [
    { value: '1month', label: 'Último Mês' },
    { value: '3months', label: 'Últimos 3 Meses' },
    { value: '6months', label: 'Últimos 6 Meses' },
    { value: '1year', label: 'Último Ano' }
  ]

  const reports = [
    // Relatórios de Clientes
    { id: 'clientes-aniversariantes', name: 'Clientes Aniversariantes', icon: Calendar, category: 'clientes' },
    { id: 'clientes-atendidos', name: 'Clientes Atendidos', icon: Users, category: 'clientes' },
    { id: 'lista-clientes', name: 'Lista de Dados de Todos os Clientes', icon: Users, category: 'clientes' },
    { id: 'clientes-credito-debito', name: 'Clientes com Crédito e/ou Débito', icon: DollarSign, category: 'clientes' },
    { id: 'taxa-retorno', name: 'Taxa de Retorno dos Clientes', icon: TrendingUp, category: 'clientes' },
    { id: 'clientes-servico-especifico', name: 'Clientes que Fizeram Serviço Específico', icon: BarChart3, category: 'clientes' },
    { id: 'clientes-faixa-etaria', name: 'Clientes por Faixa Etária', icon: Users, category: 'clientes' },
    { id: 'retorno-profissional', name: 'Retorno de Clientes por Profissional', icon: Activity, category: 'clientes' },
    { id: 'clientes-agendamentos', name: 'Clientes com Agendamentos', icon: Calendar, category: 'clientes' },
    { id: 'clientes-agendamentos-cancelados', name: 'Clientes com Agendamentos Cancelados', icon: Calendar, category: 'clientes' },
    
    // Relatórios de Profissionais
    { id: 'faturamento-profissional', name: 'Faturamento por Profissional', icon: DollarSign, category: 'profissionais' },
    { id: 'servicos-realizados', name: 'Serviços Realizados no Período', icon: BarChart3, category: 'profissionais' },
    
    // Relatórios de Serviços
    { id: 'servicos-mais-vendidos', name: 'Serviços Mais Vendidos', icon: BarChart3, category: 'servicos' },
    
    // Relatórios de Produtos
    { id: 'produtos-vendidos', name: 'Produtos Vendidos', icon: BarChart3, category: 'produtos' },
    
    // Relatórios de Comandas
    { id: 'comandas-alteradas', name: 'Comandas Alteradas no Período', icon: BarChart3, category: 'comandas' },
    
    // Relatórios Financeiros
    { id: 'financial', name: 'Relatório Financeiro Geral', icon: DollarSign, category: 'financeiro' }
  ]

  const categories = [
    { id: 'clientes', name: 'Clientes', icon: Users },
    { id: 'profissionais', name: 'Profissionais', icon: Activity },
    { id: 'servicos', name: 'Serviços', icon: BarChart3 },
    { id: 'produtos', name: 'Produtos', icon: BarChart3 },
    { id: 'comandas', name: 'Comandas', icon: BarChart3 },
    { id: 'financeiro', name: 'Financeiro', icon: DollarSign }
  ]

  // Carregar dados dos relatórios
  useEffect(() => {
    const loadReportData = async () => {
      setLoadingData(true)
      try {
        console.log('🔄 Carregando relatório:', { selectedReport, selectedPeriod })
        const response = await fetch(`/api/reports?period=${selectedPeriod}&type=${selectedReport}`)
        console.log('📡 Resposta da API:', response.status, response.ok)
        
        if (response.ok) {
          const data = await response.json()
          console.log('📊 Dados recebidos:', data)
          setReportData(data)
        } else {
          const errorData = await response.json()
          console.error('Erro ao carregar dados dos relatórios:', errorData)
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

  // Função para filtrar clientes baseado no termo de busca
  const getFilteredClients = () => {
    if (!reportData.todosClientes) return []
    
    if (!searchTerm.trim()) return reportData.todosClientes
    
    const term = searchTerm.toLowerCase()
    return reportData.todosClientes.filter(client => 
      client.name.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      client.phone.includes(term) ||
      (client.address && client.address.toLowerCase().includes(term))
    )
  }

  return (
    <ProtectedRoute requiredPermission="reports" fallbackMessage="Você não tem permissão para acessar relatórios. Apenas administradores podem visualizar essas informações.">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
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
        
        {/* Categorias */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-[#006D5B] mb-3">Categorias</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id)
                    // Selecionar o primeiro relatório da categoria
                    const firstReport = reports.find(r => r.category === category.id)
                    if (firstReport) {
                      setSelectedReport(firstReport.id)
                    }
                  }}
                  className={`px-4 py-2 rounded-lg border transition-colors flex items-center ${
                    selectedCategory === category.id
                      ? 'border-[#D15556] bg-[#D15556] text-white'
                      : 'border-gray-300 hover:border-[#D15556] bg-white text-gray-700 hover:text-[#D15556]'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Lista de Relatórios da Categoria Selecionada */}
        <div>
          <h3 className="text-md font-medium text-[#006D5B] mb-3">
            Relatórios de {categories.find(c => c.id === selectedCategory)?.name}
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {reports
              .filter(report => report.category === selectedCategory)
              .map((report) => {
            const IconComponent = report.icon
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                    className={`w-full p-3 rounded-lg border transition-colors flex items-center text-left ${
                  selectedReport === report.id
                        ? 'border-[#D15556] bg-[#D15556] text-white'
                        : 'border-gray-300 hover:border-[#D15556] bg-white text-gray-700 hover:text-[#D15556]'
                }`}
              >
                    <IconComponent className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="text-sm font-medium">{report.name}</span>
              </button>
            )
          })}
          </div>
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

      {/* Relatórios de Clientes */}
      {selectedReport === 'clientes-aniversariantes' && !loadingData && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#006D5B]">Clientes Aniversariantes do Mês</h3>
              <div className="flex items-center text-sm text-gray-600">
                <CalendarDays className="w-4 h-4 mr-2" />
                {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </div>
            </div>
            
            {reportData.aniversariantes && reportData.aniversariantes.length > 0 ? (
              <div className="space-y-3">
                {reportData.aniversariantes.map((cliente, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-red-50 rounded-lg border border-pink-200">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#D15556] to-[#c04546] rounded-full flex items-center justify-center mr-4 shadow-md">
                        <span className="text-white font-bold text-lg">{cliente.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-lg">{cliente.name}</div>
                        <div className="text-sm text-gray-600">
                          {cliente.age} anos • Aniversário: {new Date(cliente.birthDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{cliente.phone}</div>
                      <div className="text-sm text-gray-600">{cliente.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarDays className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum aniversariante este mês</h4>
                <p className="text-gray-600">Não há clientes fazendo aniversário em {new Date().toLocaleDateString('pt-BR', { month: 'long' })}.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedReport === 'clientes-atendidos' && !loadingData && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-[#006D5B] mb-4">Clientes Atendidos no Período</h3>
            <div className="space-y-3">
              {reportData.clientesAtendidos?.map((cliente, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-[#D15556] rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">{cliente.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{cliente.name}</div>
                      <div className="text-sm text-gray-600">{cliente.totalVisits} visitas</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatCurrency(cliente.totalSpent)}</div>
                    <div className="text-sm text-gray-600">Última visita: {new Date(cliente.lastVisit).toLocaleDateString('pt-BR')}</div>
                  </div>
                </div>
              )) || <p className="text-gray-500 text-center py-4">Nenhum dado disponível</p>}
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'lista-clientes' && !loadingData && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#006D5B]">Lista Completa de Clientes</h3>
              <div className="text-sm text-gray-600">
                Total: {reportData.todosClientes?.length || 0} clientes
                {searchTerm && (
                  <span className="ml-2 text-[#D15556]">
                    • {getFilteredClients().length} encontrados
                  </span>
                )}
              </div>
            </div>
            
            {/* Campo de Busca */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nome, email, telefone ou endereço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-900"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endereço</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cadastro</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredClients().length > 0 ? (
                    getFilteredClients().map((cliente, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cliente.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.phone}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={cliente.address}>
                          {cliente.address || 'Não informado'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            cliente.isCompleteProfile ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {cliente.isCompleteProfile ? 'Completo' : 'Incompleto'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(cliente.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        {searchTerm ? (
                          <div className="text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <p className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</p>
                            <p className="text-gray-600">Tente ajustar os termos de busca</p>
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            <p>Nenhum dado disponível</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'taxa-retorno' && !loadingData && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-[#006D5B] mb-4">Taxa de Retorno dos Clientes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{reportData.taxaRetorno?.totalClients || 0}</div>
                <div className="text-sm text-blue-800">Total de Clientes</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{reportData.taxaRetorno?.returningClients || 0}</div>
                <div className="text-sm text-green-800">Clientes que Retornaram</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{reportData.taxaRetorno?.returnRate || 0}%</div>
                <div className="text-sm text-purple-800">Taxa de Retorno</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'clientes-faixa-etaria' && !loadingData && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-[#006D5B] mb-4">Clientes por Faixa Etária</h3>
            <div className="space-y-4">
              {reportData.faixasEtarias && Object.entries(reportData.faixasEtarias).map(([faixa, quantidade]) => (
                <div key={faixa} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{faixa} anos</span>
                  <span className="text-lg font-bold text-[#D15556]">{quantidade} clientes</span>
                </div>
              )) || <p className="text-gray-500 text-center py-4">Nenhum dado disponível</p>}
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'faturamento-profissional' && !loadingData && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-[#006D5B] mb-4">Faturamento por Profissional</h3>
            <div className="space-y-4">
              {reportData.faturamentoProfissional?.map((profissional, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#D15556] rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{profissional.name}</div>
                      <div className="text-sm text-gray-600">{profissional.totalComandas} comandas</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatCurrency(profissional.totalRevenue)}</div>
                    <div className="text-sm text-gray-600">Ticket médio: {formatCurrency(profissional.averageTicket)}</div>
                  </div>
                </div>
              )) || <p className="text-gray-500 text-center py-4">Nenhum dado disponível</p>}
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'servicos-realizados' && !loadingData && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-[#006D5B] mb-4">Serviços Realizados no Período</h3>
            <div className="space-y-4">
              {reportData.servicosRealizados?.map((servico, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#D15556] rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{servico.name}</div>
                      <div className="text-sm text-gray-600">{servico.count} realizados</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatCurrency(servico.totalRevenue)}</div>
                    <div className="text-sm text-gray-600">Preço médio: {formatCurrency(servico.averagePrice)}</div>
                  </div>
                </div>
              )) || <p className="text-gray-500 text-center py-4">Nenhum dado disponível</p>}
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'produtos-vendidos' && !loadingData && (
        <div className="space-y-8">
          {/* Cards de Resumo Financeiro */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Receita Total</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(reportData.resumoProdutos?.receitaTotal || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Descontos</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(reportData.resumoProdutos?.descontos || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Valor de Custo</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(reportData.resumoProdutos?.valorCusto || 0)}
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
                  <p className="text-sm font-medium text-gray-600">Total Líquido</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(reportData.resumoProdutos?.totalLiquido || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Produtos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-[#006D5B] mb-4">Produtos Vendidos no Período</h3>
            <div className="space-y-4">
              {reportData.produtosVendidos && reportData.produtosVendidos.length > 0 ? (
                reportData.produtosVendidos.map((produto, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#D15556] rounded-full flex items-center justify-center mr-4">
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{produto.name}</div>
                        <div className="text-sm text-gray-600">{produto.quantity} unidades</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatCurrency(produto.totalRevenue)}</div>
                      <div className="text-sm text-gray-600">Preço médio: {formatCurrency(produto.averagePrice)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto vendido</h4>
                  <p className="text-gray-600">Não há produtos vendidos no período selecionado.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'comandas-alteradas' && !loadingData && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-[#006D5B] mb-4">Comandas Alteradas no Período</h3>
            <div className="space-y-4">
              {reportData.comandasAlteradas?.map((comanda, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-gray-900">{comanda.clienteNome}</div>
                      <div className="text-sm text-gray-600">Profissional: {comanda.profissionalNome}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatCurrency(comanda.valorTotal)}</div>
                      <div className="text-sm text-gray-600">{new Date(comanda.dataFinalizacao).toLocaleDateString('pt-BR')}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Motivo da alteração:</strong> {comanda.motivoAlteracao}
                  </div>
                </div>
              )) || <p className="text-gray-500 text-center py-4">Nenhuma comanda alterada no período</p>}
            </div>
          </div>
        </div>
      )}

      {/* Relatório de Serviços Mais Vendidos */}
      {selectedReport === 'servicos-mais-vendidos' && !loadingData && (
        <div className="space-y-8">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Receita Total</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(reportData.servicosMaisVendidos?.stats?.totalRevenue || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Serviços</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {reportData.servicosMaisVendidos?.stats?.totalServices || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Preço Médio</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(reportData.servicosMaisVendidos?.stats?.avgPrice || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Agendamentos</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {reportData.servicosMaisVendidos?.stats?.totalAppointments || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Serviços Mais Vendidos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-[#006D5B] mb-4">Serviços Mais Vendidos no Período</h3>
            <div className="space-y-4">
              {reportData.servicosMaisVendidos?.topServices && reportData.servicosMaisVendidos.topServices.length > 0 ? (
                reportData.servicosMaisVendidos.topServices.map((servico, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#D15556] rounded-full flex items-center justify-center mr-4">
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{servico.name}</div>
                        <div className="text-sm text-gray-600">{servico.count} vendas</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatCurrency(servico.totalRevenue)}</div>
                      <div className="text-sm text-gray-600">Preço médio: {formatCurrency(servico.avgPrice)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum serviço vendido</h4>
                  <p className="text-gray-600">Não há serviços vendidos no período selecionado.</p>
                </div>
              )}
            </div>
          </div>
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
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
            <p className="text-sm text-gray-600">Debug info:</p>
            <p className="text-xs text-gray-500">selectedReport: {selectedReport}</p>
            <p className="text-xs text-gray-500">selectedPeriod: {selectedPeriod}</p>
            <p className="text-xs text-gray-500">reportData keys: {Object.keys(reportData).join(', ')}</p>
            <p className="text-xs text-gray-500">reportData: {JSON.stringify(reportData, null, 2)}</p>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  )
}