import mongoose from 'mongoose'

// Extend global type
declare global {
  var mongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  } | undefined
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
  }
  
  if (cached.conn) {
    return cached.conn
  }

  // Lazy init - só acessa env quando realmente precisa conectar
  const MONGODB_URI = process.env.MONGODB_URI
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI não está definida no ambiente.')
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts) as any
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB

export async function connectToDatabase() {
  const conn = await connectDB()
  if (!conn) {
    throw new Error('Failed to connect to database')
  }
  return { db: (conn as any).connection.db }
}
