/**
 * Specialties Module Types
 * Based on API_CONTRACT.md Specialties Module.
 */

export interface Specialty {
  id: string;
  name: string;
  created_at: string;
}

export interface GetSpecialtiesParams {
  page?: number;
  limit?: number;
  search?: string;
}

