import mongoose from 'mongoose'

const homeGallerySchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

export default mongoose.models.HomeGallery || mongoose.model('HomeGallery', homeGallerySchema)
