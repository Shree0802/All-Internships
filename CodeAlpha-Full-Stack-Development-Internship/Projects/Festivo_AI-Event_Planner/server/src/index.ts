import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { initDatabase, getStorageStatus } from './services/dataService.js';
import { aiService } from './services/aiService.js';
import eventRoutes from './routes/eventRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. Security & Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible rendering in dev/staging
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      // In dev or production, permit CLIENT_URL and localhost
      if (
        origin === CLIENT_URL ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for competition review demos
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Rate Limiting (Section 20 Security requirement)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // limit AI generation calls to 30 per 5 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'AI generation rate limit reached. Please wait a few moments before requesting more plans.' },
});

app.use('/api/', generalLimiter);
app.use('/api/events/:id/generate-plan', aiLimiter);
app.use('/api/events/:id/ai-chat', aiLimiter);

// 2. Health & Status Route
app.get('/api/health', (_req: Request, res: Response) => {
  const storageStatus = getStorageStatus();
  res.json({
    status: 'healthy',
    application: 'Festivo AI: Your Intelligent Celebration Planner',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: storageStatus,
    aiProvider: {
      provider: 'Google Gemini',
      model: aiService.getModelName(),
      isConfigured: aiService.isConfigured(),
      mode: aiService.isConfigured() ? 'live_api' : 'intelligent_simulator',
    },
  });
});

// 3. API Routes
app.use('/api/events', eventRoutes);
app.use('/api/events', aiRoutes);

// 4. Serve Client in Production (if built)
const possibleClientPaths = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
];

const clientDistPath = possibleClientPaths.find((p) => fs.existsSync(p));

if (clientDistPath) {
  console.log(`Serving static production client from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  app.get('*', (req: Request, res: Response) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    }
  });
} else {
  // Root health probe fallback for API-only cloud deployments
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      status: 'online',
      application: 'Festivo AI Backend API',
      health: '/api/health',
      docs: 'https://github.com/Shree0802/Festivo_AI-Event_Planner',
    });
  });
}

// 5. Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred',
  });
});

// 6. Start Server
async function startServer() {
  await initDatabase();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(` Festivo AI Server running on port ${port} (0.0.0.0)`);
    console.log(` Health check: http://0.0.0.0:${port}/api/health`);
    console.log(` Storage Mode: ${getStorageStatus().label}`);
    console.log(` AI Provider: ${aiService.isConfigured() ? 'Live Gemini API' : 'Intelligent Demo Simulator'}`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Festivo AI server:', err);
  process.exit(1);
});

export default app;
