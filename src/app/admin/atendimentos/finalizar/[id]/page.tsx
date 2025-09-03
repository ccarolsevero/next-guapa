'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  CheckCircle, 
  DollarSign, 
  Clock, 
  User,
  CreditCard,
  FileText,
  Star
} from 'lucide-react'

interface Comanda {
  id: string
  clienteId: string
  clienteNome: string
  clienteTelefone: string
  profissionalId: string
  profissionalNome: string
  inicioAt: string
  servicos: Array<{
    nome: string
    preco: number
    quantidade: number
  }>
  produtos: Array<{
    nome: string
    preco: number
    quantidade: number
    vendidoPor?: string
  }>
  valorTotal: number
  status: string
  observacoes?: string
}

interface Finalizacao {
  paymentMethod: string
  receivedAmount: number
  change: number
  observations: string
  nextAppointment: string
  recommendedProducts: string
  completedAt: string
  discount: number
  creditAmount: number
}

const paymentMethods = [
  { id: 'pix', name: 'PIX', icon: '💳' },
  { id: 'credit', name: 'Cartão de Crédito', icon: '💳' },
  { id: 'debit', name: 'Cartão de Débito', icon: '💳' },
  { id: 'cash', name: 'Dinheiro', icon: '💵' },
  { id: 'transfer', name: 'Transferência', icon: '🏦' }
]

