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
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any = await apiFetch("/bookings", {
      method: "POST",
      body: JSON.stringify({
        salon_id: data.salonId,
        service_id: data.serviceId,
        booking_date: data.date,
        booking_time: data.time,
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone,
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
  } catch (err) {
    console.warn("Backend unreachable for create booking, using mock:", err);
    return {
      ...data,
      id: `booking-${Date.now()}`,
      status: "confirmed",
    } as Booking;
  }
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
  try {
    return await apiFetch<TimeSlot[]>(
      `/bookings/slots?salonId=${salonId}&date=${date}`
    );
  } catch (err) {
    console.warn("Backend unreachable for available slots, using mock:", err);
    return [
      { time: "09:00", available: true },
      { time: "09:30", available: true },
      { time: "10:00", available: false },
      { time: "10:30", available: true },
      { time: "11:00", available: true },
      { time: "11:30", available: false },
      { time: "12:00", available: true },
      { time: "14:00", available: true },
      { time: "14:30", available: true },
      { time: "15:00", available: false },
      { time: "15:30", available: true },
      { time: "16:00", available: true },
      { time: "16:30", available: true },
      { time: "17:00", available: true },
      { time: "17:30", available: false },
      { time: "18:00", available: true },
    ];
  }
}

/**
 * Cancel a booking.
 *
 * Backend endpoint: DELETE /api/v1/bookings/:id
 */
export async function cancelBooking(bookingId: string): Promise<void> {
  try {
    await apiFetch(`/bookings/${bookingId}`, { method: "DELETE" });
  } catch (err) {
    console.warn("Backend unreachable for cancel booking:", err);
  }
}
