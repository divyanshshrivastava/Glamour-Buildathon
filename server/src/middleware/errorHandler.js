import { errorResponse } from '../utils/response.js';
import { ERROR_CODES } from '../config/constants.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Validation errors
  if (err.name === 'ValidationError') {
    return errorResponse(
      res,
      ERROR_CODES.VALIDATION_ERROR,
      'Validation failed',
      { errors: err.details },
      422,
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(
      res,
      ERROR_CODES.UNAUTHORIZED,
      'Invalid token',
      {},
      401,
    );
  }

  // Database errors
  if (err.code === '23505') {
    // Unique constraint violation
    return errorResponse(
      res,
      ERROR_CODES.VALIDATION_ERROR,
      'This resource already exists',
      {},
      409,
    );
  }

  // Default error
  return errorResponse(
    res,
    ERROR_CODES.INTERNAL_ERROR,
    process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error',
    {},
    500,
  );
};

export const notFoundHandler = (req, res) => {
  return errorResponse(
    res,
    ERROR_CODES.NOT_FOUND,
    'Route not found',
    { path: req.path },
    404,
  );
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
