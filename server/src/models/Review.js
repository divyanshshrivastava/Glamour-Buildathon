import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const ReviewModel = {
  async create(reviewData) {
    const {
      salonId,
      customerId = null,
      bookingId = null,
      rating,
      title,
      text,
      authorName,
      authorInitials,
    } = reviewData;

    const id = uuidv4();
    const now = new Date();

    const result = await pool.query(
      `INSERT INTO reviews 
       (id, salon_id, customer_id, booking_id, rating, title, text, author_name, author_initials, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        id,
        salonId,
        customerId,
        bookingId,
        rating,
        title,
        text,
        authorName,
        authorInitials,
        now,
        now,
      ]
    );

    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
    return result.rows[0];
  },

  async findBySalonId(salonId, filters = {}) {
    let query = 'SELECT * FROM reviews WHERE salon_id = $1 AND approved = true';
    const params = [salonId];
    let paramCount = 2;

    if (filters.minRating) {
      query += ` AND rating >= $${paramCount}`;
      params.push(filters.minRating);
      paramCount++;
    }

    // Add sorting
    let sortBy = filters.sort || 'recent';
    if (sortBy === 'helpful') {
      query += ' ORDER BY helpful DESC';
    } else if (sortBy === 'rating') {
      query += ' ORDER BY rating DESC';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const result = await pool.query(query, params);
    return result.rows;
  },

  async getTestimonials(limit = 6, minRating = 4) {
    const result = await pool.query(
      `SELECT r.*, s.name as salon_name 
       FROM reviews r
       JOIN salons s ON r.salon_id = s.id
       WHERE r.approved = true AND r.rating >= $1
       ORDER BY r.created_at DESC
       LIMIT $2`,
      [minRating, limit]
    );

    return result.rows;
  },

  async getRatingAggregate(salonId) {
    const result = await pool.query(
      `SELECT 
        AVG(rating)::DECIMAL(2,1) as average_rating,
        COUNT(*) as total_reviews,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1
       FROM reviews 
       WHERE salon_id = $1 AND approved = true`,
      [salonId]
    );

    const row = result.rows[0];
    return {
      averageRating: parseFloat(row.average_rating) || 0,
      totalReviews: parseInt(row.total_reviews) || 0,
      ratingDistribution: {
        5: parseInt(row.rating_5) || 0,
        4: parseInt(row.rating_4) || 0,
        3: parseInt(row.rating_3) || 0,
        2: parseInt(row.rating_2) || 0,
        1: parseInt(row.rating_1) || 0,
      },
    };
  },

  async updateHelpful(id, helpful) {
    const now = new Date();

    const result = await pool.query(
      `UPDATE reviews 
       SET helpful = $1, updated_at = $2
       WHERE id = $3
       RETURNING *`,
      [helpful, now, id]
    );

    return result.rows[0];
  },

  async approve(id) {
    const now = new Date();

    const result = await pool.query(
      `UPDATE reviews 
       SET approved = true, updated_at = $1
       WHERE id = $2
       RETURNING *`,
      [now, id]
    );

    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
  },

  async checkDuplicateByBooking(bookingId) {
    const result = await pool.query('SELECT COUNT(*) as count FROM reviews WHERE booking_id = $1', [
      bookingId,
    ]);

    return result.rows[0].count > 0;
  },
};
