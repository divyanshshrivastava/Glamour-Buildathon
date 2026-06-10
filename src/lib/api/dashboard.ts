import { Salon, Service } from "@/types";
import { apiFetchWithAuth } from "./client";

// ── Salon owner's salon ──────────────────────────────────────────────

export interface SalonWithStats extends Salon {
  stats: {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    totalReviews: number;
  };
}

export async function getMySalon(token: string) {
  return await apiFetchWithAuth<SalonWithStats>("/salons/my", token);
}

export async function updateSalon(
  token: string,
  id: string,
  data: Partial<{
    name: string;
    tagline: string;
    description: string;
    phone: string;
    website: string;
    address: string;
    city: string;
    amenities: string[];
    openingHours: { day: string; open: string; close: string; closed: boolean }[];
  }>
) {
  return await apiFetchWithAuth<Salon>(`/salons/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ── Bookings ─────────────────────────────────────────────────────────

export interface SalonBooking {
  id: string;
  serviceId: string;
  service: { id: string; name: string; price: number; duration: string } | null;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string | null;
  createdAt: string;
}

export async function getSalonBookings(
  token: string,
  salonId: string,
  params?: { status?: string; date?: string; page?: number; limit?: number }
) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.date) query.set("date", params.date);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString() ? `?${query.toString()}` : "";

  return await apiFetchWithAuth<SalonBooking[]>(
    `/bookings/salon/${salonId}${qs}`,
    token
  );
}

export async function confirmBooking(token: string, id: string) {
  return await apiFetchWithAuth<{ id: string; status: string }>(
    `/bookings/${id}/confirm`,
    token,
    { method: "PUT" }
  );
}

export async function completeBooking(token: string, id: string) {
  return await apiFetchWithAuth<{ id: string; status: string }>(
    `/bookings/${id}/complete`,
    token,
    { method: "PUT" }
  );
}

export async function cancelSalonBooking(
  token: string,
  id: string,
  reason?: string
) {
  return await apiFetchWithAuth<{ id: string; status: string }>(
    `/bookings/${id}/cancel`,
    token,
    { method: "PUT", body: JSON.stringify({ reason }) }
  );
}

// ── Services ─────────────────────────────────────────────────────────

export interface ServiceItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: string;
  category: string;
  isActive?: boolean;
}

export async function getSalonServices(token: string, salonId: string) {
  return await apiFetchWithAuth<ServiceItem[]>(
    `/services/salon/${salonId}`,
    token
  );
}

export async function createService(
  token: string,
  salonId: string,
  data: { name: string; description?: string; price: number; duration: string; category: string }
) {
  return await apiFetchWithAuth<ServiceItem>(
    `/services/salon/${salonId}`,
    token,
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function updateService(
  token: string,
  id: string,
  data: Partial<{ name: string; description: string; price: number; duration: string; category: string }>
) {
  return await apiFetchWithAuth<ServiceItem>(`/services/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteService(token: string, id: string) {
  return await apiFetchWithAuth<void>(`/services/${id}`, token, {
    method: "DELETE",
  });
}

// ── Reviews ──────────────────────────────────────────────────────────

export interface SalonReview {
  id: string;
  authorName: string;
  authorInitials: string;
  rating: number;
  title: string | null;
  text: string;
  date: string;
  helpful: number;
  verified: boolean;
}

export interface ReviewAggregate {
  averageRating: number;
  totalReviews: number;
  distribution: Record<string, number>;
}

export async function getSalonReviews(
  token: string,
  salonId: string,
  sort: string = "recent"
) {
  // This endpoint is public, but we call with auth for consistency
  return await apiFetchWithAuth<SalonReview[]>(
    `/reviews/salon/${salonId}?sort=${sort}`,
    token
  );
}
