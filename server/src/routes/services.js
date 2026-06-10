import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import {
  getCategories,
  getSalonServices,
  createService,
  updateService,
  deleteService,
} from '../controllers/services.js';

const router = express.Router();

// GET /api/v1/services/categories
router.get('/categories', asyncHandler(getCategories));

// GET /api/v1/services/salon/:salonId
router.get('/salon/:salonId', asyncHandler(getSalonServices));

// POST /api/v1/services/salon/:salonId
router.post(
  '/salon/:salonId',
  authMiddleware,
  roleMiddleware('salonOwner', 'admin'),
  asyncHandler(createService),
);

// PUT /api/v1/services/:id
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('salonOwner', 'admin'),
  asyncHandler(updateService),
);

// DELETE /api/v1/services/:id
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('salonOwner', 'admin'),
  asyncHandler(deleteService),
);

export default router;
