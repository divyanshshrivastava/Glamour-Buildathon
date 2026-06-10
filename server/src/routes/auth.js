import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authMiddleware } from '../middleware/auth.js';
import {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getMe,
} from '../controllers/auth.js';

const router = express.Router();

// POST /api/v1/auth/register
router.post('/register', asyncHandler(register));

// POST /api/v1/auth/login
router.post('/login', asyncHandler(login));

// POST /api/v1/auth/logout
router.post('/logout', authMiddleware, asyncHandler(logout));

// POST /api/v1/auth/refresh
router.post('/refresh', asyncHandler(refresh));

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', asyncHandler(forgotPassword));

// POST /api/v1/auth/reset-password
router.post('/reset-password', asyncHandler(resetPassword));

// POST /api/v1/auth/verify-email
router.post('/verify-email', asyncHandler(verifyEmail));

// GET /api/v1/auth/me
router.get('/me', authMiddleware, asyncHandler(getMe));

export default router;
