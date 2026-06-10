// User Roles
export const ROLES = {
  CUSTOMER: 'customer',
  SALON_OWNER: 'salonOwner',
  ADMIN: 'admin',
};

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Review Status
export const REVIEW_STATUS = {
  APPROVED: 'approved',
  PENDING: 'pending',
  REJECTED: 'rejected',
};

// Partner Application Status
export const PARTNER_APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Days of Week
export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

// Amenities
export const AMENITIES = [
  'Wi-Fi',
  'Parking',
  'A/C',
  'Wheelchair Accessible',
  'Waiting Area',
  'Restrooms',
  'Refreshments',
  'Kids Play Area',
];

// Service Categories
export const SERVICE_CATEGORIES = [
  'Haircut',
  'Hair Treatment',
  'Coloring',
  'Styling',
  'Facial',
  'Massage',
  'Manicure',
  'Pedicure',
];

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Cache TTL (in seconds)
export const CACHE_TTL = {
  FEATURED_SALONS: 300, // 5 minutes
  SALONS_LIST: 300, // 5 minutes
  SALON_DETAIL: 300, // 5 minutes
  SERVICES_CATEGORIES: 3600, // 1 hour
  REVIEWS_TESTIMONIALS: 3600, // 1 hour
  BOOKING_SLOTS: 120, // 2 minutes
};

// Error Codes
export const ERROR_CODES = {
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  SLOT_ALREADY_BOOKED: 'SLOT_ALREADY_BOOKED',
  INVALID_SLOT: 'INVALID_SLOT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DUPLICATE_REVIEW: 'DUPLICATE_REVIEW',
};
