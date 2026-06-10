import { verifyToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.js';
import { ERROR_CODES } from '../config/constants.js';

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.access_token;
    console.log('Auth Middleware - Token:', token);

    if (!token) {
      return errorResponse(res, ERROR_CODES.UNAUTHORIZED, 'Missing authorization token', {}, 401);
    }
    console.log('Auth Middleware - Verifying Token...');
    const decoded = verifyToken(token);
    console.log('Auth Middleware - Decoded Token:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, ERROR_CODES.UNAUTHORIZED, 'Invalid or expired token', {}, 401);
  }
};

export const optionalAuthMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.access_token;

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }
    next();
  } catch (error) {
    // Token is optional, so we just continue
    next();
  }
};

export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, ERROR_CODES.UNAUTHORIZED, 'User not authenticated', {}, 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, ERROR_CODES.FORBIDDEN, 'Insufficient permissions', {}, 403);
    }

    next();
  };
};

export const ownershipMiddleware = (resourceOwnerField = 'salonOwnerId') => {
  return (req, res, next) => {
    // Check if the user owns the resource
    // This is typically checked in the controller based on the resource
    next();
  };
};
