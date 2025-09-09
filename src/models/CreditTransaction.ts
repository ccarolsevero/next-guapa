import mongoose, { Document, Schema } from 'mongoose'

export interface ICreditTransaction extends Document {
  clientId: mongoose.Types.ObjectId
  appointmentId?: mongoose.Types.ObjectId
  type: 'credit' | 'debit' | 'refund'
  amount: number
  description: string
  status: 'pending' | 'completed' | 'cancelled'
  paymentMethod?: string
  transactionId?: string
  createdAt: Date
  updatedAt: Date
}

const CreditTransactionSchema: Schema = new Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: false
  },
  type: {
    type: String,
    enum: ['credit', 'debit', 'refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    trim: true
  },
  transactionId: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

// Índices para melhor performance
CreditTransactionSchema.index({ clientId: 1, createdAt: -1 })
CreditTransactionSchema.index({ appointmentId: 1 })
CreditTransactionSchema.index({ status: 1 })

export default mongoose.models.CreditTransaction || mongoose.model<ICreditTransaction>('CreditTransaction', CreditTransactionSchema)
