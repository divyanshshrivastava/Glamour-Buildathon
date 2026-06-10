import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  authMiddleware,
  roleMiddleware,
  optionalAuthMiddleware,
} from '../middleware/auth.js';
import {
  getTestimonials,
  getSalonReviews,
  createReview,
  markHelpful,
  deleteReview,
} from '../controllers/reviews.js';

const router = express.Router();

// GET /api/v1/reviews
router.get('/', asyncHandler(getTestimonials));

// GET /api/v1/reviews/salon/:salonId
router.get('/salon/:salonId', asyncHandler(getSalonReviews));

// POST /api/v1/reviews
router.post('/', optionalAuthMiddleware, asyncHandler(createReview));

// PUT /api/v1/reviews/:id/helpful
router.put('/:id/helpful', asyncHandler(markHelpful));

// DELETE /api/v1/reviews/:id
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('salonOwner', 'admin'),
  asyncHandler(deleteReview),
);

export default router;
