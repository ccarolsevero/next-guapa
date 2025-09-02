import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
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
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  productCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Índices para melhor performance
categorySchema.index({ isActive: 1, order: 1 })
categorySchema.index({ name: 1 })

export default mongoose.models.Category || mongoose.model('Category', categorySchema)
