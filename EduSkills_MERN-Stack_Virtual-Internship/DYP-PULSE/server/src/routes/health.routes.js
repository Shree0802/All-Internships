import mongoose from 'mongoose';
import { Router } from 'express';
import config from '../config/index.js';

const router = Router();

/**
 * Health check endpoint
 * GET /api/v1/health or GET /api/health
 */
router.get('/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      database: isDbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: config.env,
      version: '1.0.0'
    }
  });
});

export default router;
