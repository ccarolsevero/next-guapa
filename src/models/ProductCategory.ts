import mongoose, { Schema, Document } from 'mongoose'

export interface IProductCategory extends Document {
  name: string
  description?: string
  color?: string
  icon?: string
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

const productCategorySchema = new Schema<IProductCategory>({
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
    default: '#006D5B'
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

// Índices para melhor performance
productCategorySchema.index({ name: 1 })
productCategorySchema.index({ isActive: 1 })
productCategorySchema.index({ order: 1 })

export default mongoose.models.ProductCategory || mongoose.model<IProductCategory>('ProductCategory', productCategorySchema)
