import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import {
  apply,
  getStatus,
  approve,
  reject,
} from '../controllers/partners.js';

const router = express.Router();

// POST /api/v1/partners/apply
router.post('/apply', asyncHandler(apply));

// GET /api/v1/partners/apply/:id
router.get('/apply/:id', asyncHandler(getStatus));

// POST /api/v1/partners/:id/approve
router.post(
  '/:id/approve',
  authMiddleware,
  roleMiddleware('admin'),
  asyncHandler(approve),
);

// POST /api/v1/partners/:id/reject
router.post(
  '/:id/reject',
  authMiddleware,
  roleMiddleware('admin'),
  asyncHandler(reject),
);

export default router;
