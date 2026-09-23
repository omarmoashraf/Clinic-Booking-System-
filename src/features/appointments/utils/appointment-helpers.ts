import type { Appointment, AppointmentStatus } from "../types";

/**
 * Validates whether an appointment can be cancelled by the patient according to API_CONTRACT.md:
 * - Only appointments with status "PENDING" or "CONFIRMED" can be cancelled.
 * - "COMPLETED" and "CANCELLED" are terminal statuses.
 * - Past appointments (date in the past) are immutable.
 */
export function canCancelAppointment(appointment: Appointment): boolean {
  if (
    appointment.status !== ("PENDING" as AppointmentStatus) &&
    appointment.status !== ("CONFIRMED" as AppointmentStatus)
  ) {
    return false;
  }

  // Check if date is strictly in the past (YYYY-MM-DD)
  const todayStr = new Date().toISOString().slice(0, 10);
  if (appointment.availability.date < todayStr) {
    return false;
  }

  return true;
}

/**
 * Filter appointments list by search term across doctor name or specialty name.
 */
export function filterAppointmentsBySearch(
  appointments: Appointment[],
  searchQuery: string
): Appointment[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return appointments;

  return appointments.filter(
    (apt) =>
      apt.doctor.fullName.toLowerCase().includes(query) ||
      apt.doctor.specialty?.name?.toLowerCase().includes(query)
  );
}

