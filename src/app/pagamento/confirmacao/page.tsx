'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface PaymentStatus {
  success: boolean
  paid: boolean
  paidAt?: string
  signalValue?: number
  status?: string
  error?: string
}

function ConfirmacaoPagamentoContent() {
  const searchParams = useSearchParams()
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  const appointmentId = searchParams.get('appointmentId')
  const transactionId = searchParams.get('transactionId')

  useEffect(() => {
    if (appointmentId) {
      checkPaymentStatus()
    } else {
      setLoading(false)
    }
  }, [appointmentId])

  const checkPaymentStatus = async () => {
    if (!appointmentId) return

    try {
      setChecking(true)
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId,
          transactionId
        })
      })

      const data = await response.json()
      
      if (data.success && data.appointment?.signalPaid) {
        setPaymentStatus({
          success: true,
          paid: true,
          paidAt: data.appointment.signalPaidAt,
          signalValue: data.creditsAdded,
          status: 'confirmed'
        })
      } else if (data.success === false) {
        setPaymentStatus({
          success: false,
          paid: false,
          status: data.status || 'pending'
        })
      } else {
        setPaymentStatus({
          success: false,
          paid: false,
          error: 'Erro ao verificar status do pagamento'
        })
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error)
      setPaymentStatus({
        success: false,
        paid: false,
        error: 'Erro ao verificar status do pagamento'
      })
    } finally {
      setLoading(false)
      setChecking(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#D15556] mx-auto mb-4" />
          <p className="text-gray-600">Verificando status do pagamento...</p>
        </div>
      </div>
    )
  }

  if (!appointmentId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro</h1>
          <p className="text-gray-600 mb-6">
            Parâmetros de pagamento não encontrados.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-[#D15556] text-white rounded-lg hover:bg-[#c04546] transition-colors"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        {paymentStatus?.paid ? (
          // Pagamento confirmado
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Pagamento Confirmado!
            </h1>
            <p className="text-gray-600 mb-6">
              Seu sinal foi pago com sucesso. Seu agendamento está confirmado.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    <strong>Créditos adicionados!</strong> O valor do sinal foi adicionado como crédito na sua conta e pode ser usado em futuros agendamentos.
                  </p>
                </div>
              </div>
            </div>
            
            {paymentStatus.signalValue && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  <strong>Valor pago:</strong> {formatCurrency(paymentStatus.signalValue)}
                </p>
                {paymentStatus.paidAt && (
                  <p className="text-sm text-green-800 mt-1">
                    <strong>Data do pagamento:</strong> {formatDate(paymentStatus.paidAt)}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3">
              <Link
                href="/painel-cliente"
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-[#D15556] text-white rounded-lg hover:bg-[#c04546] transition-colors"
              >
                Acessar Painel do Cliente
              </Link>
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voltar ao início
              </Link>
            </div>
          </div>
        ) : paymentStatus?.error ? (
          // Erro
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Erro no Pagamento
            </h1>
            <p className="text-gray-600 mb-6">
              {paymentStatus.error}
            </p>
            <div className="space-y-3">
              <button
                onClick={checkPaymentStatus}
                disabled={checking}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-[#D15556] text-white rounded-lg hover:bg-[#c04546] transition-colors disabled:opacity-50"
              >
                {checking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Verificando...
                  </>
                ) : (
                  'Tentar Novamente'
                )}
              </button>
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voltar ao início
              </Link>
            </div>
          </div>
        ) : (
          // Pagamento pendente
          <div className="text-center">
            <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Pagamento Pendente
            </h1>
            <p className="text-gray-600 mb-6">
              Seu pagamento ainda está sendo processado. Aguarde alguns minutos e verifique novamente.
            </p>
            
            {paymentStatus?.signalValue && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Valor a pagar:</strong> {formatCurrency(paymentStatus.signalValue)}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={checkPaymentStatus}
                disabled={checking}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-[#D15556] text-white rounded-lg hover:bg-[#c04546] transition-colors disabled:opacity-50"
              >
                {checking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Verificando...
                  </>
                ) : (
                  'Verificar Pagamento'
                )}
              </button>
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voltar ao início
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ConfirmacaoPagamentoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#D15556] mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <ConfirmacaoPagamentoContent />
    </Suspense>
  )
}
