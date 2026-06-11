import { Salon, SearchFilters } from "@/types";
import { apiFetch } from "./client";

/**
 * Map a backend salon object to the frontend Salon type.
 * The backend doesn't track `distance`, so we set a placeholder.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSalon(raw: any): Salon {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    tagline: raw.tagline ?? "",
    description: raw.description ?? "",
    rating: raw.rating ?? 0,
    reviewCount: raw.reviewCount ?? 0,
    distance: raw.distance ?? "–",
    startingPrice: raw.startingPrice ?? 0,
    coverImage: raw.coverImage ?? "/images/salon-1.jpg",
    address: raw.address ?? "",
    city: raw.city ?? "",
    phone: raw.phone ?? "",
    email: raw.email ?? "",
    website: raw.website,
    openingHours: raw.openingHours ?? [],
    amenities: raw.amenities ?? [],
    gallery: raw.gallery ?? [],
    services: (raw.services ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        duration: s.duration,
        category: s.category,
        description: s.description,
      })
    ),
    featured: raw.featured ?? false,
    verified: raw.verified ?? false,
    coordinates: raw.coordinates ?? { x: 0, y: 0 },
  };
}

/**
 * Fetch featured salons for the homepage.
 *
 * Backend endpoint: GET /api/v1/salons/featured
 */
export async function getFeaturedSalons(): Promise<Salon[]> {
  const raw = await apiFetch<unknown[]>("/salons/featured");
  return raw.map(mapSalon);
}

/**
 * Fetch a single salon by ID.
 *
 * Backend endpoint: GET /api/v1/salons/:id
 */
export async function getSalonById(id: string): Promise<Salon | null> {
  const raw = await apiFetch<unknown>(`/salons/${id}`);
  return mapSalon(raw);
}

/**
 * Search salons with filters.
 *
 * Backend endpoint: GET /api/v1/salons/search?...
 */
export async function searchSalons(filters: SearchFilters): Promise<Salon[]> {
  const params = new URLSearchParams();
  if (filters.location) params.set("location", filters.location);
  if (filters.service) params.set("q", filters.service);
  if (filters.minRating) params.set("minRating", String(filters.minRating));
  if (filters.maxPrice) params.set("maxPrice", String(filters.maxPrice));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);

  const raw = await apiFetch<unknown[]>(`/salons/search?${params.toString()}`);
  return raw.map(mapSalon);
}

/**
 * Get all salons (for listing page).
 *
 * Backend endpoint: GET /api/v1/salons
 */
export async function getAllSalons(): Promise<Salon[]> {
  const raw = await apiFetch<unknown[]>("/salons");
  return raw.map(mapSalon);
}
