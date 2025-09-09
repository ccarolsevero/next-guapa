// Security configuration
export const securityConfig = {
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  
  // CORS
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'https://next-guapa.vercel.app',
    'https://espacoguapa.com',
    'https://www.espacoguapa.com'
  ],
  
  // File upload
  fileUpload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png', 
      'image/webp'
    ]
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expiresIn: '24h'
  },
  
  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },
  
  // Session
  session: {
    secret: process.env.SESSION_SECRET || 'fallback-session-secret',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}

// Validate environment variables
export function validateEnvironment() {
  const required = ['MONGODB_URI']
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
  
  // Warn about insecure defaults
  if (process.env.JWT_SECRET === 'fallback-secret-key') {
    console.warn('⚠️  Using default JWT secret. Set JWT_SECRET in production!')
  }
  
  if (process.env.SESSION_SECRET === 'fallback-session-secret') {
    console.warn('⚠️  Using default session secret. Set SESSION_SECRET in production!')
  }
}
