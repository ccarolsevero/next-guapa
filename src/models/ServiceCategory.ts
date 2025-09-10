import mongoose, { Schema, Document } from 'mongoose'

export interface IServiceCategory extends Document {
  name: string
  description?: string
  color?: string
  icon?: string
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

const serviceCategorySchema = new Schema<IServiceCategory>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true,
    default: '#D15556'
  },
  icon: {
    type: String,
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

// Índices para melhor performance (name já tem unique: true)
serviceCategorySchema.index({ isActive: 1 })
serviceCategorySchema.index({ order: 1 })

export default mongoose.models.ServiceCategory || mongoose.model<IServiceCategory>('ServiceCategory', serviceCategorySchema)
