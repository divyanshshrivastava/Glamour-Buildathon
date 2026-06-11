import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import pg from 'pg';
const { Client } = pg;

const client = new Client({ user: 'postgres', password: 'postgres', host: 'localhost', database: 'glamour_dev' });

async function testApprove() {
  await client.connect();
  const id = '96293612-c68f-4354-903b-aea156d6ed44';
  
  try {
    const appRes = await client.query('SELECT * FROM partner_applications WHERE id = $1', [id]);
    const application = appRes.rows[0];
    console.log("Application:", application);

    let userRes = await client.query('SELECT * FROM users WHERE email = $1', [application.email]);
    let user = userRes.rows[0];

    if (user) {
      console.log("User exists, updating...");
      const updateResult = await client.query('UPDATE users SET role = $1 WHERE email = $2 RETURNING id', ['salonOwner', application.email]);
      user.id = updateResult.rows[0].id;
    } else {
      console.log("User does not exist, creating...");
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const userId = uuidv4();
      const now = new Date();
      const userRes = await client.query(
        `INSERT INTO users (id, email, password, first_name, last_name, phone, role, salon_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [userId, application.email, hashedPassword, application.owner_name.split(' ')[0], application.owner_name.split(' ').slice(1).join(' ') || null, application.phone, 'salonOwner', null, now, now]
      );
      user = userRes.rows[0];
    }

    console.log("Verifying email...");
    await client.query('UPDATE users SET email_verified = true, updated_at = $1 WHERE id = $2', [new Date(), user.id]);

    const slug = application.salon_name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim() + '-' + Date.now().toString().slice(-4);
    
    console.log("Creating salon...");
    const salonId = uuidv4();
    const salonRes = await client.query(
      `INSERT INTO salons (id, name, slug, tagline, description, email, phone, website, address, city, coordinates, cover_image, gallery, amenities, salon_owner_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [salonId, application.salon_name, slug, null, null, application.email, application.phone, null, application.city, application.city, JSON.stringify(null), null, JSON.stringify([]), JSON.stringify([]), user.id, new Date(), new Date()]
    );
    console.log("Salon created!");

  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    await client.end();
  }
}

testApprove();
