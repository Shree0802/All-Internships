const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Import Error Middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Enable CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Serve static assets from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../client')));

// API Endpoint Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'ShopSphere API Server',
    timestamp: new Date().toISOString(),
  });
});

// HTML Page Route Helpers for clean URLs
const pages = [
  'products',
  'product-details',
  'cart',
  'checkout',
  'login',
  'register',
  'profile',
  'order-success',
  'order-history',
  'about',
  'contact',
  '404',
];

pages.forEach((page) => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, `../client/pages/${page}.html`));
  });
});

// Fallback for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// 404 & Error Handler Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server AFTER database connection & seeding finish
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 ShopSphere Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`📍 Web Application URL: http://localhost:${PORT}`);
      console.log(`🔌 API Base Endpoint:   http://localhost:${PORT}/api`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start ShopSphere server:', err.message);
  }
};

startServer();
