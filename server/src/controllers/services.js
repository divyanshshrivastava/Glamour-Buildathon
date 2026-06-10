import { ServiceModel, ServiceCategoryModel } from '../models/Service.js';
import { SalonModel } from '../models/Salon.js';
import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from '../services/cache.js';
import { CACHE_TTL, ERROR_CODES } from '../config/constants.js';
import {
  successResponse,
  createdResponse,
  errorResponse,
  noContentResponse,
} from '../utils/response.js';
import { validateUUID } from '../utils/validation.js';

// ── GET /api/v1/services/categories ───────────────────────────────────

export const getCategories = async (req, res) => {
  const cacheKey = 'services:categories';
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const categories = await ServiceCategoryModel.findAll();

  const formatted = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    description: c.description,
    count: parseInt(c.count) || 0,
  }));

  const response = { status: 'success', data: formatted, count: formatted.length };
  await cacheSet(cacheKey, response, CACHE_TTL.SERVICES_CATEGORIES);

  return res.status(200).json(response);
};

// ── GET /api/v1/services/salon/:salonId ───────────────────────────────

export const getSalonServices = async (req, res) => {
  const { salonId } = req.params;

  if (!validateUUID(salonId)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid salon ID format', {}, 400);
  }

  // Check salon exists
  const salon = await SalonModel.findById(salonId);
  if (!salon) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Salon not found', {}, 404);
  }

  const services = await ServiceModel.findBySalonId(salonId);

  const formatted = services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    price: parseFloat(s.price),
    duration: s.duration,
    category: s.category,
    isActive: s.is_active,
  }));

  return res.status(200).json({
    status: 'success',
    data: formatted,
    count: formatted.length,
  });
};

// ── POST /api/v1/services/salon/:salonId ──────────────────────────────

export const createService = async (req, res) => {
  const { salonId } = req.params;
  const { name, description, price, duration, category } = req.body;

  if (!validateUUID(salonId)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid salon ID format', {}, 400);
  }

  // Check salon exists
  const salon = await SalonModel.findById(salonId);
  if (!salon) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Salon not found', {}, 404);
  }

  // Check ownership
  if (req.user.role !== 'admin' && salon.salon_owner_id !== req.user.id) {
    return errorResponse(res, ERROR_CODES.FORBIDDEN, 'You can only add services to your own salon', {}, 403);
  }

  // Validate required fields
  if (!name || price === undefined || !duration || !category) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Name, price, duration, and category are required', {}, 422);
  }

  if (parseFloat(price) < 0) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Price must be >= 0', { field: 'price' }, 422);
  }

  const service = await ServiceModel.create({
    salonId,
    name,
    description: description || null,
    price: parseFloat(price),
    duration,
    category,
  });

  // Invalidate cache
  await cacheDel(`salons:detail:${salonId}`);
  await cacheDel('services:categories');

  return createdResponse(res, {
    id: service.id,
    name: service.name,
    description: service.description,
    price: parseFloat(service.price),
    duration: service.duration,
    category: service.category,
  }, 'Service created successfully');
};

// ── PUT /api/v1/services/:id ──────────────────────────────────────────

export const updateService = async (req, res) => {
  const { id } = req.params;

  if (!validateUUID(id)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid service ID format', {}, 400);
  }

  // Find service
  const service = await ServiceModel.findById(id);
  if (!service) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Service not found', {}, 404);
  }

  // Check ownership
  const salon = await SalonModel.findById(service.salon_id);
  if (!salon) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Associated salon not found', {}, 404);
  }

  if (req.user.role !== 'admin' && salon.salon_owner_id !== req.user.id) {
    return errorResponse(res, ERROR_CODES.FORBIDDEN, 'You can only update services for your own salon', {}, 403);
  }

  const { name, description, price, duration, category } = req.body;

  if (price !== undefined && parseFloat(price) < 0) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Price must be >= 0', { field: 'price' }, 422);
  }

  const updated = await ServiceModel.update(id, {
    name,
    description,
    price: price !== undefined ? parseFloat(price) : undefined,
    duration,
    category,
  });

  // Invalidate cache
  await cacheDel(`salons:detail:${service.salon_id}`);

  return successResponse(res, {
    id: updated.id,
    name: updated.name,
    description: updated.description,
    price: parseFloat(updated.price),
    duration: updated.duration,
    category: updated.category,
  }, 'Service updated successfully');
};

// ── DELETE /api/v1/services/:id ───────────────────────────────────────

export const deleteService = async (req, res) => {
  const { id } = req.params;

  if (!validateUUID(id)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid service ID format', {}, 400);
  }

  // Find service
  const service = await ServiceModel.findById(id);
  if (!service) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Service not found', {}, 404);
  }

  // Check ownership
  const salon = await SalonModel.findById(service.salon_id);
  if (!salon) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Associated salon not found', {}, 404);
  }

  if (req.user.role !== 'admin' && salon.salon_owner_id !== req.user.id) {
    return errorResponse(res, ERROR_CODES.FORBIDDEN, 'You can only delete services for your own salon', {}, 403);
  }

  await ServiceModel.softDelete(id);

  // Invalidate cache
  await cacheDel(`salons:detail:${service.salon_id}`);
  await cacheDel('services:categories');

  return noContentResponse(res);
};
