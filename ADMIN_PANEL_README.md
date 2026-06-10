# Glamour Admin Panel Guide

The Glamour Admin Panel provides platform administrators with the tools needed to manage the marketplace, review salon applications, and monitor key metrics.

## 🔐 Accessing the Admin Panel

The admin panel is located at `/admin` and is protected by role-based authentication. 

To log in:
1. Navigate to `/login`
2. Enter the administrator credentials:
   - **Email:** `admin@glamour.io`
   - **Password:** `Password123!`
3. You will be automatically redirected to the admin dashboard.

> **Note:** If you are logged in as a normal customer or salon owner, attempting to visit `/admin` will redirect you back to the homepage.

---

## 📊 Dashboard Overview (`/admin`)

The primary dashboard provides a high-level view of platform health.

**Key Metrics Tracked:**
- Total number of registered salons
- Total volume of bookings 
- Total registered users
- Total published reviews
- **Action Items:** Pending applications and reviews requiring moderation

**Features:**
- **Top Rated Salons Table:** Quickly see your highest-performing partners.
- **Platform Revenue (Simulation):** Tracks monthly and yearly revenue growth (currently UI simulation awaiting payment gateway integration).

---

## 🏬 Salon Management (`/admin/salons`)

The Salons page displays a complete directory of all businesses registered on the platform.

**Capabilities:**
- **Search:** Find specific salons by name or city.
- **Verification:** Platform administrators must manually verify salons to ensure quality control. Unverified salons carry a grey badge, while verified ones show a green badge. Click the shield icon in the actions column to verify a salon.
- **View Listing:** Jump directly to the public-facing salon page.
- **Deletion:** Remove non-compliant salons from the platform (requires confirmation).

---

## 📝 Partner Applications (`/admin/applications`)

When prospective salon owners submit the form at `/partner`, their requests appear here.

**Workflow:**
1. Applications arrive in the **Pending** tab.
2. Review the applicant's details (Name, Location, Contact Info, Message).
3. **Approve:** Click the green Approve button to mark the application as accepted. (In a full implementation, this would trigger an onboarding email).
4. **Reject:** Click the red Reject button. You will be prompted to provide a rejection reason, which is saved for future reference.

**Filtering:**
Use the tabs at the top to filter between All, Pending, Approved, and Rejected applications.

---

## 👤 Role Permissions Matrix

The platform utilizes a strict role hierarchy:

| Feature | `customer` | `salonOwner` | `admin` |
|---------|:---:|:---:|:---:|
| Browse Salons | ✅ | ✅ | ✅ |
| Book Appointments | ✅ | ❌ | ❌ |
| Write Reviews | ✅ | ❌ | ❌ |
| Manage Own Salon | ❌ | ✅ | ❌ |
| Verify Salons | ❌ | ❌ | ✅ |
| Review Applications | ❌ | ❌ | ✅ |
| View System Metrics | ❌ | ❌ | ✅ |

*Note: Administrative users cannot currently book appointments for themselves. They must use a separate customer account for testing the booking flow.*
