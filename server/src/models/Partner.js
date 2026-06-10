import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { PARTNER_APPLICATION_STATUS } from '../config/constants.js';

export const PartnerApplicationModel = {
  async create(applicationData) {
    const { salonName, ownerName, email, phone, city, message } = applicationData;

    const id = uuidv4();
    const now = new Date();

    const result = await pool.query(
      `INSERT INTO partner_applications (id, salon_name, owner_name, email, phone, city, message, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        id,
        salonName,
        ownerName,
        email,
        phone,
        city,
        message,
        PARTNER_APPLICATION_STATUS.PENDING,
        now,
        now,
      ]
    );

    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM partner_applications WHERE id = $1', [id]);

    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM partner_applications WHERE email = $1', [email]);

    return result.rows[0];
  },

  async findAll(filters = {}) {
    let query = 'SELECT * FROM partner_applications WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  },

  async approve(id, reviewedBy) {
    const now = new Date();

    const result = await pool.query(
      `UPDATE partner_applications 
       SET status = $1, reviewed_by = $2, reviewed_at = $3, updated_at = $4
       WHERE id = $5
       RETURNING *`,
      [PARTNER_APPLICATION_STATUS.APPROVED, reviewedBy, now, now, id]
    );

    return result.rows[0];
  },

  async reject(id, rejectionReason, reviewedBy) {
    const now = new Date();

    const result = await pool.query(
      `UPDATE partner_applications 
       SET status = $1, rejection_reason = $2, reviewed_by = $3, reviewed_at = $4, updated_at = $5
       WHERE id = $6
       RETURNING *`,
      [PARTNER_APPLICATION_STATUS.REJECTED, rejectionReason, reviewedBy, now, now, id]
    );

    return result.rows[0];
  },

  async countByStatus(status) {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM partner_applications WHERE status = $1',
      [status]
    );

    return parseInt(result.rows[0].count);
  },
};
