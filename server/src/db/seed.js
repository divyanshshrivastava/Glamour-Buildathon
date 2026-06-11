import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const SALT_ROUNDS = 10;

async function seed() {
  const client = await pool.connect();

  try {
    console.log('🌱 Seeding database...\n');

    await client.query('BEGIN');

    // Clean existing data for a fresh seed (order matters for FK constraints)
    await client.query('TRUNCATE TABLE email_verification_tokens, password_reset_tokens, sessions, reviews, bookings, services, opening_hours, service_categories, partner_applications, salons, users CASCADE');
    console.log('✓ Existing data cleared');

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
      [adminId, 'admin@glamour.io', password, 'Admin', 'User', '+919876543210', 'admin', null, 'Mumbai', true, true, now, now, now],
      [owner1Id, 'rajesh@luxurycuts.in', password, 'Rajesh', 'Kumar', '+919876543211', 'salonOwner', null, 'Kolkata', true, true, now, now, now],
      [owner2Id, 'priya@bellesalon.in', password, 'Priya', 'Mehta', '+919876543212', 'salonOwner', null, 'Bangalore', true, true, now, now, now],
      [owner3Id, 'amit@urbanstyle.in', password, 'Amit', 'Singh', '+919876543213', 'salonOwner', null, 'Mumbai', true, true, now, now, now],
      [customer1Id, 'customer1@example.com', password, 'Ananya', 'Sharma', '+919876543214', 'customer', null, 'Kolkata', true, true, now, now, now],
      [customer2Id, 'customer2@example.com', password, 'Rohan', 'Gupta', '+919876543215', 'customer', null, 'Bangalore', true, true, now, now, now],
      [customer3Id, 'customer3@example.com', password, 'Sneha', 'Patel', '+919876543216', 'customer', null, 'Mumbai', true, true, now, now, now],
      [customer4Id, 'customer4@example.com', password, 'Vikram', 'Joshi', '+919876543217', 'customer', null, 'Delhi', true, true, now, now, now],
      [customer5Id, 'customer5@example.com', password, 'Meera', 'Reddy', '+919876543218', 'customer', null, 'Hyderabad', true, true, now, now, now],
    ];

    for (const u of users) {
      await client.query(
        `INSERT INTO users (id, email, password, first_name, last_name, phone, role, salon_id, city, email_verified, active, last_login, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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
        reviewCount: 8,
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
        reviewCount: 6,
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
        reviewCount: 4,
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

    const salonHours = {
      [salon1Id]: { open: '09:00', close: '21:00', closedDays: [] },
      [salon2Id]: { open: '10:00', close: '20:00', closedDays: ['Sunday'] },
      [salon3Id]: { open: '09:30', close: '20:30', closedDays: ['Sunday'] },
    };

    for (const salonId of [salon1Id, salon2Id, salon3Id]) {
      const config = salonHours[salonId];
      for (const day of days) {
        const closed = config.closedDays.includes(day);
        await client.query(
          `INSERT INTO opening_hours (id, salon_id, day, open_time, close_time, closed, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [uuidv4(), salonId, day, closed ? null : config.open, closed ? null : config.close, closed, now, now],
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
      // Salon 1 — Luxury Cuts (5 services)
      { salonId: salon1Id, name: 'Signature Haircut', description: 'Precision cut tailored to your face shape', price: 800, duration: '45 min', category: 'Haircut' },
      { salonId: salon1Id, name: 'Premium Hair Spa', description: 'Deep conditioning with imported products', price: 1500, duration: '60 min', category: 'Hair Treatment' },
      { salonId: salon1Id, name: 'Full Hair Coloring', description: 'Global color with premium brands', price: 3000, duration: '120 min', category: 'Coloring' },
      { salonId: salon1Id, name: 'Bridal Styling', description: 'Complete bridal hair and makeup', price: 5000, duration: '180 min', category: 'Styling' },
      { salonId: salon1Id, name: 'Express Facial', description: 'Quick 30-min refreshing facial', price: 500, duration: '30 min', category: 'Facial' },

      // Salon 2 — Belle Salon & Spa (7 services)
      { salonId: salon2Id, name: 'Classic Haircut', description: 'Traditional haircut with styling', price: 400, duration: '30 min', category: 'Haircut' },
      { salonId: salon2Id, name: 'Keratin Treatment', description: 'Smoothing keratin treatment', price: 4000, duration: '150 min', category: 'Hair Treatment' },
      { salonId: salon2Id, name: 'Highlights', description: 'Partial or full highlights', price: 2500, duration: '90 min', category: 'Coloring' },
      { salonId: salon2Id, name: 'Gold Facial', description: 'Luxurious gold-infused facial', price: 2000, duration: '60 min', category: 'Facial' },
      { salonId: salon2Id, name: 'Swedish Massage', description: 'Full body relaxation massage', price: 1800, duration: '60 min', category: 'Massage' },
      { salonId: salon2Id, name: 'Gel Manicure', description: 'Long-lasting gel nail polish', price: 700, duration: '45 min', category: 'Manicure' },
      { salonId: salon2Id, name: 'Spa Pedicure', description: 'Relaxing spa pedicure with scrub', price: 800, duration: '45 min', category: 'Pedicure' },

      // Salon 3 — Urban Style Studio (4 services)
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

    // Helper to create date strings relative to today
    const dateOffset = (days) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    };

    const todayStr = dateOffset(0);
    const tomorrowStr = dateOffset(1);
    const nextWeekStr = dateOffset(7);
    const yesterdayStr = dateOffset(-1);
    const twoDaysAgoStr = dateOffset(-2);
    const threeDaysAgoStr = dateOffset(-3);
    const lastWeekStr = dateOffset(-7);
    const dayAfterStr = dateOffset(2);

    const bookings = [
      // ── Salon 1: Luxury Cuts — 10 bookings ──
      // Today's bookings (show up on dashboard overview)
      { salonId: salon1Id, serviceId: serviceIds[`${salon1Id}_Signature Haircut`], customerId: customer1Id, date: todayStr, time: '10:00', name: 'Ananya Sharma', email: 'customer1@example.com', phone: '+919876543214', status: 'confirmed', notes: null },
      { salonId: salon1Id, serviceId: serviceIds[`${salon1Id}_Premium Hair Spa`], customerId: customer2Id, date: todayStr, time: '11:30', name: 'Rohan Gupta', email: 'customer2@example.com', phone: '+919876543215', status: 'confirmed', notes: 'First time visitor' },
      { salonId: salon1Id, serviceId: serviceIds[`${salon1Id}_Express Facial`], customerId: customer3Id, date: todayStr, time: '14:00', name: 'Sneha Patel', email: 'customer3@example.com', phone: '+919876543216', status: 'pending', notes: null },
      { salonId: salon1Id, serviceId: serviceIds[`${salon1Id}_Signature Haircut`], customerId: customer4Id, date: todayStr, time: '16:30', name: 'Vikram Joshi', email: 'customer4@example.com', phone: '+919876543217', status: 'pending', notes: 'Prefers short on sides' },

      // Tomorrow
      { salonId: salon1Id, serviceId: serviceIds[`${salon1Id}_Full Hair Coloring`], customerId: customer5Id, date: tomorrowStr, time: '10:00', name: 'Meera Reddy', email: 'customer5@example.com', phone: '+919876543218', status: 'confirmed', notes: 'Wants auburn shade' },
      { salonId: salon1Id, serviceId: serviceIds[`${salon1Id}_Bridal Styling`], customerId: customer1Id, date: nextWeekStr, time: '09:00', name: 'Ananya Sharma', email: 'customer1@example.com', phone: '+919876543214', status: 'pending', notes: 'Wedding on Saturday' },

      // Past — completed
      { salonId: salon1Id, serviceId: serviceIds[`${salon1Id}_Signature Haircut`], customerId: customer3Id, date: yesterdayStr, time: '11:00', name: 'Sneha Patel', email: 'customer3@example.com', phone: '+919876543216', status: 'completed', notes: null },
      { salonId: salon1Id, serviceId: serviceIds[`${salon1Id}_Premium Hair Spa`], customerId: customer4Id, date: twoDaysAgoStr, time: '15:00', name: 'Vikram Joshi', email: 'customer4@example.com', phone: '+919876543217', status: 'completed', notes: null },
      { salonId: salon1Id, serviceId: serviceIds[`${salon1Id}_Express Facial`], customerId: customer2Id, date: threeDaysAgoStr, time: '12:00', name: 'Rohan Gupta', email: 'customer2@example.com', phone: '+919876543215', status: 'completed', notes: null },

      // Past — cancelled
      { salonId: salon1Id, serviceId: serviceIds[`${salon1Id}_Signature Haircut`], customerId: customer5Id, date: lastWeekStr, time: '16:00', name: 'Meera Reddy', email: 'customer5@example.com', phone: '+919876543218', status: 'cancelled', notes: 'Customer requested reschedule' },

      // ── Salon 2: Belle Salon & Spa — 8 bookings ──
      // Today
      { salonId: salon2Id, serviceId: serviceIds[`${salon2Id}_Gold Facial`], customerId: customer1Id, date: todayStr, time: '10:30', name: 'Ananya Sharma', email: 'customer1@example.com', phone: '+919876543214', status: 'confirmed', notes: null },
      { salonId: salon2Id, serviceId: serviceIds[`${salon2Id}_Swedish Massage`], customerId: customer5Id, date: todayStr, time: '13:00', name: 'Meera Reddy', email: 'customer5@example.com', phone: '+919876543218', status: 'pending', notes: 'Has back pain, be gentle' },
      { salonId: salon2Id, serviceId: serviceIds[`${salon2Id}_Gel Manicure`], customerId: customer3Id, date: todayStr, time: '15:30', name: 'Sneha Patel', email: 'customer3@example.com', phone: '+919876543216', status: 'pending', notes: null },

      // Tomorrow & upcoming
      { salonId: salon2Id, serviceId: serviceIds[`${salon2Id}_Classic Haircut`], customerId: customer2Id, date: tomorrowStr, time: '11:00', name: 'Rohan Gupta', email: 'customer2@example.com', phone: '+919876543215', status: 'confirmed', notes: null },
      { salonId: salon2Id, serviceId: serviceIds[`${salon2Id}_Keratin Treatment`], customerId: customer4Id, date: dayAfterStr, time: '10:00', name: 'Vikram Joshi', email: 'customer4@example.com', phone: '+919876543217', status: 'pending', notes: 'Wants to discuss options first' },

      // Past
      { salonId: salon2Id, serviceId: serviceIds[`${salon2Id}_Highlights`], customerId: customer1Id, date: twoDaysAgoStr, time: '14:00', name: 'Ananya Sharma', email: 'customer1@example.com', phone: '+919876543214', status: 'completed', notes: null },
      { salonId: salon2Id, serviceId: serviceIds[`${salon2Id}_Spa Pedicure`], customerId: customer3Id, date: threeDaysAgoStr, time: '16:00', name: 'Sneha Patel', email: 'customer3@example.com', phone: '+919876543216', status: 'completed', notes: null },
      { salonId: salon2Id, serviceId: serviceIds[`${salon2Id}_Classic Haircut`], customerId: customer5Id, date: lastWeekStr, time: '12:00', name: 'Meera Reddy', email: 'customer5@example.com', phone: '+919876543218', status: 'cancelled', notes: 'No-show' },

      // ── Salon 3: Urban Style Studio — 6 bookings ──
      // Today
      { salonId: salon3Id, serviceId: serviceIds[`${salon3Id}_Men's Haircut`], customerId: customer2Id, date: todayStr, time: '10:00', name: 'Rohan Gupta', email: 'customer2@example.com', phone: '+919876543215', status: 'confirmed', notes: null },
      { salonId: salon3Id, serviceId: serviceIds[`${salon3Id}_Beard Grooming`], customerId: customer4Id, date: todayStr, time: '11:00', name: 'Vikram Joshi', email: 'customer4@example.com', phone: '+919876543217', status: 'pending', notes: null },

      // Upcoming
      { salonId: salon3Id, serviceId: serviceIds[`${salon3Id}_Hair Color (Men)`], customerId: customer2Id, date: tomorrowStr, time: '14:00', name: 'Rohan Gupta', email: 'customer2@example.com', phone: '+919876543215', status: 'pending', notes: 'Wants natural brown' },

      // Past
      { salonId: salon3Id, serviceId: serviceIds[`${salon3Id}_Men's Haircut`], customerId: customer4Id, date: yesterdayStr, time: '09:30', name: 'Vikram Joshi', email: 'customer4@example.com', phone: '+919876543217', status: 'completed', notes: null },
      { salonId: salon3Id, serviceId: serviceIds[`${salon3Id}_Head Massage`], customerId: customer2Id, date: twoDaysAgoStr, time: '16:00', name: 'Rohan Gupta', email: 'customer2@example.com', phone: '+919876543215', status: 'completed', notes: null },
      { salonId: salon3Id, serviceId: serviceIds[`${salon3Id}_Beard Grooming`], customerId: customer5Id, date: lastWeekStr, time: '10:30', name: 'Meera Reddy', email: 'customer5@example.com', phone: '+919876543218', status: 'cancelled', notes: 'Rescheduled to next week' },
    ];

    for (const b of bookings) {
      await client.query(
        `INSERT INTO bookings (id, salon_id, service_id, customer_id, booking_date, booking_time, duration, customer_name, customer_email, customer_phone, status, notes, confirmation_token, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, '30 min', $7, $8, $9, $10, $11, $12, $13, $14)`,
        [uuidv4(), b.salonId, b.serviceId, b.customerId, b.date, b.time, b.name, b.email, b.phone, b.status, b.notes, uuidv4(), now, now],
      );
    }
    console.log(`✓ Bookings created (${bookings.length} bookings with today's appointments for all salons)`);

    // ── 7. Create Reviews ───────────────────────────────────────────

    const reviews = [
      // ── Salon 1: Luxury Cuts — 8 reviews ──
      { salonId: salon1Id, customerId: customer1Id, rating: 5, title: 'Perfect haircut!', text: 'Absolutely loved the experience at Luxury Cuts. The stylist really understood what I wanted and delivered perfectly. The ambiance is great and staff is super friendly. Will definitely come back!', authorName: 'Ananya Sharma', initials: 'AS', helpful: 3 },
      { salonId: salon1Id, customerId: customer2Id, rating: 5, title: 'Best salon in Kolkata', text: 'I have been coming here for over a year now and every visit has been fantastic. The quality of service is consistently excellent. Highly recommended for anyone looking for premium grooming.', authorName: 'Rohan Gupta', initials: 'RG', helpful: 5 },
      { salonId: salon1Id, customerId: customer3Id, rating: 5, title: 'Amazing hair spa', text: 'The hair spa treatment was incredible. My hair feels so much healthier and shinier. The products they use are top-notch and the massage was very relaxing.', authorName: 'Sneha Patel', initials: 'SP', helpful: 2 },
      { salonId: salon1Id, customerId: customer4Id, rating: 4, title: 'Great service', text: 'Very professional staff and clean environment. The haircut was really good. Only reason for 4 stars is the slight wait time, but overall a great experience.', authorName: 'Vikram Joshi', initials: 'VJ', helpful: 1 },
      { salonId: salon1Id, customerId: customer5Id, rating: 5, title: 'Love this place!', text: 'The bridal styling package was absolutely worth it. They made me feel so special on my big day. The attention to detail was remarkable. Thank you Luxury Cuts!', authorName: 'Meera Reddy', initials: 'MR', helpful: 8 },
      { salonId: salon1Id, customerId: customer2Id, rating: 5, title: 'Consistently excellent', text: 'Another great visit. Got my hair colored this time and it turned out exactly as I imagined. The stylist was patient and gave great recommendations.', authorName: 'Rohan Gupta', initials: 'RG', helpful: 0 },
      { salonId: salon1Id, customerId: customer3Id, rating: 4, title: 'Good but pricey', text: 'Service quality is undoubtedly the best in town. The only downside is the pricing which is on the higher end. But you do get what you pay for.', authorName: 'Sneha Patel', initials: 'SP', helpful: 4 },
      { salonId: salon1Id, customerId: customer1Id, rating: 5, title: 'Second visit – still amazing', text: 'Came back for the express facial this time. It was refreshing and my skin felt amazing afterwards. The staff remembers you and that personal touch means a lot.', authorName: 'Ananya Sharma', initials: 'AS', helpful: 1 },

      // ── Salon 2: Belle Salon & Spa — 6 reviews ──
      { salonId: salon2Id, customerId: customer1Id, rating: 5, title: 'Wonderful experience', text: 'Belle Salon is my go-to for facials. The gold facial treatment left my skin glowing for days. The therapists are well-trained and very professional.', authorName: 'Ananya Sharma', initials: 'AS', helpful: 6 },
      { salonId: salon2Id, customerId: customer2Id, rating: 4, title: 'Good salon', text: 'Had a nice haircut and the keratin treatment was really effective. The salon is well-maintained and the prices are reasonable for the quality you get.', authorName: 'Rohan Gupta', initials: 'RG', helpful: 2 },
      { salonId: salon2Id, customerId: customer3Id, rating: 5, title: 'Best facial ever!', text: 'The facial treatment at Belle Salon was absolutely divine. My skin has never felt this good. The ambiance is calming and the staff makes you feel right at home.', authorName: 'Sneha Patel', initials: 'SP', helpful: 7 },
      { salonId: salon2Id, customerId: customer4Id, rating: 5, title: 'Relaxing massage', text: 'The Swedish massage was exactly what I needed after a stressful week. The therapist knew exactly the right pressure points. Will be a regular here.', authorName: 'Vikram Joshi', initials: 'VJ', helpful: 3 },
      { salonId: salon2Id, customerId: customer5Id, rating: 4, title: 'Nice pedicure', text: 'The spa pedicure was very relaxing and my feet feel so much better. The products used were high quality. Just wish the appointment was a bit longer.', authorName: 'Meera Reddy', initials: 'MR', helpful: 1 },
      { salonId: salon2Id, customerId: customer1Id, rating: 5, title: 'Love the manicure!', text: 'The gel manicure lasted for weeks without chipping. The nail technician was creative with the design and very careful. Highly recommended!', authorName: 'Ananya Sharma', initials: 'AS', helpful: 4 },

      // ── Salon 3: Urban Style Studio — 4 reviews ──
      { salonId: salon3Id, customerId: customer4Id, rating: 5, title: 'Top-notch grooming', text: 'Urban Style Studio is the best men\'s grooming place in Mumbai. The beard trim was precise and the head massage was very relaxing. Great value for money.', authorName: 'Vikram Joshi', initials: 'VJ', helpful: 5 },
      { salonId: salon3Id, customerId: customer5Id, rating: 4, title: 'Cool vibe', text: 'Modern studio with a great atmosphere. The haircut was trendy and exactly what I wanted. Will recommend to friends looking for a good men\'s salon.', authorName: 'Meera Reddy', initials: 'MR', helpful: 2 },
      { salonId: salon3Id, customerId: customer2Id, rating: 5, title: 'Best men\'s salon', text: 'Finally found a salon that understands men\'s grooming properly. The hot towel finish after the haircut was a nice touch. Very professional team.', authorName: 'Rohan Gupta', initials: 'RG', helpful: 3 },
      { salonId: salon3Id, customerId: customer1Id, rating: 4, title: 'Good for men', text: 'Took my brother here for his birthday. He loved the haircut and beard grooming combo. The prices are very reasonable for the quality of service.', authorName: 'Ananya Sharma', initials: 'AS', helpful: 1 },
    ];

    // Create reviews with staggered dates for realistic "recent" sorting
    for (let i = 0; i < reviews.length; i++) {
      const r = reviews[i];
      const reviewDate = new Date(now);
      reviewDate.setDate(reviewDate.getDate() - (i * 3 + 1)); // Stagger by 3 days each

      await client.query(
        `INSERT INTO reviews (id, salon_id, customer_id, rating, title, text, author_name, author_initials, helpful, verified, approved, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, true, $10, $11)`,
        [uuidv4(), r.salonId, r.customerId, r.rating, r.title, r.text, r.authorName, r.initials, r.helpful, reviewDate, reviewDate],
      );
    }
    console.log(`✓ Reviews created (${reviews.length} reviews with helpful counts and staggered dates)`);

    // ── 8. Create Partner Applications ──────────────────────────────

    const applications = [
      { salonName: 'Glamour Studio', ownerName: 'Deepa Nair', email: 'deepa@glamourstudio.in', phone: '+919876543220', city: 'Chennai', message: 'We are a premium salon in Chennai with 5 years of experience. Looking to expand our reach through your platform.', status: 'pending' },
      { salonName: 'Style Hub', ownerName: 'Karan Malhotra', email: 'karan@stylehub.in', phone: '+919876543221', city: 'Delhi', message: 'Award-winning salon chain looking to expand through your platform. We have 3 branches across Delhi NCR.', status: 'pending' },
      { salonName: 'Radiance Beauty Bar', ownerName: 'Nisha Kapoor', email: 'nisha@radiancebeauty.in', phone: '+919876543222', city: 'Hyderabad', message: 'Specializing in bridal makeup and premium beauty treatments. Would love to partner with Glamour.', status: 'pending' },
    ];

    for (const app of applications) {
      await client.query(
        `INSERT INTO partner_applications (id, salon_name, owner_name, email, phone, city, message, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (email) DO NOTHING`,
        [uuidv4(), app.salonName, app.ownerName, app.email, app.phone, app.city, app.message, app.status, now, now],
      );
    }
    console.log(`✓ Partner applications created (${applications.length} pending)`);

    // ── Update salon_id for owners ──────────────────────────────────

    await client.query('UPDATE users SET salon_id = $1 WHERE id = $2', [salon1Id, owner1Id]);
    await client.query('UPDATE users SET salon_id = $1 WHERE id = $2', [salon2Id, owner2Id]);
    await client.query('UPDATE users SET salon_id = $1 WHERE id = $2', [salon3Id, owner3Id]);
    console.log('✓ Updated salon owners with salon IDs');

    await client.query('COMMIT');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login Credentials (all passwords: Password123!)');
    console.log('┌───────────────────────────────────────────────────');
    console.log('│ Role          │ Email                   │ Dashboard');
    console.log('├───────────────────────────────────────────────────');
    console.log('│ Admin         │ admin@glamour.io        │ /admin');
    console.log('│ Salon Owner 1 │ rajesh@luxurycuts.in    │ /dashboard');
    console.log('│ Salon Owner 2 │ priya@bellesalon.in     │ /dashboard');
    console.log('│ Salon Owner 3 │ amit@urbanstyle.in      │ /dashboard');
    console.log('│ Customer      │ customer1@example.com   │ —');
    console.log('│ ...           │ customer5@example.com   │ —');
    console.log('└───────────────────────────────────────────────────');
    console.log('\n📊 Seed Data Summary');
    console.log(`├─ ${bookings.length} bookings (with today's appointments for each salon)`);
    console.log(`├─ ${reviews.length} reviews (with helpful counts & staggered dates)`);
    console.log(`├─ ${services.length} services across 3 salons`);
    console.log(`├─ ${applications.length} pending partner applications`);
    console.log('└─ Opening hours configured per salon\n');
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
