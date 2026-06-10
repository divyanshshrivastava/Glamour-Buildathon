import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { BOOKING_STATUS } from '../config/constants.js';

export const BookingModel = {
  async create(bookingData) {
    const {
      salonId,
      serviceId,
      customerId = null,
      bookingDate,
      bookingTime,
      duration,
      customerName,
      customerEmail,
      customerPhone,
      notes = null,
    } = bookingData;

    const id = uuidv4();
    const now = new Date();
    const confirmationToken = uuidv4();

    const result = await pool.query(
      `INSERT INTO bookings 
       (id, salon_id, service_id, customer_id, booking_date, booking_time, duration, customer_name, customer_email, customer_phone, status, notes, confirmation_token, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        id,
        salonId,
        serviceId,
        customerId,
        bookingDate,
        bookingTime,
        duration,
        customerName,
        customerEmail,
        customerPhone,
        BOOKING_STATUS.PENDING,
        notes,
        confirmationToken,
        now,
        now,
      ],
    );

    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [
      id,
    ]);
    return result.rows[0];
  },

  async findByCustomerId(customerId, filters = {}) {
    let query = 'SELECT * FROM bookings WHERE customer_id = $1';
    const params = [customerId];
    let paramCount = 2;

    if (filters.status) {
      query += ` AND status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    query += ' ORDER BY booking_date DESC';

    const result = await pool.query(query, params);
    return result.rows;
  },

  async findBySalonId(salonId, filters = {}) {
    let query = 'SELECT * FROM bookings WHERE salon_id = $1';
    const params = [salonId];
    let paramCount = 2;

    if (filters.status) {
      query += ` AND status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.date) {
      query += ` AND booking_date = $${paramCount}`;
      params.push(filters.date);
      paramCount++;
    }

    query += ' ORDER BY booking_date ASC, booking_time ASC';

    const result = await pool.query(query, params);
    return result.rows;
  },

  async updateStatus(
    id,
    status,
    cancelledBy = null,
    cancellationReason = null,
  ) {
    const now = new Date();

    const result = await pool.query(
      `UPDATE bookings 
       SET status = $1, cancelled_by = $2, cancellation_reason = $3, cancelled_at = $4, updated_at = $5
       WHERE id = $6
       RETURNING *`,
      [
        status,
        cancelledBy,
        cancellationReason,
        status === BOOKING_STATUS.CANCELLED ? now : null,
        now,
        id,
      ],
    );

    return result.rows[0];
  },

  async checkAvailability(salonId, bookingDate, bookingTime, duration) {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM bookings 
       WHERE salon_id = $1 
       AND booking_date = $2 
       AND booking_time = $3 
       AND status != $4`,
      [salonId, bookingDate, bookingTime, BOOKING_STATUS.CANCELLED],
    );

    return result.rows[0].count === 0;
  },

  async getBookingsForDate(salonId, bookingDate) {
    const result = await pool.query(
      `SELECT id, booking_time, customer_name, status FROM bookings 
       WHERE salon_id = $1 
       AND booking_date = $2
       AND status != $3
       ORDER BY booking_time ASC`,
      [salonId, bookingDate, BOOKING_STATUS.CANCELLED],
    );

    return result.rows;
  },
};
