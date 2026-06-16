import { verifyToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.js';
import { ERROR_CODES } from '../config/constants.js';
import pool from '../config/database.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.access_token;

    if (!token) {
      return errorResponse(res, ERROR_CODES.UNAUTHORIZED, 'Missing authorization token', {}, 401);
    }

    const decoded = verifyToken(token);

    // Verify session still exists in DB (single-session enforcement)
    const sessionResult = await pool.query(
      'SELECT id FROM sessions WHERE token = $1 AND user_id = $2',
      [token, decoded.id],
    );

    if (sessionResult.rows.length === 0) {
      return errorResponse(res, ERROR_CODES.UNAUTHORIZED, 'Session expired. You may have logged in from another device.', {}, 401);
    }

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
