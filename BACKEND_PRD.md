# BACKEND PRD: Glamour - Salon Marketplace Platform

**Project Name:** Glamour  
**Version:** 1.0  
**Date:** 2026-06-09  
**Status:** Product Requirements Document

---

## 1. EXECUTIVE SUMMARY

Glamour is a comprehensive salon marketplace platform that connects customers with beauty and grooming professionals across India. The platform enables customers to discover, compare, and book salon services seamlessly while providing salon owners with a centralized management system.

**Core Value Proposition:**

- Customers: Unified platform to find, compare, and book trusted salons with transparent pricing and verified reviews
- Salon Partners: Access to a curated customer base and modern booking management system

---

## 2. PRODUCT OVERVIEW

### 2.1 Platform Architecture

- **Frontend:** Next.js 16 (React 19) with TypeScript
- **Backend:** To be implemented (Node.js/Express, Python/Django, or Java/Spring Boot - architect's choice)
- **Database:** PostgreSQL / MongoDB (to be selected)
- **Authentication:** JWT-based token authentication
- **API Style:** RESTful JSON API

### 2.2 Key Platforms

1. **Customer Portal:** Browse, search, and book salon services
2. **Salon Admin Dashboard:** Manage salon details, services, availability, and bookings
3. **Public API:** Mobile app support and third-party integrations

---

## 3. CORE FEATURES & REQUIREMENTS

### 3.1 SALONS MANAGEMENT

#### 3.1.1 Salon Data Model

```
Salon {
  id: UUID (primary key)
  name: string (required, max 255)
  slug: string (unique, required)
  tagline: string (max 255)
  description: string (long text)

  // Contact Information
  email: string (required, unique)
  phone: string (required, E.164 format)
  website: string (URL, optional)
  address: string (required)
  city: string (required, indexed)

  // Ratings & Reviews
  rating: decimal (0-5, calculated field)
  reviewCount: integer (calculated field)

  // Business Details
  startingPrice: decimal (>= 0)
  distance: string (calculated from user location)
  coordinates: {
    latitude: decimal,
    longitude: decimal
  }

  // Media & Gallery
  coverImage: string (image URL)
  gallery: string[] (array of image URLs, max 20)

  // Operating Hours
  openingHours: OpeningHours[] {
    day: enum (Monday-Sunday)
    open: time (HH:MM format)
    close: time (HH:MM format)
    closed: boolean (optional)
  }

  // Amenities
  amenities: string[] (e.g., Wi-Fi, Parking, A/C)

  // Status
  featured: boolean (default: false)
  verified: boolean (default: false)
  active: boolean (default: true)

  // Metadata
  createdAt: timestamp
  updatedAt: timestamp
  salonOwnerId: UUID (foreign key)
}
```

#### 3.1.2 API Endpoints - Salons

##### GET /api/v1/salons/featured

- **Description:** Fetch featured salons for homepage
- **Authentication:** None
- **Query Parameters:**
  - `limit` (optional, default: 6): number of salons
  - `city` (optional): filter by city
- **Response:**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "uuid",
        "name": "Luxury Cuts",
        "slug": "luxury-cuts",
        "tagline": "Where precision meets elegance",
        "rating": 4.9,
        "reviewCount": 328,
        "coverImage": "/images/salon-1.jpg",
        "startingPrice": 500,
        "city": "Kolkata",
        "distance": "1.2 km",
        "verified": true,
        "featured": true
      }
    ],
    "count": 6
  }
  ```
- **HTTP Status:** 200 OK
- **Error Handling:**
  - 500: Internal Server Error

##### GET /api/v1/salons

- **Description:** List all salons with pagination
- **Authentication:** None
- **Query Parameters:**
  - `page` (optional, default: 1): page number
  - `limit` (optional, default: 12): items per page (max: 100)
  - `city` (optional): filter by city
  - `sortBy` (optional): "featured", "rating", "newest"
- **Response:**
  ```json
  {
    "status": "success",
    "data": [
      {
        /* salon objects */
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 156,
      "totalPages": 13
    }
  }
  ```
- **HTTP Status:** 200 OK
- **Caching:** 5 minutes (Redis)

##### GET /api/v1/salons/:id

- **Description:** Fetch salon details by ID
- **Authentication:** None
- **URL Parameters:**
  - `id` (required): UUID of salon
- **Response:**
  ```json
  {
    "status": "success",
    "data": {
      "id": "uuid",
      "name": "Luxury Cuts",
      "slug": "luxury-cuts",
      "tagline": "Where precision meets elegance",
      "description": "Award-winning salon...",
      "rating": 4.9,
      "reviewCount": 328,
      "email": "hello@luxurycuts.in",
      "phone": "+91-98765-43210",
      "address": "42 Park Street, Kolkata",
      "city": "Kolkata",
      "startingPrice": 500,
      "coverImage": "/images/salon-1.jpg",
      "gallery": ["/images/gallery-1.jpg", ...],
      "amenities": ["Wi-Fi", "Parking", "A/C"],
      "openingHours": [
        {
          "day": "Monday",
          "open": "09:00",
          "close": "20:00",
          "closed": false
        }
      ],
      "services": [
        {
          "id": "uuid",
          "name": "Signature Haircut",
          "price": 800,
          "duration": "45 min",
          "category": "Haircut",
          "description": "Precision cut..."
        }
      ],
      "coordinates": {
        "latitude": 22.5726,
        "longitude": 88.3639
      },
      "verified": true,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-06-09T00:00:00Z"
    }
  }
  ```
- **HTTP Status:** 200 OK
- **Error Handling:**
  - 404: Salon not found
  - 500: Internal Server Error
- **Caching:** 5 minutes (Redis)

##### GET /api/v1/salons/search

- **Description:** Search salons with advanced filters
- **Authentication:** None
- **Query Parameters:**
  - `q` (optional): search term (salon name, city)
  - `location` (optional): city name
  - `service` (optional): service category
  - `minRating` (optional): minimum rating (0-5)
  - `maxPrice` (optional): maximum starting price
  - `sortBy` (optional): "rating", "distance", "price"
  - `page` (optional, default: 1)
  - `limit` (optional, default: 12)
- **Response:** Same as GET /api/v1/salons
- **HTTP Status:** 200 OK
- **Caching:** Not cached (search is dynamic)

##### POST /api/v1/salons (Admin Only)

- **Description:** Create new salon (salon owner registration)
- **Authentication:** Required (JWT - Salon Owner role)
- **Request Body:**
  ```json
  {
    "name": "Luxury Cuts",
    "tagline": "Where precision meets elegance",
    "description": "Award-winning salon...",
    "email": "hello@luxurycuts.in",
    "phone": "+91-98765-43210",
    "website": "https://luxurycuts.in",
    "address": "42 Park Street, Kolkata",
    "city": "Kolkata",
    "coordinates": {
      "latitude": 22.5726,
      "longitude": 88.3639
    },
    "amenities": ["Wi-Fi", "Parking", "A/C"],
    "openingHours": [
      {
        "day": "Monday",
        "open": "09:00",
        "close": "20:00"
      }
    ]
  }
  ```
- **Response:** Created salon object (same as GET /api/v1/salons/:id)
- **HTTP Status:** 201 Created
- **Validation Rules:**
  - name: required, 3-255 characters
  - email: required, valid email format, unique
  - phone: required, valid E.164 format
  - address & city: required
  - tagline: 0-255 characters
  - Amenities: max 20 items
  - Opening hours: all 7 days required

##### PUT /api/v1/salons/:id (Owner Only)

- **Description:** Update salon details
- **Authentication:** Required (JWT - Salon Owner)
- **Authorization:** User must own the salon
- **Request Body:** Same fields as POST (all optional)
- **Response:** Updated salon object
- **HTTP Status:** 200 OK
- **Error Handling:**
  - 401: Unauthorized
  - 403: Forbidden (not salon owner)
  - 404: Salon not found

##### DELETE /api/v1/salons/:id (Admin Only)

- **Description:** Soft delete a salon
- **Authentication:** Required (JWT - Admin)
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Salon deleted successfully"
  }
  ```
- **HTTP Status:** 204 No Content
- **Error Handling:**
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Salon not found

---

### 3.2 SERVICES MANAGEMENT

#### 3.2.1 Service Data Model

```
Service {
  id: UUID (primary key)
  salonId: UUID (foreign key, indexed)
  name: string (required, max 255)
  description: string (long text)
  price: decimal (required, >= 0)
  duration: string (e.g., "45 min", required)
  category: string (required, indexed)
  isActive: boolean (default: true)
  createdAt: timestamp
  updatedAt: timestamp
}

ServiceCategory {
  id: UUID (primary key)
  name: string (required, unique)
  slug: string (unique)
  icon: string (icon name, e.g., "Scissors")
  description: string
  count: integer (calculated field)
  createdAt: timestamp
}
```

#### 3.2.2 API Endpoints - Services

##### GET /api/v1/services/categories

- **Description:** Fetch all service categories
- **Authentication:** None
- **Response:**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "uuid",
        "name": "Haircut",
        "slug": "haircut",
        "icon": "Scissors",
        "description": "Precision cuts for every style",
        "count": 245
      }
    ],
    "count": 8
  }
  ```
- **HTTP Status:** 200 OK
- **Caching:** 1 hour (Redis)

##### GET /api/v1/salons/:salonId/services

- **Description:** Get all services for a salon
- **Authentication:** None
- **URL Parameters:**
  - `salonId` (required): UUID of salon
- **Response:**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "uuid",
        "name": "Signature Haircut",
        "price": 800,
        "duration": "45 min",
        "category": "Haircut",
        "description": "Precision cut..."
      }
    ],
    "count": 8
  }
  ```
