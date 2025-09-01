import mongoose from 'mongoose'

const professionalSchema = new mongoose.Schema({
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
  }
}, {
  timestamps: true
})

export default mongoose.models.Professional || mongoose.model('Professional', professionalSchema)
