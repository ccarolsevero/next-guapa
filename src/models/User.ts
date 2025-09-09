import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  name: string
  username: string
  password: string
  role: 'admin' | 'professional'
  canAccessFinancial: boolean
  canAccessSiteEdit: boolean
  canAccessGoals: boolean
  canAccessReports: boolean
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
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
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
})

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema)
