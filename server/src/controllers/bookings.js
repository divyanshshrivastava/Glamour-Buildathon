import { BookingModel } from '../models/Booking.js';
import { SalonModel } from '../models/Salon.js';
import { ServiceModel } from '../models/Service.js';
import { OpeningHoursModel } from '../models/OpeningHours.js';
import { generateTimeSlots } from '../services/booking.js';
import { cacheGet, cacheSet, cacheDelPattern } from '../services/cache.js';
import { CACHE_TTL, ERROR_CODES, BOOKING_STATUS } from '../config/constants.js';
import {
  successResponse,
  createdResponse,
  errorResponse,
  paginatedResponse,
  getPaginationParams,
  buildPaginationMeta,
} from '../utils/response.js';
import {
  validateUUID,
  validateDate,
  validateTime,
  validateFutureDate,
  validateDateRange,
  validateTimeSlotInterval,
  validateEmail,
  validatePhone,
} from '../utils/validation.js';
import {
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail,
  sendReviewRequestEmail,
} from '../services/email.js';

// ── GET /api/v1/bookings/slots ────────────────────────────────────────

export const getSlots = async (req, res) => {
  const { salonId, date, serviceId } = req.query;

  if (!salonId || !date) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'salonId and date are required', {}, 422);
  }

  if (!validateUUID(salonId)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid salon ID format', {}, 400);
  }

  if (!validateDate(date)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid date format (YYYY-MM-DD required)', {}, 400);
  }

  if (!validateFutureDate(date)) {
    return errorResponse(res, ERROR_CODES.INVALID_SLOT, 'Cannot view slots for past dates', {}, 400);
  }

  // Cache check
  const cacheKey = `bookings:slots:${salonId}:${date}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  // Check salon exists
  const salon = await SalonModel.findById(salonId);
  if (!salon) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Salon not found', {}, 404);
  }

  // Get opening hours and bookings
  const openingHours = await OpeningHoursModel.findBySalonId(salonId);
  const existingBookings = await BookingModel.getBookingsForDate(salonId, date);

  // Get service duration if serviceId provided
  let serviceDuration = 30;
  if (serviceId && validateUUID(serviceId)) {
    const service = await ServiceModel.findById(serviceId);
    if (service && service.duration) {
      const durationMatch = service.duration.match(/(\d+)/);
      if (durationMatch) {
        serviceDuration = parseInt(durationMatch[1]);
      }
    }
  }

  const slots = generateTimeSlots({
    openingHours,
    existingBookings,
    date,
    serviceDuration,
  });

  const response = {
    status: 'success',
    date,
    salonId,
    data: slots,
    count: slots.length,
  };

  await cacheSet(cacheKey, response, CACHE_TTL.BOOKING_SLOTS);

  return res.status(200).json(response);
};

// ── GET /api/v1/bookings ──────────────────────────────────────────────

export const getUserBookings = async (req, res) => {
  const { page, limit, offset } = getPaginationParams(req.query);
  const status = req.query.status || null;

  const bookings = await BookingModel.findByCustomerId(req.user.id, { status });
  const total = bookings.length;
  const paginated = bookings.slice(offset, offset + limit);

  // Enrich with salon and service info
  const enriched = await Promise.all(
    paginated.map(async (b) => {
      const [salon, service] = await Promise.all([
        SalonModel.findById(b.salon_id),
        ServiceModel.findById(b.service_id),
      ]);

      return {
        id: b.id,
        salonId: b.salon_id,
        salon: salon ? { id: salon.id, name: salon.name, phone: salon.phone } : null,
        serviceId: b.service_id,
        service: service ? { id: service.id, name: service.name, price: parseFloat(service.price), duration: service.duration } : null,
        date: b.booking_date,
        time: b.booking_time,
        status: b.status,
        customerName: b.customer_name,
        customerEmail: b.customer_email,
        notes: b.notes,
        createdAt: b.created_at,
        updatedAt: b.updated_at,
      };
    }),
  );

  const pagination = buildPaginationMeta(page, limit, total);

  return res.status(200).json({
    status: 'success',
    data: enriched,
    pagination,
  });
};

// ── GET /api/v1/bookings/:id ──────────────────────────────────────────

export const getBookingById = async (req, res) => {
  const { id } = req.params;

  if (!validateUUID(id)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid booking ID format', {}, 400);
  }

  const booking = await BookingModel.findById(id);
  if (!booking) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Booking not found', {}, 404);
  }

  // Authorization: customer, salon owner, or admin
  const salon = await SalonModel.findById(booking.salon_id);
  const isCustomer = booking.customer_id === req.user.id;
  const isOwner = salon && salon.salon_owner_id === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isCustomer && !isOwner && !isAdmin) {
    return errorResponse(res, ERROR_CODES.FORBIDDEN, 'You do not have access to this booking', {}, 403);
  }

  const service = await ServiceModel.findById(booking.service_id);

  return successResponse(res, {
    id: booking.id,
    salonId: booking.salon_id,
    salon: salon ? { id: salon.id, name: salon.name, phone: salon.phone } : null,
    serviceId: booking.service_id,
    service: service ? { id: service.id, name: service.name, price: parseFloat(service.price), duration: service.duration } : null,
    date: booking.booking_date,
    time: booking.booking_time,
    status: booking.status,
    customerName: booking.customer_name,
    customerEmail: booking.customer_email,
    customerPhone: booking.customer_phone,
    notes: booking.notes,
    cancellationReason: booking.cancellation_reason,
    cancelledBy: booking.cancelled_by,
    cancelledAt: booking.cancelled_at,
    createdAt: booking.created_at,
    updatedAt: booking.updated_at,
  });
};

// ── POST /api/v1/bookings ─────────────────────────────────────────────

export const createBooking = async (req, res) => {
  const { salonId, serviceId, date, time, customerName, customerEmail, customerPhone, notes } = req.body;

  // Validate required fields
  if (!salonId || !serviceId || !date || !time || !customerName || !customerEmail || !customerPhone) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'salonId, serviceId, date, time, customerName, customerEmail, and customerPhone are required', {}, 422);
  }

  if (!validateUUID(salonId) || !validateUUID(serviceId)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid salonId or serviceId format', {}, 400);
  }

  if (!validateDate(date) || !validateFutureDate(date)) {
    return errorResponse(res, ERROR_CODES.INVALID_SLOT, 'Invalid or past date', {}, 400);
  }

  if (!validateDateRange(date)) {
    return errorResponse(res, ERROR_CODES.INVALID_SLOT, 'Bookings can only be made up to 90 days in advance', {}, 400);
  }

  if (!validateTime(time)) {
    return errorResponse(res, ERROR_CODES.INVALID_SLOT, 'Invalid time format (HH:MM required)', {}, 400);
  }

  if (!validateEmail(customerEmail)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid email format', { field: 'customerEmail' }, 422);
  }

  // Check salon exists
  const salon = await SalonModel.findById(salonId);
  if (!salon) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Salon not found', {}, 404);
  }

  // Check service exists and belongs to salon
  const service = await ServiceModel.findById(serviceId);
  if (!service || service.salon_id !== salonId) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Service not found for this salon', {}, 404);
  }

  // Check slot availability
  const isAvailable = await BookingModel.checkAvailability(salonId, date, time);
  if (!isAvailable) {
    return errorResponse(res, ERROR_CODES.SLOT_ALREADY_BOOKED, 'This time slot is no longer available', {}, 409);
  }

  // Create booking
  const booking = await BookingModel.create({
    salonId,
    serviceId,
    customerId: req.user?.id || null,
    bookingDate: date,
    bookingTime: time,
    duration: service.duration,
    customerName,
    customerEmail,
    customerPhone,
    notes: notes || null,
  });

  // Send confirmation email
  await sendBookingConfirmationEmail(customerEmail, booking, salon, service);

  // Invalidate slot cache
  await cacheDelPattern(`bookings:slots:${salonId}:*`);

  return createdResponse(res, {
    id: booking.id,
    salonId: booking.salon_id,
    serviceId: booking.service_id,
    date: booking.booking_date,
    time: booking.booking_time,
    status: booking.status,
    customerName: booking.customer_name,
    customerEmail: booking.customer_email,
    createdAt: booking.created_at,
  }, 'Booking confirmed! Check your email for details.');
};

// ── PUT /api/v1/bookings/:id/cancel ───────────────────────────────────

export const cancelBooking = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!validateUUID(id)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid booking ID format', {}, 400);
  }

  const booking = await BookingModel.findById(id);
  if (!booking) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Booking not found', {}, 404);
  }

  // Check if already cancelled or completed
  if (booking.status === BOOKING_STATUS.CANCELLED) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Booking is already cancelled', {}, 409);
  }
  if (booking.status === BOOKING_STATUS.COMPLETED) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Cannot cancel a completed booking', {}, 409);
  }

  // Determine who is cancelling
  const salon = await SalonModel.findById(booking.salon_id);
  const isCustomer = booking.customer_id === req.user.id;
  const isOwner = salon && salon.salon_owner_id === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isCustomer && !isOwner && !isAdmin) {
    return errorResponse(res, ERROR_CODES.FORBIDDEN, 'You cannot cancel this booking', {}, 403);
  }

  // 24-hour cancellation rule for customers
  if (isCustomer && !isOwner && !isAdmin) {
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
    const hoursUntilBooking = (bookingDateTime - new Date()) / (1000 * 60 * 60);

    if (hoursUntilBooking < 24) {
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        'Customers can only cancel bookings more than 24 hours before the appointment',
        {},
        400,
      );
    }
  }

  let cancelledBy = 'customer';
  if (isOwner) cancelledBy = 'salon';
  if (isAdmin) cancelledBy = 'admin';

  const updated = await BookingModel.updateStatus(
    id,
    BOOKING_STATUS.CANCELLED,
    cancelledBy,
    reason || null,
  );

  // Send cancellation email
  const service = await ServiceModel.findById(booking.service_id);
  await sendBookingCancellationEmail(
    booking.customer_email,
    booking,
    salon || { name: 'Unknown Salon' },
    service || { name: 'Unknown Service' },
    reason,
  );

  // Invalidate slot cache
  await cacheDelPattern(`bookings:slots:${booking.salon_id}:*`);

  return successResponse(res, {
    id: updated.id,
    status: updated.status,
    cancelledBy: updated.cancelled_by,
    cancellationReason: updated.cancellation_reason,
    cancelledAt: updated.cancelled_at,
  }, 'Booking cancelled successfully');
};

// ── PUT /api/v1/bookings/:id/confirm ──────────────────────────────────

export const confirmBooking = async (req, res) => {
  const { id } = req.params;

  if (!validateUUID(id)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid booking ID format', {}, 400);
  }

  const booking = await BookingModel.findById(id);
  if (!booking) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Booking not found', {}, 404);
  }

  if (booking.status !== BOOKING_STATUS.PENDING) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, `Cannot confirm a booking with status: ${booking.status}`, {}, 400);
  }

  // Check salon ownership
  const salon = await SalonModel.findById(booking.salon_id);
  if (!salon || (req.user.role !== 'admin' && salon.salon_owner_id !== req.user.id)) {
    return errorResponse(res, ERROR_CODES.FORBIDDEN, 'Only the salon owner can confirm bookings', {}, 403);
  }

  const updated = await BookingModel.updateStatus(id, BOOKING_STATUS.CONFIRMED);

  // Send confirmation email
  const service = await ServiceModel.findById(booking.service_id);
  await sendBookingConfirmationEmail(booking.customer_email, updated, salon, service || { name: 'Service', duration: '', price: 0 });

  return successResponse(res, {
    id: updated.id,
    status: updated.status,
    updatedAt: updated.updated_at,
  }, 'Booking confirmed successfully');
};

// ── PUT /api/v1/bookings/:id/complete ─────────────────────────────────

export const completeBooking = async (req, res) => {
  const { id } = req.params;

  if (!validateUUID(id)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid booking ID format', {}, 400);
  }

  const booking = await BookingModel.findById(id);
  if (!booking) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Booking not found', {}, 404);
  }

  if (booking.status !== BOOKING_STATUS.CONFIRMED) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, `Cannot complete a booking with status: ${booking.status}`, {}, 400);
  }

  // Check salon ownership
  const salon = await SalonModel.findById(booking.salon_id);
  if (!salon || (req.user.role !== 'admin' && salon.salon_owner_id !== req.user.id)) {
    return errorResponse(res, ERROR_CODES.FORBIDDEN, 'Only the salon owner can complete bookings', {}, 403);
  }

  // Check date is on or after appointment
  const bookingDate = new Date(booking.booking_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (bookingDate > today) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Cannot mark booking as complete before the appointment date', {}, 400);
  }

  const updated = await BookingModel.updateStatus(id, BOOKING_STATUS.COMPLETED);

  // Send review request email
  await sendReviewRequestEmail(booking.customer_email, booking.customer_name, salon);

  return successResponse(res, {
    id: updated.id,
    status: updated.status,
    updatedAt: updated.updated_at,
  }, 'Booking marked as completed');
};

// ── GET /api/v1/bookings/salon/:salonId ───────────────────────────────

export const getSalonBookings = async (req, res) => {
  const { salonId } = req.params;
  const { page, limit, offset } = getPaginationParams(req.query);

  if (!validateUUID(salonId)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid salon ID format', {}, 400);
  }

  // Check salon ownership
  const salon = await SalonModel.findById(salonId);
  if (!salon) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Salon not found', {}, 404);
  }

  if (req.user.role !== 'admin' && salon.salon_owner_id !== req.user.id) {
    return errorResponse(res, ERROR_CODES.FORBIDDEN, 'You can only view bookings for your own salon', {}, 403);
  }

  const status = req.query.status || null;
  const date = req.query.date || null;

  const bookings = await BookingModel.findBySalonId(salonId, { status, date });
  const total = bookings.length;
  const paginated = bookings.slice(offset, offset + limit);

  // Enrich with service info
  const enriched = await Promise.all(
    paginated.map(async (b) => {
      const service = await ServiceModel.findById(b.service_id);
      return {
        id: b.id,
        serviceId: b.service_id,
        service: service ? { id: service.id, name: service.name, price: parseFloat(service.price), duration: service.duration } : null,
        date: b.booking_date,
        time: b.booking_time,
        status: b.status,
        customerName: b.customer_name,
        customerEmail: b.customer_email,
        customerPhone: b.customer_phone,
        notes: b.notes,
        createdAt: b.created_at,
      };
    }),
  );

  const pagination = buildPaginationMeta(page, limit, total);

  return res.status(200).json({
    status: 'success',
    data: enriched,
    pagination,
  });
};
