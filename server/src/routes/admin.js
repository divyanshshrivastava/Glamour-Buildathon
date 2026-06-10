import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import {
  getDashboardStats,
  getApplications,
  verifySalon,
  deleteSalon,
} from '../controllers/admin.js';

const router = express.Router();

// GET /api/v1/admin/dashboard/stats
router.get(
  '/dashboard/stats',
  authMiddleware,
  roleMiddleware('admin'),
  asyncHandler(getDashboardStats),
);

// GET /api/v1/admin/applications
router.get(
  '/applications',
  authMiddleware,
  roleMiddleware('admin'),
  asyncHandler(getApplications),
);

// PUT /api/v1/admin/salons/:id/verify
router.put(
  '/salons/:id/verify',
  authMiddleware,
  roleMiddleware('admin'),
  asyncHandler(verifySalon),
);

// DELETE /api/v1/admin/salons/:id
router.delete(
  '/salons/:id',
  authMiddleware,
  roleMiddleware('admin'),
  asyncHandler(deleteSalon),
);

export default router;
