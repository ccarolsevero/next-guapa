import mongoose, { Schema, Document } from 'mongoose'

export interface IPromotion extends Document {
  title: string
  description: string
  imageUrl: string
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

const promotionSchema = new Schema<IPromotion>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Índices para melhor performance
promotionSchema.index({ isActive: 1, order: 1 })
promotionSchema.index({ createdAt: -1 })

export default mongoose.models.Promotion || mongoose.model<IPromotion>('Promotion', promotionSchema)