- **HTTP Status:** 200 OK
- **Caching:** 5 minutes

##### POST /api/v1/salons/:salonId/services (Owner Only)

- **Description:** Create a new service
- **Authentication:** Required (JWT - Salon Owner)
- **Authorization:** User must own the salon
- **Request Body:**
  ```json
  {
    "name": "Signature Haircut",
    "price": 800,
    "duration": "45 min",
    "category": "Haircut",
    "description": "Precision cut tailored to your face shape"
  }
  ```
- **Response:** Created service object
- **HTTP Status:** 201 Created
- **Validation Rules:**
  - name: required, 3-255 characters
  - price: required, >= 0
  - duration: required, valid format
  - category: required, must exist in ServiceCategory

##### PUT /api/v1/services/:id (Owner Only)

- **Description:** Update service details
- **Authentication:** Required (JWT)
- **Authorization:** User must own the salon
- **Response:** Updated service object
- **HTTP Status:** 200 OK

##### DELETE /api/v1/services/:id (Owner Only)

- **Description:** Delete a service
- **Authentication:** Required (JWT)
- **Authorization:** User must own the salon
- **HTTP Status:** 204 No Content

---

### 3.3 BOOKINGS MANAGEMENT

#### 3.3.1 Booking Data Model

```
Booking {
  id: UUID (primary key)
  salonId: UUID (foreign key, indexed)
  serviceId: UUID (foreign key)
  customerId: UUID (foreign key, nullable - allow guest bookings)

  // Booking Details
  date: date (required)
  time: time (required)
  duration: string (inherited from service)

  // Customer Information
  customerName: string (required, max 255)
  customerEmail: string (required, email format)
  customerPhone: string (required, E.164 format)

  // Status
  status: enum (pending, confirmed, completed, cancelled)
    - pending: awaiting salon confirmation
    - confirmed: salon confirmed the booking
    - completed: service completed
    - cancelled: booking cancelled

  // Additional
  notes: string (optional, max 1000)
  cancellationReason: string (optional, only if cancelled)
  cancelledBy: enum (customer, salon, admin)
  cancelledAt: timestamp (optional)

  // Metadata
  createdAt: timestamp
  updatedAt: timestamp
  confirmationToken: string (for email confirmation)
  reminderSentAt: timestamp (optional)
}

TimeSlot {
  time: time (HH:MM format)
  available: boolean
  bookedBy?: {
    bookingId: UUID
    customerName: string
  }
}
```

