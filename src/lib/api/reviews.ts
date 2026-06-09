import { Review } from "@/types";
import { reviewsMock, testimonialsMock } from "@/mock/reviews";

/**
 * Fetch reviews for a specific salon.
 *
 * TODO BACKEND
 * Endpoint: GET /api/reviews?salonId=:id&page=1&limit=10
 * Expected Response: { reviews: Review[], total: number, averageRating: number }
 * Authentication: Not Required
 * React Query: useQuery(['reviews', salonId], () => getReviewsBySalon(salonId))
 * Loading State: Skeleton review cards
 * Error State: "Unable to load reviews."
 */
export async function getReviewsBySalon(salonId: string): Promise<Review[]> {
  return reviewsMock.filter((r) => r.salonId === salonId);
}

/**
 * Fetch testimonials for the homepage.
 *
 * TODO BACKEND
 * Endpoint: GET /api/reviews/testimonials
 * Expected Response: Review[]
 * Authentication: Not Required
 */
export async function getTestimonials(): Promise<Review[]> {
  return testimonialsMock;
}

/**
 * Submit a new review.
 *
 * TODO BACKEND
 * Endpoint: POST /api/reviews
 * Body: { salonId: string, rating: number, text: string }
 * Expected Response: Review
 * Authentication: Required (JWT)
 * React Query: useMutation(submitReview, { onSuccess: invalidate(['reviews', salonId]) })
 */
export async function submitReview(
  _salonId: string,
  _rating: number,
  _text: string
): Promise<void> {
  console.log("TODO: Submit review to backend");
}
