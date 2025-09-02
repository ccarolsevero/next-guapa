import mongoose, { Schema, Document } from 'mongoose'

export interface IProntuario extends Document {
  clientId: mongoose.Types.ObjectId
  comandaId: mongoose.Types.ObjectId
  professionalId: mongoose.Types.ObjectId
  dataAtendimento: Date
  historicoProcedimentos: string
  reacoesEfeitos: string
  recomendacoes: string
  proximaSessao?: Date
  observacoesAdicionais: string
  servicosRealizados: Array<{
    servicoId: mongoose.Types.ObjectId
    nome: string
    preco: number
    quantidade: number
  }>
  produtosVendidos: Array<{
    produtoId: mongoose.Types.ObjectId
    nome: string
    preco: number
    quantidade: number
    vendidoPor: mongoose.Types.ObjectId
  }>
  valorTotal: number
  createdAt: Date
  updatedAt: Date
}

const ProntuarioSchema: Schema = new Schema({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  comandaId: {
    type: Schema.Types.ObjectId,
    ref: 'Comanda',
    required: true
  },
  professionalId: {
    type: Schema.Types.ObjectId,
    ref: 'Professional',
    required: true
  },
  dataAtendimento: {
    type: Date,
    default: Date.now
  },
  historicoProcedimentos: {
    type: String,
    required: true,
    trim: true
  },
  reacoesEfeitos: {
    type: String,
    trim: true,
    default: ''
  },
  recomendacoes: {
    type: String,
    trim: true,
    default: ''
  },
  proximaSessao: {
    type: Date
  },
  observacoesAdicionais: {
    type: String,
    trim: true,
    default: ''
  },
  servicosRealizados: [{
    servicoId: {
      type: Schema.Types.ObjectId,
      ref: 'Service'
    },
    nome: String,
    preco: Number,
    quantidade: Number
  }],
  produtosVendidos: [{
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
  valorTotal: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
})

// Índices para melhor performance
ProntuarioSchema.index({ clientId: 1, dataAtendimento: -1 })
ProntuarioSchema.index({ comandaId: 1 })
ProntuarioSchema.index({ professionalId: 1 })

export default mongoose.models.Prontuario || mongoose.model<IProntuario>('Prontuario', ProntuarioSchema)
