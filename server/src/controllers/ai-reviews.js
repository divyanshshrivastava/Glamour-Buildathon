/**
 * AI Review Intelligence Controller
 *
 * Generates insights from salon reviews using Gemini,
 * with Redis caching (24h TTL) and a Q&A endpoint.
 */

import { generateJSON } from '../services/ai.js';
import { ReviewModel } from '../models/Review.js';
import { SalonModel } from '../models/Salon.js';
import { cacheGet, cacheSet } from '../services/cache.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { ERROR_CODES } from '../config/constants.js';
import { validateUUID } from '../utils/validation.js';

const INSIGHTS_CACHE_TTL = 86400; // 24 hours

// ── GET /api/v1/ai/review-insights/:salonId ──────────────────────────

export const getReviewInsights = async (req, res) => {
  const { salonId } = req.params;

  if (!validateUUID(salonId)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid salon ID', {}, 400);
  }

  // Check salon exists
  const salon = await SalonModel.findById(salonId);
  if (!salon) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Salon not found', {}, 404);
  }

  // Check cache first
  const cacheKey = `ai:review-insights:${salonId}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return successResponse(res, { ...cached, cachedAt: cached._cachedAt });
  }

  // Fetch all approved reviews for this salon
  const reviews = await ReviewModel.findBySalonId(salonId, { sort: 'recent' });

  if (!reviews || reviews.length < 3) {
    return successResponse(res, {
      whatCustomersLove: [],
      commonComplaints: [],
      strengthAreas: [],
      sentiment: { positive: 0, neutral: 0, negative: 0 },
      summary: 'Not enough reviews to generate insights. At least 3 reviews are needed.',
      totalReviews: reviews?.length || 0,
    });
  }

  // Build review text for analysis
  const reviewTexts = reviews.map(
    (r) => `[Rating: ${r.rating}/5] ${r.title ? r.title + ': ' : ''}${r.text}`
  );

  const prompt = `You are a review intelligence analyst for a salon called "${salon.name}". Analyze these customer reviews and generate actionable insights.

Reviews (${reviews.length} total):
${reviewTexts.slice(0, 50).join('\n---\n')}

Return a JSON object with this EXACT structure:
{
  "whatCustomersLove": ["quality 1", "quality 2", "quality 3", "quality 4", "quality 5"],
  "commonComplaints": ["complaint 1", "complaint 2", "complaint 3"],
  "strengthAreas": ["service area 1", "service area 2", "service area 3"],
  "sentiment": {
    "positive": 72,
    "neutral": 18,
    "negative": 10
  },
  "summary": "A concise 2-3 sentence summary of what customers think about this salon. Be specific and mention the salon name."
}

Rules:
- whatCustomersLove: 3-6 most praised qualities (be specific, e.g. "Expert bridal makeup" not just "Good service")
- commonComplaints: 1-4 most mentioned issues (if none, use ["No significant complaints found"])
- strengthAreas: 2-4 services/areas most praised
- sentiment percentages must add up to 100
- summary should be balanced and honest`;

  try {
    const insights = await generateJSON(prompt);

    // Ensure sentiment adds to 100
    const total =
      (insights.sentiment?.positive || 0) +
      (insights.sentiment?.neutral || 0) +
      (insights.sentiment?.negative || 0);
    if (total > 0 && total !== 100) {
      const factor = 100 / total;
      insights.sentiment.positive = Math.round(insights.sentiment.positive * factor);
      insights.sentiment.neutral = Math.round(insights.sentiment.neutral * factor);
      insights.sentiment.negative = 100 - insights.sentiment.positive - insights.sentiment.neutral;
    }

    const result = {
      whatCustomersLove: insights.whatCustomersLove || [],
      commonComplaints: insights.commonComplaints || [],
      strengthAreas: insights.strengthAreas || [],
      sentiment: insights.sentiment || { positive: 0, neutral: 0, negative: 0 },
      summary: insights.summary || 'Unable to generate summary.',
      totalReviews: reviews.length,
    };

    // Cache the result
    await cacheSet(cacheKey, { ...result, _cachedAt: new Date().toISOString() }, INSIGHTS_CACHE_TTL);

    return successResponse(res, result);
  } catch (err) {
    console.error('[Review Insights] Analysis failed:', err.message);
    return errorResponse(res, 'AI_ERROR', 'Failed to generate review insights. Please try again.', {}, 500);
  }
};

// ── POST /api/v1/ai/review-qa/:salonId ───────────────────────────────

export const askReviewQuestion = async (req, res) => {
  const { salonId } = req.params;
  const { question } = req.body;

  if (!validateUUID(salonId)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid salon ID', {}, 400);
  }

  if (!question || question.trim().length < 5) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Question must be at least 5 characters', {}, 422);
  }

  const salon = await SalonModel.findById(salonId);
  if (!salon) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Salon not found', {}, 404);
  }

  const reviews = await ReviewModel.findBySalonId(salonId, { sort: 'recent' });

  if (!reviews || reviews.length === 0) {
    return successResponse(res, {
      answer: 'There are no reviews for this salon yet, so I cannot answer your question.',
      relevantReviews: [],
    });
  }

  const reviewTexts = reviews.slice(0, 30).map(
    (r, i) => `Review ${i + 1} [Rating: ${r.rating}/5, By: ${r.author_name}]: ${r.text}`
  );

  const prompt = `You are a helpful assistant answering questions about "${salon.name}" salon based on real customer reviews.

Customer reviews:
${reviewTexts.join('\n---\n')}

User question: "${question.trim()}"

Return a JSON object with this EXACT structure:
{
  "answer": "A clear, helpful answer based on the reviews (2-4 sentences). Be specific and cite evidence from reviews.",
  "relevantReviewIndices": [0, 3, 5]
}

- relevantReviewIndices are 0-based indices of the reviews most relevant to the answer (max 3)
- If the question cannot be answered from reviews, say so honestly
- Do not make up information not supported by the reviews`;

  try {
    const result = await generateJSON(prompt);

    // Map indices back to actual review data
    const relevantReviews = (result.relevantReviewIndices || [])
      .filter((i) => i >= 0 && i < reviews.length)
      .slice(0, 3)
      .map((i) => ({
        id: reviews[i].id,
        text: reviews[i].text,
        rating: reviews[i].rating,
        authorName: reviews[i].author_name,
      }));

    return successResponse(res, {
      answer: result.answer || 'Unable to generate an answer.',
      relevantReviews,
    });
  } catch (err) {
    console.error('[Review QA] Failed:', err.message);
    return errorResponse(res, 'AI_ERROR', 'Failed to answer your question. Please try again.', {}, 500);
  }
};
