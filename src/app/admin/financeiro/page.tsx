'use client'
import { useState, useEffect } from 'react'
import { Users, Package, Loader2, ChevronDown, ChevronUp, Scissors, DollarSign, Banknote, CreditCard, Download, TrendingUp, TrendingDown } from 'lucide-react'

interface FinancialData {
  revenue: Array<{ month: string; amount: number }>
  expenses: Array<{ month: string; amount: number }>
  totals: {
    revenue: number
    expenses: number
    profit: number
    comandas: number
  }
  paymentMethods: Array<{ _id: string; count: number; amount: number }>
  recentPayments: Array<{ clientName: string; service: string; amount: number; method: string }>
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
      profissionalId: string
    }>
  }>
}

export default function FinanceiroPage() {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('1month')
  const [expandedProfessional, setExpandedProfessional] = useState<string | null>(null)

  const periods = [
    { value: '1month', label: 'Último Mês' },
    { value: '3months', label: 'Últimos 3 Meses' },
    { value: '6months', label: 'Últimos 6 Meses' },
    { value: '1year', label: 'Último Ano' }
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
      console.log('🔍 paymentMethods da API:', financialData.paymentMethods)
      financialData.paymentMethods.forEach((apiMethod: { _id: string; count: number; amount: number }) => {
        console.log('🔍 Processando método:', apiMethod)
        const method = methods.find(m => m.id === apiMethod._id)
        if (method) {
          method.count = apiMethod.count || 0
          method.amount = apiMethod.amount || 0
          console.log('✅ Método encontrado e atualizado:', method)
        } else {
          console.log('❌ Método não encontrado para ID:', apiMethod._id)
        }
      })
    }

    return methods
  }

  const getTotalRevenue = () => financialData?.totals?.revenue || 0
  const getTotalExpenses = () => financialData?.totals?.expenses || 0
  const getTotalProfit = () => financialData?.totals?.profit || 0

  const loadFinancialData = async (period: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/financeiro?period=${period}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar dados financeiros')
      }
      const result = await response.json()
      
      // A API retorna os dados dentro de result.data
      const data = result.data || result
      console.log('📊 Dados recebidos da API:', data)
      
      setFinancialData(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFinancialData(selectedPeriod)
  }, [selectedPeriod])

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
          <label className="text-sm font-medium text-gray-700">Período:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#D15556]"
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
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
                  <p className="text-sm text-gray-600">Lucro Líquido</p>
                  <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(getTotalProfit())}
              </p>
            </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
        </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Comandas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {financialData?.totals?.comandas || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita Mensal</h3>
              <div className="space-y-3">
                {financialData?.revenue && financialData.revenue.length > 0 ? (
                  financialData.revenue.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.month}</span>
                      <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Nenhum dado de receita disponível</p>
                )}
        </div>
      </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Comissões Mensais</h3>
              <div className="space-y-3">
                {financialData?.expenses && financialData.expenses.length > 0 ? (
                  financialData.expenses.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.month}</span>
                      <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Nenhum dado de comissão disponível</p>
                )}
              </div>
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
              <button className="px-4 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
            
            {financialData?.recentPayments && financialData.recentPayments.length > 0 ? (
              <div className="space-y-3">
                {financialData.recentPayments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{payment.clientName}</p>
                        <p className="text-sm text-gray-500">{payment.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                      <p className="text-sm text-gray-500">{payment.method}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum pagamento encontrado para este período</p>
                </div>
            )}
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

            {financialData?.comissoesPorProfissional && financialData.comissoesPorProfissional.length > 0 ? (
          <div className="space-y-4">
                {financialData.comissoesPorProfissional.map((comissao, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg border border-gray-100">
                    {/* Header do Profissional */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleProfessional(comissao._id.toString())}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-[#EED7B6] rounded-full flex items-center justify-center mr-4">
                            <Users className="w-6 h-6 text-[#D15556]" />
                  </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{comissao.nome}</h4>
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
                          {expandedProfessional === comissao._id.toString() ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
          </div>
        </div>
      </div>

                    {/* Detalhes das Comissões - Expandidos/Colapsados */}
                    {expandedProfessional === comissao._id.toString() && (
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
                                    .filter(d => d.tipo === 'Serviço' && d.profissionalId === comissao._id.toString())
                                    .reduce((sum, d) => sum + d.valor, 0)
                                    .toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2 mb-4">
                              {comissao.detalhes
                                .filter(d => d.tipo === 'Serviço' && d.profissionalId === comissao._id.toString())
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
                                  .filter(d => d.tipo === 'Serviço' && d.profissionalId === comissao._id.toString())
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
                                    .filter(d => d.tipo === 'Produto' && d.profissionalId === comissao._id.toString())
                                    .reduce((sum, d) => sum + d.valor, 0)
                                    .toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2 mb-4">
                              {comissao.detalhes
                                .filter(d => d.tipo === 'Produto' && d.profissionalId === comissao._id.toString())
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
                                  .filter(d => d.tipo === 'Produto' && d.profissionalId === comissao._id.toString())
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
    </div>
  )
}

