import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UserModel } from '../models/User.js';
import pool from '../config/database.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import {
  validateEmail,
  validatePassword,
  validatePhone,
} from '../utils/validation.js';
import {
  successResponse,
  createdResponse,
  errorResponse,
} from '../utils/response.js';
import { ERROR_CODES, ROLES } from '../config/constants.js';
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from '../services/email.js';

const SALT_ROUNDS = 10;

// ── POST /api/v1/auth/register ────────────────────────────────────────

export const register = async (req, res) => {
  const { email, password, firstName, lastName, phone } = req.body;

  // Validate required fields
  if (!email || !password) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Email and password are required', {}, 422);
  }

  if (!validateEmail(email)) {
    return errorResponse(res, ERROR_CODES.INVALID_EMAIL, 'Invalid email format', { field: 'email' }, 422);
  }

  if (!validatePassword(password)) {
    return errorResponse(
      res,
      ERROR_CODES.INVALID_PASSWORD,
      'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 digit, and 1 special character',
      { field: 'password' },
      422,
    );
  }

  if (phone && !validatePhone(phone)) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid phone format (E.164 required)', { field: 'phone' }, 422);
  }

  // Check if email already exists
  const existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    return errorResponse(res, ERROR_CODES.EMAIL_ALREADY_EXISTS, 'An account with this email already exists', { field: 'email' }, 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const user = await UserModel.create({
    email,
    password: hashedPassword,
    firstName: firstName || null,
    lastName: lastName || null,
    phone: phone || null,
    role: ROLES.CUSTOMER,
  });

  // Generate email verification token
  const verificationToken = uuidv4();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await pool.query(
    'INSERT INTO email_verification_tokens (id, user_id, token, expires_at, created_at) VALUES ($1, $2, $3, $4, $5)',
    [uuidv4(), user.id, verificationToken, expiresAt, new Date()],
  );

  // Send verification email
  await sendVerificationEmail(email, firstName || 'there', verificationToken);

  return createdResponse(res, {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
  }, 'Registration successful. Check your email to verify your account.');
};

// ── POST /api/v1/auth/login ───────────────────────────────────────────

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Email and password are required', {}, 422);
  }

  // Find user (includes password hash)
  const user = await UserModel.findByEmail(email);
  if (!user) {
    return errorResponse(res, ERROR_CODES.INVALID_CREDENTIALS, 'Invalid email or password', {}, 401);
  }

  // Check account is active
  if (!user.active) {
    return errorResponse(res, ERROR_CODES.ACCOUNT_DISABLED, 'This account has been disabled', {}, 403);
  }

  // Check email verified
  if (!user.email_verified) {
    return errorResponse(res, ERROR_CODES.EMAIL_NOT_VERIFIED, 'Please verify your email before logging in', {}, 403);
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return errorResponse(res, ERROR_CODES.INVALID_CREDENTIALS, 'Invalid email or password', {}, 401);
  }

  // Generate tokens
  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    salonId: user.salon_id || null,
  };

  const token = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken({ id: user.id });

  // Create session
  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + (parseInt(process.env.JWT_EXPIRE) || 3600) * 1000);

  await pool.query(
    'INSERT INTO sessions (id, user_id, token, refresh_token, expires_at, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
    [sessionId, user.id, token, refreshToken, expiresAt, new Date()],
  );

  // Update last login
  await UserModel.updateLastLogin(user.id);

  return successResponse(res, {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    salonId: user.salon_id,
    token,
    refreshToken,
    expiresIn: parseInt(process.env.JWT_EXPIRE) || 3600,
  });
};

// ── POST /api/v1/auth/logout ──────────────────────────────────────────

export const logout = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    // Delete session
    await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
  }

  return successResponse(res, null, 'Logged out successfully');
};

// ── POST /api/v1/auth/refresh ─────────────────────────────────────────

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Refresh token is required', {}, 422);
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    return errorResponse(res, ERROR_CODES.UNAUTHORIZED, 'Invalid or expired refresh token', {}, 401);
  }

  // Find session
  const sessionResult = await pool.query(
    'SELECT * FROM sessions WHERE refresh_token = $1 AND user_id = $2',
    [refreshToken, decoded.id],
  );

  if (sessionResult.rows.length === 0) {
    return errorResponse(res, ERROR_CODES.UNAUTHORIZED, 'Session not found', {}, 401);
  }

  // Get user
  const user = await UserModel.findById(decoded.id);
  if (!user || !user.active) {
    return errorResponse(res, ERROR_CODES.UNAUTHORIZED, 'User not found or disabled', {}, 401);
  }

  // Generate new token
  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    salonId: user.salon_id || null,
  };

  const newToken = generateToken(tokenPayload);
  const expiresAt = new Date(Date.now() + (parseInt(process.env.JWT_EXPIRE) || 3600) * 1000);

  // Update session
  await pool.query(
    'UPDATE sessions SET token = $1, expires_at = $2 WHERE refresh_token = $3',
    [newToken, expiresAt, refreshToken],
  );

  return successResponse(res, {
    token: newToken,
    expiresIn: parseInt(process.env.JWT_EXPIRE) || 3600,
  });
};

