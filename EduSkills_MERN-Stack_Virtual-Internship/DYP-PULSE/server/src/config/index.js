import dotenv from 'dotenv';
dotenv.config();

/**
 * Parse CORS origins from comma-separated string or single origin
 */
const parseCorsOrigins = (rawOrigin) => {
  const localDefaults = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175'
  ];
  if (!rawOrigin) return localDefaults;
  const parsed = rawOrigin.split(',').map((o) => o.trim()).filter(Boolean);
  return [...new Set([...parsed, ...localDefaults])];
};

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dypulse',
  session: {
    secret: process.env.SESSION_SECRET || 'dypulse-dev-session-secret-change-in-production-min-64-chars-long-random',
    name: 'dypulse.sid',
    maxAge: 7 * 24 * 60 * 60 * 1000
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    allowedOrigins: parseCorsOrigins(process.env.CORS_ORIGIN)
  },
  csrf: {
    secret: process.env.CSRF_SECRET || 'dypulse-dev-csrf-secret-change-in-production'
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || ''
  },
  email: {
    provider: process.env.EMAIL_PROVIDER || 'mock', // 'mock' | 'smtp' | 'ethereal'
    from: process.env.EMAIL_FROM || 'DYPULSE Campus Store <noreply@dypulse.edu>',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: parseInt(process.env.SMTP_PORT, 10) || 587,
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    smtpSecure: process.env.SMTP_SECURE === 'true',
    requireVerification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true'
  },
  clientUrl: process.env.CLIENT_URL || process.env.CORS_ORIGIN || 'http://localhost:5173',
  admin: {
    email: process.env.ADMIN_EMAIL || '',
    password: process.env.ADMIN_PASSWORD || ''
  }
};

/**
 * Validate configuration for production safety
 */
export const validateConfig = () => {
  const warnings = [];
  const errors = [];

  if (config.env === 'production') {
    if (
      !process.env.SESSION_SECRET ||
      process.env.SESSION_SECRET.includes('dypulse-dev-session-secret')
    ) {
      warnings.push('SESSION_SECRET is using a default fallback; set a custom 64-char string for optimal session security.');
    }

    const mongoUri = process.env.MONGODB_URI || '';
    if (
      !mongoUri ||
      mongoUri.includes('localhost') ||
      mongoUri.includes('your_mongodb_atlas_connection_string') ||
      mongoUri.includes('<cluster>') ||
      (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://'))
    ) {
      warnings.push(
        'MONGODB_URI is not set to a live MongoDB Atlas instance. Standalone in-memory catalog mode enabled.'
      );
    }

    if (!config.cloudinary.cloudName) {
      warnings.push('CLOUDINARY_CLOUD_NAME is not set; file uploads will use local disk storage.');
    }

    if (!config.razorpay.keyId) {
      warnings.push('RAZORPAY_KEY_ID is not set; checkout will operate in COD-only mode.');
    }
  }

  if (warnings.length > 0) {
    console.warn('[CONFIG WARNINGS]:');
    warnings.forEach((w) => console.warn(`  - ${w}`));
  }

  if (errors.length > 0) {
    console.error('[CONFIG ERRORS]:');
    errors.forEach((e) => console.error(`  - ${e}`));
    if (config.env === 'production') {
      throw new Error(`Production configuration validation failed:\n${errors.join('\n')}`);
    }
  }

  return { isValid: errors.length === 0, warnings, errors };
};

export default Object.freeze(config);
