import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import {
  getFeatured,
  getAll,
  search,
  getById,
  getMySalon,
  create,
  update,
  remove,
} from '../controllers/salons.js';

const router = express.Router();

// GET /api/v1/salons/my (must be before /:id to avoid conflict)
router.get(
  '/my',
  authMiddleware,
  roleMiddleware('salonOwner', 'admin'),
  asyncHandler(getMySalon),
);

// GET /api/v1/salons/featured
router.get('/featured', asyncHandler(getFeatured));

// GET /api/v1/salons/search
router.get('/search', asyncHandler(search));

// GET /api/v1/salons
router.get('/', asyncHandler(getAll));

// GET /api/v1/salons/:id
router.get('/:id', asyncHandler(getById));

// POST /api/v1/salons
router.post(
  '/',
  authMiddleware,
  roleMiddleware('salonOwner', 'admin'),
  asyncHandler(create),
);

// PUT /api/v1/salons/:id
router.put('/:id', authMiddleware, asyncHandler(update));

// DELETE /api/v1/salons/:id
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  asyncHandler(remove),
);

export default router;
