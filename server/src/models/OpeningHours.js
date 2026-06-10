import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const OpeningHoursModel = {
  async create(hoursData) {
    const { salonId, day, openTime, closeTime, closed = false } = hoursData;

    const id = uuidv4();
    const now = new Date();

    const result = await pool.query(
      `INSERT INTO opening_hours (id, salon_id, day, open_time, close_time, closed, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, salonId, day, openTime, closeTime, closed, now, now],
    );

    return result.rows[0];
  },

  async createMany(salonId, hoursArray) {
    const results = [];
    for (const hours of hoursArray) {
      const result = await this.create({
        salonId,
        day: hours.day,
        openTime: hours.open || hours.openTime,
        closeTime: hours.close || hours.closeTime,
        closed: hours.closed || false,
      });
      results.push(result);
    }
    return results;
  },

  async findBySalonId(salonId) {
    const result = await pool.query(
      'SELECT * FROM opening_hours WHERE salon_id = $1 ORDER BY CASE day WHEN \'Monday\' THEN 1 WHEN \'Tuesday\' THEN 2 WHEN \'Wednesday\' THEN 3 WHEN \'Thursday\' THEN 4 WHEN \'Friday\' THEN 5 WHEN \'Saturday\' THEN 6 WHEN \'Sunday\' THEN 7 END',
      [salonId],
    );
    return result.rows;
  },

  async findBySalonIdAndDay(salonId, day) {
    const result = await pool.query(
      'SELECT * FROM opening_hours WHERE salon_id = $1 AND day = $2',
      [salonId, day],
    );
    return result.rows[0];
  },

  async update(id, hoursData) {
    const { openTime, closeTime, closed } = hoursData;
    const now = new Date();

    const result = await pool.query(
      `UPDATE opening_hours 
       SET open_time = COALESCE($1, open_time),
           close_time = COALESCE($2, close_time),
           closed = COALESCE($3, closed),
           updated_at = $4
       WHERE id = $5
       RETURNING *`,
      [openTime, closeTime, closed, now, id],
    );

    return result.rows[0];
  },

  async deleteBySalonId(salonId) {
    await pool.query('DELETE FROM opening_hours WHERE salon_id = $1', [salonId]);
  },
};
