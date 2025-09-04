import mongoose, { Document, Schema } from 'mongoose'

export interface IRecomendacao extends Document {
  clientId: string
  titulo: string
  descricao: string
  tipo: 'pos-atendimento' | 'cuidados' | 'manutencao' | 'orientacoes' | 'outro'
  prioridade: 'baixa' | 'media' | 'alta'
  status: 'ativa' | 'concluida' | 'cancelada'
  anexos: Array<{
    nome: string
    url: string
    tipo: string
    tamanho: number
    dataUpload: Date
  }>
  profissionalId: string
  dataRecomendacao: Date
  dataValidade?: Date
  observacoes?: string
  createdAt: Date
  updatedAt: Date
}

const RecomendacaoSchema = new Schema<IRecomendacao>({
  clientId: {
    type: String,
    required: true,
    index: true
  },
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  descricao: {
    type: String,
    required: true,
    trim: true
  },
  tipo: {
    type: String,
    enum: ['pos-atendimento', 'cuidados', 'manutencao', 'orientacoes', 'outro'],
    required: true
  },
  prioridade: {
    type: String,
    enum: ['baixa', 'media', 'alta'],
    default: 'media'
  },
  status: {
    type: String,
    enum: ['ativa', 'concluida', 'cancelada'],
    default: 'ativa'
  },
  anexos: [{
    nome: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    tipo: {
      type: String,
      required: true
    },
    tamanho: {
      type: Number,
      required: true
    },
    dataUpload: {
      type: Date,
      default: Date.now
    }
  }],
  profissionalId: {
    type: String,
    required: true
  },
  dataRecomendacao: {
    type: Date,
    default: Date.now
  },
  dataValidade: {
    type: Date
  },
  observacoes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

// Índices para melhor performance
RecomendacaoSchema.index({ clientId: 1, status: 1 })
RecomendacaoSchema.index({ dataRecomendacao: -1 })

export default mongoose.models.Recomendacao || mongoose.model<IRecomendacao>('Recomendacao', RecomendacaoSchema)
