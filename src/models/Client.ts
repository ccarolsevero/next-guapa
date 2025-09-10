import mongoose from 'mongoose'

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  birthDate: {
    type: Date,
    default: null
  },
  address: {
    type: String,
    default: 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP'
  },
  password: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: null
  },
  profileComplete: {
    type: Boolean,
    default: false
  },
  onboardingRequired: {
    type: Boolean,
    default: true
  },
  firstAccess: {
    type: Boolean,
    default: true
  },
  profileCompletionDate: {
    type: Date,
    default: null
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  onboardingCompletedAt: {
    type: Date,
    default: null
  },
  isCompleteProfile: {
    type: Boolean,
    default: false
  },
  credits: {
    type: Number,
    default: 0,
    min: 0
  },
  creditHistory: [{
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['signal_payment', 'comanda_usage', 'manual_adjustment'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null
    },
    comandaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comanda',
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
})

export default mongoose.models.Client || mongoose.model('Client', clientSchema)