#### 3.3.2 API Endpoints - Bookings

##### GET /api/v1/bookings/slots

- **Description:** Get available time slots for a salon on a given date
- **Authentication:** None (public)
- **Query Parameters:**
  - `salonId` (required): UUID
  - `date` (required): YYYY-MM-DD format
  - `serviceId` (optional): UUID of service to check duration
- **Response:**
  ```json
  {
    "status": "success",
    "date": "2026-06-15",
    "salonId": "uuid",
    "data": [
      {
        "time": "09:00",
        "available": true
      },
      {
        "time": "09:30",
        "available": false,
        "bookedBy": {
          "bookingId": "uuid",
          "customerName": "John Doe"
        }
      }
    ],
    "count": 16
  }
  ```
- **HTTP Status:** 200 OK
- **Business Logic:**
  - Show slots during salon's operating hours
  - Account for service duration when showing availability
  - Hide salons that are closed on the selected date
  - 30-minute time slot intervals
  - No slots for past times (same-day bookings only in current hour or later)
- **Caching:** 2 minutes (cache invalidated on each booking)

##### POST /api/v1/bookings

- **Description:** Create a new booking
- **Authentication:** None (allow guest bookings, but logged-in users get priority)
- **Request Body:**
  ```json
  {
    "salonId": "uuid",
    "serviceId": "uuid",
    "date": "2026-06-15",
    "time": "10:30",
    "customerName": "Priya Sharma",
    "customerEmail": "priya@example.com",
    "customerPhone": "+91-98765-43210",
    "notes": "First time at this salon, please be gentle"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "data": {
      "id": "uuid",
      "salonId": "uuid",
      "serviceId": "uuid",
      "date": "2026-06-15",
      "time": "10:30",
      "status": "pending",
      "customerName": "Priya Sharma",
      "customerEmail": "priya@example.com",
      "createdAt": "2026-06-09T15:30:00Z"
    },
    "message": "Booking confirmed! Check your email for details."
  }
  ```
- **HTTP Status:** 201 Created
- **Validation Rules:**
  - salonId & serviceId: must exist
  - date: must be today or in future, max 90 days ahead
  - time: must be during salon's operating hours, in 30-min intervals
  - customerEmail: valid email format, unique per booking
  - customerPhone: valid E.164 format
  - Slot must be available
- **Side Effects:**
  - Send confirmation email to customer with details and link to cancel
  - Send notification to salon with new booking
  - Auto-confirm booking if salon has auto-confirmation enabled (future feature)
  - Reservation expires in 2 hours if not confirmed by salon (future feature)
- **Error Handling:**
  - 400: Invalid slot (past time, already booked, salon closed)
  - 409: Slot no longer available
  - 422: Validation error

##### GET /api/v1/bookings/:id

- **Description:** Fetch booking details
- **Authentication:** Required (JWT)
- **Authorization:** User is customer, salon owner, or admin
- **URL Parameters:**
  - `id` (required): UUID
- **Response:**
  ```json
  {
    "status": "success",
    "data": {
      "id": "uuid",
      "salonId": "uuid",
      "salon": {
        "id": "uuid",
        "name": "Luxury Cuts",
        "phone": "+91-98765-43210"
      },
      "serviceId": "uuid",
      "service": {
        "id": "uuid",
        "name": "Signature Haircut",
        "price": 800,
        "duration": "45 min"
      },
      "date": "2026-06-15",
      "time": "10:30",
      "status": "confirmed",
      "customerName": "Priya Sharma",
      "customerEmail": "priya@example.com",
      "customerPhone": "+91-98765-43210",
      "notes": "First time...",
      "createdAt": "2026-06-09T15:30:00Z",
      "updatedAt": "2026-06-09T15:45:00Z"
    }
  }
  ```
- **HTTP Status:** 200 OK
- **Error Handling:**
  - 401: Unauthorized
  - 403: Forbidden (no access)
  - 404: Booking not found

##### GET /api/v1/bookings (User Bookings)

- **Description:** List user's bookings
- **Authentication:** Required (JWT)
- **Query Parameters:**
  - `status` (optional): filter by status
  - `page` (optional, default: 1)
  - `limit` (optional, default: 10)
- **Response:**
  ```json
  {
    "status": "success",
    "data": [
      /* booking objects */
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 24,
      "totalPages": 3
    }
  }
  ```
- **HTTP Status:** 200 OK

##### PUT /api/v1/bookings/:id/cancel

- **Description:** Cancel a booking
- **Authentication:** Required (JWT)
- **Authorization:** Customer (before 24h), salon owner, or admin
- **Request Body:**
  ```json
  {
    "reason": "Change of plans"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Booking cancelled successfully",
    "data": {
      /* updated booking */
    }
  }
  ```
- **HTTP Status:** 200 OK
- **Business Logic:**
  - Customers can cancel up to 24 hours before appointment
  - After 24 hours, only salon or admin can cancel
  - Cancelled bookings become available for rebooking
  - Send cancellation confirmation email
