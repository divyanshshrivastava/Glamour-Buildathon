import pool from '../config/database.js';
import { SalonModel } from '../models/Salon.js';
import { PartnerApplicationModel } from '../models/Partner.js';
import { OpeningHoursModel } from '../models/OpeningHours.js';
import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from '../services/cache.js';
import { CACHE_TTL, ERROR_CODES } from '../config/constants.js';
import {
  successResponse,
  errorResponse,
  noContentResponse,
  getPaginationParams,
  buildPaginationMeta,
} from '../utils/response.js';
import { validateUUID } from '../utils/validation.js';

// ── GET /api/v1/admin/dashboard/stats ─────────────────────────────────

export const getDashboardStats = async (req, res) => {
  const cacheKey = 'admin:dashboard:stats';
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return successResponse(res, cached);
  }

  // Run aggregate queries in parallel
  const [
    salonsResult,
    bookingsResult,
    usersResult,
    reviewsResult,
    pendingAppsResult,
    pendingReviewsResult,
    topSalonsResult,
  ] = await Promise.all([
    pool.query('SELECT COUNT(*) as count FROM salons WHERE active = true'),
    pool.query('SELECT COUNT(*) as count FROM bookings'),
    pool.query('SELECT COUNT(*) as count FROM users WHERE active = true'),
    pool.query('SELECT COUNT(*) as count FROM reviews'),
    pool.query("SELECT COUNT(*) as count FROM partner_applications WHERE status = 'pending'"),
    pool.query('SELECT COUNT(*) as count FROM reviews WHERE approved = false'),
    pool.query(`
      SELECT s.id, s.name, s.rating, 
        (SELECT COUNT(*) FROM bookings b WHERE b.salon_id = s.id) as bookings
      FROM salons s 
      WHERE s.active = true 
      ORDER BY s.rating DESC 
      LIMIT 5
    `),
  ]);

  const stats = {
    totalSalons: parseInt(salonsResult.rows[0].count),
    totalBookings: parseInt(bookingsResult.rows[0].count),
    totalUsers: parseInt(usersResult.rows[0].count),
    totalReviews: parseInt(reviewsResult.rows[0].count),
    pendingApplications: parseInt(pendingAppsResult.rows[0].count),
    pendingReviews: parseInt(pendingReviewsResult.rows[0].count),
    topSalons: topSalonsResult.rows.map((s) => ({
      id: s.id,
      name: s.name,
      rating: parseFloat(s.rating),
      bookings: parseInt(s.bookings),
    })),
  };

  await cacheSet(cacheKey, stats, CACHE_TTL.SALON_DETAIL);

  return successResponse(res, stats);
};

// ── GET /api/v1/admin/applications ────────────────────────────────────

export const getApplications = async (req, res) => {
  const { page, limit, offset } = getPaginationParams(req.query);
  const status = req.query.status || null;

  const applications = await PartnerApplicationModel.findAll({ status });
  const total = applications.length;
  const paginated = applications.slice(offset, offset + limit);

  const formatted = paginated.map((a) => ({
    id: a.id,
    salonName: a.salon_name,
    ownerName: a.owner_name,
    email: a.email,
    phone: a.phone,
    city: a.city,
    message: a.message,
    status: a.status,
    rejectionReason: a.rejection_reason,
    createdAt: a.created_at,
    reviewedAt: a.reviewed_at,
  }));

  const pagination = buildPaginationMeta(page, limit, total);

  return res.status(200).json({
    status: 'success',
    data: formatted,
    pagination,
  });
};

// ── PUT /api/v1/admin/salons/:id/verify ───────────────────────────────

export const verifySalon = async (req, res) => {
  const { id } = req.params;

  if (!validateUUID(id)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid salon ID format', {}, 400);
  }

  const salon = await SalonModel.findById(id);
  if (!salon) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Salon not found', {}, 404);
  }

  if (salon.verified) {
    return successResponse(res, { id: salon.id, verified: true }, 'Salon is already verified');
  }

  const updated = await SalonModel.verify(id);

  // Invalidate cache
  await cacheDel(`salons:detail:${id}`);
  await cacheDelPattern('salons:list:*');
  await cacheDelPattern('salons:featured:*');

  return successResponse(res, {
    id: updated.id,
    name: updated.name,
    verified: updated.verified,
    updatedAt: updated.updated_at,
  }, 'Salon verified successfully');
};

// ── DELETE /api/v1/admin/salons/:id ───────────────────────────────────

export const deleteSalon = async (req, res) => {
  const { id } = req.params;

  if (!validateUUID(id)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid salon ID format', {}, 400);
  }

  // Check salon exists (including inactive)
  const salonResult = await pool.query('SELECT * FROM salons WHERE id = $1', [id]);
  if (salonResult.rows.length === 0) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Salon not found', {}, 404);
  }

  // Hard delete — cascade through related tables
  // Order matters due to foreign key constraints
  await pool.query('DELETE FROM reviews WHERE salon_id = $1', [id]);
  await pool.query('DELETE FROM bookings WHERE salon_id = $1', [id]);
  await pool.query('DELETE FROM services WHERE salon_id = $1', [id]);
  await pool.query('DELETE FROM opening_hours WHERE salon_id = $1', [id]);
  await SalonModel.hardDelete(id);

  // Invalidate all salon caches
  await cacheDel(`salons:detail:${id}`);
  await cacheDelPattern('salons:*');
  await cacheDelPattern('reviews:*');
  await cacheDel('admin:dashboard:stats');

  return noContentResponse(res);
};
