import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authMiddleware } from '../middleware/auth.js';
import { updateProfile, changePassword } from '../controllers/users.js';

const router = express.Router();

// PUT /api/v1/users/profile
router.put('/profile', authMiddleware, asyncHandler(updateProfile));

// PUT /api/v1/users/password
router.put('/password', authMiddleware, asyncHandler(changePassword));

export default router;
