import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const SalonModel = {
  async create(salonData) {
    const {
      name,
      slug,
      tagline,
      description,
      email,
      phone,
      website,
      address,
      city,
      coordinates,
      coverImage,
      gallery,
      amenities,
      salonOwnerId,
    } = salonData;

    const id = uuidv4();
    const now = new Date();

    const result = await pool.query(
      `INSERT INTO salons 
       (id, name, slug, tagline, description, email, phone, website, address, city, coordinates, cover_image, gallery, amenities, salon_owner_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        id,
        name,
        slug,
        tagline,
        description,
        email,
        phone,
        website,
        address,
        city,
        JSON.stringify(coordinates),
        coverImage,
        JSON.stringify(gallery),
        JSON.stringify(amenities),
        salonOwnerId,
        now,
        now,
      ],
    );

    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM salons WHERE id = $1 AND active = true',
      [id],
    );
    return result.rows[0];
  },

  async findBySlug(slug) {
    const result = await pool.query(
      'SELECT * FROM salons WHERE slug = $1 AND active = true',
      [slug],
    );
    return result.rows[0];
  },

  async findByOwnerId(ownerId) {
    const result = await pool.query(
      'SELECT * FROM salons WHERE salon_owner_id = $1 AND active = true',
      [ownerId],
    );
    return result.rows[0];
  },

  async findFeatured(limit = 6, city = null) {
    let query = `SELECT * FROM salons WHERE featured = true AND active = true`;
    const params = [];

    if (city) {
      query += ` AND city = $1`;
      params.push(city);
    }

    query += ` ORDER BY rating DESC LIMIT ${limit}`;

    const result = await pool.query(query, params);
    return result.rows;
  },

  async findAll(filters = {}) {
    let query = `SELECT * FROM salons WHERE active = true`;
    const params = [];
    let paramCount = 1;

    if (filters.city) {
      query += ` AND city = $${paramCount}`;
      params.push(filters.city);
      paramCount++;
    }

    // Add sorting
    let sortBy = filters.sortBy || 'created_at';
    if (sortBy === 'featured') {
      query += ` ORDER BY featured DESC, rating DESC`;
    } else if (sortBy === 'rating') {
      query += ` ORDER BY rating DESC`;
    } else {
      query += ` ORDER BY created_at DESC`;
    }

    const result = await pool.query(query, params);
    return result.rows;
  },

  async search(searchTerm = '', filters = {}) {
    let query = `SELECT * FROM salons WHERE active = true AND (name ILIKE $1 OR city ILIKE $1)`;
    const params = [`%${searchTerm}%`];
    let paramCount = 2;

    if (filters.city) {
      query += ` AND city = $${paramCount}`;
      params.push(filters.city);
      paramCount++;
    }

    if (filters.minRating) {
      query += ` AND rating >= $${paramCount}`;
      params.push(filters.minRating);
      paramCount++;
    }

    if (filters.maxPrice) {
      query += ` AND starting_price <= $${paramCount}`;
      params.push(filters.maxPrice);
      paramCount++;
    }

    query += ` ORDER BY rating DESC LIMIT 100`;

    const result = await pool.query(query, params);
    return result.rows;
  },

  async update(id, salonData) {
    const {
      name,
      tagline,
      description,
      phone,
      website,
      address,
      city,
      coordinates,
      coverImage,
      gallery,
      amenities,
      startingPrice,
    } = salonData;

    const now = new Date();

    const result = await pool.query(
      `UPDATE salons 
       SET name = COALESCE($1, name),
           tagline = COALESCE($2, tagline),
           description = COALESCE($3, description),
           phone = COALESCE($4, phone),
           website = COALESCE($5, website),
           address = COALESCE($6, address),
           city = COALESCE($7, city),
           coordinates = COALESCE($8, coordinates),
           cover_image = COALESCE($9, cover_image),
           gallery = COALESCE($10, gallery),
           amenities = COALESCE($11, amenities),
           starting_price = COALESCE($12, starting_price),
           updated_at = $13
       WHERE id = $14
       RETURNING *`,
      [
        name,
        tagline,
        description,
        phone,
        website,
        address,
        city,
        coordinates ? JSON.stringify(coordinates) : null,
        coverImage,
        gallery ? JSON.stringify(gallery) : null,
        amenities ? JSON.stringify(amenities) : null,
        startingPrice,
        now,
        id,
      ],
    );

    return result.rows[0];
  },

  async updateRating(id, rating) {
    const now = new Date();

    const result = await pool.query(
      `UPDATE salons 
       SET rating = $1, updated_at = $2
       WHERE id = $3
       RETURNING rating`,
      [rating, now, id],
    );

    return result.rows[0];
  },

  async verify(id) {
    const now = new Date();

    const result = await pool.query(
      `UPDATE salons 
       SET verified = true, updated_at = $1
       WHERE id = $2
       RETURNING *`,
      [now, id],
    );

    return result.rows[0];
  },

  async softDelete(id) {
    const now = new Date();

    await pool.query(
      `UPDATE salons 
       SET active = false, updated_at = $1
       WHERE id = $2`,
      [now, id],
    );
  },

  async hardDelete(id) {
    await pool.query('DELETE FROM salons WHERE id = $1', [id]);
  },
};
