'use client'
import { useState, useEffect } from 'react'
import { Users, Package, Loader2, ChevronDown, ChevronUp, Scissors, DollarSign, Banknote, CreditCard, Download, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react'

interface Despesa {
  _id: string
  valor: number
  categoria: string
  observacao: string
  tipo: 'fixa' | 'variavel'
  data: Date
  createdAt: Date
}

interface Categoria {
  _id: string
  nome: string
  createdAt: string
}

interface FinancialData {
  totalRevenue: number
  totalCommissions: number
  totalOrders: number
  totalExpenses: number
  paymentMethods: Array<{ method: string; count: number; amount: number }>
  recentPayments: Array<{ id: number; clientName: string; service: string; amount: number; method: string; date: string; status: string }>
  commissionsByProfessional: Array<{
    profissional: string
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
}

export default function FinanceiroPage() {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('1month')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [expandedProfessional, setExpandedProfessional] = useState<string | null>(null)
  const [showDespesaModal, setShowDespesaModal] = useState(false)
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [novaDespesa, setNovaDespesa] = useState({
    valor: '',
    categoria: '',
    observacao: '',
    tipo: 'variavel' as 'fixa' | 'variavel'
  })
  const [novaCategoria, setNovaCategoria] = useState('')
  const [showCategoriaModal, setShowCategoriaModal] = useState(false)
  const [editingDespesa, setEditingDespesa] = useState<Despesa | null>(null)
  const [showEditDespesaModal, setShowEditDespesaModal] = useState(false)

  const periods = [
    { value: '1month', label: 'Último Mês' },
    { value: '3months', label: 'Últimos 3 Meses' },
    { value: '6months', label: 'Últimos 6 Meses' },
    { value: '1year', label: 'Último Ano' },
    { value: 'custom', label: 'Período Personalizado' }
  ]

  const toggleProfessional = (professionalId: string) => {
    setExpandedProfessional(expandedProfessional === professionalId ? null : professionalId)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPaymentMethod = (method: string) => {
    const methods: { [key: string]: string } = {
      'cash': 'Dinheiro',
      'debit': 'Cartão de Débito',
      'credit': 'Cartão de Crédito',
      'pix': 'PIX',
      'transfer': 'Transferência'
    }
    return methods[method] || method
  }

  const getPaymentMethods = () => {
    const methods = [
      {
        id: 'cash',
        name: 'Dinheiro',
        icon: <Banknote className="w-5 h-5 text-green-600 mr-2" />,
        count: 0,
        amount: 0
      },
      {
        id: 'debit',
        name: 'Cartão de Débito',
        icon: <CreditCard className="w-5 h-5 text-green-600 mr-2" />,
        count: 0,
        amount: 0
      },
      {
        id: 'credit',
        name: 'Cartão de Crédito',
        icon: <CreditCard className="w-5 h-5 text-blue-600 mr-2" />,
        count: 0,
        amount: 0
      },
      {
        id: 'pix',
        name: 'PIX',
        icon: <DollarSign className="w-5 h-5 text-green-600 mr-2" />,
        count: 0,
        amount: 0
      }
    ]

    // Associar dados da API aos métodos
    if (financialData?.paymentMethods) {
      financialData.paymentMethods.forEach((apiMethod: unknown) => {
        const methodData = apiMethod as Record<string, unknown>
        
        // Tentar diferentes campos possíveis para o ID
        const methodId = methodData._id || methodData.id || methodData.method || methodData.paymentMethod
        const methodCount = methodData.count || methodData.total || methodData.transactions || 0
        const methodAmount = methodData.amount || methodData.value || methodData.total || 0
        
        const foundMethod = methods.find(m => m.id === methodId)
        if (foundMethod) {
          foundMethod.count = methodCount as number
          foundMethod.amount = methodAmount as number
        }
      })
    }

    return methods
  }

  const getTotalRevenue = () => financialData?.totalRevenue || 0
  const getTotalExpenses = () => financialData?.totalCommissions || 0
  const getTotalProfit = () => {
    if (!financialData) return 0
    return (financialData.totalRevenue || 0) - (financialData.totalCommissions || 0) - (financialData.totalExpenses || 0)
  }

  const loadFinancialData = async (period: string, startDate?: string, endDate?: string) => {
    try {
      setLoading(true)
      
      let url = `/api/financeiro?period=${period}`
      if (period === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`
      }
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Erro ao carregar dados financeiros')
      }
      const result = await response.json()
      
      // A API retorna os dados dentro de result.data
      const data = result.data || result
      console.log('📊 Dados recebidos da API:', data)
      
      if (data.success && data.data) {
        setFinancialData({
          totalRevenue: data.data.totals?.revenue || 0,
          totalCommissions: data.data.totals?.expenses || 0,
          totalOrders: data.data.totals?.comandas || 0,
          totalExpenses: data.data.totalExpenses || 0,
          paymentMethods: data.data.paymentMethods || [],
          recentPayments: data.data.recentPayments || [],
          commissionsByProfessional: data.data.comissoesPorProfissional || []
        })
      } else {
        setFinancialData({
          totalRevenue: data.totals?.revenue || 0,
          totalCommissions: data.totals?.expenses || 0,
          totalOrders: data.totals?.comandas || 0,
          totalExpenses: data.totalExpenses || 0,
          paymentMethods: data.paymentMethods || [],
          recentPayments: data.recentPayments || [],
          commissionsByProfessional: data.comissoesPorProfissional || []
        })
      }
      
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadDespesas = async () => {
    try {
      const response = await fetch('/api/despesas')
      if (response.ok) {
        const result = await response.json()
        setDespesas(result.data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar despesas:', error)
    }
  }

  const loadCategorias = async () => {
    try {
      const response = await fetch('/api/despesas/categorias')
      if (response.ok) {
        const result = await response.json()
        setCategorias(result.data || [])
      }
    } catch (error) {
        console.error('Erro ao carregar categorias:', error)
      }
    }

    const criarDespesa = async () => {
      try {
        const response = await fetch('/api/despesas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novaDespesa)
        })
        
        if (response.ok) {
          const result = await response.json()
          setDespesas([result.data, ...despesas])
          setNovaDespesa({ valor: '', categoria: '', observacao: '', tipo: 'variavel' })
          setShowDespesaModal(false)
          // Recarregar dados financeiros para atualizar totais
          loadFinancialData(selectedPeriod, customStartDate, customEndDate)
        }
      } catch (error) {
        console.error('Erro ao criar despesa:', error)
      }
    }

    const editarDespesa = async () => {
      if (!editingDespesa) return
      
      console.log('🔍 Editando despesa:', editingDespesa)
      console.log('🔍 ID da despesa:', editingDespesa._id)
      console.log('🔍 Dados para enviar:', JSON.stringify(editingDespesa))
      
      try {
        const url = `/api/despesas/${editingDespesa._id}`
        console.log('🔍 URL da requisição:', url)
        
        const response = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingDespesa)
        })
        
        console.log('🔍 Response status:', response.status)
        console.log('🔍 Response headers:', response.headers)
        
        if (response.ok) {
          const result = await response.json()
          console.log('✅ Despesa editada com sucesso:', result)
          console.log('🔍 Dados retornados:', result.data)
          
          // Atualizar a despesa na lista local
          const novasDespesas = despesas.map(d => 
            d._id === editingDespesa._id ? result.data : d
          )
          console.log('🔍 Lista atualizada:', novasDespesas)
          
          setDespesas(novasDespesas)
          setShowEditDespesaModal(false)
          setEditingDespesa(null)
          
          // Recarregar dados financeiros para atualizar totais
          loadFinancialData(selectedPeriod, customStartDate, customEndDate)
          
          console.log('✅ Modal fechado e estado atualizado')
        } else {
          const errorData = await response.json()
          console.error('❌ Erro na API:', errorData)
          alert(`Erro ao editar despesa: ${errorData.error || 'Erro desconhecido'}`)
        }
      } catch (error) {
        console.error('❌ Erro ao editar despesa:', error)
        alert('Erro ao editar despesa. Verifique o console para mais detalhes.')
      }
    }

    const excluirDespesa = async (despesaId: string) => {
      if (!confirm('Tem certeza que deseja excluir esta despesa?')) return
      
      console.log('🗑️ Excluindo despesa:', despesaId)
      
      try {
        const response = await fetch(`/api/despesas/${despesaId}`, {
          method: 'DELETE'
        })
        
        console.log('🔍 Response status:', response.status)
        
        if (response.ok) {
          console.log('✅ Despesa excluída com sucesso')
          // Remover a despesa da lista local
          setDespesas(despesas.filter(d => d._id !== despesaId))
          // Recarregar dados financeiros para atualizar totais
          loadFinancialData(selectedPeriod, customStartDate, customEndDate)
        } else {
          const errorData = await response.json()
          console.error('❌ Erro na API:', errorData)
          alert(`Erro ao excluir despesa: ${errorData.error || 'Erro desconhecido'}`)
        }
      } catch (error) {
        console.error('❌ Erro ao excluir despesa:', error)
        alert('Erro ao excluir despesa. Verifique o console para mais detalhes.')
      }
    }

      const criarCategoria = async () => {
    try {
      console.log('🔍 Tentando criar categoria:', novaCategoria)
      
      const response = await fetch('/api/despesas/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novaCategoria })
      })
      
      console.log('🔍 Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Categoria criada com sucesso:', result)
        setCategorias([...categorias, result.data])
        setNovaCategoria('')
        setShowCategoriaModal(false)
        // Recarregar categorias para garantir sincronização
        loadCategorias()
      } else {
        const errorData = await response.json()
        console.error('❌ Erro na API:', errorData)
        alert(`Erro ao criar categoria: ${errorData.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('❌ Erro ao criar categoria:', error)
      alert('Erro ao criar categoria. Verifique o console para mais detalhes.')
    }
  }

  useEffect(() => {
    if (selectedPeriod === 'custom') {
      if (customStartDate && customEndDate) {
        loadFinancialData(selectedPeriod, customStartDate, customEndDate)
      }
    } else {
      loadFinancialData(selectedPeriod)
    }
    
    loadDespesas()
    loadCategorias()
  }, [selectedPeriod, customStartDate, customEndDate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#D15556]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro: {error}</p>
          <button 
            onClick={() => loadFinancialData(selectedPeriod)}
            className="px-4 py-2 bg-[#D15556] text-white rounded-md hover:bg-[#B84444]"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Financeiro</h1>
        <p className="text-gray-600">Acompanhe o desempenho financeiro do seu negócio</p>
        </div>

      {/* Seletor de Período */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-semibold text-gray-900">Período:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-400 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556]"
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
          
          {selectedPeriod === 'custom' && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-semibold text-gray-900">De:</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="border border-gray-400 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556]"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-semibold text-gray-900">Até:</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="border border-gray-400 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {financialData && !loading && (
        <>
      {/* Resumo Financeiro */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Faturamento Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(getTotalRevenue())}
              </p>
            </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Comissões</p>
                  <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(getTotalExpenses())}
              </p>
            </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
        </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Despesas</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(financialData?.totalExpenses || 0)}
              </p>
            </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-red-600" />
          </div>
        </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Lucro Líquido</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(getTotalProfit())}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Controle de Despesas */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Controle de Despesas</h3>
                <p className="text-sm text-gray-700">Gerencie as despesas da empresa</p>
        </div>
              <button
                onClick={() => setShowDespesaModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Nova Despesa
              </button>
      </div>

            <div className="space-y-3">
              {despesas.length > 0 ? (
                despesas.map((despesa) => (
                  <div key={despesa._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-red-100">
                        <DollarSign className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{despesa.categoria}</span>
                          <span className={`px-2 py-1 text-xs rounded-full text-white font-medium ${
                            despesa.tipo === 'fixa' 
                              ? 'bg-blue-500' 
                              : 'bg-orange-500'
                          }`}>
                            {despesa.tipo === 'fixa' ? 'Fixa' : 'Variável'}
                          </span>
                        </div>
                        {despesa.observacao && (
                          <p className="text-sm text-gray-600">{despesa.observacao}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setEditingDespesa(despesa)
                            setShowEditDespesaModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                          title="Editar despesa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => excluirDespesa(despesa._id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                          title="Excluir despesa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <div>
                          <p className="text-lg font-semibold text-red-600">{formatCurrency(despesa.valor)}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(despesa.data).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhuma despesa registrada</p>
                  <p className="text-sm text-gray-400">Clique em "Nova Despesa" para começar</p>
                </div>
              )}
            </div>
          </div>

          {/* Métodos de Pagamento */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Métodos de Pagamento</h3>
                <p className="text-sm text-gray-700">Distribuição por forma de pagamento</p>
        </div>
      </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getPaymentMethods().map((method) => (
                <div key={method.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                  <div className="flex items-center">
                      {method.icon}
                    <div>
                        <p className="font-medium text-gray-900">{method.name}</p>
                        <p className="text-sm text-gray-600">{method.count} transações</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-[#D15556]">
                        R$ {method.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagamentos Recentes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pagamentos Recentes</h3>
                <p className="text-sm text-gray-700">Últimas transações realizadas</p>
              </div>
            </div>

            <div className="space-y-3">
              {financialData?.recentPayments && financialData.recentPayments.length > 0 ? (
                financialData.recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{payment.clientName}</p>
                        <p className="text-sm text-gray-600">{payment.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                      <p className="text-sm text-gray-500">{payment.method}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum pagamento recente</p>
                </div>
              )}
            </div>
          </div>

          {/* Comissionamento por Profissional */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Comissionamento por Profissional
                </h3>
                <p className="text-sm text-gray-700">Vendas e comissões do mês atual</p>
          </div>
        </div>

            {financialData?.commissionsByProfessional && financialData.commissionsByProfessional.length > 0 ? (
          <div className="space-y-4">
                {financialData.commissionsByProfessional.map((comissao, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg border border-gray-100">
                    {/* Header do Profissional */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleProfessional(comissao.profissional)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-[#EED7B6] rounded-full flex items-center justify-center mr-4">
                            <Users className="w-6 h-6 text-[#D15556]" />
                  </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{comissao.profissional}</h4>
                            <p className="text-sm text-gray-700">Profissional</p>
                  </div>
                </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <p className="text-sm text-gray-700">Comissão Total</p>
                            <p className="text-lg font-medium text-[#D15556]">
                              R$ {comissao.totalComissao.toFixed(2)}
                            </p>
                          </div>
                          {expandedProfessional === comissao.profissional ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
          </div>
        </div>
      </div>

                    {/* Detalhes das Comissões - Expandidos/Colapsados */}
                    {expandedProfessional === comissao.profissional && (
                      <div className="border-t border-gray-100 p-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Serviços */}
                          <div className="bg-white p-4 rounded-lg border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-gray-900 flex items-center">
                                <Scissors className="w-4 h-4 mr-2" />
                                Serviços
                              </h4>
                              <div className="text-right">
                                <p className="text-sm text-gray-700">Total</p>
                                <p className="font-medium text-[#D15556]">
                                  R$ {comissao.detalhes
                                    .filter(d => d.tipo === 'Serviço' && d.profissional === comissao.profissional)
                                    .reduce((sum, d) => sum + d.valor, 0)
                                    .toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2 mb-4">
                              {comissao.detalhes
                                .filter(d => d.tipo === 'Serviço' && d.profissional === comissao.profissional)
                                .map((detalhe, detIndex) => (
                                  <div key={detIndex} className="flex justify-between text-sm">
                                    <span className="text-gray-700">{detalhe.item}</span>
                                    <span className="font-medium text-gray-900">R$ {detalhe.valor.toFixed(2)}</span>
                                  </div>
                                ))}
                            </div>
                            <div className="flex justify-between text-sm font-medium border-t pt-2">
                              <span className="text-gray-700">Comissão (10%):</span>
                              <span className="text-[#D15556]">
                                R$ {comissao.detalhes
                                  .filter(d => d.tipo === 'Serviço' && d.profissional === comissao.profissional)
                                  .reduce((sum, d) => sum + d.comissao, 0)
                                  .toFixed(2)}
                              </span>
          </div>
        </div>
        
                          {/* Produtos */}
                          <div className="bg-white p-4 rounded-lg border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-gray-900 flex items-center">
                                <Package className="w-4 h-4 mr-2" />
                                Produtos
                              </h4>
                              <div className="text-right">
                                <p className="text-sm text-gray-700">Total</p>
                                <p className="font-medium text-[#D15556]">
                                  R$ {comissao.detalhes
                                    .filter(d => d.tipo === 'Produto' && d.profissional === comissao.profissional)
                                    .reduce((sum, d) => sum + d.valor, 0)
                                    .toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2 mb-4">
                              {comissao.detalhes
                                .filter(d => d.tipo === 'Produto' && d.profissional === comissao.profissional)
                                .map((detalhe, detIndex) => (
                                  <div key={detIndex} className="flex justify-between text-sm">
                                    <span className="text-gray-700">{detalhe.item}</span>
                                    <span className="font-medium text-gray-900">R$ {detalhe.valor.toFixed(2)}</span>
                                  </div>
                                ))}
                            </div>
                            <div className="flex justify-between text-sm font-medium border-t pt-2">
                              <span className="text-gray-700">Comissão (15%):</span>
                              <span className="text-[#D15556]">
                                R$ {comissao.detalhes
                                  .filter(d => d.tipo === 'Produto' && d.profissional === comissao.profissional)
                                  .reduce((sum, d) => sum + d.comissao, 0)
                                  .toFixed(2)}
                        </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Resumo Total */}
                        <div className="mt-4 p-4 bg-[#EED7B6]/20 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-sm text-gray-700">Total de Vendas</p>
                              <p className="text-lg font-medium text-gray-900">
                                R$ {comissao.detalhes
                                  .reduce((sum, d) => sum + d.valor, 0)
                                  .toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-700">Total de Itens</p>
                              <p className="text-lg font-medium text-gray-900">
                                {comissao.quantidadeItens}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-700">Comissão Total</p>
                              <p className="text-lg font-medium text-[#D15556]">
                                R$ {comissao.totalComissao.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">Nenhuma comissão registrada para este período</p>
        </div>
                        )}
          </div>


        </>
      )}

      {/* Modal Nova Despesa */}
      {showDespesaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nova Despesa</h3>
              <button
                onClick={() => setShowDespesaModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={novaDespesa.valor}
                  onChange={(e) => setNovaDespesa({...novaDespesa, valor: e.target.value})}
                  className="w-full border border-gray-500 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556]"
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <div className="flex space-x-2">
                  <select
                    value={novaDespesa.categoria}
                    onChange={(e) => setNovaDespesa({...novaDespesa, categoria: e.target.value})}
                    className="flex-1 border border-gray-500 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556]"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map((cat) => (
                      <option key={cat._id} value={cat.nome}>
                        {cat.nome}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowCategoriaModal(true)}
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Despesa
                </label>
                <select
                  value={novaDespesa.tipo}
                  onChange={(e) => setNovaDespesa({...novaDespesa, tipo: e.target.value as 'fixa' | 'variavel'})}
                  className="w-full border border-gray-500 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556]"
                >
                  <option value="variavel">Variável</option>
                  <option value="fixa">Fixa</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observação
                </label>
                <textarea
                  value={novaDespesa.observacao}
                  onChange={(e) => setNovaDespesa({...novaDespesa, observacao: e.target.value})}
                  className="w-full border border-gray-500 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556]"
                  rows={3}
                  placeholder="Descrição da despesa..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowDespesaModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={criarDespesa}
                  disabled={!novaDespesa.valor || !novaDespesa.categoria}
                  className="flex-1 px-4 py-2 bg-[#D15556] text-white rounded-md hover:bg-[#B84444] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvar Despesa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Despesa */}
      {showEditDespesaModal && editingDespesa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Editar Despesa</h3>
              <button
                onClick={() => setShowEditDespesaModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingDespesa.valor}
                  onChange={(e) => setEditingDespesa({...editingDespesa, valor: parseFloat(e.target.value) || 0})}
                  className="w-full border border-gray-500 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556]"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <div className="flex space-x-2">
                  <select
                    value={editingDespesa.categoria}
                    onChange={(e) => setEditingDespesa({...editingDespesa, categoria: e.target.value})}
                    className="flex-1 border border-gray-500 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556]"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map((cat) => (
                      <option key={cat._id} value={cat.nome}>
                        {cat.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Despesa
                </label>
                <select
                  value={editingDespesa.tipo}
                  onChange={(e) => setEditingDespesa({...editingDespesa, tipo: e.target.value as 'fixa' | 'variavel'})}
                  className="w-full border border-gray-500 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556]"
                >
                  <option value="variavel">Variável</option>
                  <option value="fixa">Fixa</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observação
                </label>
                <textarea
                  value={editingDespesa.observacao}
                  onChange={(e) => setEditingDespesa({...editingDespesa, observacao: e.target.value})}
                  className="w-full border border-gray-500 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556]"
                  rows={3}
                  placeholder="Descrição da despesa..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowEditDespesaModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={editarDespesa}
                  disabled={!editingDespesa.valor || !editingDespesa.categoria}
                  className="flex-1 px-4 py-2 bg-[#D15556] text-white rounded-md hover:bg-[#B84444] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Categoria */}
      {showCategoriaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nova Categoria</h3>
              <button
                onClick={() => setShowCategoriaModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  className="w-full border border-gray-500 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556]"
                  placeholder="Ex: Aluguel, Material, Marketing..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowCategoriaModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={criarCategoria}
                  disabled={!novaCategoria.trim()}
                  className="flex-1 px-4 py-2 bg-[#D15556] text-white rounded-md hover:bg-[#B84444] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Criar Categoria
                </button>
              </div>
            </div>
        </div>
      </div>
      )}
    </div>
  )
}

