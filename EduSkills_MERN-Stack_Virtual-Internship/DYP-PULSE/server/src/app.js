import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import config from './config/index.js';
import { isValidMongoUri } from './config/db.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { csrfTokenMiddleware } from './middleware/csrf.js';

import path from 'path';

// Route imports
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import teamKitRoutes from './routes/teamKit.routes.js';
import reviewRoutes from './routes/review.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';

const app = express();

// Trust proxy for rate-limiting and secure cookies behind reverse proxy
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS with multi-origin support for local development, production domains, and Vercel previews
app.use(cors({
  origin: (origin, callback) => {
    // Reflect origin to allow credentials for any calling client (localhost, vercel, custom domains)
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token',
    'csrf-token',
    'X-Requested-With',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ]
}));

// Logging
if (config.env !== 'test') {
  app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
}

// Body parsing with rawBody capture for webhook signature verification
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration with resilient store (MongoStore when connected, MemoryStore fallback)
const createSessionStore = () => {
  if (isValidMongoUri(config.mongoUri)) {
    try {
      return MongoStore.create({
        mongoUrl: config.mongoUri,
        collectionName: 'sessions',
        ttl: config.session.maxAge / 1000,
        autoRemove: 'native'
      });
    } catch (err) {
      console.warn('[Session] MongoStore setup failed, using memory store:', err.message);
    }
  }
  return new session.MemoryStore();
};

app.use(session({
  name: config.session.name,
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  store: createSessionStore(),
  cookie: {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: config.env === 'production' ? 'none' : 'lax',
    maxAge: config.session.maxAge,
    path: '/'
  }
}));

// CSRF token generation & attachment to session
app.use(csrfTokenMiddleware);

// Static file serving for uploads (local disk fallback) and API documentation
app.use('/uploads', express.static(path.resolve('public', 'uploads')));
app.use('/docs', express.static(path.resolve('docs')));

// API Routes - versioned under /api/v1
app.use('/api/v1', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/team-kits', teamKitRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/inventory', inventoryRoutes);

// Backward-compatible unversioned routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/team-kits', teamKitRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/inventory', inventoryRoutes);

// 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
