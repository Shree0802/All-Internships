import mongoose from 'mongoose';
import config from './index.js';

/**
 * Validate whether the MongoDB URI is well-formed
 */
export const isValidMongoUri = (uri) => {
  if (!uri || typeof uri !== 'string') return false;
  const isSchemeValid = uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');
  const isPlaceholder =
    uri.includes('your_mongodb_atlas_connection_string') ||
    uri.includes('<cluster>') ||
    uri.includes('<username>') ||
    uri.includes('<password>');
  return isSchemeValid && !isPlaceholder;
};

/**
 * Connect to MongoDB using Mongoose with Atlas connection pooling and resiliency options.
 * If remote database is unavailable or URI is unconfigured, enters resilient in-memory mode without crashing.
 * @returns {Promise<typeof mongoose | null>}
 */
export const connectDB = async () => {
  const uri = config.mongoUri || '';

  if (!isValidMongoUri(uri)) {
    console.warn('[MongoDB] No valid cloud MongoDB URI configured. Running in Resilient Standalone Mode.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: config.env !== 'production',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error event:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Connection lost. Attempting reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[MongoDB] Connection re-established successfully');
    });

    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Warning: Could not connect to remote MongoDB: ${error.message}`);
    console.warn('[MongoDB] Entering Resilient Standalone Mode. All endpoints will remain online.');
    return null;
  }
};

export default connectDB;
