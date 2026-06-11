import { Booking, TimeSlot } from "@/types";
import { apiFetch } from "./client";

/**
 * Create a new booking.
 *
 * Backend endpoint: POST /api/v1/bookings
 */
export async function createBooking(
  data: Omit<Booking, "id" | "status">
): Promise<Booking> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any = await apiFetch("/bookings", {
    method: "POST",
    body: JSON.stringify({
      salonId: data.salonId,
      serviceId: data.serviceId,
      date: data.date,
      time: data.time,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      notes: data.notes,
    }),
  });
  
  return {
    id: raw.id,
    salonId: raw.salonId ?? raw.salon_id,
    serviceId: raw.serviceId ?? raw.service_id,
    date: raw.date ?? raw.booking_date,
    time: raw.time ?? raw.booking_time,
    status: raw.status ?? "confirmed",
    customerName: raw.customerName ?? raw.customer_name ?? data.customerName,
    customerEmail: raw.customerEmail ?? raw.customer_email ?? data.customerEmail,
    customerPhone: raw.customerPhone ?? raw.customer_phone ?? data.customerPhone,
    notes: raw.notes,
  };
}

/**
 * Get available time slots for a salon on a given date.
 *
 * Backend endpoint: GET /api/v1/bookings/slots?salonId=:id&date=:date
 */
export async function getAvailableSlots(
  salonId: string,
  date: string
): Promise<TimeSlot[]> {
  return await apiFetch<TimeSlot[]>(
    `/bookings/slots?salonId=${salonId}&date=${date}`
  );
}

/**
 * Cancel a booking.
 *
 * Backend endpoint: DELETE /api/v1/bookings/:id
 */
export async function cancelBooking(bookingId: string): Promise<void> {
  await apiFetch(`/bookings/${bookingId}`, { method: "DELETE" });
}
