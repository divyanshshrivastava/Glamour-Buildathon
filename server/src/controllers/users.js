import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import { ERROR_CODES } from '../config/constants.js';
import {
  successResponse,
  errorResponse,
} from '../utils/response.js';
import { validatePassword, validatePhone } from '../utils/validation.js';

const SALT_ROUNDS = 10;

// ── PUT /api/v1/users/profile ─────────────────────────────────────────

export const updateProfile = async (req, res) => {
  const { firstName, lastName, phone, avatar } = req.body;

  // Validate phone if provided
  if (phone && !validatePhone(phone)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid phone format (E.164 required)', { field: 'phone' }, 422);
  }

  if (firstName && firstName.length > 100) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'First name must be at most 100 characters', { field: 'firstName' }, 422);
  }

  if (lastName && lastName.length > 100) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Last name must be at most 100 characters', { field: 'lastName' }, 422);
  }

  const updated = await UserModel.update(req.user.id, {
    firstName,
    lastName,
    phone,
    avatar,
  });

  if (!updated) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'User not found', {}, 404);
  }

  return successResponse(res, {
    id: updated.id,
    email: updated.email,
    firstName: updated.first_name,
    lastName: updated.last_name,
    phone: updated.phone,
    avatar: updated.avatar,
    role: updated.role,
    createdAt: updated.created_at,
    updatedAt: updated.updated_at,
  }, 'Profile updated successfully');
};

// ── PUT /api/v1/users/password ────────────────────────────────────────

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Current password and new password are required', {}, 422);
  }

  if (!validatePassword(newPassword)) {
    return errorResponse(
      res,
      ERROR_CODES.INVALID_PASSWORD,
      'New password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 digit, and 1 special character',
      { field: 'newPassword' },
      422,
    );
  }

  // Get user with password
  const user = await UserModel.findByEmail(req.user.email);
  if (!user) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'User not found', {}, 404);
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return errorResponse(res, ERROR_CODES.INVALID_CREDENTIALS, 'Current password is incorrect', {}, 401);
  }

  // Hash and update new password
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await UserModel.updatePassword(req.user.id, hashedPassword);

  return successResponse(res, null, 'Password changed successfully');
};
