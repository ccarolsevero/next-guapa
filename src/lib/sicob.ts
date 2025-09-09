// Serviço para integração com a API do Sicob
// Documentação: https://developers.sicoob.com.br/

interface SicobConfig {
  clientId: string
  clientSecret: string
  certificatePath?: string
  environment: 'sandbox' | 'production'
}

interface PaymentRequest {
  amount: number
  description: string
  clientName: string
  clientEmail: string
  clientPhone: string
  appointmentId: string
  dueDate?: Date
}

interface PaymentResponse {
  success: boolean
  paymentLink?: string
  transactionId?: string
  error?: string
}

class SicobService {
  private config: SicobConfig
  private baseUrl: string
  private accessToken: string | null = null

  constructor(config: SicobConfig) {
    this.config = config
    this.baseUrl = config.environment === 'production' 
      ? 'https://api.sicoob.com.br' 
      : 'https://sandbox.sicoob.com.br'
  }

  // Autenticação OAuth2
  private async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          scope: 'cobranca_bancaria'
        })
      })

      if (!response.ok) {
        throw new Error(`Erro na autenticação: ${response.statusText}`)
      }

      const data = await response.json()
      this.accessToken = data.access_token
      return true
    } catch (error) {
      console.error('Erro na autenticação Sicob:', error)
      return false
    }
  }

  // Gerar link de pagamento
  async createPaymentLink(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Autenticar se necessário
      if (!this.accessToken) {
        const authenticated = await this.authenticate()
        if (!authenticated) {
          return {
            success: false,
            error: 'Falha na autenticação com Sicob'
          }
        }
      }

      // Calcular data de vencimento (7 dias a partir de hoje)
      const dueDate = paymentRequest.dueDate || new Date()
      dueDate.setDate(dueDate.getDate() + 7)

      // Preparar dados para a API
      const paymentData = {
        valor: paymentRequest.amount,
        descricao: paymentRequest.description,
        vencimento: dueDate.toISOString().split('T')[0], // YYYY-MM-DD
        pagador: {
          nome: paymentRequest.clientName,
          email: paymentRequest.clientEmail,
          telefone: paymentRequest.clientPhone
        },
        instrucoes: [
          'Sinal de 30% para agendamento de serviços',
          'Pagamento obrigatório para confirmação do agendamento'
        ],
        metadata: {
          appointmentId: paymentRequest.appointmentId,
          type: 'signal_payment'
        }
      }

      // Fazer requisição para criar cobrança
      const response = await fetch(`${this.baseUrl}/cobranca-bancaria/v1/cobrancas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Erro ao criar cobrança: ${errorData.message || response.statusText}`)
      }

      const data = await response.json()

      return {
        success: true,
        paymentLink: data.linkPagamento,
        transactionId: data.id
      }

    } catch (error) {
      console.error('Erro ao criar link de pagamento:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Verificar status do pagamento
  async checkPaymentStatus(transactionId: string): Promise<{
    success: boolean
    paid?: boolean
    paidAt?: Date
    error?: string
  }> {
    try {
      if (!this.accessToken) {
        const authenticated = await this.authenticate()
        if (!authenticated) {
          return {
            success: false,
            error: 'Falha na autenticação com Sicob'
          }
        }
      }

      const response = await fetch(`${this.baseUrl}/cobranca-bancaria/v1/cobrancas/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ao verificar status: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        success: true,
        paid: data.status === 'PAGO',
        paidAt: data.status === 'PAGO' ? new Date(data.dataPagamento) : undefined
      }

    } catch (error) {
      console.error('Erro ao verificar status do pagamento:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }
}

// Instância do serviço (configuração via variáveis de ambiente)
const sicobService = new SicobService({
  clientId: process.env.SICOOB_CLIENT_ID || '',
  clientSecret: process.env.SICOOB_CLIENT_SECRET || '',
  environment: (process.env.SICOOB_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
})

export default sicobService

// Função utilitária para calcular 30% do valor
export function calculateSignalValue(totalValue: number): number {
  return Math.round(totalValue * 0.3 * 100) / 100 // Arredonda para 2 casas decimais
}

// Função para formatar valor para exibição
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}
