import { ReviewModel } from '../models/Review.js';
import { SalonModel } from '../models/Salon.js';
import { BookingModel } from '../models/Booking.js';
import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from '../services/cache.js';
import { CACHE_TTL, ERROR_CODES } from '../config/constants.js';
import {
  successResponse,
  createdResponse,
  errorResponse,
  getPaginationParams,
  buildPaginationMeta,
} from '../utils/response.js';
import { validateUUID } from '../utils/validation.js';

// ── Helper: Generate initials from name ───────────────────────────────

const generateInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ── GET /api/v1/reviews (Testimonials) ────────────────────────────────

export const getTestimonials = async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;
  const minRating = parseInt(req.query.minRating) || 4;

  const cacheKey = `reviews:testimonials:${limit}:${minRating}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const reviews = await ReviewModel.getTestimonials(limit, minRating);

  const formatted = reviews.map((r) => ({
    id: r.id,
    authorName: r.author_name,
    authorInitials: r.author_initials,
    rating: r.rating,
    text: r.text,
    title: r.title,
    salonName: r.salon_name,
    date: r.created_at,
    helpful: r.helpful,
    verified: r.verified,
  }));

  const response = { status: 'success', data: formatted, count: formatted.length };
  await cacheSet(cacheKey, response, CACHE_TTL.REVIEWS_TESTIMONIALS);

  return res.status(200).json(response);
};

// ── GET /api/v1/reviews/salon/:salonId ────────────────────────────────

export const getSalonReviews = async (req, res) => {
  const { salonId } = req.params;
  const { page, limit, offset } = getPaginationParams(req.query);
  const sort = req.query.sort || 'recent';

  if (!validateUUID(salonId)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid salon ID format', {}, 400);
  }

  // Check salon exists
  const salon = await SalonModel.findById(salonId);
  if (!salon) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Salon not found', {}, 404);
  }

  const reviews = await ReviewModel.findBySalonId(salonId, { sort });
  const aggregate = await ReviewModel.getRatingAggregate(salonId);

  const total = reviews.length;
  const paginated = reviews.slice(offset, offset + limit);

  const formatted = paginated.map((r) => ({
    id: r.id,
    authorName: r.author_name,
    authorInitials: r.author_initials,
    rating: r.rating,
    title: r.title,
    text: r.text,
    date: r.created_at,
    helpful: r.helpful,
    verified: r.verified,
  }));

  const pagination = buildPaginationMeta(page, limit, total);

  return res.status(200).json({
    status: 'success',
    data: formatted,
    pagination,
    aggregate,
  });
};

// ── POST /api/v1/reviews ──────────────────────────────────────────────

export const createReview = async (req, res) => {
  const { salonId, rating, title, text, authorName, bookingId } = req.body;

  // Validate required fields
  if (!salonId || !rating || !text || !authorName) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'salonId, rating, text, and authorName are required', {}, 422);
  }

  if (!validateUUID(salonId)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid salon ID format', {}, 400);
  }

  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Rating must be an integer between 1 and 5', { field: 'rating' }, 422);
  }

  if (text.length < 10 || text.length > 2000) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Review text must be between 10 and 2000 characters', { field: 'text' }, 422);
  }

  if (authorName.length < 2 || authorName.length > 100) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Author name must be between 2 and 100 characters', { field: 'authorName' }, 422);
  }

  // Check salon exists
  const salon = await SalonModel.findById(salonId);
  if (!salon) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Salon not found', {}, 404);
  }

  // Check for duplicate review by booking
  if (bookingId) {
    if (!validateUUID(bookingId)) {
      return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid booking ID format', {}, 400);
    }

    const isDuplicate = await ReviewModel.checkDuplicateByBooking(bookingId);
    if (isDuplicate) {
      return errorResponse(res, ERROR_CODES.DUPLICATE_REVIEW, 'A review already exists for this booking', {}, 409);
    }
  }

  const authorInitials = generateInitials(authorName);

  const review = await ReviewModel.create({
    salonId,
    customerId: req.user?.id || null,
    bookingId: bookingId || null,
    rating,
    title: title || null,
    text,
    authorName,
    authorInitials,
  });

  // Update salon rating aggregate
  const aggregate = await ReviewModel.getRatingAggregate(salonId);
  if (aggregate.averageRating > 0) {
    await SalonModel.updateRating(salonId, aggregate.averageRating);
  }

  // Invalidate caches
  await cacheDelPattern('reviews:testimonials:*');
  await cacheDel(`salons:detail:${salonId}`);
  await cacheDelPattern('salons:list:*');
  await cacheDelPattern('salons:featured:*');
  await cacheDel(`ai:review-insights:${salonId}`);

  return createdResponse(res, {
    id: review.id,
    salonId: review.salon_id,
    rating: review.rating,
    title: review.title,
    text: review.text,
    authorName: review.author_name,
    authorInitials: review.author_initials,
    approved: review.approved,
    createdAt: review.created_at,
  }, 'Thank you for your review! It will be published after moderation.');
};

// ── PUT /api/v1/reviews/:id/helpful ───────────────────────────────────

export const markHelpful = async (req, res) => {
  const { id } = req.params;
  const { helpful } = req.body;

  if (!validateUUID(id)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid review ID format', {}, 400);
  }

  const review = await ReviewModel.findById(id);
  if (!review) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Review not found', {}, 404);
  }

  const newCount = helpful === true || helpful === undefined
    ? (review.helpful || 0) + 1
    : Math.max(0, (review.helpful || 0) - 1);

  const updated = await ReviewModel.updateHelpful(id, newCount);

  return successResponse(res, {
    id: updated.id,
    helpful: updated.helpful,
  }, 'Review helpful count updated');
};

// ── DELETE /api/v1/reviews/:id ────────────────────────────────────────

export const deleteReview = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!validateUUID(id)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid review ID format', {}, 400);
  }

  const review = await ReviewModel.findById(id);
  if (!review) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Review not found', {}, 404);
  }

  // Delete the review
  await ReviewModel.delete(id);

  // Update salon rating
  const aggregate = await ReviewModel.getRatingAggregate(review.salon_id);
  await SalonModel.updateRating(review.salon_id, aggregate.averageRating || 0);

  // Invalidate caches
  await cacheDelPattern('reviews:testimonials:*');
  await cacheDel(`salons:detail:${review.salon_id}`);

  return successResponse(res, null, 'Review removal request submitted');
};
