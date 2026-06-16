/**
 * AI No-Show & Cancellation Predictor Controller
 *
 * Predicts booking no-show risk using customer history analysis
 * with a hybrid approach: rule-based heuristics for bulk overview,
 * Gemini AI for detailed single-booking analysis.
 */

import { generateJSON } from '../services/ai.js';
import { SalonModel } from '../models/Salon.js';
import { BookingModel } from '../models/Booking.js';
import { ServiceModel } from '../models/Service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { ERROR_CODES } from '../config/constants.js';
import { validateUUID } from '../utils/validation.js';
import pool from '../config/database.js';

// ── Rule-based risk scorer (no AI call) ──────────────────────────────

function calculateRiskScore(customerHistory, booking) {
  let score = 0;

  // Factor 1: Cancellation history (0-40 points)
  if (customerHistory.totalBookings > 0) {
    const cancelRate = customerHistory.cancellations / customerHistory.totalBookings;
    score += Math.min(40, Math.round(cancelRate * 80));
  }

  // Factor 2: Lead time — short lead time = higher risk (0-25 points)
  const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
  const leadTimeHours = (bookingDateTime - new Date()) / (1000 * 60 * 60);
  if (leadTimeHours < 12) score += 25;
  else if (leadTimeHours < 24) score += 18;
  else if (leadTimeHours < 48) score += 10;
  else if (leadTimeHours < 72) score += 5;

  // Factor 3: Day of week — weekend bookings slightly higher risk (0-10 points)
  const dayOfWeek = bookingDateTime.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) score += 8;

  // Factor 4: New customer (no history) — moderate risk (0-15 points)
  if (customerHistory.totalBookings === 0) score += 15;

  // Factor 5: Low booking frequency (0-10 points)
  if (customerHistory.totalBookings > 0 && customerHistory.totalBookings < 3) {
    score += 10;
  }

  return Math.min(100, score);
}

function riskLevelFromScore(score) {
  if (score >= 60) return 'high';
  if (score >= 35) return 'medium';
  return 'low';
}

// ── GET /api/v1/ai/no-show-risk/:bookingId (detailed AI analysis) ────

export const predictBookingRisk = async (req, res) => {
  const { bookingId } = req.params;

  if (!validateUUID(bookingId)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid booking ID', {}, 400);
  }

  const booking = await BookingModel.findById(bookingId);
  if (!booking) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Booking not found', {}, 404);
  }

  // Auth: salon owner or admin
  const salon = await SalonModel.findById(booking.salon_id);
  if (!salon) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Salon not found', {}, 404);
  }
  if (req.user.role !== 'admin' && salon.salon_owner_id !== req.user.id) {
    return errorResponse(res, ERROR_CODES.FORBIDDEN, 'Access denied', {}, 403);
  }

  // Get customer history
  let customerHistory = { totalBookings: 0, cancellations: 0, completed: 0, noShows: 0 };

  if (booking.customer_id) {
    const historyResult = await pool.query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE status = 'completed') as completed
       FROM bookings
       WHERE customer_id = $1 AND id != $2`,
      [booking.customer_id, bookingId]
    );
    const h = historyResult.rows[0];
    customerHistory = {
      totalBookings: parseInt(h.total) || 0,
      cancellations: parseInt(h.cancelled) || 0,
      completed: parseInt(h.completed) || 0,
      noShows: 0,
    };
  }

  // Get service details
  const service = await ServiceModel.findById(booking.service_id);
  const servicePrice = service ? parseFloat(service.price) : 0;

  // Use Gemini for detailed analysis
  const ruleScore = calculateRiskScore(customerHistory, booking);

  const prompt = `You are a booking risk analyst for a salon. Assess the no-show/cancellation risk for this booking.

Booking details:
- Date: ${booking.booking_date}, Time: ${booking.booking_time}
- Service: ${service?.name || 'Unknown'}, Price: ₹${servicePrice}
- Customer: ${booking.customer_name}
- Status: ${booking.status}
- Created: ${booking.created_at}

Customer history:
- Total past bookings: ${customerHistory.totalBookings}
- Completed: ${customerHistory.completed}
- Cancelled: ${customerHistory.cancellations}
- Cancellation rate: ${customerHistory.totalBookings > 0 ? Math.round((customerHistory.cancellations / customerHistory.totalBookings) * 100) : 'N/A'}%

Lead time: ${Math.round((new Date(`${booking.booking_date}T${booking.booking_time}`) - new Date()) / (1000 * 60 * 60))} hours from now

Rule-based risk score: ${ruleScore}/100

Return a JSON object with this EXACT structure:
{
  "riskLevel": "low | medium | high",
  "probability": 35,
  "explanation": "2-3 sentence explanation of why this booking has this risk level. Be specific about the factors.",
  "recommendedActions": ["Action 1", "Action 2", "Action 3"]
}

