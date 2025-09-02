import mongoose from 'mongoose'

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  validityDays: {
    type: Number,
    required: true,
    min: 1,
    default: 30
  },
  services: [{
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    name: String,
    price: Number
  }],
  description: {
    type: String,
    required: true,
    trim: true
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discountedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  commission: {
    type: String,
    enum: ['comissao-valor-integral', 'comissao-valor-desconto', 'sem-comissao'],
    default: 'sem-comissao'
  },
  availableOnline: {
    type: Boolean,
    default: true
  },
  availableInSystem: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

packageSchema.index({ isActive: 1 })
packageSchema.index({ name: 1 })

export default mongoose.models.Package || mongoose.model('Package', packageSchema)
