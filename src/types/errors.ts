/**
 * Error Normalization Types for Clinic Management System
 * Supports API_CONTRACT.md error envelopes and network failure scenarios.
 */

export type ApiErrorKind =
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "UNKNOWN";

export type FieldErrorsMap = Record<string, string[]>;

export interface NormalizedErrorDetails {
  kind: ApiErrorKind;
  status: number | null;
  message: string;
  i18nKey: string;
  fieldErrors: FieldErrorsMap;
  code?: string;
  details?: unknown[];
  raw?: unknown;
}

