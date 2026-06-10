import { Review } from "@/types";
import { reviewsMock, testimonialsMock } from "@/mock/reviews";
import { apiFetch } from "./client";

/**
 * Map a backend review object to the frontend Review type.
 *
 * Backend returns `authorName` / `authorInitials` whereas the
 * frontend type uses `author` / `initials`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapReview(raw: any): Review {
  return {
    id: raw.id,
    author: raw.authorName ?? raw.author ?? "",
    initials: raw.authorInitials ?? raw.initials ?? "??",
    rating: raw.rating ?? 0,
    text: raw.text ?? "",
    date: raw.date ?? raw.createdAt ?? "",
    salonId: raw.salonId,
    salonName: raw.salonName,
    helpful: raw.helpful ?? 0,
  };
}

/**
 * Fetch reviews for a specific salon.
 *
 * Backend endpoint: GET /api/v1/reviews/salon/:salonId
 */
export async function getReviewsBySalon(salonId: string): Promise<Review[]> {
  try {
    const raw = await apiFetch<unknown[]>(`/reviews/salon/${salonId}`);
    return raw.map(mapReview);
  } catch (err) {
    console.warn(`Backend unreachable for salon ${salonId} reviews, using mock data:`, err);
    return reviewsMock.filter((r) => r.salonId === salonId);
  }
}

/**
 * Fetch testimonials for the homepage.
 *
 * Backend endpoint: GET /api/v1/reviews
 */
export async function getTestimonials(): Promise<Review[]> {
  try {
    const raw = await apiFetch<unknown[]>("/reviews");
    return raw.map(mapReview);
  } catch (err) {
    console.warn("Backend unreachable for testimonials, using mock data:", err);
    return testimonialsMock;
  }
}

/**
 * Submit a new review.
 *
 * Backend endpoint: POST /api/v1/reviews
 */
export async function submitReview(
  salonId: string,
  rating: number,
  text: string
): Promise<void> {
  try {
    await apiFetch("/reviews", {
      method: "POST",
      body: JSON.stringify({
        salonId,
        rating,
        text,
        authorName: "Anonymous User",
      }),
    });
  } catch (err) {
    console.warn("Backend unreachable for submit review:", err);
  }
}