- **Error Handling:**
  - 400: Cannot cancel (within 24 hours for customer)
  - 403: Forbidden
  - 404: Booking not found
  - 409: Booking already cancelled/completed

##### PUT /api/v1/bookings/:id/confirm (Salon Only)

- **Description:** Salon confirms a pending booking
- **Authentication:** Required (JWT - Salon Owner)
- **Authorization:** Must own the salon
- **Response:** Updated booking with status = "confirmed"
- **HTTP Status:** 200 OK
- **Side Effects:**
  - Send confirmation email to customer
  - Send reminder email 24 hours before

##### PUT /api/v1/bookings/:id/complete (Salon Only)

- **Description:** Mark booking as completed
- **Authentication:** Required (JWT - Salon Owner)
- **Request Body:**
  ```json
  {
    "actualPrice": 800,
    "notes": "Service completed successfully"
  }
  ```
- **Response:** Updated booking
- **HTTP Status:** 200 OK
- **Business Logic:**
  - Only mark as complete on or after appointment date
  - Can optionally update price if different from quoted
  - Allows salon to add notes
  - Triggers email to customer asking for review

##### GET /api/v1/salons/:salonId/bookings (Salon Dashboard)

- **Description:** List all bookings for a salon
- **Authentication:** Required (JWT - Salon Owner)
- **Authorization:** Must own the salon
- **Query Parameters:**
  - `status` (optional)
  - `date` (optional): YYYY-MM-DD, show bookings for this date
  - `page` (optional, default: 1)
- **Response:** Array of bookings with customer details
- **HTTP Status:** 200 OK

---

### 3.4 REVIEWS & RATINGS

#### 3.4.1 Review Data Model

```
Review {
  id: UUID (primary key)
  salonId: UUID (foreign key, indexed)
  customerId: UUID (foreign key, indexed, nullable)

  // Review Content
  rating: integer (1-5, required)
  title: string (max 255, optional)
  text: string (min 10, max 2000, required)

  // Reviewer Info
  authorName: string (required, max 100)
  authorInitials: string (generated, 2 chars)
  avatar?: string (profile image URL)

  // Engagement
  helpful: integer (count of helpful votes, default: 0)
  unhelpful: integer (count of unhelpful votes, default: 0)

  // Status
  verified: boolean (default: false)
  approved: boolean (default: false)

  // Metadata
  createdAt: timestamp
  updatedAt: timestamp
  bookingId?: UUID (reference to completed booking)
}

RatingAggregate {
  salonId: UUID
  averageRating: decimal (0-5)
  totalReviews: integer
  ratingDistribution: {
    "5": integer,
    "4": integer,
    "3": integer,
    "2": integer,
    "1": integer
  }
}
```

#### 3.4.2 API Endpoints - Reviews

##### GET /api/v1/reviews

- **Description:** Fetch testimonials for homepage
- **Authentication:** None
- **Query Parameters:**
  - `limit` (optional, default: 6): number of reviews
  - `minRating` (optional, default: 4): minimum rating
- **Response:**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "uuid",
        "authorName": "Priya Sharma",
        "authorInitials": "PS",
        "rating": 5,
        "text": "Absolutely loved the experience...",
        "salonName": "Luxury Cuts",
        "date": "2025-12-15",
        "helpful": 24,
        "verified": true
      }
    ],
    "count": 6
  }
  ```
- **HTTP Status:** 200 OK
- **Caching:** 1 hour

##### GET /api/v1/salons/:salonId/reviews

- **Description:** Fetch reviews for a specific salon
- **Authentication:** None
- **Query Parameters:**
  - `page` (optional, default: 1)
  - `limit` (optional, default: 10, max: 50)
  - `sort` (optional): "recent", "helpful", "rating"
- **Response:**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "uuid",
        "authorName": "Priya Sharma",
        "rating": 5,
        "title": "Perfect haircut!",
        "text": "Absolutely loved...",
        "date": "2025-12-15",
        "helpful": 24,
        "verified": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 328,
      "totalPages": 33
    },
    "aggregate": {
      "averageRating": 4.9,
      "totalReviews": 328,
      "ratingDistribution": {
        "5": 298,
        "4": 25,
        "3": 5,
        "2": 0,
        "1": 0
      }
    }
  }
  ```
- **HTTP Status:** 200 OK
- **Caching:** 5 minutes

##### POST /api/v1/reviews

- **Description:** Submit a new review
- **Authentication:** Optional (JWT - enhanced experience for logged-in users)
- **Request Body:**
  ```json
  {
    "salonId": "uuid",
    "rating": 5,
    "title": "Perfect haircut!",
    "text": "Absolutely loved the experience at Luxury Cuts...",
    "authorName": "Priya Sharma",
    "bookingId": "uuid"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Thank you for your review! It will be published after moderation.",
    "data": {
      "id": "uuid",
      "salonId": "uuid",
      "rating": 5,
      "text": "Absolutely loved...",
      "authorName": "Priya Sharma",
      "approved": false,
      "createdAt": "2026-06-09T15:30:00Z"
    }
  }
  ```
- **HTTP Status:** 201 Created
- **Validation Rules:**
  - rating: required, 1-5
  - text: required, 10-2000 characters
  - salonId: must exist
  - authorName: required, 2-100 characters
  - One review per booking (if bookingId provided)
  - Prevent duplicate reviews by same person for same salon within 30 days (future)
- **Side Effects:**
  - Review goes to moderation queue
  - If verified booking: auto-approve (future feature)
  - Send notification to salon owner
  - Update salon's rating aggregate
- **Error Handling:**
  - 400: Invalid data
  - 404: Salon not found
  - 409: Review already exists for this booking

##### PUT /api/v1/reviews/:id/helpful

