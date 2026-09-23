/**
 * Appointment Domain Types
 * Based on API_CONTRACT.md Appointments Module.
 */

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

export interface AppointmentPatient {
  id: string;
  fullName: string;
}

export interface AppointmentDoctorSpecialty {
  id: string;
  name: string;
}

export interface AppointmentDoctor {
  id: string;
  fullName: string;
  specialty: AppointmentDoctorSpecialty;
}

export interface AppointmentAvailability {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface Appointment {
  id: string;
  status: AppointmentStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  patient: AppointmentPatient;
  doctor: AppointmentDoctor;
  availability: AppointmentAvailability;
}

export interface GetAppointmentsParams {
  page?: number;
  limit?: number;
  status?: AppointmentStatus;
}

export interface CancelAppointmentPayload {
  status: "CANCELLED";
}

export interface UpdateAppointmentStatusPayload {
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
}

export interface CreateAppointmentPayload {
  availabilityId: string;
  notes?: string | null;
}

export interface CreateAppointmentResponse {
  status: "success";
  data: Appointment;
}

