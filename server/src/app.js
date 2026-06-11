import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import dotenv from 'dotenv';

import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.js';
import salonRoutes from './routes/salons.js';
import serviceRoutes from './routes/services.js';
import bookingRoutes from './routes/bookings.js';
import reviewRoutes from './routes/reviews.js';
import partnerRoutes from './routes/partners.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
// Parse comma-separated CORS origins into an array
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// More specific rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 50000000 : 1000000, // Allow more attempts in development
  message: 'Too many login attempts, please try again later.',
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'development' ? 10000000 : 3000000, // Limit each IP to 3 registrations per hour
  message: 'Too many registrations from this IP, please try again later.',
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
const apiBasePath = process.env.API_BASE_PATH || '/api';
const apiVersion = `${apiBasePath}/v1`;

// Authentication routes
app.use(`${apiVersion}/auth`, authLimiter, authRoutes);

// Salon routes
app.use(`${apiVersion}/salons`, salonRoutes);

// Service routes
app.use(`${apiVersion}/services`, serviceRoutes);

// Booking routes
app.use(`${apiVersion}/bookings`, bookingRoutes);

// Review routes
app.use(`${apiVersion}/reviews`, reviewRoutes);

// Partner routes
app.use(`${apiVersion}/partners`, partnerRoutes);

// User routes
app.use(`${apiVersion}/users`, userRoutes);

// Admin routes
app.use(`${apiVersion}/admin`, adminRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
