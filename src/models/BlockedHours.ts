import mongoose from 'mongoose';

const BlockedHoursSchema = new mongoose.Schema({
  professionalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    required: true
  },
  type: {
    type: String,
    enum: ['weekly', 'date_range', 'lunch_break', 'vacation', 'custom'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  // Para bloqueios semanais (ex: toda segunda-feira)
  dayOfWeek: {
    type: Number, // 0 = domingo, 1 = segunda, etc.
    min: 0,
    max: 6
  },
  startTime: {
    type: String, // formato "HH:MM"
    required: true
  },
  endTime: {
    type: String, // formato "HH:MM"
    required: true
  },
  // Para bloqueios por período específico
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  // Para bloqueios recorrentes
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'weekly'
  },
  // Status do bloqueio
  isActive: {
    type: Boolean,
    default: true
  },
  // Metadados
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Índices para performance
BlockedHoursSchema.index({ professionalId: 1, isActive: 1 });
BlockedHoursSchema.index({ startDate: 1, endDate: 1 });
BlockedHoursSchema.index({ dayOfWeek: 1, startTime: 1, endTime: 1 });

// Middleware para atualizar updatedAt
BlockedHoursSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.BlockedHours || mongoose.model('BlockedHours', BlockedHoursSchema);
