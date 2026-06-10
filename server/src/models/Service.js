import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const ServiceModel = {
  async create(serviceData) {
    const { salonId, name, description, price, duration, category } = serviceData;

    const id = uuidv4();
    const now = new Date();

    const result = await pool.query(
      `INSERT INTO services (id, salon_id, name, description, price, duration, category, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [id, salonId, name, description, price, duration, category, now, now]
    );

    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM services WHERE id = $1', [id]);
    return result.rows[0];
  },

  async findBySalonId(salonId) {
    const result = await pool.query(
      'SELECT * FROM services WHERE salon_id = $1 AND is_active = true ORDER BY category, name',
      [salonId]
    );

    return result.rows;
  },

  async findByCategory(category) {
    const result = await pool.query(
      'SELECT * FROM services WHERE category = $1 AND is_active = true ORDER BY name',
      [category]
    );

    return result.rows;
  },

  async update(id, serviceData) {
    const { name, description, price, duration, category } = serviceData;
    const now = new Date();

    const result = await pool.query(
      `UPDATE services 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           duration = COALESCE($4, duration),
           category = COALESCE($5, category),
           updated_at = $6
       WHERE id = $7
       RETURNING *`,
      [name, description, price, duration, category, now, id]
    );

    return result.rows[0];
  },

  async softDelete(id) {
    const now = new Date();

    await pool.query('UPDATE services SET is_active = false, updated_at = $1 WHERE id = $2', [
      now,
      id,
    ]);
  },

  async hardDelete(id) {
    await pool.query('DELETE FROM services WHERE id = $1', [id]);
  },
};

export const ServiceCategoryModel = {
  async create(categoryData) {
    const { name, slug, icon, description } = categoryData;
    const id = uuidv4();

    const result = await pool.query(
      `INSERT INTO service_categories (id, name, slug, icon, description, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, name, slug, icon, description, new Date()]
    );

    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query('SELECT * FROM service_categories ORDER BY name');
    return result.rows;
  },

  async findBySlug(slug) {
    const result = await pool.query('SELECT * FROM service_categories WHERE slug = $1', [slug]);

    return result.rows[0];
  },

  async updateCount(categoryName, count) {
    const now = new Date();

    await pool.query('UPDATE service_categories SET count = $1 WHERE name = $2', [
      count,
      categoryName,
    ]);
  },
};