Rules:
- probability should be 0-100 (percentage chance of cancellation/no-show)
- recommendedActions: 2-4 specific actions like "Send reminder SMS 2 hours before", "Request confirmation", "Offer waitlist backup", "Contact customer directly"
- Base your assessment on the data provided — don't invent history`;

  try {
    const aiResult = await generateJSON(prompt);

    return successResponse(res, {
      bookingId,
      riskLevel: aiResult.riskLevel || riskLevelFromScore(ruleScore),
      probability: aiResult.probability || ruleScore,
      explanation: aiResult.explanation || 'Risk assessment based on booking patterns.',
      recommendedActions: aiResult.recommendedActions || ['Send booking reminder'],
    });
  } catch (err) {
    console.error('[No-Show] AI analysis failed, using rule-based fallback:', err.message);
    // Fallback to rule-based scoring
    return successResponse(res, {
      bookingId,
      riskLevel: riskLevelFromScore(ruleScore),
      probability: ruleScore,
      explanation: `Risk score ${ruleScore}/100 based on customer history and booking patterns.`,
      recommendedActions: ruleScore >= 60
        ? ['Send reminder', 'Request confirmation', 'Prepare waitlist backup']
        : ruleScore >= 35
          ? ['Send reminder', 'Request confirmation']
          : ['Standard reminder'],
    });
  }
};

// ── GET /api/v1/ai/no-show-risk/salon/:salonId (bulk overview) ───────

export const getSalonRiskOverview = async (req, res) => {
  const { salonId } = req.params;

  if (!validateUUID(salonId)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid salon ID', {}, 400);
  }

  const salon = await SalonModel.findById(salonId);
  if (!salon) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Salon not found', {}, 404);
  }
  if (req.user.role !== 'admin' && salon.salon_owner_id !== req.user.id) {
    return errorResponse(res, ERROR_CODES.FORBIDDEN, 'Access denied', {}, 403);
  }

  // Get all upcoming/pending/confirmed bookings
  const upcomingResult = await pool.query(
    `SELECT b.*, sv.price as service_price, sv.name as service_name
     FROM bookings b
     LEFT JOIN services sv ON b.service_id = sv.id
     WHERE b.salon_id = $1
       AND b.status IN ('pending', 'confirmed')
       AND b.booking_date >= CURRENT_DATE
     ORDER BY b.booking_date ASC, b.booking_time ASC`,
    [salonId]
  );

  const bookings = upcomingResult.rows;

  if (bookings.length === 0) {
    return successResponse(res, {
      totalUpcoming: 0,
      highRisk: 0,
      mediumRisk: 0,
      lowRisk: 0,
      revenueAtRisk: 0,
      bookingRisks: [],
    });
  }

  // Get customer histories in bulk
  const customerIds = [...new Set(bookings.map((b) => b.customer_id).filter(Boolean))];

  let customerHistories = {};
  if (customerIds.length > 0) {
    const histResult = await pool.query(
      `SELECT customer_id,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE status = 'completed') as completed
       FROM bookings
       WHERE customer_id = ANY($1)
       GROUP BY customer_id`,
      [customerIds]
    );

    for (const row of histResult.rows) {
      customerHistories[row.customer_id] = {
        totalBookings: parseInt(row.total) || 0,
        cancellations: parseInt(row.cancelled) || 0,
        completed: parseInt(row.completed) || 0,
      };
    }
  }

  // Calculate risk for each booking using rule-based scoring (no AI calls)
  const bookingRisks = bookings.map((b) => {
    const history = customerHistories[b.customer_id] || {
      totalBookings: 0, cancellations: 0, completed: 0,
    };
    const score = calculateRiskScore(history, b);
    const riskLevel = riskLevelFromScore(score);

    return {
      bookingId: b.id,
      customerName: b.customer_name,
      date: b.booking_date,
      time: b.booking_time,
      serviceName: b.service_name,
      servicePrice: parseFloat(b.service_price) || 0,
      riskLevel,
      probability: score,
      explanation: '',
      recommendedActions: riskLevel === 'high'
        ? ['Send reminder', 'Request confirmation', 'Prepare waitlist']
        : riskLevel === 'medium'
          ? ['Send reminder', 'Request confirmation']
          : ['Standard reminder'],
    };
  });

  const highRisk = bookingRisks.filter((r) => r.riskLevel === 'high');
  const mediumRisk = bookingRisks.filter((r) => r.riskLevel === 'medium');
  const lowRisk = bookingRisks.filter((r) => r.riskLevel === 'low');

  const revenueAtRisk = [...highRisk, ...mediumRisk].reduce(
    (sum, r) => sum + r.servicePrice,
    0
  );

  return successResponse(res, {
    totalUpcoming: bookings.length,
    highRisk: highRisk.length,
    mediumRisk: mediumRisk.length,
    lowRisk: lowRisk.length,
    revenueAtRisk: Math.round(revenueAtRisk),
    bookingRisks,
  });
};
