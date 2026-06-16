-- Users Table
CREATE TABLE
    IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email VARCHAR(254) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        avatar TEXT,
        role VARCHAR(50) NOT NULL DEFAULT 'customer', -- customer, salonOwner, admin
        salon_id UUID,
        city VARCHAR(100),
        email_verified BOOLEAN DEFAULT FALSE,
        active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
    );

CREATE INDEX idx_users_email ON users (email);

CREATE UNIQUE INDEX idx_users_phone_unique ON users (phone) WHERE phone IS NOT NULL;

CREATE INDEX idx_users_role ON users (role);

CREATE INDEX idx_users_salon_id ON users (salon_id);

-- Salons Table
CREATE TABLE
    IF NOT EXISTS salons (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        tagline VARCHAR(255),
        description TEXT,
        email VARCHAR(254) NOT NULL UNIQUE,
        phone VARCHAR(20) NOT NULL,
        website TEXT,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        coordinates JSONB,
        cover_image TEXT,
        gallery JSONB,
        amenities JSONB,
        starting_price DECIMAL(10, 2) DEFAULT 0,
        rating DECIMAL(2, 1) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        salon_owner_id UUID NOT NULL REFERENCES users (id),
        featured BOOLEAN DEFAULT FALSE,
        verified BOOLEAN DEFAULT FALSE,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
    );

CREATE INDEX idx_salons_city ON salons (city);

CREATE INDEX idx_salons_rating ON salons (rating DESC);

CREATE INDEX idx_salons_verified ON salons (verified);

CREATE INDEX idx_salons_featured ON salons (featured);

CREATE INDEX idx_salons_salon_owner_id ON salons (salon_owner_id);

-- Service Categories Table
CREATE TABLE
    IF NOT EXISTS service_categories (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        icon VARCHAR(100),
        description TEXT,
        count INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL
    );

-- Services Table
CREATE TABLE
    IF NOT EXISTS services (
        id UUID PRIMARY KEY,
        salon_id UUID NOT NULL REFERENCES salons (id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        duration VARCHAR(50) NOT NULL,
        category VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
    );

CREATE INDEX idx_services_salon_id ON services (salon_id);

CREATE INDEX idx_services_category ON services (category);

CREATE INDEX idx_services_is_active ON services (is_active);

-- Bookings Table
CREATE TABLE
    IF NOT EXISTS bookings (
        id UUID PRIMARY KEY,
        salon_id UUID NOT NULL REFERENCES salons (id),
        service_id UUID NOT NULL REFERENCES services (id),
        customer_id UUID REFERENCES users (id),
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        duration VARCHAR(50),
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(254) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, confirmed, completed, cancelled
        notes TEXT,
        cancellation_reason TEXT,
        cancelled_by VARCHAR(50), -- customer, salon, admin
        cancelled_at TIMESTAMP,
        confirmation_token VARCHAR(255),
        reminder_sent_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
    );

CREATE INDEX idx_bookings_salon_id ON bookings (salon_id);

CREATE INDEX idx_bookings_salon_date ON bookings (salon_id, booking_date);

CREATE INDEX idx_bookings_customer_id ON bookings (customer_id);

CREATE INDEX idx_bookings_status ON bookings (status);

CREATE INDEX idx_bookings_date ON bookings (booking_date);

-- Reviews Table
CREATE TABLE
    IF NOT EXISTS reviews (
        id UUID PRIMARY KEY,
        salon_id UUID NOT NULL REFERENCES salons (id),
        customer_id UUID REFERENCES users (id),
        booking_id UUID REFERENCES bookings (id),
        rating INTEGER NOT NULL CHECK (
            rating >= 1
            AND rating <= 5
        ),
        title VARCHAR(255),
        text TEXT NOT NULL,
        author_name VARCHAR(100) NOT NULL,
        author_initials VARCHAR(2),
        avatar TEXT,
        helpful INTEGER DEFAULT 0,
        unhelpful INTEGER DEFAULT 0,
        verified BOOLEAN DEFAULT FALSE,
        approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
    );

CREATE INDEX idx_reviews_salon_id ON reviews (salon_id);

CREATE INDEX idx_reviews_customer_id ON reviews (customer_id);

CREATE INDEX idx_reviews_approved ON reviews (approved);

CREATE INDEX idx_reviews_created_at ON reviews (created_at DESC);

-- Partner Applications Table
CREATE TABLE
    IF NOT EXISTS partner_applications (
        id UUID PRIMARY KEY,
        salon_name VARCHAR(255) NOT NULL,
        owner_name VARCHAR(100) NOT NULL,
        email VARCHAR(254) NOT NULL UNIQUE,
        phone VARCHAR(20) NOT NULL,
        city VARCHAR(100) NOT NULL,
        message TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
        rejection_reason TEXT,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        reviewed_at TIMESTAMP,
        reviewed_by UUID REFERENCES users (id)
    );

CREATE INDEX idx_partner_applications_email ON partner_applications (email);

CREATE INDEX idx_partner_applications_status ON partner_applications (status);

CREATE INDEX idx_partner_applications_created_at ON partner_applications (created_at DESC);

-- Opening Hours Table
CREATE TABLE
    IF NOT EXISTS opening_hours (
        id UUID PRIMARY KEY,
        salon_id UUID NOT NULL REFERENCES salons (id),
        day VARCHAR(20) NOT NULL,
        open_time TIME,
        close_time TIME,
        closed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
    );

CREATE INDEX idx_opening_hours_salon_id ON opening_hours (salon_id);

-- Sessions Table (for JWT token management)
CREATE TABLE
    IF NOT EXISTS sessions (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users (id),
        token VARCHAR(1000) NOT NULL,
        refresh_token VARCHAR(1000),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL
    );

CREATE INDEX idx_sessions_user_id ON sessions (user_id);

CREATE INDEX idx_sessions_token ON sessions (token);

-- Password Reset Tokens Table
CREATE TABLE
    IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users (id),
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL
    );

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens (user_id);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens (token);

-- Email Verification Tokens Table
CREATE TABLE
    IF NOT EXISTS email_verification_tokens (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users (id),
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL
    );

CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens (user_id);

CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens (token);