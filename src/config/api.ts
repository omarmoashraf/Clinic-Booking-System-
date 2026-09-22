/**
 * API Configuration for Clinic Management System
 * Aligned with API_CONTRACT.md and AGENT.md guidelines.
 */

export const DEFAULT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";

export const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;

export const HTTP_HEADERS = {
  CONTENT_TYPE: "Content-Type",
  ACCEPT: "Accept",
  AUTHORIZATION: "Authorization",
} as const;

export const CONTENT_TYPES = {
  JSON: "application/json",
} as const;

