import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 15,
    max: 480, // máximo 8 horas
    default: 60
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  commissions: [{
    professionalId: {
      type: String,
      required: true
    },
    professionalName: {
      type: String,
      required: true
    },
    commission: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    assistantCommission: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }]
}, {
  timestamps: true,
  collection: 'services'
})

const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema)

export default Service
