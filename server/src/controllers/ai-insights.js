/**
 * AI Business Insights & Pricing Advisor Controller
 *
 * Analyses salon booking data, revenue, and trends to generate
 * actionable business recommendations.
 */

import { generateJSON } from '../services/ai.js';
import { SalonModel } from '../models/Salon.js';
import { cacheGet, cacheSet } from '../services/cache.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { ERROR_CODES } from '../config/constants.js';
import { validateUUID } from '../utils/validation.js';
import pool from '../config/database.js';

const INSIGHTS_CACHE_TTL = 21600; // 6 hours

// ── GET /api/v1/ai/business-insights/:salonId ────────────────────────

export const getBusinessInsights = async (req, res) => {
  const { salonId } = req.params;

  if (!validateUUID(salonId)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid salon ID', {}, 400);
  }

  // Auth check: only the salon owner or admin
  const salon = await SalonModel.findById(salonId);
  if (!salon) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Salon not found', {}, 404);
  }

  if (req.user.role !== 'admin' && salon.salon_owner_id !== req.user.id) {
    return errorResponse(res, ERROR_CODES.FORBIDDEN, 'Access denied', {}, 403);
  }

  // Check cache
  const cacheKey = `ai:business-insights:${salonId}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return successResponse(res, cached);
  }

  // ── Gather business data ────────────────────────────────────────────

  try {
    // 1. Booking stats
    const bookingStatsResult = await pool.query(
      `SELECT
        COUNT(*) as total_bookings,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed
      FROM bookings WHERE salon_id = $1`,
      [salonId]
    );

    // 2. Revenue (from completed bookings)
    const revenueResult = await pool.query(
      `SELECT COALESCE(SUM(sv.price), 0) as total_revenue
       FROM bookings b
       JOIN services sv ON b.service_id = sv.id
       WHERE b.salon_id = $1 AND b.status = 'completed'`,
      [salonId]
    );

    // 3. Popular services
    const popularServicesResult = await pool.query(
      `SELECT sv.name, sv.price, sv.duration, COUNT(b.id) as booking_count
       FROM bookings b
       JOIN services sv ON b.service_id = sv.id
       WHERE b.salon_id = $1
       GROUP BY sv.id, sv.name, sv.price, sv.duration
       ORDER BY booking_count DESC
       LIMIT 10`,
      [salonId]
    );

    // 4. Bookings by day of week
    const dayOfWeekResult = await pool.query(
      `SELECT EXTRACT(DOW FROM booking_date) as day_num,
              TO_CHAR(booking_date, 'Day') as day_name,
              COUNT(*) as count
       FROM bookings WHERE salon_id = $1
       GROUP BY day_num, day_name
       ORDER BY day_num`,
      [salonId]
    );

    // 5. Repeat customers
    const repeatCustomerResult = await pool.query(
      `SELECT COUNT(*) as repeat_count FROM (
        SELECT customer_id FROM bookings
        WHERE salon_id = $1 AND customer_id IS NOT NULL
        GROUP BY customer_id
        HAVING COUNT(*) > 1
      ) sub`,
      [salonId]
    );

    const totalUniqueCustomers = await pool.query(
      `SELECT COUNT(DISTINCT customer_id) as total FROM bookings
       WHERE salon_id = $1 AND customer_id IS NOT NULL`,
      [salonId]
    );

    // 6. All services with prices
    const allServicesResult = await pool.query(
      `SELECT name, price, duration, category FROM services
       WHERE salon_id = $1 AND is_active = true
       ORDER BY category, name`,
      [salonId]
    );

    // Build the data object
    const stats = bookingStatsResult.rows[0];
    const totalBookings = parseInt(stats.total_bookings) || 0;
    const totalRevenue = parseFloat(revenueResult.rows[0]?.total_revenue) || 0;
    const cancellationRate = totalBookings > 0
      ? Math.round((parseInt(stats.cancelled) / totalBookings) * 100)
      : 0;
    const uniqueCustomers = parseInt(totalUniqueCustomers.rows[0]?.total) || 0;
    const repeatCustomers = parseInt(repeatCustomerResult.rows[0]?.repeat_count) || 0;
    const repeatRate = uniqueCustomers > 0
      ? Math.round((repeatCustomers / uniqueCustomers) * 100)
      : 0;

    const metrics = {
      totalBookings,
      totalRevenue,
      cancellationRate,
      repeatCustomerRate: repeatRate,
      averageBookingValue: totalBookings > 0 ? Math.round(totalRevenue / parseInt(stats.completed || 1)) : 0,
    };

    // ── Send to Gemini for analysis ───────────────────────────────────

    const prompt = `You are a business intelligence analyst for a salon called "${salon.name}" in ${salon.city}, India.

