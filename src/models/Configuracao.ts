import mongoose, { Document, Schema } from 'mongoose'

export interface IConfiguracao extends Document {
  // Informações do Sistema
  nomeSalao: string
  emailContato: string
  telefone: string
  endereco: string
  
  // Configurações do Negócio
  moeda: string
  fusoHorario: string
  taxaCancelamento: number
  tempoAntecedencia: number
  
  // Políticas
  politicaCancelamento: string
  politicaReagendamento: string
  
  // Horários de Funcionamento
  horariosFuncionamento: Array<{
    dia: string
    ativo: boolean
    horaInicio: string
    horaFim: string
  }>
  
  // Intervalos de Agendamento
  intervaloAgendamentos: number
  duracaoMaximaAgendamento: number
  
  // Configurações de Segurança
  autenticacaoDuasEtapas: boolean
  sessaoAutomatica: boolean
  logAtividades: boolean
  
  // Metadados
  ultimaAtualizacao: Date
  atualizadoPor: string
}

const ConfiguracaoSchema = new Schema<IConfiguracao>({
  // Informações do Sistema
  nomeSalao: {
    type: String,
    required: true,
    default: 'Espaço Guapa'
  },
  emailContato: {
    type: String,
    required: true,
    default: 'contato@espacoguapa.com'
  },
  telefone: {
    type: String,
    required: true,
    default: '(11) 99999-9999'
  },
  endereco: {
    type: String,
    required: true,
    default: 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP'
  },
  
  // Configurações do Negócio
  moeda: {
    type: String,
    required: true,
    default: 'BRL'
  },
  fusoHorario: {
    type: String,
    required: true,
    default: 'America/Sao_Paulo'
  },
  taxaCancelamento: {
    type: Number,
    required: true,
    default: 10
  },
  tempoAntecedencia: {
    type: Number,
    required: true,
    default: 15
  },
  
  // Políticas
  politicaCancelamento: {
    type: String,
    required: true,
    default: 'Cancelamentos devem ser feitos com pelo menos 24h de antecedência. Cancelamentos em menos de 24h podem ser cobrados 50% do valor do serviço.'
  },
  politicaReagendamento: {
    type: String,
    required: true,
    default: 'Reagendamentos podem ser feitos até 2h antes do horário marcado, sem custo adicional.'
  },
  
  // Horários de Funcionamento
  horariosFuncionamento: [{
    dia: {
      type: String,
      required: true
    },
    ativo: {
      type: Boolean,
      default: true
    },
    horaInicio: {
      type: String,
      required: true
    },
    horaFim: {
      type: String,
      required: true
    }
  }],
  
  // Intervalos de Agendamento
  intervaloAgendamentos: {
    type: Number,
    required: true,
    default: 15
  },
  duracaoMaximaAgendamento: {
    type: Number,
    required: true,
    default: 180
  },
  
  // Configurações de Segurança
  autenticacaoDuasEtapas: {
    type: Boolean,
    default: false
  },
  sessaoAutomatica: {
    type: Boolean,
    default: true
  },
  logAtividades: {
    type: Boolean,
    default: true
  },
  
  // Metadados
  ultimaAtualizacao: {
    type: Date,
    default: Date.now
  },
  atualizadoPor: {
    type: String,
    required: true,
    default: 'admin'
  }
}, {
  timestamps: true
})

// Índice único para garantir apenas uma configuração
ConfiguracaoSchema.index({}, { unique: true })

export default mongoose.models.Configuracao || mongoose.model<IConfiguracao>('Configuracao', ConfiguracaoSchema)
