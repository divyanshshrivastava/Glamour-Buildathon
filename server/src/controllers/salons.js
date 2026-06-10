import { SalonModel } from '../models/Salon.js';
import { ServiceModel } from '../models/Service.js';
import { OpeningHoursModel } from '../models/OpeningHours.js';
import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from '../services/cache.js';
import { CACHE_TTL, ERROR_CODES } from '../config/constants.js';
import {
  successResponse,
  createdResponse,
  errorResponse,
  paginatedResponse,
  getPaginationParams,
  buildPaginationMeta,
  noContentResponse,
} from '../utils/response.js';
import { validateUUID } from '../utils/validation.js';

// ── Helper: Generate slug from name ───────────────────────────────────

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// ── Helper: Format salon for API response ─────────────────────────────

const formatSalon = (salon) => {
  return {
    id: salon.id,
    name: salon.name,
    slug: salon.slug,
    tagline: salon.tagline,
    description: salon.description,
    email: salon.email,
    phone: salon.phone,
    website: salon.website,
    address: salon.address,
    city: salon.city,
    coordinates: salon.coordinates,
    coverImage: salon.cover_image,
    gallery: salon.gallery,
    amenities: salon.amenities,
    startingPrice: parseFloat(salon.starting_price) || 0,
    rating: parseFloat(salon.rating) || 0,
    reviewCount: parseInt(salon.review_count) || 0,
    salonOwnerId: salon.salon_owner_id,
    featured: salon.featured,
    verified: salon.verified,
    active: salon.active,
    createdAt: salon.created_at,
    updatedAt: salon.updated_at,
  };
};

// ── GET /api/v1/salons/featured ───────────────────────────────────────

export const getFeatured = async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;
  const city = req.query.city || null;

  const cacheKey = `salons:featured:${city || 'all'}:${limit}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return successResponse(res, cached.data, 'Success');
  }

  const salons = await SalonModel.findFeatured(limit, city);
  const formatted = salons.map(formatSalon);

  const responseData = { data: formatted, count: formatted.length };
  await cacheSet(cacheKey, responseData, CACHE_TTL.FEATURED_SALONS);

  return res.status(200).json({
    status: 'success',
    data: formatted,
    count: formatted.length,
  });
};

// ── GET /api/v1/salons ────────────────────────────────────────────────

export const getAll = async (req, res) => {
  const { page, limit, offset } = getPaginationParams(req.query);
  const city = req.query.city || null;
  const sortBy = req.query.sortBy || 'created_at';

  const cacheKey = `salons:list:${city || 'all'}:${sortBy}:${page}:${limit}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const salons = await SalonModel.findAll({ city, sortBy });
  const total = salons.length;

  // Manual pagination (could optimize with SQL LIMIT/OFFSET in model)
  const paginated = salons.slice(offset, offset + limit);
  const formatted = paginated.map(formatSalon);
  const pagination = buildPaginationMeta(page, limit, total);

  const response = { status: 'success', data: formatted, pagination };
  await cacheSet(cacheKey, response, CACHE_TTL.SALONS_LIST);

  return res.status(200).json(response);
};

// ── GET /api/v1/salons/search ─────────────────────────────────────────

export const search = async (req, res) => {
  const { page, limit, offset } = getPaginationParams(req.query);
  const q = req.query.q || '';
  const location = req.query.location || req.query.city || null;
  const minRating = req.query.minRating ? parseFloat(req.query.minRating) : null;
  const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
  const sortBy = req.query.sortBy || 'rating';

  const salons = await SalonModel.search(q, {
    city: location,
    minRating,
    maxPrice,
    sortBy,
  });

  const total = salons.length;
  const paginated = salons.slice(offset, offset + limit);
  const formatted = paginated.map(formatSalon);
  const pagination = buildPaginationMeta(page, limit, total);

  return res.status(200).json({
    status: 'success',
    data: formatted,
    pagination,
  });
};

// ── GET /api/v1/salons/:id ────────────────────────────────────────────