- **Description:** Mark review as helpful
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "helpful": true
  }
  ```
- **Response:** Updated review object
- **HTTP Status:** 200 OK
- **Business Logic:**
  - Track IP/user to prevent duplicate votes (future)

##### DELETE /api/v1/reviews/:id (Salon Owner)

- **Description:** Request review removal (for inappropriate content)
- **Authentication:** Required (JWT - Salon Owner or Admin)
- **Request Body:**
  ```json
  {
    "reason": "Inappropriate content / Spam / Defamatory"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Review removal request submitted"
  }
  ```
- **HTTP Status:** 200 OK
- **Business Logic:**
  - Moves to removal queue for admin review
  - Does not delete immediately
  - Send notification to customer

---

### 3.5 PARTNER MANAGEMENT

#### 3.5.1 Partner Application Data Model

```
PartnerApplication {
  id: UUID (primary key)

  // Salon Information
  salonName: string (required, max 255)
  ownerName: string (required, max 100)
  email: string (required, unique, indexed)
  phone: string (required, E.164 format)
  city: string (required)

  // Application
  message: string (optional, max 1000)
  status: enum (pending, approved, rejected)
  rejectionReason?: string

  // Metadata
  createdAt: timestamp
  updatedAt: timestamp
  reviewedAt?: timestamp
  reviewedBy?: UUID (admin user)
}
```

#### 3.5.2 API Endpoints - Partner Applications

##### POST /api/v1/partners/apply

- **Description:** Submit salon partnership application
- **Authentication:** None (open to public)
- **Request Body:**
  ```json
  {
    "salonName": "Luxury Cuts",
    "ownerName": "Rajesh Kumar",
    "email": "rajesh@luxurycuts.in",
    "phone": "+91-98765-43210",
    "city": "Kolkata",
    "message": "We are an award-winning salon..."
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Thank you for applying! We will review your application and get back to you within 3-5 business days.",
    "data": {
      "id": "uuid",
      "status": "pending",
      "createdAt": "2026-06-09T15:30:00Z"
    }
  }
  ```
- **HTTP Status:** 201 Created
- **Validation Rules:**
  - salonName: required, 3-255 characters
  - ownerName: required, 2-100 characters
  - email: required, valid format, unique
  - phone: required, valid E.164 format
  - city: required, must match available cities
  - message: 0-1000 characters
- **Side Effects:**
  - Send confirmation email to applicant
  - Create notification for admin to review
  - Create TODO task for admin dashboard
- **Error Handling:**
  - 400: Invalid data
  - 409: Email already applied

##### GET /api/v1/partners/apply/:id

- **Description:** Check application status
- **Authentication:** None (use email/token)
- **Query Parameters:**
  - `token` (required): verification token sent in email
- **Response:**
  ```json
  {
    "status": "success",
    "data": {
      "id": "uuid",
      "salonName": "Luxury Cuts",
      "status": "pending",
      "message": "Your application is under review",
      "createdAt": "2026-06-09T15:30:00Z"
    }
  }
  ```
- **HTTP Status:** 200 OK
- **Error Handling:**
  - 404: Application not found
  - 401: Invalid token

##### POST /api/v1/admin/partners/:id/approve (Admin Only)

- **Description:** Approve partner application and create salon account
- **Authentication:** Required (JWT - Admin)
- **Request Body:**
  ```json
  {
    "password": "initial-password-for-login"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Application approved. Salon account created.",
    "data": {
      "salonId": "uuid",
      "userId": "uuid"
    }
  }
  ```
- **HTTP Status:** 200 OK
- **Side Effects:**
  - Create Salon record
  - Create User account (salon owner role)
  - Send welcome email with login details
  - Update application status to "approved"

##### POST /api/v1/admin/partners/:id/reject (Admin Only)

- **Description:** Reject partner application
- **Authentication:** Required (JWT - Admin)
- **Request Body:**
  ```json
  {
    "reason": "Location already saturated with partners"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Application rejected"
  }
  ```
- **HTTP Status:** 200 OK
- **Side Effects:**
  - Update application status to "rejected"
  - Send rejection email with reason

---

### 3.6 AUTHENTICATION & AUTHORIZATION

#### 3.6.1 User Data Model

```
User {
  id: UUID (primary key)
  email: string (required, unique, indexed)
  password: string (bcrypt hashed, required)

  // Profile
  firstName: string (max 100)
  lastName: string (max 100)
  phone: string (E.164 format, optional)
  avatar?: string (image URL)

  // Roles
  role: enum (customer, salonOwner, admin)

  // Salon Association (for salon owners)
  salonId?: UUID (foreign key)

  // Status
  emailVerified: boolean (default: false)
  active: boolean (default: true)
  lastLogin?: timestamp

  // Metadata
  createdAt: timestamp
  updatedAt: timestamp
}

Session {
  id: UUID (primary key)
  userId: UUID (foreign key)
  token: string (JWT, unique)
  refreshToken: string (optional, for token refresh)
  expiresAt: timestamp
  createdAt: timestamp
}
```

#### 3.6.2 API Endpoints - Authentication

##### POST /api/v1/auth/register

- **Description:** User registration
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "email": "priya@example.com",
    "password": "SecurePassword123!",
    "firstName": "Priya",
    "lastName": "Sharma",
    "phone": "+91-98765-43210"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Registration successful. Check your email to verify account.",
    "data": {
      "id": "uuid",
      "email": "priya@example.com",
      "role": "customer",
      "createdAt": "2026-06-09T15:30:00Z"
    }
  }
  ```
- **HTTP Status:** 201 Created
- **Validation Rules:**
  - email: required, valid format, unique
  - password: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
  - firstName/lastName: max 100 chars each
  - phone: valid E.164 format (optional)
- **Side Effects:**
  - Send verification email with link
  - Create user with role = "customer"
  - emailVerified = false initially

