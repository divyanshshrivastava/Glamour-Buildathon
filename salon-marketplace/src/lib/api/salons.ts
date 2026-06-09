import { Salon, SearchFilters } from "@/types";
import { salonsMock, featuredSalonsMock } from "@/mock/salons";

/**
 * Fetch featured salons for the homepage.
 *
 * TODO BACKEND
 * Endpoint: GET /api/salons/featured
 * Expected Response: Salon[]
 * Authentication: Not Required
 * React Query: useQuery(['salons', 'featured'], getFeaturedSalons)
 * Loading State: Skeleton cards grid
 * Error State: "Unable to load salons. Please try again."
 */
export async function getFeaturedSalons(): Promise<Salon[]> {
  return featuredSalonsMock;
}

/**
 * Fetch a single salon by ID.
 *
 * TODO BACKEND
 * Endpoint: GET /api/salons/:id
 * Expected Response: Salon
 * Authentication: Not Required
 * React Query: useQuery(['salon', id], () => getSalonById(id))
 * Loading State: Full page skeleton
 * Error State: 404 page or "Salon not found"
 */
export async function getSalonById(id: string): Promise<Salon | null> {
  return salonsMock.find((s) => s.id === id) ?? null;
}

/**
 * Search salons with filters.
 *
 * TODO BACKEND
 * Endpoint: GET /api/salons/search?location=...&service=...&date=...
 * Expected Response: { salons: Salon[], total: number, page: number }
 * Authentication: Not Required
 * React Query: useQuery(['salons', 'search', filters], () => searchSalons(filters))
 * Loading State: Skeleton cards with filter bar
 * Error State: "No salons found matching your criteria."
 */
export async function searchSalons(filters: SearchFilters): Promise<Salon[]> {
  let results = [...salonsMock];

  if (filters.minRating) {
    results = results.filter((s) => s.rating >= filters.minRating!);
  }

  if (filters.maxPrice) {
    results = results.filter((s) => s.startingPrice <= filters.maxPrice!);
  }

  if (filters.sortBy === "rating") {
    results.sort((a, b) => b.rating - a.rating);
  } else if (filters.sortBy === "price") {
    results.sort((a, b) => a.startingPrice - b.startingPrice);
  }

  return results;
}

/**
 * Get all salons (for listing page).
 *
 * TODO BACKEND
 * Endpoint: GET /api/salons?page=1&limit=12
 * Expected Response: { salons: Salon[], total: number, page: number, totalPages: number }
 * Authentication: Not Required
 */
export async function getAllSalons(): Promise<Salon[]> {
  return salonsMock;
}
