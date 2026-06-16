// Email validation pattern
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation pattern (min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char)
export const PASSWORD_PATTERN =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

// E.164 phone format pattern
export const PHONE_PATTERN = /^\+[1-9]\d{1,14}$/;

// Normalize phone: strip spaces, dashes, parentheses, dots
export const normalizePhone = (phone) => {
  if (!phone) return phone;
  let normalized = phone.replace(/[\s\-\(\)\.]/g, '');
  // 10-digit number without country code → assume India (+91)
  if (/^\d{10}$/.test(normalized)) {
    normalized = '+91' + normalized;
  }
  // Has digits with no '+' prefix (e.g. "919876543210") → prepend '+'
  if (!normalized.startsWith('+') && normalized.length > 10) {
    normalized = '+' + normalized;
  }
  return normalized;
};

// Time format pattern (HH:MM)
export const TIME_PATTERN = /^([0-1]\d|2[0-3]):([0-5]\d)$/;

// Date format pattern (YYYY-MM-DD)
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// UUID pattern
export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// URL pattern
export const URL_PATTERN =
  /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

export const validateEmail = (email) => {
  return EMAIL_PATTERN.test(email) && email.length <= 254;
};

export const validatePassword = (password) => {
  return PASSWORD_PATTERN.test(password);
};

export const validatePhone = (phone) => {
  return PHONE_PATTERN.test(normalizePhone(phone));
};

export const validateTime = (time) => {
  return TIME_PATTERN.test(time);
};

export const validateDate = (date) => {
  return DATE_PATTERN.test(date);
};

export const validateUUID = (id) => {
  return UUID_PATTERN.test(id);
};

export const validateURL = (url) => {
  return URL_PATTERN.test(url);
};

export const validateTimeSlotInterval = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return minutes % 30 === 0; // Must be in 30-minute intervals
};

export const validateFutureDate = (date) => {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate >= today;
};

export const validateDateRange = (date, maxDaysFuture = 90) => {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + maxDaysFuture);

  return selectedDate >= today && selectedDate <= maxDate;
};
