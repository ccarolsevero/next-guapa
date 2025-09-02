import mongoose, { Schema, Document } from 'mongoose'

export interface IComanda extends Document {
  clientId: mongoose.Types.ObjectId
  professionalId: mongoose.Types.ObjectId
  status: 'em_atendimento' | 'finalizada' | 'cancelada'
  dataInicio: Date
  dataFim?: Date
  servicos: Array<{
    servicoId: mongoose.Types.ObjectId
    nome: string
    preco: number
    quantidade: number
  }>
  produtos: Array<{
    produtoId: mongoose.Types.ObjectId
    nome: string
    preco: number
    quantidade: number
    vendidoPor: mongoose.Types.ObjectId
  }>
  observacoes: string
  valorTotal: number
  createdAt: Date
  updatedAt: Date
}

const ComandaSchema: Schema = new Schema({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  professionalId: {
    type: Schema.Types.ObjectId,
    ref: 'Professional',
    required: true
  },
  status: {
    type: String,
    enum: ['em_atendimento', 'finalizada', 'cancelada'],
    default: 'em_atendimento'
  },
  dataInicio: {
    type: Date,
    default: Date.now
  },
  dataFim: {
    type: Date
  },
  servicos: [{
    servicoId: {
      type: Schema.Types.ObjectId,
      ref: 'Service'
    },
    nome: String,
    preco: Number,
    quantidade: Number
  }],
  produtos: [{
    produtoId: {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    },
    nome: String,
    preco: Number,
    quantidade: Number,
    vendidoPor: {
      type: Schema.Types.ObjectId,
      ref: 'Professional'
    }
  }],
  observacoes: {
    type: String,
    trim: true,
    default: ''
  },
  valorTotal: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
})

// Índices para melhor performance
ComandaSchema.index({ clientId: 1, status: 1 })
ComandaSchema.index({ professionalId: 1, status: 1 })
ComandaSchema.index({ dataInicio: -1 })

export default mongoose.models.Comanda || mongoose.model<IComanda>('Comanda', ComandaSchema)
