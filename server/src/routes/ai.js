/**
 * AI Routes
 *
 * Centralises all AI feature endpoints under /api/v1/ai/*
 */

import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authMiddleware, roleMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';

// Controllers
import { uploadMiddleware, analyzeBeauty } from '../controllers/ai-beauty.js';
import { conciergeSearch } from '../controllers/ai-concierge.js';
import { getReviewInsights, askReviewQuestion } from '../controllers/ai-reviews.js';
import { generateContent, refineContent } from '../controllers/ai-marketing.js';
import { getBusinessInsights } from '../controllers/ai-insights.js';
import { predictBookingRisk, getSalonRiskOverview } from '../controllers/ai-noshow.js';

const router = express.Router();

// ── 1. Beauty Consultant (public) ────────────────────────────────────

router.post(
  '/beauty-consultant',
  uploadMiddleware,
  asyncHandler(analyzeBeauty)
);

// ── 2. Concierge Search (public) ─────────────────────────────────────

router.post('/concierge-search', asyncHandler(conciergeSearch));

// ── 3. Review Intelligence (public) ──────────────────────────────────

router.get('/review-insights/:salonId', asyncHandler(getReviewInsights));
router.post('/review-qa/:salonId', asyncHandler(askReviewQuestion));

// ── 4. Marketing Assistant (salon owners) ────────────────────────────

router.post(
  '/marketing/generate',
  authMiddleware,
  roleMiddleware('salonOwner', 'admin'),
  asyncHandler(generateContent)
);

router.post(
  '/marketing/refine',
  authMiddleware,
  roleMiddleware('salonOwner', 'admin'),
  asyncHandler(refineContent)
);

// ── 5. Business Insights (salon owners) ──────────────────────────────

router.get(
  '/business-insights/:salonId',
  authMiddleware,
  roleMiddleware('salonOwner', 'admin'),
  asyncHandler(getBusinessInsights)
);

// ── 6. No-Show Predictor (salon owners) ──────────────────────────────

router.get(
  '/no-show-risk/salon/:salonId',
  authMiddleware,
  roleMiddleware('salonOwner', 'admin'),
  asyncHandler(getSalonRiskOverview)
);

router.get(
  '/no-show-risk/:bookingId',
  authMiddleware,
  roleMiddleware('salonOwner', 'admin'),
  asyncHandler(predictBookingRisk)
);

export default router;