export default function FinalizarAtendimentoPage() {
  const router = useRouter()
  const params = useParams()
  const comandaId = params.id

  const [comanda, setComanda] = useState<Comanda | null>(null)
  const [loading, setLoading] = useState(true)
  const [finalizacao, setFinalizacao] = useState<Finalizacao>({
    paymentMethod: '',
    receivedAmount: 0,
    change: 0,
    observations: '',
    nextAppointment: new Date().toISOString().slice(0, 10),
    recommendedProducts: '',
    completedAt: new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 16),
    discount: 0,
    creditAmount: 0
  })

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed')

  // Buscar dados da comanda
  useEffect(() => {
    const fetchComanda = async () => {
      if (!comandaId) return
      
      try {
        setLoading(true)
        console.log('🔄 Buscando comanda:', comandaId)
        
        const response = await fetch(`/api/comandas/${comandaId}`)
        if (response.ok) {
          const data = await response.json()
          setComanda(data.comanda)
          console.log('✅ Comanda carregada:', data.comanda)
          console.log('📊 Serviços na comanda:', data.comanda.servicos?.length || 0)
          console.log('📦 Produtos na comanda:', data.comanda.produtos?.length || 0)
          console.log('🔍 Detalhes dos produtos:', data.comanda.produtos)
          console.log('🔍 Detalhes dos serviços:', data.comanda.servicos)
          
          // TODO: Futuramente implementar busca automática do sinal do agendamento
          // const sinal = await buscarSinalAgendamento(data.comanda.appointmentId)
          // if (sinal > 0) {
          //   setFinalizacao(prev => ({ ...prev, creditAmount: sinal }))
          //   console.log('💰 Sinal do agendamento carregado:', sinal)
          // }
        } else {
          console.error('❌ Erro ao carregar comanda:', response.status)
        }
      } catch (error) {
        console.error('❌ Erro ao buscar comanda:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchComanda()
  }, [comandaId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFinalizacao(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))

    // Calcular troco
    if (name === 'receivedAmount') {
      const amount = parseFloat(value) || 0
      const valorFinal = (comanda?.valorTotal || 0) - finalizacao.discount
      const change = amount - valorFinal
      setFinalizacao(prev => ({
        ...prev,
        change: Math.max(0, change)
      }))
    }
  }

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const discount = parseFloat(e.target.value) || 0
    let valorFinal = 0
    
    if (discountType === 'percentage') {
      // Desconto em porcentagem
      const discountAmount = (comanda?.valorTotal || 0) * (discount / 100)
      valorFinal = Math.max(0, (comanda?.valorTotal || 0) - discountAmount)
    } else {
      // Desconto em valor fixo
      valorFinal = Math.max(0, (comanda?.valorTotal || 0) - discount)
    }
    
    setFinalizacao(prev => ({
      ...prev,
      discount,
      change: Math.max(0, finalizacao.receivedAmount - valorFinal)
    }))
  }

  const calcularComissoes = () => {
    if (!comanda) return { totalComissao: 0, detalhes: [] }
    
    let totalComissao = 0
    const detalhes: Array<{
      tipo: string
      item: string
      valor: number
      comissao: number
      vendidoPor?: string
    }> = []
    
    // Comissão dos serviços (10% para o profissional)
    comanda.servicos.forEach(servico => {
      const comissao = servico.preco * servico.quantidade * 0.10
      totalComissao += comissao
      detalhes.push({
        tipo: 'Serviço',
        item: servico.nome,
        valor: servico.preco * servico.quantidade,
        comissao: comissao
      })
    })
    
    // Comissão dos produtos (15% para quem vendeu)
    comanda.produtos.forEach(produto => {
      const comissao = produto.preco * produto.quantidade * 0.15
      totalComissao += comissao
      detalhes.push({
        tipo: 'Produto',
        item: produto.nome,
        valor: produto.preco * produto.quantidade,
        comissao: comissao,
        vendidoPor: produto.vendidoPor || 'Não definido'
      })
    })
    
    return { totalComissao, detalhes }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comanda) return
    
    setIsLoading(true)
    setMessage('')

    try {
      // Usar a função calcularValorFinal para obter o valor correto
      const valorFinalCalculado = calcularValorFinal()
      const { totalComissao, detalhes } = calcularComissoes()
      
      console.log('🔄 Finalizando atendimento...')
      console.log('💰 Valor original:', comanda.valorTotal)
      console.log('💸 Desconto:', finalizacao.discount)
      console.log('💳 Crédito:', finalizacao.creditAmount)
      console.log('💵 Valor final:', valorFinalCalculado)
      console.log('💳 Método de pagamento:', finalizacao.paymentMethod)
      console.log('💵 Valor recebido:', finalizacao.receivedAmount)
      
      // Dados da finalização para salvar
      const finalizacaoData = {
        comandaId: comanda.id,
        clienteId: comanda.clienteId,
        profissionalId: comanda.profissionalId,
        dataInicio: comanda.inicioAt,
        dataFim: finalizacao.completedAt,
        valorOriginal: comanda.valorTotal,
        valorFinal: valorFinalCalculado,
        desconto: finalizacao.discount,
        creditAmount: finalizacao.creditAmount,
        metodoPagamento: finalizacao.paymentMethod,
        valorRecebido: finalizacao.receivedAmount,
        troco: finalizacao.change,
        observacoes: finalizacao.observations || '',
        proximoAgendamento: finalizacao.nextAppointment || '',
        produtosRecomendados: finalizacao.recommendedProducts || '',
        servicos: comanda.servicos,
        produtos: comanda.produtos,
        totalComissao: totalComissao,
        detalhesComissao: detalhes,
        faturamento: valorFinalCalculado
      }

      // Validações antes de enviar
      if (!finalizacaoData.comandaId) {
        throw new Error('ID da comanda não encontrado')
      }
      if (!finalizacaoData.clienteId) {
        throw new Error('ID do cliente não encontrado')
      }
      if (!finalizacaoData.profissionalId) {
        throw new Error('ID do profissional não encontrado')
      }
      if (!finalizacaoData.metodoPagamento) {
        throw new Error('Forma de pagamento não selecionada')
      }
      if (finalizacaoData.valorRecebido < finalizacaoData.valorFinal) {
        throw new Error('Valor recebido é menor que o valor final')
      }

      console.log('✅ Dados da finalização:', finalizacaoData)
      
      // Chamar API para finalizar comanda
      console.log('🚀 Enviando dados para API de finalização...')
      console.log('📦 Comanda ID:', comanda.id)
      console.log('💰 Dados enviados:', finalizacaoData)
      
      const response = await fetch('/api/comandas/finalizar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comandaId: comanda.id,
          finalizacaoData: finalizacaoData
        })
      })

      console.log('📡 Status da resposta:', response.status)
      console.log('📡 Status OK:', response.ok)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Erro na API:', errorData)
        throw new Error(errorData.error || 'Erro ao finalizar comanda')
      }

      const result = await response.json()
      console.log('✅ Resultado da finalização:', result)
      console.log('💰 Faturamento atualizado:', result.faturamentoAtualizado)
      
      setMessage('✅ Atendimento finalizado com sucesso! Dados salvos no histórico da cliente e relatórios financeiros.')
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        router.push('/admin/comandas')
      }, 3000)
          } catch (error) {
        console.error('❌ Erro ao finalizar atendimento:', error)
        if (error instanceof Error) {
          console.error('❌ Mensagem de erro:', error.message)
          console.error('❌ Stack trace:', error.stack)
        }
        setMessage('❌ Erro ao finalizar atendimento. Tente novamente.')
      } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando comanda...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!comanda) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Comanda não encontrada</h2>
            <p className="text-gray-600 mb-6">A comanda que você está procurando não existe ou foi removida.</p>
            <Link
              href="/admin/comandas"
              className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors font-medium tracking-wide"
            >
              Voltar para Comandas
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const calcularValorFinal = () => {
    let valorFinal = comanda.valorTotal
    
    // Aplicar desconto
    if (discountType === 'percentage') {
      const discountAmount = comanda.valorTotal * (finalizacao.discount / 100)
      valorFinal -= discountAmount
    } else {
      valorFinal -= finalizacao.discount
    }
    
    // Aplicar crédito (sinal)
    valorFinal -= finalizacao.creditAmount
    
    // Garantir que o valor final não seja negativo
    return Math.max(0, valorFinal)
  }
  
  const valorFinal = calcularValorFinal()
  const { totalComissao, detalhes } = calcularComissoes()

  const getCurrentSaoPauloTime = () => {
    return new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 16)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link 
                href="/admin/comandas" 
                className="flex items-center text-gray-600 hover:text-black mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Link>
              <h1 className="text-2xl font-bold text-black">
                Finalizar Atendimento
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações do Atendimento */}
          <div className="bg-white p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-black mb-6 flex items-center">
              <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
              Informações do Atendimento
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Cliente</label>
                <p className="text-gray-700">{comanda.clienteNome}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Profissional</label>
                <p className="text-gray-700">{comanda.profissionalNome}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Serviço</label>
                <p className="text-gray-700">
                  {comanda.servicos.map(s => s.nome).join(' + ')}
                  {comanda.produtos.length > 0 && ' + ' + comanda.produtos.map(p => p.nome).join(' + ')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Data e Hora</label>
                <p className="text-gray-700">
                  {new Date(comanda.inicioAt).toLocaleString('pt-BR', { 
                    timeZone: 'America/Sao_Paulo',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Resumo da comanda */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-base font-bold text-gray-900 mb-3">Resumo da comanda:</h4>
              <div className="space-y-3">
                {comanda.servicos.map((servico, index) => (
                  <div key={index} className="flex justify-between items-center py-2 px-3 bg-white rounded-md border border-gray-100">
                    <span className="text-gray-900 font-semibold text-base">{servico.nome} (x{servico.quantidade})</span>
                    <span className="text-green-700 font-bold text-lg">R$ {(servico.preco * servico.quantidade).toFixed(2)}</span>
                  </div>
                ))}
                {comanda.produtos.map((produto, index) => (
                  <div key={index} className="flex justify-between items-center py-2 px-3 bg-white rounded-md border border-gray-100">
                    <span className="text-gray-900 font-semibold text-base">{produto.nome} (x{produto.quantidade})</span>
                    <span className="text-green-700 font-bold text-lg">R$ {(produto.preco * produto.quantidade).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center bg-blue-50 p-3 rounded-md">
                  <span className="text-gray-900 font-bold text-lg">Total:</span>
                  <span className="text-blue-800 font-bold text-xl">R$ {comanda.valorTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Valor e Pagamento */}
          <div className="bg-white p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-black mb-6 flex items-center">
              <DollarSign className="w-6 h-6 mr-3 text-green-600" />
              Valor e Pagamento - Deploy Forçado
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Valor Original (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="text"
                    value={comanda.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    disabled
                    className="w-full p-3 pl-10 border border-gray-300 bg-gray-100 text-gray-700 font-medium"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Desconto
                </label>
                
                {/* Seletor de tipo de desconto */}
                <div className="flex space-x-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setDiscountType('fixed')}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      discountType === 'fixed'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    R$ (Valor)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('percentage')}
                    className={`px-3 py-2 text-sm font-medium rounded-colors ${
                      discountType === 'percentage'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    % (Porcentagem)
                  </button>
                </div>
                
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {discountType === 'percentage' ? '%' : 'R$'}
                  </span>
                  <input
                    type="text"
                    name="discount"
                    value={finalizacao.discount > 0 ? 
                      (discountType === 'percentage' 
                        ? `${Math.round(finalizacao.discount)}%` 
                        : finalizacao.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      ) : ''
                    }
                    onChange={(e) => {
                      let value = e.target.value
                      
                      if (discountType === 'percentage') {
                        // Remover % e converter para número
                        value = value.replace('%', '').replace(/[^\d,]/g, '').replace(',', '.')
                        const numValue = parseFloat(value) || 0
                        
                        // Limitar porcentagem a 100%
                        if (numValue <= 100) {
                          setFinalizacao(prev => ({ ...prev, discount: numValue }))
                        }
                      } else {
                        // Formato normal para valores
                        value = value.replace(/[^\d,]/g, '').replace(',', '.')
                        const numValue = parseFloat(value) || 0
                        
                        // Limitar valor fixo ao total da comanda
                        if (numValue <= comanda.valorTotal) {
                          setFinalizacao(prev => ({ ...prev, discount: numValue }))
                        }
                      }
                    }}
                    placeholder={discountType === 'percentage' ? '0,0%' : '0,00'}
                    className={`w-full p-3 pl-10 border transition-colors ${
                      finalizacao.discount > 0 
                        ? 'border-green-500 bg-green-50 text-green-800' 
                        : 'border-gray-300 bg-white text-black'
                    } focus:ring-0 focus:border-black`}
                  />
                </div>
                
                {finalizacao.discount > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    {discountType === 'percentage' 
                      ? `Desconto de ${finalizacao.discount.toFixed(1)}% (R$ ${((finalizacao.discount / 100) * comanda.valorTotal).toFixed(2)})`
                      : `Desconto de R$ ${finalizacao.discount.toFixed(2)} (${((finalizacao.discount / comanda.valorTotal) * 100).toFixed(1)}%)`
                    }
                  </p>
                )}
              </div>
              
              {/* Campo de Crédito (Sinal Pago) */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Sinal (Reserva do Horário)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="text"
                    name="creditAmount"
                    value={finalizacao.creditAmount > 0 ? finalizacao.creditAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d,]/g, '').replace(',', '.')
                      const numValue = parseFloat(value) || 0
                      
                      // Limitar crédito ao valor total da comanda
                      if (numValue <= comanda.valorTotal) {
                        setFinalizacao(prev => ({ ...prev, creditAmount: numValue }))
                      }
                    }}
                    placeholder="0,00"
                    className={`w-full p-3 pl-10 border transition-colors ${
                      finalizacao.creditAmount > 0 
                        ? 'border-blue-500 bg-blue-50 text-blue-800' 
                        : 'border-gray-300 bg-white text-black'
                    } focus:ring-0 focus:border-black`}
                  />
                </div>
                {finalizacao.creditAmount > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    Sinal de R$ {finalizacao.creditAmount.toFixed(2)} já pago para reserva
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  💡 Valor pago antecipadamente para reservar o horário
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Valor Final (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="number"
                    value={valorFinal.toFixed(2)}
                    disabled
                    className={`w-full p-3 pl-10 border font-bold ${
                      valorFinal < comanda.valorTotal 
                        ? 'border-green-500 bg-green-50 text-green-800' 
                        : 'border-gray-300 bg-gray-100 text-gray-700'
                    }`}
                  />
                </div>
                {valorFinal < comanda.valorTotal && (
                  <p className="text-xs text-green-600 mt-1">
                    {finalizacao.discount > 0 && `Desconto: R$ ${finalizacao.discount.toFixed(2)}`}
                    {finalizacao.discount > 0 && finalizacao.creditAmount > 0 && ' + '}
                    {finalizacao.creditAmount > 0 && `Crédito: R$ ${finalizacao.creditAmount.toFixed(2)}`}
                    {finalizacao.discount > 0 || finalizacao.creditAmount > 0 ? ` = Total: R$ ${(comanda.valorTotal - valorFinal).toFixed(2)}` : ''}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Forma de Pagamento *
                </label>
                <select
                  name="paymentMethod"
                  value={finalizacao.paymentMethod}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 bg-white text-black focus:ring-0 focus:border-black transition-colors"
                >
                  <option value="">Selecione...</option>
                  {paymentMethods.map(method => (
                    <option key={method.id} value={method.id}>
                      {method.icon} {method.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Valor Recebido (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="text"
                    name="receivedAmount"
                    value={finalizacao.receivedAmount > 0 ? finalizacao.receivedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d,]/g, '').replace(',', '.')
                      const numValue = parseFloat(value) || 0
                      setFinalizacao(prev => ({ ...prev, receivedAmount: numValue }))
                      
                      // Calcular troco
                      const change = numValue - valorFinal
                      setFinalizacao(prev => ({
                        ...prev,
                        change: Math.max(0, change)
                      }))
                    }}
                    required
                    placeholder={valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    className={`w-full p-3 pl-10 border transition-colors ${
                      finalizacao.receivedAmount >= valorFinal 
                        ? 'border-green-500 bg-green-50 text-green-800' 
                        : finalizacao.receivedAmount > 0 
                        ? 'border-orange-500 bg-orange-50 text-orange-800'
                        : 'border-gray-300 bg-white text-black'
                    } focus:ring-0 focus:border-black`}
                  />
                </div>
                {finalizacao.receivedAmount > 0 && finalizacao.receivedAmount < valorFinal && (
                  <p className="text-xs text-orange-600 mt-1">
                    Faltam R$ {(valorFinal - finalizacao.receivedAmount).toFixed(2)}
                  </p>
                )}
                {finalizacao.receivedAmount >= valorFinal && (
                  <p className="text-xs text-green-600 mt-1">
                    Valor suficiente ✓
                  </p>
                )}
              </div>
              

            </div>
          </div>



          {/* Observações do Atendimento */}
          <div className="bg-white p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-black mb-6 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-blue-600" />
              Observações do Atendimento
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Observações do Atendimento
                </label>
                <textarea
                  name="observations"
                  value={finalizacao.observations}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 bg-white text-black focus:ring-0 focus:border-black transition-colors"
                  placeholder="Observações sobre o atendimento... (opcional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Recomendações
                </label>
                <textarea
                  name="recommendedProducts"
                  value={finalizacao.recommendedProducts}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 bg-white text-black focus:ring-0 focus:border-black transition-colors"
                  placeholder="Recomendações para a cliente (produtos, cuidados, próximos passos)... (opcional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Próximo Agendamento Sugerido
                </label>
                <input
                  type="date"
                  name="nextAppointment"
                  value={finalizacao.nextAppointment}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 bg-white text-black focus:ring-0 focus:border-black transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Horário de Conclusão
                </label>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    name="completedAt"
                    value={finalizacao.completedAt}
                    onChange={handleInputChange}
                    required
                    className="flex-1 p-3 border border-gray-300 bg-white text-black focus:ring-0 focus:border-black transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setFinalizacao(prev => ({ ...prev, completedAt: getCurrentSaoPauloTime() }))}
                    className="px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                  >
                    Agora
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-1">Horário de São Paulo (GMT-3)</p>
              </div>
            </div>
          </div>

          {/* Botão de Finalização */}
          <div className="text-center">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                💡 Sistema atualizado: Finalização salva status, faturamento e comissões automaticamente
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/faturamento')
                      const data = await response.json()
                      console.log('💰 Faturamento atual:', data)
                      alert(`Faturamento do dia: R$ ${data.faturamento.valorTotal.toFixed(2)}\nComandas: ${data.comandasFinalizadas}`)
                    } catch (error) {
                      console.error('Erro ao consultar faturamento:', error)
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📊 Ver Faturamento
                </button>
                
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/debug/cliente?nome=${encodeURIComponent(comanda.clienteNome)}`)
                      const data = await response.json()
                      console.log('🔍 Debug cliente:', data)
                      alert(`Debug Cliente:\nCliente encontrado: ${data.debug.clienteEncontrado ? 'SIM' : 'NÃO'}\nComandas: ${data.debug.comandasEncontradas}\nFinalizações: ${data.debug.finalizacoesEncontradas}`)
                    } catch (error) {
                      console.error('Erro ao debug cliente:', error)
                    }
                  }}
                  className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                >
                  🔍 Debug Cliente
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !finalizacao.paymentMethod || finalizacao.receivedAmount < valorFinal}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-10 py-4 hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-bold tracking-wide text-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center mx-auto shadow-lg hover:shadow-xl transform hover:scale-105 rounded-lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Finalizando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Finalizar Atendimento
                </>
              )}
            </button>
            
            {/* Mensagem de ajuda */}
            {!finalizacao.paymentMethod && (
              <p className="text-sm text-orange-600 mt-2">
                ⚠️ Selecione uma forma de pagamento para continuar
              </p>
            )}
            {finalizacao.paymentMethod && finalizacao.receivedAmount < valorFinal && (
              <p className="text-sm text-orange-600 mt-2">
                ⚠️ O valor recebido deve ser maior ou igual ao valor final (R$ {valorFinal.toFixed(2)})
              </p>
            )}
          </div>

          {/* Mensagem de Status */}
          {message && (
            <div className={`text-center p-4 rounded-lg ${
              message.includes('sucesso') 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
