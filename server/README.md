# Glamour Backend API

A comprehensive RESTful API for the Glamour salon marketplace platform connecting customers with beauty professionals across India.

## Project Overview

Glamour is a salon booking platform that enables:

- **Customers**: Browse, search, and book salon services with verified reviews
- **Salon Owners**: Manage their salon, services, and bookings
- **Admins**: Monitor platform, verify salons, and manage applications

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Jest + Supertest

## Project Structure

```
src/
├── config/               # Configuration files
│   ├── database.js      # PostgreSQL connection pool
│   ├── redis.js         # Redis client setup
│   └── constants.js     # App-wide constants and enums
├── models/              # Database models
│   ├── User.js         # User model
│   ├── Salon.js        # Salon model
│   ├── Service.js      # Service model (to be created)
│   ├── Booking.js      # Booking model (to be created)
│   ├── Review.js       # Review model (to be created)
│   └── Partner.js      # Partner application model (to be created)
├── controllers/         # Request handlers
│   ├── auth.js         # Authentication logic (to be created)
│   ├── salons.js       # Salon operations (to be created)
│   ├── services.js     # Service operations (to be created)
│   ├── bookings.js     # Booking operations (to be created)
│   ├── reviews.js      # Review operations (to be created)
│   ├── partners.js     # Partner management (to be created)
│   ├── users.js        # User profile (to be created)
│   └── admin.js        # Admin operations (to be created)
├── routes/             # API route definitions
│   ├── auth.js        # /api/v1/auth
│   ├── salons.js      # /api/v1/salons
│   ├── services.js    # /api/v1/services
│   ├── bookings.js    # /api/v1/bookings
│   ├── reviews.js     # /api/v1/reviews
│   ├── partners.js    # /api/v1/partners
│   ├── users.js       # /api/v1/users
│   └── admin.js       # /api/v1/admin
├── middleware/         # Express middleware
│   ├── auth.js        # Authentication & authorization
│   └── errorHandler.js # Error handling
├── services/          # Business logic services (to be created)
│   ├── auth.js       # Auth service
│   ├── email.js      # Email sending
│   ├── cache.js      # Caching logic
│   └── booking.js    # Booking logic
├── utils/             # Utility functions
│   ├── jwt.js        # JWT operations
│   ├── validation.js # Input validation
│   └── response.js   # API response formatting
├── db/                # Database scripts
│   ├── schema.sql    # Database schema (to be created)
│   ├── seed.js       # Seed data (to be created)
│   └── migrate.js    # Migration scripts (to be created)
├── app.js            # Express app configuration
└── index.js          # Entry point

tests/                 # Test files
├── unit/             # Unit tests
├── integration/       # Integration tests
└── fixtures/         # Test data
```

## Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd galmour-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Create PostgreSQL database**

   ```bash
   createdb glamour_dev
   ```

5. **Run database migrations**

   ```bash
   npm run db:migrate
   ```

6. **Seed sample data** (optional)

   ```bash
   npm run db:seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## Available Scripts

```bash
# Development
npm run dev              # Start dev server with auto-reload

# Production
npm start               # Start server

# Testing
npm test               # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Code quality
npm run lint           # Run ESLint
npm run lint:fix      # Fix linting issues
npm run format         # Format code with Prettier

# Database
npm run db:migrate    # Run pending migrations
npm run db:seed       # Seed initial data
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token
- `POST /api/v1/auth/verify-email` - Verify email address
- `GET /api/v1/auth/me` - Get current user

### Salons

- `GET /api/v1/salons` - List all salons (paginated)
- `GET /api/v1/salons/featured` - Get featured salons
- `GET /api/v1/salons/search` - Search salons with filters
- `GET /api/v1/salons/:id` - Get salon details
- `POST /api/v1/salons` - Create new salon (auth required)
- `PUT /api/v1/salons/:id` - Update salon (owner only)
- `DELETE /api/v1/salons/:id` - Delete salon (admin only)

### Services

- `GET /api/v1/services/categories` - Get all service categories
- `GET /api/v1/services/salon/:salonId` - Get services for a salon
- `POST /api/v1/services/salon/:salonId` - Create service (owner only)
- `PUT /api/v1/services/:id` - Update service (owner only)
- `DELETE /api/v1/services/:id` - Delete service (owner only)

### Bookings

- `GET /api/v1/bookings/slots` - Get available time slots
- `GET /api/v1/bookings` - List user's bookings (auth required)
- `GET /api/v1/bookings/:id` - Get booking details (auth required)
- `POST /api/v1/bookings` - Create booking
- `PUT /api/v1/bookings/:id/cancel` - Cancel booking (auth required)
- `PUT /api/v1/bookings/:id/confirm` - Confirm booking (owner only)
- `PUT /api/v1/bookings/:id/complete` - Mark booking complete (owner only)
- `GET /api/v1/salons/:salonId/bookings` - List salon bookings (owner only)

