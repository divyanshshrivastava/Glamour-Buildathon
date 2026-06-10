import bcrypt from 'bcryptjs';
import pool from '../src/config/database.js';
import { v4 as uuidv4 } from 'uuid';

async function seedUsers() {
  const password = 'Password123!';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const testUsers = [
    {
      email: 'admin@glamour.io',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      phone: '1234567890'
    },
    {
      email: 'customer@test.com',
      firstName: 'Test',
      lastName: 'Customer',
      role: 'customer',
      phone: '1234567891'
    },
    {
      email: 'salon@test.com',
      firstName: 'Salon',
      lastName: 'Owner',
      role: 'salonOwner',
      phone: '1234567892'
    }
  ];

  console.log(`Creating test accounts with password: ${password}`);

  try {
    for (const user of testUsers) {
      // Check if exists
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [user.email]);
      if (existing.rows.length > 0) {
        // Just update the password for existing ones to be sure
        await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, user.email]);
        console.log(`User ${user.email} already exists. Password updated.`);
        continue;
      }
      
      const id = uuidv4();
      const now = new Date();
      await pool.query(
        `INSERT INTO users (id, email, password, first_name, last_name, phone, role, email_verified, active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true, true, $8, $9)`,
        [id, user.email, hashedPassword, user.firstName, user.lastName, user.phone, user.role, now, now]
      );
      console.log(`Created user: ${user.email} (${user.role})`);

      // If salon owner, create a salon and link it
      if (user.role === 'salonOwner') {
        const salonId = uuidv4();
        const slug = `test-salon-${Date.now()}`;
        await pool.query(
          `INSERT INTO salons (id, name, slug, tagline, description, email, phone, address, city, salon_owner_id, active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, $11, $12)`,
          [salonId, 'Test Salon', slug, 'A test salon', 'Created by seed-users script for testing the salon owner dashboard.', user.email, user.phone, 'Test Address', 'Test City', id, now, now]
        );
        await pool.query('UPDATE users SET salon_id = $1 WHERE id = $2', [salonId, id]);
        console.log(`  → Created salon "${slug}" and linked to ${user.email}`);
      }
    }

    console.log('\nDone!');
    console.log('\n📋 Login Credentials:');
    console.log('├─ Admin:       admin@glamour.io / Password123!     → /admin');
    console.log('├─ Salon Owner: salon@test.com / Password123!       → /dashboard');
    console.log('└─ Customer:    customer@test.com / Password123!    → /');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    pool.end();
  }
}

seedUsers();