// ── POST /api/v1/auth/forgot-password ─────────────────────────────────

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Email is required', {}, 422);
  }

  // Always return success (security — don't reveal if email exists)
  const user = await UserModel.findByEmail(email);

  if (user) {
    // Delete any existing reset tokens for this user
    await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id]);

    // Generate reset token
    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'INSERT INTO password_reset_tokens (id, user_id, token, expires_at, created_at) VALUES ($1, $2, $3, $4, $5)',
      [uuidv4(), user.id, resetToken, expiresAt, new Date()],
    );

    // Send email
    await sendPasswordResetEmail(email, user.first_name || 'there', resetToken);
  }

  return successResponse(res, null, 'If an account with that email exists, a password reset link has been sent.');
};

// ── POST /api/v1/auth/reset-password ──────────────────────────────────

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Token and new password are required', {}, 422);
  }

  if (!validatePassword(password)) {
    return errorResponse(
      res,
      ERROR_CODES.INVALID_PASSWORD,
      'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 digit, and 1 special character',
      { field: 'password' },
      422,
    );
  }

  // Find token
  const tokenResult = await pool.query(
    'SELECT * FROM password_reset_tokens WHERE token = $1',
    [token],
  );

  if (tokenResult.rows.length === 0) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid or expired reset token', {}, 400);
  }

  const resetRecord = tokenResult.rows[0];

  // Check expiry
  if (new Date() > new Date(resetRecord.expires_at)) {
    await pool.query('DELETE FROM password_reset_tokens WHERE id = $1', [resetRecord.id]);
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Reset token has expired', {}, 400);
  }

  // Hash new password and update user
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  await UserModel.updatePassword(resetRecord.user_id, hashedPassword);

  // Delete used token
  await pool.query('DELETE FROM password_reset_tokens WHERE id = $1', [resetRecord.id]);

  // Invalidate all sessions for this user (force re-login)
  await pool.query('DELETE FROM sessions WHERE user_id = $1', [resetRecord.user_id]);

  return successResponse(res, null, 'Password reset successfully. Please log in with your new password.');
};

// ── POST /api/v1/auth/verify-email ────────────────────────────────────

export const verifyEmail = async (req, res) => {
  const token = req.query.token || req.body.token;

  if (!token) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Verification token is required', {}, 422);
  }

  // Find token
  const tokenResult = await pool.query(
    'SELECT * FROM email_verification_tokens WHERE token = $1',
    [token],
  );

  if (tokenResult.rows.length === 0) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Invalid or expired verification token', {}, 400);
  }

  const verificationRecord = tokenResult.rows[0];

  // Check expiry
  if (new Date() > new Date(verificationRecord.expires_at)) {
    await pool.query('DELETE FROM email_verification_tokens WHERE id = $1', [verificationRecord.id]);
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Verification token has expired', {}, 400);
  }

  // Verify email
  await UserModel.verifyEmail(verificationRecord.user_id);

  // Delete used token
  await pool.query('DELETE FROM email_verification_tokens WHERE id = $1', [verificationRecord.id]);

  // Send welcome email
  const user = await UserModel.findById(verificationRecord.user_id);
  if (user) {
    await sendWelcomeEmail(user.email, user.first_name || 'there');
  }

  return successResponse(res, null, 'Email verified successfully. You can now log in.');
};

// ── GET /api/v1/auth/me ───────────────────────────────────────────────

export const getMe = async (req, res) => {
  const user = await UserModel.findById(req.user.id);

  if (!user) {
    return errorResponse(res, ERROR_CODES.NOT_FOUND, 'User not found', {}, 404);
  }

  return successResponse(res, {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone,
    role: user.role,
    salonId: user.salon_id,
    emailVerified: user.email_verified,
    lastLogin: user.last_login,
    createdAt: user.created_at,
  });
};
