/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found Middleware
 */
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route not found: ${req.method} ${req.originalUrl}`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

/**
 * Centralized Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let details = err.details || null;

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
  }

  // Handle Mongoose Cast Error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'CAST_ERROR';
    message = `Invalid ${err.path}: ${err.value}`;
    details = [
      {
        field: err.path,
        message: `Resource not found with specified identifier`
      }
    ];
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY_ERROR';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const val = err.keyValue ? err.keyValue[field] : '';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${val}' already exists`;
    details = err.keyValue;
  }

  // Handle Zod Error
  if (err.name === 'ZodError' || Array.isArray(err.issues)) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = (err.issues || err.errors || []).map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message
    }));
  }

  // Log 500s for backend debugging
  if (statusCode >= 500) {
    console.error(`[ERROR] ${err.name || 'Error'}: ${err.message}`, err.stack);
  }

  res.status(statusCode).json({
    success: false,
    code,
    message,
    error: {
      message,
      code,
      ...(details ? { details } : {})
    }
  });
};

export default errorHandler;
