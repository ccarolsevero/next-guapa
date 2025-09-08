import mongoose, { Schema, Document } from 'mongoose'

export interface IAppointment extends Document {
  clientName: string
  clientPhone: string
  clientEmail?: string
  clientId?: string // ID do cliente se estiver logado
  service: string
  professional: string
  professionalId: string
  date: Date
  startTime: string
  endTime: string
  duration: number // em minutos
  status: 'SCHEDULED' | 'CONFIRMED' | 'PENDING' | 'IN_PROGRESS' | 'PAID' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  price: number
  signalValue?: number // Valor do sinal (30% do preço)
  signalPaid?: boolean // Se o sinal foi pago
  signalPaidAt?: Date // Data do pagamento do sinal
  notes?: string
  customLabels?: Array<{
    id: number
    name: string
    color: string
  }>
  createdAt: Date
  updatedAt: Date
}

const appointmentSchema = new Schema<IAppointment>({
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  clientPhone: {
    type: String,
    required: true,
    trim: true
  },
  clientEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  clientId: {
    type: String,
    trim: true,
    index: true,
    sparse: true
  },
  service: {
    type: String,
    required: true,
    trim: true
  },
  professional: {
    type: String,
    required: true,
    trim: true
  },
  professionalId: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 15,
    max: 480 // máximo 8 horas
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'CONFIRMED', 'PENDING', 'IN_PROGRESS', 'PAID', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    default: 'SCHEDULED'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  signalValue: {
    type: Number,
    min: 0
  },
  signalPaid: {
    type: Boolean,
    default: false
  },
  signalPaidAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  customLabels: [{
    id: {
      type: Number,
      required: false
    },
    name: {
      type: String,
      required: false,
      trim: true
    },
    color: {
      type: String,
      required: false,
      trim: true
    }
  }]
}, {
  timestamps: true
})

// Índices para melhor performance
appointmentSchema.index({ date: 1, startTime: 1 })
appointmentSchema.index({ professionalId: 1, date: 1 })
appointmentSchema.index({ status: 1 })
appointmentSchema.index({ clientPhone: 1 })
appointmentSchema.index({ clientId: 1 })

export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', appointmentSchema)
