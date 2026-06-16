/**
 * AI Concierge Search Controller
 *
 * Converts natural language queries into structured search filters,
 * queries the database, and applies an AI recommendation layer.
 */

import { generateJSON } from '../services/ai.js';
import { SalonModel } from '../models/Salon.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { ERROR_CODES } from '../config/constants.js';
import pool from '../config/database.js';

export const conciergeSearch = async (req, res) => {
  const { query } = req.body;

  if (!query || query.trim().length < 3) {
    return errorResponse(
      res,
      ERROR_CODES.VALIDATION_ERROR,
      'Please provide a search query (at least 3 characters)',
      {},
      422
    );
  }

  // ── Step 1: Extract structured filters from natural language ───────

  const extractPrompt = `You are a search query parser for a salon booking platform in India. Parse the following natural language query into structured search filters.

User query: "${query.trim()}"

Return a JSON object with this EXACT structure:
{
  "serviceType": "the type of service requested, or null",
  "budget": { "min": null, "max": null },
  "date": "YYYY-MM-DD or relative like 'this weekend', 'tomorrow', or null",
  "time": "preferred time like 'evening', 'morning', 'afternoon', or null",
  "location": "city or area mentioned, or null",
  "ratingPreference": 4.0,
  "urgency": "high | medium | low | null",
  "additionalPreferences": ["list of any other preferences mentioned"]
}

Notes:
- Budget values should be numbers (₹ amounts) or null
- For "this weekend", set date to the next Saturday's date
- For "tomorrow", set date to tomorrow's actual date
- ratingPreference should be a number like 4.0, 4.5, etc. or null
- Be generous with interpretation — if they say "best" assume high rating preference`;

  let understood;
  try {
    understood = await generateJSON(extractPrompt);
  } catch (err) {
    console.error('[Concierge] Filter extraction failed:', err.message);
    return errorResponse(res, 'AI_ERROR', 'Failed to understand your query. Please try rephrasing.', {}, 500);
  }

  // ── Step 2: Query the database with extracted filters ──────────────

  let results = [];
  try {
    // Build a flexible SQL query based on extracted filters
    const conditions = ['sa.active = true'];
    const params = [];
    let paramIndex = 1;

    // Service type filter — search in services table
    if (understood.serviceType) {
      conditions.push(`EXISTS (
        SELECT 1 FROM services sv
        WHERE sv.salon_id = sa.id
          AND sv.is_active = true
          AND LOWER(sv.name) LIKE LOWER($${paramIndex})
      )`);
      params.push(`%${understood.serviceType}%`);
      paramIndex++;
    }

    // Location filter
    if (understood.location) {
      conditions.push(`LOWER(sa.city) LIKE LOWER($${paramIndex})`);
      params.push(`%${understood.location}%`);
      paramIndex++;
    }

    // Rating filter
    if (understood.ratingPreference) {
      conditions.push(`sa.rating >= $${paramIndex}`);
      params.push(understood.ratingPreference);
      paramIndex++;
    }

    // Budget filter — check starting_price
    if (understood.budget?.max) {
      conditions.push(`sa.starting_price <= $${paramIndex}`);
      params.push(understood.budget.max);
      paramIndex++;
    }

    const query_sql = `
      SELECT sa.*,
        (
          SELECT json_agg(json_build_object(
            'id', sv.id,
            'name', sv.name,
            'price', sv.price,
            'duration', sv.duration
          ))
          FROM services sv
          WHERE sv.salon_id = sa.id
            AND sv.is_active = true
            ${understood.serviceType ? `AND LOWER(sv.name) LIKE LOWER($1)` : ''}
          LIMIT 5
        ) as matched_services
      FROM salons sa
      WHERE ${conditions.join(' AND ')}
      ORDER BY sa.rating DESC, sa.review_count DESC
      LIMIT 10
    `;

    const dbResult = await pool.query(query_sql, params);

    results = dbResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      rating: parseFloat(row.rating) || 0,
      reviewCount: parseInt(row.review_count) || 0,
      city: row.city,
      coverImage: row.cover_image,
      startingPrice: parseFloat(row.starting_price) || 0,
      matchedServices: (row.matched_services || []).map((s) => ({
        id: s.id,
        name: s.name,
        price: parseFloat(s.price),
        duration: s.duration,
      })),
      aiScore: 0,
      aiReason: '',
    }));
  } catch (err) {
    console.error('[Concierge] Database query failed:', err.message);
    // Return what we have so far
  }

  // ── Step 3: AI recommendation layer — rank results ─────────────────

  if (results.length > 0) {
    try {
      const rankPrompt = `You are a salon recommendation expert. Given the user's query and search results, rank and add a brief recommendation reason for each salon.

User query: "${query.trim()}"
AI understood: ${JSON.stringify(understood)}

Salons found:
${results.map((r, i) => `${i + 1}. ${r.name} (Rating: ${r.rating}, Reviews: ${r.reviewCount}, City: ${r.city}, Price: ₹${r.startingPrice})`).join('\n')}

Return a JSON object with this EXACT structure:
{
  "rankings": [
    { "index": 0, "aiScore": 95, "aiReason": "Brief 1-sentence reason why this salon is a good match" }
  ],
  "aiRecommendation": "A brief 2-sentence overall recommendation to the user"
}

- index is 0-based matching the salon list above
- aiScore is 0-100 based on match quality
- Order by best match first`;

      const ranking = await generateJSON(rankPrompt);

      if (ranking.rankings) {
        for (const rank of ranking.rankings) {
          if (results[rank.index]) {
            results[rank.index].aiScore = rank.aiScore || 0;
            results[rank.index].aiReason = rank.aiReason || '';
          }
        }
        // Re-sort by AI score
        results.sort((a, b) => b.aiScore - a.aiScore);
      }

      return successResponse(res, {
        understood,
        results,
        aiRecommendation: ranking.aiRecommendation || '',
      });
    } catch (err) {
      console.error('[Concierge] Ranking failed:', err.message);
      // Fall through with unranked results
    }
  }

  return successResponse(res, {
    understood,
    results,
    aiRecommendation: results.length > 0
      ? 'Here are salons matching your search criteria.'
      : 'No salons found matching your criteria. Try broadening your search.',
  });
};