##### POST /api/v1/auth/login

- **Description:** User login
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "email": "priya@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "data": {
      "id": "uuid",
      "email": "priya@example.com",
      "firstName": "Priya",
      "role": "customer",
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  }
  ```
- **HTTP Status:** 200 OK
- **Validation Rules:**
  - email & password: required
  - User must exist and emailVerified = true
  - Account must be active
- **Side Effects:**
  - Create session record
  - Update lastLogin timestamp
  - Token expires in 1 hour
- **Error Handling:**
  - 401: Invalid credentials
  - 403: Email not verified
  - 403: Account disabled

##### POST /api/v1/auth/logout

- **Description:** User logout
- **Authentication:** Required (JWT)
- **Request Body:**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Logged out successfully"
  }
  ```
- **HTTP Status:** 200 OK
- **Side Effects:**
  - Invalidate session token
  - Delete refresh token (if applicable)

##### POST /api/v1/auth/refresh

- **Description:** Refresh JWT token
- **Authentication:** Required (RefreshToken)
- **Request Body:**
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  }
  ```
- **HTTP Status:** 200 OK

##### POST /api/v1/auth/forgot-password

- **Description:** Request password reset
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "email": "priya@example.com"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Check your email for password reset link"
  }
  ```
- **HTTP Status:** 200 OK
- **Side Effects:**
  - Generate reset token
  - Send reset email with link

##### POST /api/v1/auth/reset-password

- **Description:** Reset password with token
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "token": "reset-token",
    "password": "NewPassword123!"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Password reset successfully"
  }
  ```
- **HTTP Status:** 200 OK
- **Error Handling:**
  - 400: Token expired or invalid
  - 422: Password validation failed

##### POST /api/v1/auth/verify-email

- **Description:** Verify email address
- **Authentication:** None
- **Query Parameters:**
  - `token` (required): verification token from email
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Email verified successfully"
  }
  ```
- **HTTP Status:** 200 OK
- **Error Handling:**
  - 400: Token expired
  - 404: User not found

##### GET /api/v1/auth/me

- **Description:** Get current authenticated user
- **Authentication:** Required (JWT)
- **Response:**
  ```json
  {
    "status": "success",
    "data": {
      "id": "uuid",
      "email": "priya@example.com",
      "firstName": "Priya",
      "role": "customer",
      "salonId": null,
      "lastLogin": "2026-06-09T15:30:00Z"
    }
  }
  ```
- **HTTP Status:** 200 OK

---

### 3.7 USER PROFILE MANAGEMENT

#### 3.7.1 API Endpoints - User Profile

##### PUT /api/v1/users/profile

- **Description:** Update user profile
- **Authentication:** Required (JWT)
- **Request Body:**
  ```json
  {
    "firstName": "Priya",
    "lastName": "Sharma",
    "phone": "+91-98765-43210",
    "avatar": "image-url"
  }
  ```
- **Response:** Updated user object
- **HTTP Status:** 200 OK

##### PUT /api/v1/users/password

- **Description:** Change password (authenticated user)
- **Authentication:** Required (JWT)
- **Request Body:**
  ```json
  {
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword456!"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Password changed successfully"
  }
  ```
- **HTTP Status:** 200 OK
- **Error Handling:**
  - 401: Current password incorrect

---

### 3.8 ADMIN OPERATIONS

#### 3.8.1 Admin Data Management

##### GET /api/v1/admin/dashboard/stats

- **Description:** Get platform statistics
- **Authentication:** Required (JWT - Admin)
- **Response:**
  ```json
  {
    "status": "success",
    "data": {
      "totalSalons": 1500,
      "totalBookings": 45000,
      "totalUsers": 120000,
      "totalReviews": 8500,
      "pendingApplications": 23,
      "pendingReviews": 45,
      "revenue": {
        "thisMonth": 250000,
        "thisYear": 2100000
      },
      "topSalons": [
        {
          "id": "uuid",
          "name": "Luxury Cuts",
          "rating": 4.9,
          "bookings": 450
        }
      ]
    }
  }
  ```
- **HTTP Status:** 200 OK
- **Caching:** 5 minutes

##### GET /api/v1/admin/applications

- **Description:** List partner applications
- **Authentication:** Required (JWT - Admin)
- **Query Parameters:**
  - `status` (optional): pending, approved, rejected
  - `page` (optional, default: 1)
  - `limit` (optional, default: 20)
- **Response:** Array of applications
- **HTTP Status:** 200 OK

##### PUT /api/v1/admin/salons/:id/verify

- **Description:** Mark salon as verified
- **Authentication:** Required (JWT - Admin)
- **Response:** Updated salon object
- **HTTP Status:** 200 OK

##### DELETE /api/v1/admin/salons/:id

- **Description:** Permanently delete salon (hard delete)
- **Authentication:** Required (JWT - Admin)
- **HTTP Status:** 204 No Content

---

## 4. DATA VALIDATION & ERROR HANDLING

### 4.1 HTTP Status Codes

| Code | Meaning               | Example                        |
| ---- | --------------------- | ------------------------------ |
| 200  | OK                    | Successful GET, PUT            |
| 201  | Created               | Successful POST                |
| 204  | No Content            | Successful DELETE              |
| 400  | Bad Request           | Invalid input data             |
| 401  | Unauthorized          | Missing/invalid JWT            |
| 403  | Forbidden             | Insufficient permissions       |
| 404  | Not Found             | Resource doesn't exist         |
| 409  | Conflict              | Slot already booked            |
| 422  | Unprocessable Entity  | Validation error               |
| 429  | Too Many Requests     | Rate limit exceeded            |
| 500  | Internal Server Error | Unexpected server error        |
| 503  | Service Unavailable   | Database/external service down |

