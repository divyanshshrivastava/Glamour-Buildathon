import { Booking, TimeSlot } from "@/types";

/**
 * Create a new booking.
 *
 * TODO BACKEND
 * Endpoint: POST /api/bookings
 * Body: { salonId: string, serviceId: string, date: string, time: string, customerName: string, customerEmail: string, customerPhone: string, notes?: string }
 * Expected Response: Booking
 * Authentication: Required (JWT)
 * React Query: useMutation(createBooking, { onSuccess: redirect to confirmation })
 * Loading State: Button spinner "Booking..."
 * Error State: Toast notification "Booking failed. Please try again."
 */
export async function createBooking(
  _data: Omit<Booking, "id" | "status">
): Promise<Booking> {
  console.log("TODO: Create booking via backend");
  return {
    ..._data,
    id: `booking-${Date.now()}`,
    status: "confirmed",
  } as Booking;
}

/**
 * Get available time slots for a salon on a given date.
 *
 * TODO BACKEND
 * Endpoint: GET /api/bookings/slots?salonId=:id&date=:date
 * Expected Response: TimeSlot[]
 * Authentication: Not Required
 * React Query: useQuery(['slots', salonId, date], () => getAvailableSlots(salonId, date))
 */
export async function getAvailableSlots(
  _salonId: string,
  _date: string
): Promise<TimeSlot[]> {
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

/**
 * Cancel a booking.
 *
 * TODO BACKEND
 * Endpoint: DELETE /api/bookings/:id
 * Expected Response: { success: boolean }
 * Authentication: Required (JWT)
 */
export async function cancelBooking(_bookingId: string): Promise<void> {
  console.log("TODO: Cancel booking via backend");
}
