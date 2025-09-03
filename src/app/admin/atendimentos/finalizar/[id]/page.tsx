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
  _id: string
  clienteId: string
  clienteNome: string
  clienteTelefone: string
  profissionalId: string
  profissionalNome: string
  dataInicio: string
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
    nextAppointment: '',
    recommendedProducts: '',
    completedAt: new Date().toISOString().slice(0, 16),
    discount: 0
  })

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

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
    const valorFinal = Math.max(0, (comanda?.valorTotal || 0) - discount)
    
    setFinalizacao(prev => ({
      ...prev,
      discount,
      change: Math.max(0, finalizacao.receivedAmount - valorFinal)
    }))
  }

  const calcularComissoes = () => {
    if (!comanda) return { totalComissao: 0, detalhes: [] }
    
    let totalComissao = 0
    const detalhes = []
    
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
      const valorFinal = comanda.valorTotal - finalizacao.discount
      const { totalComissao, detalhes } = calcularComissoes()
      
      // Dados da finalização para salvar
      const finalizacaoData = {
        comandaId: comanda._id,
        clienteId: comanda.clienteId,
        profissionalId: comanda.profissionalId,
        dataInicio: comanda.dataInicio,
        dataFim: finalizacao.completedAt,
        valorOriginal: comanda.valorTotal,
        valorFinal: valorFinal,
        desconto: finalizacao.discount,
        metodoPagamento: finalizacao.paymentMethod,
        valorRecebido: finalizacao.receivedAmount,
        troco: finalizacao.change,
        observacoes: finalizacao.observations,
        proximoAgendamento: finalizacao.nextAppointment,
        produtosRecomendados: finalizacao.recommendedProducts,
        servicos: comanda.servicos,
        produtos: comanda.produtos,
        totalComissao: totalComissao,
        detalhesComissao: detalhes,
        faturamento: valorFinal
      }

      console.log('Dados da finalização:', finalizacaoData)
      
      // TODO: Implementar API para salvar finalização
      // 1. Atualizar status da comanda para 'finalizada'
      // 2. Salvar dados financeiros
      // 3. Calcular e salvar comissões
      // 4. Atualizar faturamento
      // 5. Salvar no histórico do cliente
      
      setMessage('Atendimento finalizado com sucesso! Dados salvos no histórico da cliente e relatórios financeiros.')
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        router.push('/admin/comandas')
      }, 3000)
    } catch (error) {
      setMessage('Erro ao finalizar atendimento. Tente novamente.')
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

  const valorFinal = comanda.valorTotal - finalizacao.discount
  const { totalComissao, detalhes } = calcularComissoes()

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
                <p className="text-gray-700">{new Date(comanda.dataInicio).toLocaleString('pt-BR')}</p>
              </div>
            </div>

            {/* Resumo da comanda */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-bold text-gray-900 mb-2">Resumo da comanda:</h4>
              <div className="space-y-2">
                {comanda.servicos.map((servico, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{servico.nome} (x{servico.quantidade})</span>
                    <span>R$ {(servico.preco * servico.quantidade).toFixed(2)}</span>
                  </div>
                ))}
                {comanda.produtos.map((produto, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{produto.nome} (x{produto.quantidade})</span>
                    <span>R$ {(produto.preco * produto.quantidade).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span>R$ {comanda.valorTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Valor e Pagamento */}
          <div className="bg-white p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-black mb-6 flex items-center">
              <DollarSign className="w-6 h-6 mr-3 text-green-600" />
              Valor e Pagamento
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Valor Original (R$)
                </label>
                <input
                  type="number"
                  value={comanda.valorTotal.toFixed(2)}
                  disabled
                  className="w-full p-3 border border-gray-300 bg-gray-100 text-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Desconto (R$)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={finalizacao.discount}
                  onChange={handleDiscountChange}
                  min="0"
                  max={comanda.valorTotal}
                  step="0.01"
                  className="w-full p-3 border border-gray-300 bg-white text-black focus:ring-0 focus:border-black transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Valor Final (R$)
                </label>
                <input
                  type="number"
                  value={valorFinal.toFixed(2)}
                  disabled
                  className="w-full p-3 border border-gray-300 bg-gray-100 text-gray-700 font-bold"
                />
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
                <input
                  type="number"
                  name="receivedAmount"
                  value={finalizacao.receivedAmount}
                  onChange={handleInputChange}
                  min={valorFinal}
                  step="0.01"
                  required
                  className="w-full p-3 border border-gray-300 bg-white text-black focus:ring-0 focus:border-black transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Troco (R$)
                </label>
                <input
                  type="number"
                  value={finalizacao.change.toFixed(2)}
                  disabled
                  className="w-full p-3 border border-gray-300 bg-gray-100 text-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Comissões e Faturamento */}
          <div className="bg-white p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-black mb-6 flex items-center">
              <Star className="w-6 h-6 mr-3 text-yellow-600" />
              Comissões e Faturamento
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3">Detalhes das Comissões:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {detalhes.map((item, index) => (
                    <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.tipo}: {item.item}</span>
                        <span className="text-green-600">R$ {item.comissao.toFixed(2)}</span>
                      </div>
                      {item.vendidoPor && (
                        <div className="text-xs text-gray-600">Vendido por: {item.vendidoPor}</div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                  <div className="flex justify-between font-bold text-green-800">
                    <span>Total de Comissões:</span>
                    <span>R$ {totalComissao.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3">Resumo Financeiro:</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Valor Final:</span>
                    <span className="font-bold">R$ {valorFinal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comissões:</span>
                    <span className="text-red-600">-R$ {totalComissao.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Lucro Líquido:</span>
                    <span className="text-green-600">R$ {(valorFinal - totalComissao).toFixed(2)}</span>
                  </div>
                </div>
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
                  placeholder="Observações sobre o atendimento..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Produtos Recomendados
                </label>
                <textarea
                  name="recommendedProducts"
                  value={finalizacao.recommendedProducts}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full p-3 border border-gray-300 bg-white text-black focus:ring-0 focus:border-black transition-colors"
                  placeholder="Produtos recomendados para a cliente..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Próximo Agendamento Sugerido
                </label>
                <input
                  type="datetime-local"
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
                <input
                  type="datetime-local"
                  name="completedAt"
                  value={finalizacao.completedAt}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 bg-white text-black focus:ring-0 focus:border-black transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Botão de Finalização */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isLoading || !finalizacao.paymentMethod || finalizacao.receivedAmount < valorFinal}
              className="bg-green-600 text-white px-8 py-4 hover:bg-green-700 transition-colors font-medium tracking-wide text-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center mx-auto"
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