Business Data:
- Total bookings: ${totalBookings}
- Completed: ${stats.completed}, Cancelled: ${stats.cancelled}, Pending: ${stats.pending}
- Total revenue: ₹${totalRevenue.toLocaleString()}
- Cancellation rate: ${cancellationRate}%
- Unique customers: ${uniqueCustomers}, Repeat customers: ${repeatCustomers} (${repeatRate}%)
- Average booking value: ₹${metrics.averageBookingValue}

Popular services:
${popularServicesResult.rows.map((s) => `- ${s.name}: ₹${s.price}, ${s.booking_count} bookings, ${s.duration}`).join('\n')}

Bookings by day:
${dayOfWeekResult.rows.map((d) => `- ${d.day_name.trim()}: ${d.count} bookings`).join('\n')}

All services and prices:
${allServicesResult.rows.map((s) => `- ${s.name} (${s.category}): ₹${s.price}, ${s.duration}`).join('\n')}

Return a JSON object with this EXACT structure:
{
  "insights": [
    {
      "title": "Brief insight title",
      "description": "2-3 sentence explanation with specific numbers",
      "impact": "high | medium | low",
      "category": "revenue | operations | marketing | pricing"
    }
  ],
  "pricingRecommendations": [
    {
      "serviceName": "Service Name",
      "currentPrice": 500,
      "suggestedPrice": 650,
      "reasoning": "Brief justification",
      "action": "increase | decrease | bundle | keep"
    }
  ],
  "revenueOpportunities": [
    {
      "title": "Opportunity name",
      "description": "How to implement",
      "estimatedRevenue": "₹15,000–₹20,000/month",
      "effort": "low | medium | high"
    }
  ],
  "demandForecast": {
    "highDemandPeriods": ["Weekends", "Festival seasons"],
    "lowDemandPeriods": ["Weekday mornings"],
    "seasonalOpportunities": ["Wedding season", "Festive offers"]
  },
  "actionItems": [
    "Top 5 actions the salon owner should take this month"
  ]
}

Rules:
- Provide 5-8 insights
- Provide 3-5 pricing recommendations
- Provide 2-4 revenue opportunities with realistic ₹ estimates
- Action items should be specific and actionable (max 5)
- All currency in ₹ (Indian Rupees)`;

    const aiResult = await generateJSON(prompt);

    const result = {
      insights: aiResult.insights || [],
      pricingRecommendations: aiResult.pricingRecommendations || [],
      revenueOpportunities: aiResult.revenueOpportunities || [],
      demandForecast: aiResult.demandForecast || {
        highDemandPeriods: [],
        lowDemandPeriods: [],
        seasonalOpportunities: [],
      },
      actionItems: aiResult.actionItems || [],
      metrics,
    };

    // Cache the result
    await cacheSet(cacheKey, result, INSIGHTS_CACHE_TTL);

    return successResponse(res, result);
  } catch (err) {
    console.error('[Business Insights] Failed:', err.message);
    return errorResponse(res, 'AI_ERROR', 'Failed to generate business insights. Please try again.', {}, 500);
  }
};
