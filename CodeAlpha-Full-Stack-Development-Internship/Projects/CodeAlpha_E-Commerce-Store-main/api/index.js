const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('../server/config/db');

// Import Route Handlers
const authRoutes = require('../server/routes/authRoutes');
const productRoutes = require('../server/routes/productRoutes');
const cartRoutes = require('../server/routes/cartRoutes');
const orderRoutes = require('../server/routes/orderRoutes');

// Import Error Middleware
const { notFound, errorHandler } = require('../server/middleware/errorMiddleware');

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Serve Static Files from client
app.use(express.static(path.join(__dirname, '../client')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'ShopSphere API Server',
    timestamp: new Date().toISOString(),
  });
});

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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.use(notFound);
app.use(errorHandler);

let isDbConnected = false;

module.exports = async (req, res) => {
  if (!isDbConnected) {
    await connectDB();
    isDbConnected = true;
  }
  return app(req, res);
};
