# Glamour - Premium Salon Marketplace

Glamour is a modern, full-stack marketplace connecting customers with premium salons. Users can discover salons, compare services, read verified reviews, and book appointments instantly. Salon owners can manage their profiles, services, and bookings through a dedicated interface.

![Glamour Platform Preview](https://via.placeholder.com/1200x600?text=Glamour+Platform+Preview)

## 🌟 Key Features

### For Customers
- **Discovery**: Search and filter salons by location, service, and rating
- **Instant Booking**: Real-time availability and seamless booking process
- **Verified Reviews**: Authentic ratings and reviews from real customers
- **Transparent Pricing**: Clear service menus with durations and costs
- **Personalized Dashboard**: Track upcoming appointments and history

### For Salon Owners (Future Scope)
- **Profile Management**: Update gallery, amenities, and business hours
- **Service Menu**: Add, edit, and categorize salon services
- **Booking Management**: Accept, reschedule, or cancel appointments
- **Analytics**: Track revenue, popular services, and customer retention

### For Platform Administrators
- **Dashboard Overview**: Track key platform metrics and growth
- **Salon Verification**: Review and approve new salon listings
- **Application Management**: Handle partner onboarding requests
- **Content Moderation**: Manage user reviews and platform quality

---

## 🏗️ Architecture & Tech Stack

The application follows a modern client-server architecture with separation of concerns.

### Frontend (Client)
- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Context API

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Relational Data)
- **Caching**: Redis (Performance optimization)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, Express Rate Limit, BcryptJS

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- Node.js (v18+)
- PostgreSQL (v14+)
- Redis Server (v6+)

### 1. Database Setup
1. Start your local PostgreSQL server.
2. Create a new database named `buildathon`:
   ```bash
   createdb buildathon
   ```

### 2. Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables. Copy `.env.example` to `.env` and update values if necessary:
   ```
   PORT=5000
   NODE_ENV=development
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/buildathon
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   ```
4. Run migrations and seed data:
   ```bash
   npm run db:setup
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the project root:
   ```bash
   # From the project root
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (if needed):
   ```
   # .env.local
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Test Credentials

The database is seeded with test accounts you can use immediately:

**Administrator**
- Email: `admin@glamour.io`
- Password: `Password123!`

**Salon Owners**
- Email: `rajesh@luxurycuts.in`
- Email: `priya@bellesalon.in`
- Password: `Password123!`

**Customers**
- Email: `customer1@example.com`
- Email: `customer2@example.com`
- Password: `Password123!`

---

## 📂 Project Structure

```
├── README.md                 # Main project documentation
├── ADMIN_PANEL_README.md     # Admin portal documentation
├── server/                   # Backend Express application
│   ├── src/
│   │   ├── app.js            # Express app setup & middleware
│   │   ├── config/           # DB, Redis, Constants
│   │   ├── controllers/      # Route handlers (auth, salons, bookings)
│   │   ├── db/               # SQL Schema, Migrations, Seeders
│   │   ├── middleware/       # Auth guard, Role checks, Validation
│   │   ├── routes/           # API route definitions
│   │   └── services/         # Business logic & utilities
├── src/                      # Frontend Next.js application
│   ├── app/                  # Next.js App Router pages
│   │   ├── admin/            # Admin dashboard routes
│   │   ├── auth/             # Login & Signup routes
│   │   ├── salons/           # Public salon listing routes
│   │   ├── partner/          # Partner application page
│   │   └── page.tsx          # Homepage
│   ├── components/           # React components
│   │   ├── sections/         # Large page sections (Hero, etc.)
│   │   ├── shared/           # Reusable UI (Buttons, Cards, etc.)
│   │   └── navbar/           # Navigation components
│   ├── lib/                  # Utilities and API clients
│   │   ├── api/              # Fetch wrappers for endpoints
│   │   └── auth/             # Authentication context provider
│   └── types/                # TypeScript interface definitions
```

---

## 🔌 API Documentation Overview

The API runs on `http://localhost:5000/api/v1`. 

### Endpoints Groupings:
- `/auth` - Registration, login, token refresh, and password management
- `/salons` - Public salon discovery, filtering, and details
- `/services` - Service menus associated with specific salons
- `/bookings` - Appointment creation, status updates, and history
- `/reviews` - User feedback submission and retrieval
- `/partners` - Application submission for new salons
- `/admin` - Protected routes for platform management

All endpoints expect and return JSON payloads wrapped in a standard envelope:
```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 📄 License

This project is proprietary and confidential. Unauthorized copying of files, via any medium, is strictly prohibited.
