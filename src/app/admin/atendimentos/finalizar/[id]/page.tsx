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

// Mock data
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
  const appointmentId = params.id

  const [appointment, setAppointment] = useState({
    id: '',
    clientName: '',
    clientPhone: '',
    serviceName: '',
    professionalName: '',
    date: '',
    time: '',
    duration: 0,
    originalPrice: 0,
    finalPrice: 0,
    discount: 0,
    status: 'em_andamento'
  })

  const [finalization, setFinalization] = useState({
    paymentMethod: '',
    receivedAmount: 0,
    change: 0,
    observations: '',
    nextAppointment: '',
    recommendedProducts: '',
    completedAt: new Date().toISOString().slice(0, 16)
  })

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Simular carregamento da comanda/agendamento
    // Em produção, isso viria da API com os dados da comanda
    const comandaData = {
      id: appointmentId as string,
      clientName: 'Maria Silva',
      clientPhone: '(11) 99999-1234',
      serviceName: 'Corte Feminino + Hidratação + Shampoo + Máscara',
      professionalName: 'Ana Carolina',
      date: '2024-01-15',
      time: '14:00',
      duration: 120,
      originalPrice: 158.00, // Total da comanda
      finalPrice: 158.00,
      discount: 0,
      status: 'em_andamento',
      services: [
        { name: 'Corte Feminino', price: 45.00, quantity: 1 },
        { name: 'Hidratação', price: 50.00, quantity: 1 }
      ],
      products: [
        { name: 'Shampoo Profissional', price: 35.00, quantity: 1 },
        { name: 'Máscara Hidratante', price: 28.00, quantity: 1 }
      ],
      observations: 'Cliente solicitou corte longo com camadas'
    }
    
    setAppointment(comandaData)
  }, [appointmentId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFinalization(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))

    // Calcular troco
    if (name === 'receivedAmount') {
      const amount = parseFloat(value) || 0
      const change = amount - appointment.finalPrice
      setFinalization(prev => ({
        ...prev,
        change: Math.max(0, change)
      }))
    }
  }

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const discount = parseFloat(e.target.value) || 0
    const finalPrice = Math.max(0, appointment.originalPrice - discount)
    
    setAppointment(prev => ({
      ...prev,
      discount,
      finalPrice
    }))

    // Recalcular troco
    const change = finalization.receivedAmount - finalPrice
    setFinalization(prev => ({
      ...prev,
      change: Math.max(0, change)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      // Simular processamento completo
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Dados da finalização para salvar
      const finalizationData = {
        appointmentId: appointment.id,
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone,
        professionalName: appointment.professionalName,
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration,
        originalPrice: appointment.originalPrice,
        finalPrice: appointment.finalPrice,
        discount: appointment.discount,
        paymentMethod: finalization.paymentMethod,
        receivedAmount: finalization.receivedAmount,
        change: finalization.change,
        // satisfaction: será coletada pela cliente separadamente
        observations: finalization.observations,
        nextAppointment: finalization.nextAppointment,
        recommendedProducts: finalization.recommendedProducts,
        completedAt: finalization.completedAt,
        services: (appointment as any).services || [],
        products: (appointment as any).products || [],
        totalRevenue: appointment.finalPrice,
        profitMargin: appointment.finalPrice * 0.6 // Estimativa de margem de 60%
      }

      // Em produção, aqui seria feita a chamada para a API para salvar:
      // 1. Histórico da cliente
      // 2. Dados financeiros
      // 3. Estatísticas do profissional
      // 4. Relatórios de vendas
      // 5. Atualizar status da comanda
      
      console.log('Dados salvos:', finalizationData)
      
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

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link 
                href="/admin/agendamentos" 
                className="flex items-center text-gray-600 hover:text-black mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Link>
              <h1 className="text-2xl font-light text-gray-900">
                Finalizar Atendimento
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações do Atendimento */}
          <div className="bg-white p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-black mb-6 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Informações do Atendimento
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Cliente</label>
                <div className="p-3 bg-gray-50 border border-gray-200">
                  <p className="font-medium">{appointment.clientName}</p>
                  <p className="text-sm text-gray-600">{appointment.clientPhone}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Profissional</label>
                <div className="p-3 bg-gray-50 border border-gray-200">
                  <p className="font-medium">{appointment.professionalName}</p>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-900 mb-2">Serviço</label>
                <div className="p-3 bg-gray-50 border border-gray-200">
                  <p className="font-medium">{appointment.serviceName}</p>
                  <p className="text-sm text-gray-600">
                    {appointment.date} às {appointment.time} ({appointment.duration} min)
                  </p>
                  
                  {/* Detalhes da comanda */}
                  {(appointment as any).services && (appointment as any).services.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="text-sm font-bold text-gray-900 mb-2">Serviços Realizados:</h4>
                      <div className="space-y-1">
                        {(appointment as any).services.map((service: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{service.name} (x{service.quantity})</span>
                            <span>R$ {(service.price * service.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(appointment as any).products && (appointment as any).products.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="text-sm font-bold text-gray-900 mb-2">Produtos Vendidos:</h4>
                      <div className="space-y-1">
                        {(appointment as any).products.map((product: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{product.name} (x{product.quantity})</span>
                            <span>R$ {(product.price * product.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Valor e Pagamento */}
          <div className="bg-white p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-black mb-6 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Valor e Pagamento
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Valor Original (R$)
                </label>
                <div className="p-3 bg-gray-50 border border-gray-200">
                  <p className="font-medium text-lg">R$ {appointment.originalPrice.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Desconto (R$)
                </label>
                <input
                  type="number"
                  value={appointment.discount}
                  onChange={handleDiscountChange}
                  min="0"
                  max={appointment.originalPrice}
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-0 focus:border-black transition-colors"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Valor Final (R$)
                </label>
                <div className="p-3 bg-black text-white">
                  <p className="font-medium text-lg">R$ {appointment.finalPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Forma de Pagamento *
                </label>
                <select
                  name="paymentMethod"
                  value={finalization.paymentMethod}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-0 focus:border-black transition-colors"
                >
                  <option value="">Selecione a forma de pagamento</option>
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
                  value={finalization.receivedAmount}
                  onChange={handleInputChange}
                  min={appointment.finalPrice}
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-0 focus:border-black transition-colors"
                  placeholder={appointment.finalPrice.toFixed(2)}
                />
              </div>

              {finalization.change > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Troco (R$)
                  </label>
                  <div className="p-3 bg-green-50 border border-green-200">
                    <p className="font-medium text-green-700">R$ {finalization.change.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          <div className="bg-white p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-black mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Observações do Atendimento
            </h2>
            
            <div className="space-y-6">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações do Atendimento
                </label>
                <textarea
                  name="observations"
                  value={finalization.observations}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-0 focus:border-black transition-colors"
                  placeholder="Observações sobre o atendimento, produtos utilizados, etc..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Produtos Recomendados
                </label>
                <textarea
                  name="recommendedProducts"
                  value={finalization.recommendedProducts}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-0 focus:border-black transition-colors"
                  placeholder="Produtos recomendados para a cliente..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Próximo Agendamento Sugerido
                </label>
                <input
                  type="datetime-local"
                  name="nextAppointment"
                  value={finalization.nextAppointment}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-0 focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário de Conclusão
                </label>
                <input
                  type="datetime-local"
                  name="completedAt"
                  value={finalization.completedAt}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-0 focus:border-black transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Mensagem de feedback */}
          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('sucesso') 
                ? 'bg-green-50 border border-green-200 text-green-600' 
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}>
              {message}
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/agendamentos')}
              className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !finalization.paymentMethod}
              className="px-8 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 tracking-wide flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Finalizando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Finalizar Atendimento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
