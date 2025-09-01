import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  imageUrl: String,
  discount: Number,
  originalPrice: Number
})

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerInfo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: String,
    notes: String
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'pix', 'card'],
    default: 'cash'
  },
  pickupDate: Date,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Middleware para atualizar updatedAt
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Gerar número do pedido automaticamente
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    try {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      
      // Contar pedidos do dia
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      
      const count = await mongoose.model('Order').countDocuments({
        createdAt: { $gte: startOfDay, $lt: endOfDay }
      })
      
      this.orderNumber = `PED${year}${month}${day}${String(count + 1).padStart(3, '0')}`
      console.log('Número do pedido gerado:', this.orderNumber)
    } catch (error) {
      console.error('Erro ao gerar número do pedido:', error)
      // Fallback: usar timestamp
      this.orderNumber = `PED${Date.now()}`
    }
  }
  next()
})

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)

export default Order
