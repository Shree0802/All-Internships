import mongoose from 'mongoose';
import User from '../models/User.js';
import { AppError } from './errorHandler.js';
import { standaloneUsers } from '../controllers/auth.controller.js';

/**
 * Middleware to require authenticated user session
 */
export const requireAuth = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return next(new AppError('Authentication required. Please log in.', 401, 'UNAUTHORIZED'));
    }

    // Standalone resilient session lookup when database is not connected
    if (mongoose.connection.readyState !== 1) {
      let matched = null;
      if (standaloneUsers) {
        for (const u of standaloneUsers.values()) {
          if (u._id && u._id.toString() === req.session.userId.toString()) {
            matched = u;
            break;
          }
        }
      }
      if (!matched) {
        matched = {
          _id: req.session.userId,
          firstName: 'Student',
          lastName: 'Athlete',
          fullName: 'Student Athlete',
          email: 'student@dypulse.edu',
          role: req.session.role || 'customer',
          status: 'active',
          isActive: true,
          addresses: [],
          toJSON() { return this; }
        };
      }
      req.user = matched;
      return next();
    }

    const user = await User.findById(req.session.userId);
    if (!user || !user.isActive) {
      req.session.destroy(() => {});
      return next(new AppError('User account not found or deactivated', 401, 'UNAUTHORIZED'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to require admin privileges
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
  }

  if (req.user.role !== 'admin') {
    return next(new AppError('Access forbidden: Administrator privileges required', 403, 'FORBIDDEN'));
  }

  next();
};

/**
 * Optional authentication middleware - attaches user if session exists
 */
export const optionalAuth = async (req, res, next) => {
  try {
    if (req.session && req.session.userId) {
      if (mongoose.connection.readyState !== 1) {
        let matched = null;
        if (standaloneUsers) {
          for (const u of standaloneUsers.values()) {
            if (u._id && u._id.toString() === req.session.userId.toString()) {
              matched = u;
              break;
            }
          }
        }
        if (matched) {
          req.user = matched;
        }
        return next();
      }

      const user = await User.findById(req.session.userId);
      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Continue even if session lookup fails
    next();
  }
};
