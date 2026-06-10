# Setup Guide - Glamour Backend

This guide will help you set up and run the Glamour backend locally for development.

## Quick Start (5 minutes)

### Prerequisites

- Node.js 16+ installed
- PostgreSQL 14+ installed
- Redis 6+ installed
- Git

### Step 1: Clone and Install

```bash
cd galmour-backend
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
# Edit .env with your local database credentials
```

### Step 3: Setup Database

```bash
# Create the database
createdb glamour_dev

# Run migrations to create tables
npm run db:migrate
```

### Step 4: Start Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

---

## Detailed Setup Guide

### Option A: Local Installation

#### 1. Install PostgreSQL

**Windows:**

- Download from https://www.postgresql.org/download/windows/
- Run installer and remember the password you set

**Mac:**

```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu):**

```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

#### 2. Create Database User (Optional, if not using default)

```bash
psql -U postgres
CREATE USER glamour WITH PASSWORD 'your_password';
ALTER USER glamour CREATEDB;
\q
```

#### 3. Create Database

```bash
createdb -U postgres glamour_dev
```

#### 4. Install Redis

**Windows:**

- Option 1: WSL2 (Windows Subsystem for Linux)
  ```bash
  # In WSL
  sudo apt-get install redis-server
  sudo service redis-server start
  ```
- Option 2: Use Memurai Redis (Windows native)
  https://github.com/microsoftarchive/redis/releases

**Mac:**

```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu):**

```bash
sudo apt-get install redis-server
sudo service redis-server start
```

### Option B: Docker Setup (Recommended)

If you have Docker installed, this is the easiest way:

```bash
# Start PostgreSQL, Redis, and admin tools
docker-compose up -d

# View container status
docker-compose ps
```

This starts:

- PostgreSQL on localhost:5432
- Redis on localhost:6379
- pgAdmin on http://localhost:5050 (admin/admin)
- Redis Commander on http://localhost:8081

To stop services:

```bash
docker-compose down
```

---

## Configuration

### 1. Environment Variables

Create `.env` file in project root (copy from `.env.example`):

```bash
# Application
NODE_ENV=development
PORT=5000
APP_NAME=Glamour

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=glamour_dev
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT (Change these in production!)
JWT_SECRET=your-development-secret-key-min-32-chars-required
JWT_EXPIRE=3600

# Email (SendGrid)
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM_EMAIL=noreply@glamour.io
```

### 2. Database Setup

```bash
# Run migrations (creates all tables)
npm run db:migrate

# Optional: Seed sample data
npm run db:seed
```

### 3. Test Connection

```bash
npm run dev
```

Visit http://localhost:5000/health - you should see:

```json
{
  "status": "ok",
  "timestamp": "2026-06-09T..."
}
```

---

## Verification Checklist

After setup, verify everything is working:

- [ ] Server starts without errors (`npm run dev`)
- [ ] Health check endpoint works (GET http://localhost:5000/health)
- [ ] PostgreSQL connection successful (see "Database connected" message)
- [ ] Redis connection successful (see "Connected to Redis" message)
- [ ] Database tables created (check pgAdmin)

### Test Database Connection

```bash
# Test PostgreSQL connection
psql -U postgres -d glamour_dev -c "\dt"
```

You should see all tables listed:

```
            List of relations
 Schema |          Name          | Type  | Owner
--------+------------------------+-------+----------
 public | bookings               | table | postgres
 public | opening_hours          | table | postgres
 public | partner_applications   | table | postgres
 public | password_reset_tokens  | table | postgres
 public | reviews                | table | postgres
 public | salons                 | table | postgres
 public | service_categories     | table | postgres
 public | services               | table | postgres
 public | sessions               | table | postgres
 public | users                  | table | postgres
```

### Test Redis Connection

```bash
# Test Redis connection
redis-cli ping
# Expected response: PONG
```

---

## Development Workflow

### Available Commands

```bash
# Development
npm run dev              # Start with hot-reload

# Production
npm start               # Start server

# Testing
npm test               # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report

# Code Quality
npm run lint           # Check linting
npm run lint:fix      # Fix linting issues
npm run format         # Format code

# Database
npm run db:migrate    # Run migrations
npm run db:seed       # Seed data
```

### File Structure

```
src/
├── index.js          # Entry point
├── app.js            # Express configuration
├── config/           # Configuration
├── models/           # Database models
├── controllers/      # Business logic (to be created)
├── routes/           # API routes
├── middleware/       # Express middleware
├── services/         # Reusable services (to be created)
├── utils/            # Helper utilities
└── db/               # Database scripts
```

### Creating a New Feature

1. **Create Model** (in `src/models/`)

   ```javascript
   export const MyModel = {
     async create(data) { ... },
     async findById(id) { ... },
     // ... other methods
   };
   ```

2. **Create Routes** (in `src/routes/`)

   ```javascript
   router.get(
     '/:id',
     asyncHandler(async (req, res) => {
       // Handle request
     })
   );
   ```

3. **Create Controller** (in `src/controllers/`)

   ```javascript
   export const getItem = asyncHandler(async (req, res) => {
     const item = await ItemModel.findById(req.params.id);
     return successResponse(res, item);
   });
   ```

4. **Add Tests** (in `tests/`)
   ```javascript
   describe('Item API', () => {
     test('should get item by id', async () => {
       // Test code
     });
   });
   ```

---

## Troubleshooting

### Port 5000 Already in Use

```bash
# Kill process using port 5000
# macOS/Linux
lsof -i :5000 | tail -1 | awk '{print $2}' | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

Or change PORT in `.env`

### PostgreSQL Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**

1. Check PostgreSQL is running: `psql -U postgres`
2. Verify credentials in `.env` (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD)
3. Check database exists: `psql -U postgres -l | grep glamour_dev`
4. If using Docker: `docker-compose ps`

### Redis Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solutions:**

1. Check Redis is running: `redis-cli ping` → should return `PONG`
2. Verify host/port in `.env`
3. If using Docker: `docker-compose logs redis`

### Database Tables Not Created

```bash
# Check if tables exist
psql -U postgres -d glamour_dev -c "\dt"

# If empty, run migrations
npm run db:migrate

# Check migration output for errors
```

### JWT Errors During Testing

Make sure `JWT_SECRET` in `.env` is at least 32 characters long.

---

## IDE Setup

### VS Code Recommended Extensions

1. **REST Client** - Test API endpoints
2. **PostgreSQL** - Database management
3. **Redis** - Redis browsing
4. **ESLint** - Code linting
5. **Prettier** - Code formatting

### VS Code Settings (`.vscode/settings.json`)

```json
{
  "editor.formatOnSave": true,
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    }
  },
  "files.exclude": {
    "node_modules": true,
    ".git": true
  }
}
```

---

## Next Steps

1. **Learn the Architecture** - Read through the PRD and understand the data models
2. **Implement Features** - Start implementing controllers and services
3. **Write Tests** - Add unit and integration tests
4. **Review Security** - Implement security best practices (rate limiting, validation, etc.)
5. **Monitor Performance** - Add logging and performance monitoring

---

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [JWT Introduction](https://jwt.io/introduction)

---

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review error messages carefully
3. Check database/Redis connections
4. Create an issue on the repository
