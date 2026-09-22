import type { Appointment } from "../../appointments/types";

export interface PatientAppointmentMetrics {
  activeCount: number;
  completedCount: number;
  totalBookings: number;
}

/**
 * Filter and sort to find the soonest upcoming active appointment (PENDING or CONFIRMED).
 */
export function getNextUpcomingAppointment(
  appointments: Appointment[]
): Appointment | null {
  const activeAppointments = appointments.filter(
    (a) => a.status === "CONFIRMED" || a.status === "PENDING"
  );

  if (activeAppointments.length === 0) return null;

  return [...activeAppointments].sort((a, b) => {
    const dateTimeA = `${a.availability.date}T${a.availability.startTime}`;
    const dateTimeB = `${b.availability.date}T${b.availability.startTime}`;
    return dateTimeA.localeCompare(dateTimeB);
  })[0];
}

/**
 * Compute real patient dashboard stats derived directly from appointments data.
 */
export function getPatientAppointmentMetrics(
  appointments: Appointment[],
  totalCount: number
): PatientAppointmentMetrics {
  const activeCount = appointments.filter(
    (a) => a.status === "CONFIRMED" || a.status === "PENDING"
  ).length;

  const completedCount = appointments.filter(
    (a) => a.status === "COMPLETED"
  ).length;

  return {
    activeCount,
    completedCount,
    totalBookings: totalCount,
  };
}
