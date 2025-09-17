import mongoose, { Document, Schema } from 'mongoose'

export interface IProfessional extends Document {
  name: string
  title: string
  email: string
  phone: string
  shortDescription: string
  fullDescription: string
  services: string[]
  featuredServices: string[]
  profileImage: string
  gallery: string[]
  isActive: boolean
  isFeatured: boolean
  // Novos campos para login e permissões
  username: string
  password: string
  role: 'admin' | 'professional'
  canAccessFinancial: boolean
  canAccessSiteEdit: boolean
  canAccessGoals: boolean
  canAccessReports: boolean
  isAssistant: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

const professionalSchema = new Schema<IProfessional>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    trim: true,
    default: 'Cabeleireira'
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  shortDescription: {
    type: String,
    trim: true,
    default: 'Especialista em tratamentos capilares'
  },
  fullDescription: {
    type: String,
    trim: true,
    default: 'Profissional experiente e dedicada aos cuidados capilares'
  },
  services: [{
    type: String,
    trim: true
  }],
  featuredServices: [{
    type: String,
    trim: true
  }],
  profileImage: {
    type: String,
    default: '/assents/fotobruna.jpeg'
  },
  gallery: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  // Novos campos para login e permissões
  username: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'professional'],
    default: 'professional'
  },
  canAccessFinancial: {
    type: Boolean,
    default: false
  },
  canAccessSiteEdit: {
    type: Boolean,
    default: false
  },
  canAccessGoals: {
    type: Boolean,
    default: false
  },
  canAccessReports: {
    type: Boolean,
    default: false
  },
  isAssistant: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
})

export default mongoose.models.Professional || mongoose.model<IProfessional>('Professional', professionalSchema)
