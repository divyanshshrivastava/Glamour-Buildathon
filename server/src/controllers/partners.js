import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PartnerApplicationModel } from '../models/Partner.js';
import { UserModel } from '../models/User.js';
import { SalonModel } from '../models/Salon.js';
import { ERROR_CODES, ROLES } from '../config/constants.js';
import {
  successResponse,
  createdResponse,
  errorResponse,
} from '../utils/response.js';
import { validateUUID, validateEmail, validatePhone } from '../utils/validation.js';
import { sendPartnerApplicationEmail } from '../services/email.js';

const SALT_ROUNDS = 10;

// ── POST /api/v1/partners/apply ───────────────────────────────────────

export const apply = async (req, res) => {
  const { salonName, ownerName, email, phone, city, message } = req.body;

  // Validate required fields
  if (!salonName || !ownerName || !email || !phone || !city) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'salonName, ownerName, email, phone, and city are required', {}, 422);
  }

  if (!validateEmail(email)) {
    return errorResponse(res, ERROR_CODES.INVALID_EMAIL, 'Invalid email format', { field: 'email' }, 422);
  }

  if (salonName.length < 3 || salonName.length > 255) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Salon name must be between 3 and 255 characters', { field: 'salonName' }, 422);
  }

  if (ownerName.length < 2 || ownerName.length > 100) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Owner name must be between 2 and 100 characters', { field: 'ownerName' }, 422);
  }

  // Check for duplicate application
  const existing = await PartnerApplicationModel.findByEmail(email);
  if (existing) {
    return errorResponse(res, ERROR_CODES.EMAIL_ALREADY_EXISTS, 'An application with this email already exists', { field: 'email' }, 409);
  }

  const application = await PartnerApplicationModel.create({
    salonName,
    ownerName,
    email,
    phone,
    city,
    message: message || null,
  });

  // Send confirmation email
  await sendPartnerApplicationEmail(email, ownerName, 'pending');

  return createdResponse(res, {
    id: application.id,
    status: application.status,
    createdAt: application.created_at,
  }, 'Thank you for applying! We will review your application and get back to you within 3-5 business days.');
};

// ── GET /api/v1/partners/apply/:id ────────────────────────────────────

export const getStatus = async (req, res) => {
  const { id } = req.params;

  if (!validateUUID(id)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid application ID format', {}, 400);
  }

  const application = await PartnerApplicationModel.findById(id);
  if (!application) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Application not found', {}, 404);
  }

  const statusMessages = {
    pending: 'Your application is under review',
    approved: 'Your application has been approved! Check your email for login details.',
    rejected: 'Your application has been declined.',
  };

  return successResponse(res, {
    id: application.id,
    salonName: application.salon_name,
    status: application.status,
    message: statusMessages[application.status] || 'Unknown status',
    rejectionReason: application.rejection_reason || null,
    createdAt: application.created_at,
    reviewedAt: application.reviewed_at,
  });
};

// ── POST /api/v1/partners/:id/approve ─────────────────────────────────

export const approve = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!validateUUID(id)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid application ID format', {}, 400);
  }

  const application = await PartnerApplicationModel.findById(id);
  if (!application) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Application not found', {}, 404);
  }

  if (application.status !== 'pending') {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, `Application is already ${application.status}`, {}, 400);
  }

  // Generate a default password if none provided
  const userPassword = password || `Glamour${Date.now().toString().slice(-6)}!`;
  const hashedPassword = await bcrypt.hash(userPassword, SALT_ROUNDS);

  // Create user account with salonOwner role
  const user = await UserModel.create({
    email: application.email,
    password: hashedPassword,
    firstName: application.owner_name.split(' ')[0],
    lastName: application.owner_name.split(' ').slice(1).join(' ') || null,
    phone: application.phone,
    role: ROLES.SALON_OWNER,
  });

  // Set email as verified (admin-approved)
  await UserModel.verifyEmail(user.id);

  // Generate slug for salon
  const slug = application.salon_name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() + '-' + Date.now().toString().slice(-4);

  // Create salon
  const salon = await SalonModel.create({
    name: application.salon_name,
    slug,
    tagline: null,
    description: null,
    email: application.email,
    phone: application.phone,
    website: null,
    address: application.city, // Placeholder
    city: application.city,
    coordinates: null,
    coverImage: null,
    gallery: [],
    amenities: [],
    salonOwnerId: user.id,
  });

  // Update application status
  await PartnerApplicationModel.approve(id, req.user.id);

  // Send welcome email
  await sendPartnerApplicationEmail(application.email, application.owner_name, 'approved');

  return successResponse(res, {
    salonId: salon.id,
    userId: user.id,
  }, 'Application approved. Salon account created.');
};

// ── POST /api/v1/partners/:id/reject ──────────────────────────────────

export const reject = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!validateUUID(id)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid application ID format', {}, 400);
  }

  const application = await PartnerApplicationModel.findById(id);
  if (!application) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Application not found', {}, 404);
  }

  if (application.status !== 'pending') {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, `Application is already ${application.status}`, {}, 400);
  }

  await PartnerApplicationModel.reject(id, reason || 'No reason provided', req.user.id);

  // Send rejection email
  await sendPartnerApplicationEmail(application.email, application.owner_name, 'rejected', reason);

  return successResponse(res, null, 'Application rejected');
};
