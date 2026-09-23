/**
 * Availability Module Types
 * Based on API_CONTRACT.md Availability Module.
 */

export interface AvailabilitySlot {
  id: string;
  date: string; // YYYY-MM-DD (Africa/Cairo wall-clock date)
  startTime: string; // HH:mm (24-hour time)
  endTime: string; // HH:mm (24-hour time)
}

export interface GetAvailabilityParams {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
}

export interface CreateAvailabilityPayload {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24-hour time)
  endTime: string; // HH:mm (24-hour time, strictly after startTime)
}

export type AvailabilityFilterRange = "all" | "today" | "week" | "month" | "custom";

