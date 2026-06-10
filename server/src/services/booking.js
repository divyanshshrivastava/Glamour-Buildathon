import { DAYS_OF_WEEK } from '../config/constants.js';

/**
 * Generate available time slots for a salon on a given date.
 *
 * @param {object} params
 * @param {object[]} params.openingHours — Salon's opening hours from DB
 * @param {object[]} params.existingBookings — Bookings for the date (with booking_time, status)
 * @param {string} params.date — YYYY-MM-DD
 * @param {number} [params.serviceDuration] — Service duration in minutes (default 30)
 * @returns {object[]} Array of { time, available }
 */
export const generateTimeSlots = ({
  openingHours,
  existingBookings,
  date,
  serviceDuration = 30,
}) => {
  // Find the day of the week for the given date
  const dateObj = new Date(date + 'T00:00:00');
  const dayIndex = dateObj.getDay(); // 0 = Sunday
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[dayIndex];

  // Find opening hours for this day
  const dayHours = openingHours.find(
    (h) => h.day === dayName || h.day === dayName.toLowerCase(),
  );

  if (!dayHours || dayHours.closed) {
    return []; // Salon is closed on this day
  }

  const openTime = dayHours.open_time || dayHours.open;
  const closeTime = dayHours.close_time || dayHours.close;

  if (!openTime || !closeTime) {
    return [];
  }

  // Parse times
  const [openHour, openMin] = openTime.split(':').map(Number);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);

  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  // Build set of booked times
  const bookedTimes = new Set(
    existingBookings
      .filter((b) => b.status !== 'cancelled')
      .map((b) => {
        const timeStr = typeof b.booking_time === 'string'
          ? b.booking_time
          : b.booking_time?.toString();
        // Normalize to HH:MM (handle HH:MM:SS from DB)
        return timeStr ? timeStr.substring(0, 5) : null;
      })
      .filter(Boolean),
  );

  // Check if date is today — filter out past slots
  const now = new Date();
  const isToday =
    dateObj.getFullYear() === now.getFullYear() &&
    dateObj.getMonth() === now.getMonth() &&
    dateObj.getDate() === now.getDate();

  const currentMinutes = isToday ? now.getHours() * 60 + now.getMinutes() : 0;

  // Generate 30-minute interval slots
  const slots = [];
  for (let m = openMinutes; m < closeMinutes; m += 30) {
    const hour = Math.floor(m / 60);
    const minute = m % 60;
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    // Skip past times for today
    if (isToday && m <= currentMinutes) {
      continue;
    }

    // Check if enough time for the service before closing
    if (m + serviceDuration > closeMinutes) {
      continue;
    }

    const available = !bookedTimes.has(time);
    const slot = { time, available };

    if (!available) {
      const booking = existingBookings.find((b) => {
        const bt = typeof b.booking_time === 'string'
          ? b.booking_time.substring(0, 5)
          : b.booking_time?.toString().substring(0, 5);
        return bt === time && b.status !== 'cancelled';
      });
      if (booking) {
        slot.bookedBy = {
          bookingId: booking.id,
          customerName: booking.customer_name,
        };
      }
    }

    slots.push(slot);
  }

  return slots;
};
