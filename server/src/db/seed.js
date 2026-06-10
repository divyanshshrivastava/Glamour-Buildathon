import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const SALT_ROUNDS = 10;

async function seed() {
  const client = await pool.connect();

  try {
    console.log('🌱 Seeding database...\n');

    await client.query('BEGIN');

    // ── 1. Create Users ─────────────────────────────────────────────

    const adminId = uuidv4();
    const owner1Id = uuidv4();
    const owner2Id = uuidv4();
    const owner3Id = uuidv4();
    const customer1Id = uuidv4();
    const customer2Id = uuidv4();
    const customer3Id = uuidv4();
    const customer4Id = uuidv4();
    const customer5Id = uuidv4();

    const password = await bcrypt.hash('Password123!', SALT_ROUNDS);
    const now = new Date();

    const users = [
      [adminId, 'admin@glamour.io', password, 'Admin', 'User', '+919876543210', 'admin', null, true, true, now, now, now],
      [owner1Id, 'rajesh@luxurycuts.in', password, 'Rajesh', 'Kumar', '+919876543211', 'salonOwner', null, true, true, now, now, now],
      [owner2Id, 'priya@bellesalon.in', password, 'Priya', 'Mehta', '+919876543212', 'salonOwner', null, true, true, now, now, now],
      [owner3Id, 'amit@urbanstyle.in', password, 'Amit', 'Singh', '+919876543213', 'salonOwner', null, true, true, now, now, now],
      [customer1Id, 'customer1@example.com', password, 'Ananya', 'Sharma', '+919876543214', 'customer', null, true, true, now, now, now],
      [customer2Id, 'customer2@example.com', password, 'Rohan', 'Gupta', '+919876543215', 'customer', null, true, true, now, now, now],
      [customer3Id, 'customer3@example.com', password, 'Sneha', 'Patel', '+919876543216', 'customer', null, true, true, now, now, now],
      [customer4Id, 'customer4@example.com', password, 'Vikram', 'Joshi', '+919876543217', 'customer', null, true, true, now, now, now],
      [customer5Id, 'customer5@example.com', password, 'Meera', 'Reddy', '+919876543218', 'customer', null, true, true, now, now, now],
    ];

    for (const u of users) {
      await client.query(
        `INSERT INTO users (id, email, password, first_name, last_name, phone, role, salon_id, email_verified, active, last_login, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (email) DO NOTHING`,
        u,
      );
    }
    console.log('✓ Users created (1 admin, 3 salon owners, 5 customers)');

    // ── 2. Create Salons ────────────────────────────────────────────

    const salon1Id = uuidv4();
    const salon2Id = uuidv4();
    const salon3Id = uuidv4();

    const salons = [
      {
        id: salon1Id,
        name: 'Luxury Cuts',
        slug: 'luxury-cuts',
        tagline: 'Where precision meets elegance',
        description: 'Award-winning salon specializing in precision haircuts and premium styling. Our team of expert stylists brings international techniques to create your perfect look.',
        email: 'hello@luxurycuts.in',
        phone: '+919876543211',
        website: 'https://luxurycuts.in',
        address: '42 Park Street, Kolkata',
        city: 'Kolkata',
        coordinates: JSON.stringify({ latitude: 22.5726, longitude: 88.3639 }),
        coverImage: '/images/salon-1.jpg',
        gallery: JSON.stringify(['/images/gallery-1.jpg', '/images/gallery-2.jpg', '/images/gallery-3.jpg']),
        amenities: JSON.stringify(['Wi-Fi', 'Parking', 'A/C', 'Refreshments']),
        startingPrice: 500,
        rating: 4.9,
        reviewCount: 5,
        ownerId: owner1Id,
        featured: true,
        verified: true,
      },
      {
        id: salon2Id,
        name: 'Belle Salon & Spa',
        slug: 'belle-salon-spa',
        tagline: 'Your beauty destination',
        description: 'Full-service salon and spa offering a wide range of beauty treatments. From haircuts to facials, we provide a relaxing and luxurious experience.',
        email: 'contact@bellesalon.in',
        phone: '+919876543212',
        website: 'https://bellesalon.in',
        address: '15 MG Road, Bangalore',
        city: 'Bangalore',
        coordinates: JSON.stringify({ latitude: 12.9716, longitude: 77.5946 }),
        coverImage: '/images/salon-2.jpg',
        gallery: JSON.stringify(['/images/gallery-4.jpg', '/images/gallery-5.jpg']),
        amenities: JSON.stringify(['Wi-Fi', 'A/C', 'Waiting Area', 'Restrooms']),
        startingPrice: 400,
        rating: 4.7,
        reviewCount: 3,
        ownerId: owner2Id,
        featured: true,
        verified: true,
      },
      {
        id: salon3Id,
        name: 'Urban Style Studio',
        slug: 'urban-style-studio',
        tagline: 'Modern grooming for modern men',
        description: 'Contemporary men\'s grooming studio with a focus on trendy haircuts, beard styling, and grooming treatments in a relaxed atmosphere.',
        email: 'info@urbanstyle.in',
        phone: '+919876543213',
        website: null,
        address: '78 Linking Road, Mumbai',
        city: 'Mumbai',
        coordinates: JSON.stringify({ latitude: 19.0760, longitude: 72.8777 }),
        coverImage: '/images/salon-3.jpg',
        gallery: JSON.stringify([]),
        amenities: JSON.stringify(['Wi-Fi', 'Parking', 'A/C']),
        startingPrice: 300,
        rating: 4.5,
        reviewCount: 2,
        ownerId: owner3Id,
        featured: false,
        verified: true,
      },
    ];

    for (const s of salons) {
      await client.query(
        `INSERT INTO salons (id, name, slug, tagline, description, email, phone, website, address, city, coordinates, cover_image, gallery, amenities, starting_price, rating, review_count, salon_owner_id, featured, verified, active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, true, $21, $22)
         ON CONFLICT (slug) DO NOTHING`,
        [s.id, s.name, s.slug, s.tagline, s.description, s.email, s.phone, s.website, s.address, s.city, s.coordinates, s.coverImage, s.gallery, s.amenities, s.startingPrice, s.rating, s.reviewCount, s.ownerId, s.featured, s.verified, now, now],
      );
    }
    console.log('✓ Salons created (3 salons)');

    // ── 3. Create Opening Hours ─────────────────────────────────────

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (const salonId of [salon1Id, salon2Id, salon3Id]) {
      for (const day of days) {
        const closed = day === 'Sunday' && salonId === salon3Id;
        await client.query(
          `INSERT INTO opening_hours (id, salon_id, day, open_time, close_time, closed, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [uuidv4(), salonId, day, closed ? null : '09:00', closed ? null : '20:00', closed, now, now],
        );
      }
    }
    console.log('✓ Opening hours created');

    // ── 4. Create Service Categories ────────────────────────────────

    const categories = [
      { name: 'Haircut', slug: 'haircut', icon: 'Scissors', description: 'Precision cuts for every style' },
      { name: 'Hair Treatment', slug: 'hair-treatment', icon: 'Sparkles', description: 'Nourishing treatments for healthy hair' },
      { name: 'Coloring', slug: 'coloring', icon: 'Palette', description: 'Professional hair coloring and highlights' },
      { name: 'Styling', slug: 'styling', icon: 'Wand2', description: 'Blowouts, updos, and special occasion styling' },
      { name: 'Facial', slug: 'facial', icon: 'Flower2', description: 'Rejuvenating facial treatments' },
      { name: 'Massage', slug: 'massage', icon: 'Hand', description: 'Relaxing body massages' },
      { name: 'Manicure', slug: 'manicure', icon: 'HandMetal', description: 'Professional nail care for hands' },
      { name: 'Pedicure', slug: 'pedicure', icon: 'Footprints', description: 'Professional nail care for feet' },
    ];

    for (const cat of categories) {
      await client.query(
        `INSERT INTO service_categories (id, name, slug, icon, description, count, created_at)
         VALUES ($1, $2, $3, $4, $5, 0, $6)
         ON CONFLICT (name) DO NOTHING`,
        [uuidv4(), cat.name, cat.slug, cat.icon, cat.description, now],
      );
    }
    console.log('✓ Service categories created (8 categories)');

    // ── 5. Create Services ──────────────────────────────────────────

    const services = [
      // Salon 1 — Luxury Cuts
      { salonId: salon1Id, name: 'Signature Haircut', description: 'Precision cut tailored to your face shape', price: 800, duration: '45 min', category: 'Haircut' },
      { salonId: salon1Id, name: 'Premium Hair Spa', description: 'Deep conditioning with imported products', price: 1500, duration: '60 min', category: 'Hair Treatment' },
      { salonId: salon1Id, name: 'Full Hair Coloring', description: 'Global color with premium brands', price: 3000, duration: '120 min', category: 'Coloring' },
      { salonId: salon1Id, name: 'Bridal Styling', description: 'Complete bridal hair and makeup', price: 5000, duration: '180 min', category: 'Styling' },
      { salonId: salon1Id, name: 'Express Facial', description: 'Quick 30-min refreshing facial', price: 500, duration: '30 min', category: 'Facial' },

      // Salon 2 — Belle Salon & Spa
      { salonId: salon2Id, name: 'Classic Haircut', description: 'Traditional haircut with styling', price: 400, duration: '30 min', category: 'Haircut' },
      { salonId: salon2Id, name: 'Keratin Treatment', description: 'Smoothing keratin treatment', price: 4000, duration: '150 min', category: 'Hair Treatment' },
      { salonId: salon2Id, name: 'Highlights', description: 'Partial or full highlights', price: 2500, duration: '90 min', category: 'Coloring' },
      { salonId: salon2Id, name: 'Gold Facial', description: 'Luxurious gold-infused facial', price: 2000, duration: '60 min', category: 'Facial' },
      { salonId: salon2Id, name: 'Swedish Massage', description: 'Full body relaxation massage', price: 1800, duration: '60 min', category: 'Massage' },
      { salonId: salon2Id, name: 'Gel Manicure', description: 'Long-lasting gel nail polish', price: 700, duration: '45 min', category: 'Manicure' },
      { salonId: salon2Id, name: 'Spa Pedicure', description: 'Relaxing spa pedicure with scrub', price: 800, duration: '45 min', category: 'Pedicure' },

      // Salon 3 — Urban Style Studio
      { salonId: salon3Id, name: 'Men\'s Haircut', description: 'Trendy haircut with hot towel finish', price: 300, duration: '30 min', category: 'Haircut' },
      { salonId: salon3Id, name: 'Beard Grooming', description: 'Beard trim, shape, and oil treatment', price: 200, duration: '20 min', category: 'Styling' },
      { salonId: salon3Id, name: 'Hair Color (Men)', description: 'Natural-looking color for men', price: 1000, duration: '60 min', category: 'Coloring' },
      { salonId: salon3Id, name: 'Head Massage', description: 'Relaxing scalp and head massage', price: 400, duration: '30 min', category: 'Massage' },
    ];

    const serviceIds = {};
    for (const s of services) {
      const serviceId = uuidv4();
      serviceIds[`${s.salonId}_${s.name}`] = serviceId;
      await client.query(
        `INSERT INTO services (id, salon_id, name, description, price, duration, category, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, $9)`,
        [serviceId, s.salonId, s.name, s.description, s.price, s.duration, s.category, now, now],
      );
    }
    console.log('✓ Services created (16 services across 3 salons)');

    // ── 6. Create Bookings ──────────────────────────────────────────

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const bookings = [
      { salonId: salon1Id, serviceId: serviceIds[`${salon1Id}_Signature Haircut`], customerId: customer1Id, date: tomorrowStr, time: '10:00', name: 'Ananya Sharma', email: 'customer1@example.com', phone: '+919876543214', status: 'confirmed' },
      { salonId: salon1Id, serviceId: serviceIds[`${salon1Id}_Premium Hair Spa`], customerId: customer2Id, date: tomorrowStr, time: '14:00', name: 'Rohan Gupta', email: 'customer2@example.com', phone: '+919876543215', status: 'pending' },
      { salonId: salon2Id, serviceId: serviceIds[`${salon2Id}_Classic Haircut`], customerId: customer3Id, date: nextWeekStr, time: '11:00', name: 'Sneha Patel', email: 'customer3@example.com', phone: '+919876543216', status: 'pending' },
      { salonId: salon2Id, serviceId: serviceIds[`${salon2Id}_Gold Facial`], customerId: customer4Id, date: tomorrowStr, time: '15:30', name: 'Vikram Joshi', email: 'customer4@example.com', phone: '+919876543217', status: 'confirmed' },
      { salonId: salon3Id, serviceId: serviceIds[`${salon3Id}_Men's Haircut`], customerId: customer5Id, date: yesterdayStr, time: '09:30', name: 'Meera Reddy', email: 'customer5@example.com', phone: '+919876543218', status: 'completed' },
      { salonId: salon1Id, serviceId: serviceIds[`${salon1Id}_Signature Haircut`], customerId: customer3Id, date: yesterdayStr, time: '16:00', name: 'Sneha Patel', email: 'customer3@example.com', phone: '+919876543216', status: 'cancelled' },
    ];

    for (const b of bookings) {
      await client.query(
        `INSERT INTO bookings (id, salon_id, service_id, customer_id, booking_date, booking_time, duration, customer_name, customer_email, customer_phone, status, confirmation_token, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, '30 min', $7, $8, $9, $10, $11, $12, $13)`,
        [uuidv4(), b.salonId, b.serviceId, b.customerId, b.date, b.time, b.name, b.email, b.phone, b.status, uuidv4(), now, now],
      );
    }
    console.log('✓ Bookings created (6 bookings across various statuses)');

    // ── 7. Create Reviews ───────────────────────────────────────────

    const reviews = [
      { salonId: salon1Id, customerId: customer1Id, rating: 5, title: 'Perfect haircut!', text: 'Absolutely loved the experience at Luxury Cuts. The stylist really understood what I wanted and delivered perfectly. The ambiance is great and staff is super friendly. Will definitely come back!', authorName: 'Ananya Sharma', initials: 'AS' },
      { salonId: salon1Id, customerId: customer2Id, rating: 5, title: 'Best salon in Kolkata', text: 'I have been coming here for over a year now and every visit has been fantastic. The quality of service is consistently excellent. Highly recommended for anyone looking for premium grooming.', authorName: 'Rohan Gupta', initials: 'RG' },
      { salonId: salon1Id, customerId: customer3Id, rating: 5, title: 'Amazing hair spa', text: 'The hair spa treatment was incredible. My hair feels so much healthier and shinier. The products they use are top-notch and the massage was very relaxing.', authorName: 'Sneha Patel', initials: 'SP' },
      { salonId: salon1Id, customerId: customer4Id, rating: 4, title: 'Great service', text: 'Very professional staff and clean environment. The haircut was really good. Only reason for 4 stars is the slight wait time, but overall a great experience.', authorName: 'Vikram Joshi', initials: 'VJ' },
      { salonId: salon1Id, customerId: customer5Id, rating: 5, title: 'Love this place!', text: 'The bridal styling package was absolutely worth it. They made me feel so special on my big day. The attention to detail was remarkable. Thank you Luxury Cuts!', authorName: 'Meera Reddy', initials: 'MR' },
      { salonId: salon2Id, customerId: customer1Id, rating: 5, title: 'Wonderful experience', text: 'Belle Salon is my go-to for facials. The gold facial treatment left my skin glowing for days. The therapists are well-trained and very professional.', authorName: 'Ananya Sharma', initials: 'AS' },
      { salonId: salon2Id, customerId: customer2Id, rating: 4, title: 'Good salon', text: 'Had a nice haircut and the keratin treatment was really effective. The salon is well-maintained and the prices are reasonable for the quality you get.', authorName: 'Rohan Gupta', initials: 'RG' },
      { salonId: salon2Id, customerId: customer3Id, rating: 5, title: 'Best facial ever!', text: 'The facial treatment at Belle Salon was absolutely divine. My skin has never felt this good. The ambiance is calming and the staff makes you feel right at home.', authorName: 'Sneha Patel', initials: 'SP' },
      { salonId: salon3Id, customerId: customer4Id, rating: 5, title: 'Top-notch grooming', text: 'Urban Style Studio is the best men\'s grooming place in Mumbai. The beard trim was precise and the head massage was very relaxing. Great value for money.', authorName: 'Vikram Joshi', initials: 'VJ' },
      { salonId: salon3Id, customerId: customer5Id, rating: 4, title: 'Cool vibe', text: 'Modern studio with a great atmosphere. The haircut was trendy and exactly what I wanted. Will recommend to friends looking for a good men\'s salon.', authorName: 'Meera Reddy', initials: 'MR' },
    ];

    for (const r of reviews) {
      await client.query(
        `INSERT INTO reviews (id, salon_id, customer_id, rating, title, text, author_name, author_initials, verified, approved, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, true, $9, $10)`,
        [uuidv4(), r.salonId, r.customerId, r.rating, r.title, r.text, r.authorName, r.initials, now, now],
      );
    }
    console.log('✓ Reviews created (10 reviews)');

    // ── 8. Create Partner Applications ──────────────────────────────

    await client.query(
      `INSERT INTO partner_applications (id, salon_name, owner_name, email, phone, city, message, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9)
       ON CONFLICT (email) DO NOTHING`,
      [uuidv4(), 'Glamour Studio', 'Deepa Nair', 'deepa@glamourstudio.in', '+919876543220', 'Chennai', 'We are a premium salon in Chennai with 5 years of experience.', now, now],
    );

    await client.query(
      `INSERT INTO partner_applications (id, salon_name, owner_name, email, phone, city, message, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9)
       ON CONFLICT (email) DO NOTHING`,
      [uuidv4(), 'Style Hub', 'Karan Malhotra', 'karan@stylehub.in', '+919876543221', 'Delhi', 'Award-winning salon chain looking to expand through your platform.', now, now],
    );
    console.log('✓ Partner applications created (2 pending)');

    // ── Update salon_id for owners ──────────────────────────────────

    await client.query('UPDATE users SET salon_id = $1 WHERE id = $2', [salon1Id, owner1Id]);
    await client.query('UPDATE users SET salon_id = $1 WHERE id = $2', [salon2Id, owner2Id]);
    await client.query('UPDATE users SET salon_id = $1 WHERE id = $2', [salon3Id, owner3Id]);
    console.log('✓ Updated salon owners with salon IDs');

    await client.query('COMMIT');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login Credentials (all passwords: Password123!)');
    console.log('├─ Admin:     admin@glamour.io');
    console.log('├─ Owner 1:   rajesh@luxurycuts.in');
    console.log('├─ Owner 2:   priya@bellesalon.in');
    console.log('├─ Owner 3:   amit@urbanstyle.in');
    console.log('├─ Customer:  customer1@example.com');
    console.log('└─ ... through customer5@example.com\n');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
