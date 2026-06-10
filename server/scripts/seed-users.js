import bcrypt from 'bcryptjs';
import pool from '../src/config/database.js';
import { v4 as uuidv4 } from 'uuid';

async function seedUsers() {
  const password = 'Password123!';
  // Note: Using bcryptjs as it is usually installed, or we can fallback to just bcrypt if that's what's in package.json.
  // Actually let's use the one in package.json. 
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
    }
    console.log('Done!');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    pool.end();
  }
}

seedUsers();
