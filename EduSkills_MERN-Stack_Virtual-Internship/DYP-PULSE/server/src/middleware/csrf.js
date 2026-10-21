import crypto from 'crypto';
import { AppError } from './errorHandler.js';

/**
 * Generate a cryptographically secure CSRF token
 * @returns {string}
 */
export const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Middleware to ensure CSRF token is attached to session and response
 */
export const csrfTokenMiddleware = (req, res, next) => {
  if (req.session) {
    if (!req.session.csrfToken) {
      req.session.csrfToken = generateCsrfToken();
    }
    res.locals.csrfToken = req.session.csrfToken;
  }
  next();
};

/**
 * Middleware to verify CSRF token on mutating requests (POST, PUT, PATCH, DELETE)
 */
export const verifyCsrfToken = (req, res, next) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Allow bypass in test mode only when explicitly requested
  if (process.env.NODE_ENV === 'test' && req.headers['x-test-csrf-bypass'] === 'true') {
    return next();
  }

  const sessionToken = req.session ? req.session.csrfToken : null;
  const headerToken = req.headers['x-csrf-token'] || req.headers['csrf-token'];
  const bodyToken = req.body && req.body._csrf;
  const providedToken = headerToken || bodyToken;

  if (!sessionToken || !providedToken || sessionToken !== providedToken) {
    return next(new AppError('Invalid or missing CSRF token', 403, 'CSRF_TOKEN_INVALID'));
  }

  next();
};

export default {
  generateCsrfToken,
  csrfTokenMiddleware,
  verifyCsrfToken
};
