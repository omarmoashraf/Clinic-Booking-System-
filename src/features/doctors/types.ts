/**
 * Doctor Module Types
 * Based on API_CONTRACT.md Doctors Module.
 */

export interface DoctorSpecialty {
  id: string;
  name: string;
}

export interface Doctor {
  id: string;
  fullName: string;
  specialty: DoctorSpecialty | null;
  bio: string | null;
}

export interface GetDoctorsParams {
  page?: number;
  limit?: number;
  specialty?: string;
}