### Reviews

- `GET /api/v1/reviews` - Get testimonials
- `GET /api/v1/reviews/salon/:salonId` - Get salon reviews
- `POST /api/v1/reviews` - Submit review
- `PUT /api/v1/reviews/:id/helpful` - Mark review as helpful
- `DELETE /api/v1/reviews/:id` - Request review removal

### Partner Management

- `POST /api/v1/partners/apply` - Submit salon application
- `GET /api/v1/partners/apply/:id` - Check application status
- `POST /api/v1/partners/:id/approve` - Approve application (admin only)
- `POST /api/v1/partners/:id/reject` - Reject application (admin only)

### User Profile

- `PUT /api/v1/users/profile` - Update profile (auth required)
- `PUT /api/v1/users/password` - Change password (auth required)

### Admin

- `GET /api/v1/admin/dashboard/stats` - Get dashboard stats (admin only)
- `GET /api/v1/admin/applications` - List applications (admin only)
- `PUT /api/v1/admin/salons/:id/verify` - Verify salon (admin only)
- `DELETE /api/v1/admin/salons/:id` - Hard delete salon (admin only)

## Authentication

The API uses JWT-based authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- `customer` - Regular user
- `salonOwner` - Salon owner/manager
- `admin` - Platform administrator

## Error Handling

All errors follow a consistent format:

```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field": "fieldName",
    "value": "problematic value"
  }
}
```

## Database Schema

See [BACKEND_PRD.md](./BACKEND_PRD.md) Section 8 for the complete database schema.

## Caching Strategy

The API implements Redis caching for performance:

| Endpoint             | TTL    | Invalidation |
| -------------------- | ------ | ------------ |
| /salons/featured     | 5 min  | Manual       |
| /salons              | 5 min  | Manual       |
| /salons/:id          | 5 min  | On update    |
| /services/categories | 1 hour | Manual       |
| /reviews             | 1 hour | On creation  |
| /bookings/slots      | 2 min  | On booking   |

## Security

- Passwords are hashed using bcrypt (10 salt rounds)
- JWTs expire after 1 hour
- Refresh tokens expire after 30 days
- Rate limiting is enforced on sensitive endpoints
- CORS is configured for allowed origins
- HTTPS required in production
- Input validation on all endpoints
- SQL injection prevention via parameterized queries

## Email Configuration

The API sends transactional emails via SendGrid/AWS SES:

- Welcome email (registration)
- Email verification
- Booking confirmation
- Booking reminder (24h before)
- Booking cancellation
- Review request
- Password reset
- Partner application status

Configure SMTP settings in `.env`

## Development Guidelines

### Code Style

- Use async/await for async operations
- Use ES modules (import/export)
- Follow camelCase for variables and functions
- Use UPPER_SNAKE_CASE for constants
- 2-space indentation

### Error Handling

- Always use try-catch with async operations
- Use the `asyncHandler` middleware wrapper
- Return consistent error responses
- Log errors with context

### Database

- Use parameterized queries to prevent SQL injection
- Always validate input before querying
- Use transactions for multi-step operations
- Index frequently queried columns

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/unit/models/User.test.js

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Deployment

See [BACKEND_PRD.md](./BACKEND_PRD.md) Section 10 for deployment guidelines.

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT_SECRET (min 32 chars)
- [ ] Use strong database password
- [ ] Enable HTTPS
- [ ] Configure production database
- [ ] Set up Redis for caching
- [ ] Configure email service
- [ ] Set CORS_ORIGIN to production domain
- [ ] Enable logging and monitoring
- [ ] Set up backups
- [ ] Test all critical flows

## Documentation

- [Product Requirements Document](./BACKEND_PRD.md) - Complete PRD with all features
- [API Documentation](./docs/API.md) - Detailed endpoint documentation (to be created)
- [Database Schema](./docs/DATABASE.md) - Database design (to be created)
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute (to be created)

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

- Ensure PostgreSQL is running
- Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in .env
- Verify database exists: `psql -l`

### Redis Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

- Ensure Redis is running: `redis-cli ping`
- Check REDIS_HOST and REDIS_PORT in .env

### Port Already in Use

```
Error: listen EADDRINUSE :::5000
```

- Change PORT in .env
- Or kill process using port: `lsof -i :5000 | kill -9 <PID>`

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues, please create an issue on the repository or contact the development team.
