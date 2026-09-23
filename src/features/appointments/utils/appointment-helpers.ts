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
 * Filter appointments list by search term across doctor name or specialty name (used in Patient Portal).
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

/**
 * Filter doctor's appointments by search query matching patient name, notes, or date.
 */
export function filterDoctorAppointmentsBySearch(
  appointments: Appointment[],
  searchQuery: string
): Appointment[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return appointments;

  return appointments.filter(
    (apt) =>
      apt.patient.fullName.toLowerCase().includes(query) ||
      (apt.notes && apt.notes.toLowerCase().includes(query)) ||
      apt.availability.date.includes(query)
  );
}

/**
 * Validates whether an appointment can be confirmed by the doctor:
 * - Only PENDING appointments can be confirmed.
 */
export function canDoctorConfirmAppointment(appointment: Appointment): boolean {
  return appointment.status === "PENDING";
}

/**
 * Validates whether an appointment can be completed by the doctor:
 * - Only CONFIRMED appointments can be marked as COMPLETED.
 * - Allowed even for past dates per API contract.
 */
export function canDoctorCompleteAppointment(appointment: Appointment): boolean {
  return appointment.status === "CONFIRMED";
}

/**
 * Validates whether an appointment can be cancelled by the doctor:
 * - PENDING or CONFIRMED appointments can be cancelled before elapsed date.
 */
export function canDoctorCancelAppointment(appointment: Appointment): boolean {
  if (
    appointment.status !== ("PENDING" as AppointmentStatus) &&
    appointment.status !== ("CONFIRMED" as AppointmentStatus)
  ) {
    return false;
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  if (appointment.availability.date < todayStr) {
    return false;
  }

  return true;
}

