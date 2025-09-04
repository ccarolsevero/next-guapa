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
  }
}, {
  timestamps: true
})

export default mongoose.models.Client || mongoose.model('Client', clientSchema)
