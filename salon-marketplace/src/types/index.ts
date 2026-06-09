// ─── Salon ───────────────────────────────────────────────

export interface Salon {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  rating: number;
  reviewCount: number;
  distance: string;
  startingPrice: number;
  coverImage: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  openingHours: OpeningHours[];
  amenities: string[];
  gallery: string[];
  services: Service[];
  featured: boolean;
  verified: boolean;
  coordinates: {
    x: number;
    y: number;
  };
}

export interface OpeningHours {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

// ─── Service ─────────────────────────────────────────────

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  category: string;
  description: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
  slug: string;
}

// ─── Review ──────────────────────────────────────────────

export interface Review {
  id: string;
  author: string;
  avatar?: string;
  initials: string;
  rating: number;
  text: string;
  date: string;
  salonId?: string;
  salonName?: string;
  helpful?: number;
}

// ─── Booking ─────────────────────────────────────────────

export interface Booking {
  id: string;
  salonId: string;
  serviceId: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

// ─── Search ──────────────────────────────────────────────

export interface SearchFilters {
  location?: string;
  service?: string;
  date?: string;
  minRating?: number;
  maxPrice?: number;
  sortBy?: "rating" | "distance" | "price";
}

// ─── Navigation ──────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
}

// ─── Partner ─────────────────────────────────────────────

export interface PartnerFormData {
  salonName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  message?: string;
}