### 4.2 Standard Error Response Format

```json
{
  "status": "error",
  "code": "INVALID_EMAIL",
  "message": "Email format is invalid",
  "details": {
    "field": "email",
    "value": "invalid-email"
  }
}
```

### 4.3 Validation Rules

**Email:**

- Pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Max length: 254 characters
- Must be unique in Users table

**Password:**

- Min 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 digit
- At least 1 special character (!@#$%^&\*)

**Phone (E.164 Format):**

- Pattern: `/^\+[1-9]\d{1,14}$/`
- Example: +91-98765-43210

**Time Format (HH:MM):**

- Pattern: `/^([0-1]\d|2[0-3]):([0-5]\d)$/`
- Must be in 30-minute intervals for bookings

**Date Format:**

- ISO 8601: YYYY-MM-DD
- No past dates for bookings
- Max 90 days in future

---

## 5. SECURITY REQUIREMENTS

### 5.1 Authentication & Authorization

- **JWT Token:**
  - Algorithm: HS256 or RS256
  - Expires in: 1 hour
  - Includes: userId, email, role, salonId (if applicable)
  - Stored in: HTTP-only cookie (for web) or secure storage (mobile)

- **Refresh Token:**
  - Expires in: 30 days
  - Stored in database
  - One refresh token per session
  - Invalidated on logout

- **Password Hashing:**
  - Algorithm: bcrypt
  - Salt rounds: 10
  - Never store plain passwords

- **CORS:**
  - Allow origins: localhost:3000, app.glamour.io
  - Allow methods: GET, POST, PUT, DELETE
  - Allow headers: Content-Type, Authorization
  - Credentials: include

### 5.2 Data Protection

- **HTTPS Only:** All endpoints require HTTPS in production
- **PII Encryption:** Customer emails, phones encrypted at rest
- **SQL Injection:** Use parameterized queries / ORM
- **XSS Prevention:** Sanitize all user inputs
- **CSRF Protection:** CSRF tokens for state-changing operations

### 5.3 Rate Limiting

| Endpoint         | Limit       | Window     |
| ---------------- | ----------- | ---------- |
| /auth/login      | 5 attempts  | 15 minutes |
| /auth/register   | 3 per IP    | 1 hour     |
| /bookings        | 10 per user | 1 hour     |
| /reviews         | 3 per user  | 1 day      |
| Search endpoints | 100 per IP  | 1 hour     |

### 5.4 Logging & Monitoring

- Log all auth events (login, logout, failed attempts)
- Log all critical operations (bookings, reviews, deletions)
- Exclude: passwords, tokens, payment info
- Retention: 90 days (PII), 1 year (audit logs)
- Alerts: Failed logins, unusual activity, errors > 5% of requests

---

## 6. PERFORMANCE & SCALABILITY

### 6.1 Caching Strategy

| Endpoint              | TTL    | Invalidation                     |
| --------------------- | ------ | -------------------------------- |
| /salons/featured      | 5 min  | Manual (on salon update)         |
| /salons (list)        | 5 min  | Manual                           |
| /salons/:id           | 5 min  | On salon update                  |
| /services/categories  | 1 hour | Manual                           |
| /reviews/testimonials | 1 hour | On review creation               |
| /bookings/slots       | 2 min  | On booking creation/cancellation |

**Caching Layer:** Redis

### 6.2 Database Indexing

```
Indexes to Create:
- Salons: (city), (rating DESC), (verified), (featured)
- Services: (salonId, isActive)
- Bookings: (salonId, date), (customerId), (status)
- Reviews: (salonId, createdAt DESC), (approved)
- Users: (email), (role)
- PartnerApplications: (email), (status), (createdAt DESC)
```

### 6.3 API Response Time Targets

| Endpoint Type  | Target               |
| -------------- | -------------------- |
| List endpoints | < 200ms (with cache) |
| GET by ID      | < 100ms (with cache) |
| Search         | < 500ms              |
| Create/Update  | < 300ms              |
| Delete         | < 200ms              |

### 6.4 Pagination Defaults

- Default page size: 10-20 items
- Max page size: 100 items
- Offset-based pagination (can upgrade to cursor-based for large datasets)

---

## 7. THIRD-PARTY INTEGRATIONS

### 7.1 Email Service

**Provider:** SendGrid or AWS SES  
**Templates:**

- Welcome email
- Email verification
- Booking confirmation
- Booking reminder (24h before)
- Booking cancellation
- Review request
- Password reset
- Partner application status

### 7.2 SMS Notifications (Future)

**Provider:** Twilio  
**Messages:**

- Booking confirmation
- Booking reminder
- Review request

### 7.3 Payment Integration (Future)

**Provider:** Razorpay / Stripe  
**Features:**

- Accept payment for bookings
- Salon commission calculation
- Payout management

### 7.4 Analytics (Future)

**Provider:** Mixpanel / Amplitude  
**Events:**

- Salon view
- Service view
- Booking created
- Review submitted
- Partner application

---

## 8. DATABASE SCHEMA SUMMARY

```
Tables:
┌─────────────────────────┐
│ users                   │
│ ├─ id (PK)             │
│ ├─ email (unique)      │
│ ├─ password            │
│ ├─ firstName           │
│ ├─ lastName            │
│ ├─ role (enum)         │
│ ├─ salonId (FK)        │
│ └─ timestamps          │
└─────────────────────────┘
        ↓
┌─────────────────────────┐
│ salons                  │
│ ├─ id (PK)             │
│ ├─ name                │
│ ├─ slug (unique)       │
│ ├─ email (unique)      │
│ ├─ city (indexed)      │
│ ├─ coordinates         │
│ ├─ rating              │
│ ├─ verified            │
│ ├─ featured            │
│ └─ timestamps          │
└─────────────────────────┘
        ↓
┌─────────────────────────┐
│ services                │
│ ├─ id (PK)             │
│ ├─ salonId (FK)        │
│ ├─ name                │
│ ├─ price               │
│ ├─ duration            │
│ ├─ category            │
│ └─ timestamps          │
└─────────────────────────┘
        ↓
┌─────────────────────────┐
│ bookings                │
│ ├─ id (PK)             │
│ ├─ salonId (FK)        │
│ ├─ serviceId (FK)      │
│ ├─ customerId (FK)     │
│ ├─ date                │
│ ├─ time                │
│ ├─ status              │
│ └─ timestamps          │
└─────────────────────────┘

┌─────────────────────────┐
│ reviews                 │
│ ├─ id (PK)             │
│ ├─ salonId (FK)        │
│ ├─ customerId (FK)     │
│ ├─ rating              │
│ ├─ text                │
│ ├─ approved            │
│ └─ timestamps          │
└─────────────────────────┘

┌─────────────────────────┐
│ partnerApplications     │
│ ├─ id (PK)             │
│ ├─ email (unique)      │
│ ├─ salonName           │
│ ├─ status              │
│ └─ timestamps          │
└─────────────────────────┘

┌─────────────────────────┐
│ amenities               │
│ ├─ id (PK)             │
│ ├─ salonId (FK)        │
│ ├─ name                │
│ └─ timestamps          │
└─────────────────────────┘

┌─────────────────────────┐
│ openingHours            │
│ ├─ id (PK)             │
│ ├─ salonId (FK)        │
│ ├─ day (enum)          │
│ ├─ open (time)         │
│ ├─ close (time)        │
│ └─ closed (boolean)    │
└─────────────────────────┘
```

---

## 9. API VERSIONING & VERSIONING STRATEGY

- **Current Version:** v1
- **API Base URL:** `https://api.glamour.io/api/v1/`
- **Versioning:** URL-based (/api/v1/)
- **Deprecation:** Minimum 6 months notice before sunset
- **Backwards Compatibility:** Maintain for minimum 2 versions

---

## 10. DEPLOYMENT & DEVOPS

### 10.1 Environments

| Environment | Purpose                | Database              |
| ----------- | ---------------------- | --------------------- |
| Development | Local testing          | PostgreSQL local      |
| Staging     | Pre-production testing | PostgreSQL staging    |
| Production  | Live service           | PostgreSQL production |

### 10.2 Infrastructure

- **Application Server:** Node.js/Express, Python/Django, or Java/Spring Boot
- **Database:** PostgreSQL 14+
- **Cache:** Redis 6+
- **Containerization:** Docker
- **Orchestration:** Kubernetes (future scaling)
- **Load Balancing:** nginx
- **CDN:** Cloudflare
- **Search:** Elasticsearch (future)

### 10.3 CI/CD Pipeline

- Run tests on every push
- Build Docker image
- Push to registry
- Deploy to staging
- Run smoke tests
- Deploy to production (manual gate)
- Monitor error rates and performance

---

## 11. TESTING REQUIREMENTS

### 11.1 Unit Tests

- Coverage: Minimum 80% for business logic
- Framework: Jest, Pytest, or JUnit
- Test: All validators, utility functions, business rules

### 11.2 Integration Tests

- Test entire API workflows
- Test database operations
- Test third-party integrations (mocked)
- Test JWT validation

### 11.3 E2E Tests

- Booking workflow: Search → Book → Confirm
- Review workflow: View → Submit → Approve
- Auth workflow: Register → Login → Logout
- Partner workflow: Apply → Approve → Setup

### 11.4 Load Testing

- Peak load: 1000 concurrent users
- Expected response time: <500ms at 95th percentile
- Tools: Apache JMeter, k6, or Locust

---

## 12. RELEASE NOTES & CHANGELOG

### Version 1.0 (June 2026)

**Features:**

- Salon listings and search
- Booking system with time slots
- Review and ratings system
- Partner application management
- User authentication (customer & salon owner)
- Admin dashboard (basic)

**Known Limitations:**

- No payment processing (manual payments)
- No SMS notifications
- No mobile app
- No real-time notifications
- Basic search (no full-text search)

**Future Roadmap:**

- Payment integration (Razorpay)
- SMS notifications (Twilio)
- Real-time chat with salons
- Mobile app (iOS & Android)
- Advanced search (Elasticsearch)
- Recommendation engine
- Loyalty program
- Analytics dashboard

---

## 13. GLOSSARY

- **Salon:** Beauty/grooming service provider
- **Service:** Specific beauty treatment offered by a salon
- **Booking:** Customer's appointment at a salon for a service
- **Slot:** Available time for a booking
- **Review:** Customer feedback and rating for a salon
- **Partner:** Salon owner registered on the platform
- **JWT:** JSON Web Token for authentication
- **PII:** Personally Identifiable Information

---

## 14. REFERENCES & RESOURCES

- Next.js Documentation: https://nextjs.org/docs
- REST API Design Best Practices: https://restfulapi.net/
- JWT Introduction: https://jwt.io/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Redis Documentation: https://redis.io/documentation
- OWASP Security Guidelines: https://owasp.org/

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-09  
**Author:** GitHub Copilot  
**Status:** Final - Ready for Backend Development

---

### APPROVAL SIGN-OFF

| Role            | Name   | Date   | Signature   |
| --------------- | ------ | ------ | ----------- |
| Product Manager | [Name] | [Date] | [Signature] |
| Backend Lead    | [Name] | [Date] | [Signature] |
| Frontend Lead   | [Name] | [Date] | [Signature] |
| DevOps Lead     | [Name] | [Date] | [Signature] |

---

**END OF DOCUMENT**
