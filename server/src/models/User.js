import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const UserModel = {
  async create(userData) {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      role = 'customer',
      salonId = null,
    } = userData;

    const id = uuidv4();
    const now = new Date();

    const result = await pool.query(
      `INSERT INTO users (id, email, password, first_name, last_name, phone, role, salon_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, email, first_name, last_name, phone, role, salon_id, email_verified, active, last_login, created_at, updated_at`,
      [
        id,
        email,
        password,
        firstName,
        lastName,
        phone,
        role,
        salonId,
        now,
        now,
      ],
    );

    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, phone, role, salon_id, email_verified, active, last_login, created_at, updated_at FROM users WHERE id = $1',
      [id],
    );
    return result.rows[0];
  },

  async update(id, userData) {
    const { firstName, lastName, phone, avatar } = userData;
    const now = new Date();

    const result = await pool.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           avatar = COALESCE($4, avatar),
           updated_at = $5
       WHERE id = $6
       RETURNING id, email, first_name, last_name, phone, role, avatar, created_at, updated_at`,
      [firstName, lastName, phone, avatar, now, id],
    );

    return result.rows[0];
  },

  async updatePassword(id, hashedPassword) {
    const now = new Date();

    const result = await pool.query(
      `UPDATE users 
       SET password = $1, updated_at = $2
       WHERE id = $3
       RETURNING id, email`,
      [hashedPassword, now, id],
    );

    return result.rows[0];
  },

  async updateLastLogin(id) {
    const now = new Date();

    await pool.query('UPDATE users SET last_login = $1 WHERE id = $2', [
      now,
      id,
    ]);
  },

  async verifyEmail(id) {
    const now = new Date();

    await pool.query(
      'UPDATE users SET email_verified = true, updated_at = $1 WHERE id = $2',
      [now, id],
    );
  },

  async findAll(filters = {}) {
    let query =
      'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.role) {
      query += ` AND role = $${paramCount}`;
      params.push(filters.role);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  },
};
