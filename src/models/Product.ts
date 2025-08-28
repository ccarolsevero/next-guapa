import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  category: {
    type: String,
    trim: true,
    default: 'Geral'
  },
  imageUrl: {
    type: String
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  specifications: {
    type: Map,
    of: String
  },
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  brand: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
})

// Índices para melhor performance
productSchema.index({ isActive: 1, category: 1 })
productSchema.index({ isFeatured: 1, isActive: 1 })
productSchema.index({ name: 'text', description: 'text' })

// Método para calcular preço com desconto
productSchema.methods.getFinalPrice = function() {
  if (this.discount > 0) {
    return this.price * (1 - this.discount / 100)
  }
  return this.price
}

// Método para verificar se tem estoque
productSchema.methods.hasStock = function() {
  return this.stock > 0
}

export default mongoose.models.Product || mongoose.model('Product', productSchema)
