import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  authMiddleware,
  roleMiddleware,
  optionalAuthMiddleware,
} from '../middleware/auth.js';
import {
  getSlots,
  getUserBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  confirmBooking,
  completeBooking,
  getSalonBookings,
} from '../controllers/bookings.js';

const router = express.Router();

// GET /api/v1/bookings/slots
router.get('/slots', asyncHandler(getSlots));

// GET /api/v1/bookings/salon/:salonId (must be before /:id to avoid conflict)
router.get(
  '/salon/:salonId',
  authMiddleware,
  roleMiddleware('salonOwner', 'admin'),
  asyncHandler(getSalonBookings),
);

// GET /api/v1/bookings
router.get('/', authMiddleware, asyncHandler(getUserBookings));

// GET /api/v1/bookings/:id
router.get('/:id', authMiddleware, asyncHandler(getBookingById));

// POST /api/v1/bookings
router.post('/', optionalAuthMiddleware, asyncHandler(createBooking));

// PUT /api/v1/bookings/:id/cancel
router.put('/:id/cancel', authMiddleware, asyncHandler(cancelBooking));

// PUT /api/v1/bookings/:id/confirm
router.put(
  '/:id/confirm',
  authMiddleware,
  roleMiddleware('salonOwner', 'admin'),
  asyncHandler(confirmBooking),
);

// PUT /api/v1/bookings/:id/complete
router.put(
  '/:id/complete',
  authMiddleware,
  roleMiddleware('salonOwner', 'admin'),
  asyncHandler(completeBooking),
);

export default router;
