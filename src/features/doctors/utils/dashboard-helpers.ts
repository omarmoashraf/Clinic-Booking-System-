import type { Appointment } from "../../appointments/types";

export interface DoctorAppointmentMetrics {
  pendingCount: number;
  confirmedCount: number;
  completedCount: number;
  totalSchedule: number;
}

/**
 * Filter and sort to find the soonest upcoming active appointment for the doctor (PENDING or CONFIRMED).
 */
export function getNextDoctorAppointment(
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
 * Compute real doctor operational dashboard statistics derived directly from appointments data.
 */
export function getDoctorAppointmentMetrics(
  appointments: Appointment[],
  totalCount: number
): DoctorAppointmentMetrics {
  const pendingCount = appointments.filter((a) => a.status === "PENDING").length;
  const confirmedCount = appointments.filter((a) => a.status === "CONFIRMED").length;
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;

  return {
    pendingCount,
    confirmedCount,
    completedCount,
    totalSchedule: totalCount,
  };
}