export const getById = async (req, res) => {
  const { id } = req.params;

  if (!validateUUID(id)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid salon ID format', {}, 400);
  }

  const cacheKey = `salons:detail:${id}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return successResponse(res, cached);
  }

  const salon = await SalonModel.findById(id);
  if (!salon) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Salon not found', {}, 404);
  }

  // Get related data
  const [services, openingHours] = await Promise.all([
    ServiceModel.findBySalonId(id),
    OpeningHoursModel.findBySalonId(id),
  ]);

  const formatted = {
    ...formatSalon(salon),
    services: services.map((s) => ({
      id: s.id,
      name: s.name,
      price: parseFloat(s.price),
      duration: s.duration,
      category: s.category,
      description: s.description,
    })),
    openingHours: openingHours.map((h) => ({
      day: h.day,
      open: h.open_time,
      close: h.close_time,
      closed: h.closed,
    })),
  };

  await cacheSet(cacheKey, formatted, CACHE_TTL.SALON_DETAIL);

  return successResponse(res, formatted);
};

// ── POST /api/v1/salons ───────────────────────────────────────────────

export const create = async (req, res) => {
  const {
    name,
    tagline,
    description,
    email,
    phone,
    website,
    address,
    city,
    coordinates,
    coverImage,
    gallery,
    amenities,
    openingHours,
  } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !address || !city) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Name, email, phone, address, and city are required', {}, 422);
  }

  // Generate slug
  let slug = generateSlug(name);
  const existingSlug = await SalonModel.findBySlug(slug);
  if (existingSlug) {
    slug = `${slug}-${Date.now()}`;
  }

  // Create salon
  const salon = await SalonModel.create({
    name,
    slug,
    tagline: tagline || null,
    description: description || null,
    email,
    phone,
    website: website || null,
    address,
    city,
    coordinates: coordinates || null,
    coverImage: coverImage || null,
    gallery: gallery || [],
    amenities: amenities || [],
    salonOwnerId: req.user.id,
  });

  // Create opening hours if provided
  if (openingHours && Array.isArray(openingHours)) {
    await OpeningHoursModel.createMany(salon.id, openingHours);
  }

  // Update user's salon_id
  await import('../models/User.js').then(({ UserModel }) =>
    UserModel.update(req.user.id, {}),
  );

  // Invalidate cache
  await cacheDelPattern('salons:*');

  const formatted = formatSalon(salon);
  return createdResponse(res, formatted, 'Salon created successfully');
};

// ── PUT /api/v1/salons/:id ────────────────────────────────────────────

export const update = async (req, res) => {
  const { id } = req.params;

  if (!validateUUID(id)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid salon ID format', {}, 400);
  }

  const salon = await SalonModel.findById(id);
  if (!salon) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Salon not found', {}, 404);
  }

  // Check ownership (salon owner or admin)
  if (req.user.role !== 'admin' && salon.salon_owner_id !== req.user.id) {
    return errorResponse(res, ERROR_CODES.FORBIDDEN, 'You can only update your own salon', {}, 403);
  }

  const {
    name,
    tagline,
    description,
    phone,
    website,
    address,
    city,
    coordinates,
    coverImage,
    gallery,
    amenities,
    startingPrice,
    openingHours,
  } = req.body;

  const updatedSalon = await SalonModel.update(id, {
    name,
    tagline,
    description,
    phone,
    website,
    address,
    city,
    coordinates,
    coverImage,
    gallery,
    amenities,
    startingPrice,
  });

  // Update opening hours if provided
  if (openingHours && Array.isArray(openingHours)) {
    await OpeningHoursModel.deleteBySalonId(id);
    await OpeningHoursModel.createMany(id, openingHours);
  }

  // Invalidate cache
  await cacheDel(`salons:detail:${id}`);
  await cacheDelPattern('salons:list:*');
  await cacheDelPattern('salons:featured:*');

  return successResponse(res, formatSalon(updatedSalon), 'Salon updated successfully');
};

// ── DELETE /api/v1/salons/:id ─────────────────────────────────────────

export const remove = async (req, res) => {
  const { id } = req.params;

  if (!validateUUID(id)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid salon ID format', {}, 400);
  }

  const salon = await SalonModel.findById(id);
  if (!salon) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Salon not found', {}, 404);
  }

  // Soft delete
  await SalonModel.softDelete(id);

  // Invalidate cache
  await cacheDel(`salons:detail:${id}`);
  await cacheDelPattern('salons:list:*');
  await cacheDelPattern('salons:featured:*');

  return noContentResponse(res);
};
