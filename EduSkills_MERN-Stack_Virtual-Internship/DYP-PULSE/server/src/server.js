import app from './app.js';
import config, { validateConfig } from './config/index.js';
import { connectDB } from './config/db.js';

const startServer = async () => {
  try {
    // Validate configuration
    validateConfig();

    // Connect to MongoDB (resilient)
    const db = await connectDB();
    if (db) {
      console.log('[DYPULSE] Database connected successfully to remote cluster');
    } else {
      console.log('[DYPULSE] Running in Resilient Standalone Mode (in-memory catalog active)');
    }

    // Start Express server
    const server = app.listen(config.port, () => {
      console.log(`[DYPULSE] Server running in ${config.env} mode on port ${config.port}`);
      console.log(`[DYPULSE] API: http://localhost:${config.port}/api/v1/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n[DYPULSE] ${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('[DYPULSE] HTTP server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('[DYPULSE] Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('[DYPULSE] Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('[DYPULSE] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[DYPULSE] Uncaught Exception:', error);
  process.exit(1);
});

startServer();
