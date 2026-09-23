import type {
  ApiErrorKind,
  FieldErrorsMap,
  NormalizedErrorDetails,
} from "../../types/errors";
import { HttpError } from "./http-error";

/**
 * Normalized API Error class providing consistent error properties and helper methods
 * across the application.
 */
export class NormalizedApiError extends Error implements NormalizedErrorDetails {
  readonly kind: ApiErrorKind;
  readonly status: number | null;
  readonly i18nKey: string;
  readonly fieldErrors: FieldErrorsMap;
  readonly code?: string;
  readonly details?: unknown[];
  readonly raw?: unknown;
  readonly isNormalizedApiError = true;

  constructor(details: NormalizedErrorDetails) {
    super(details.message);
    this.name = "NormalizedApiError";
    this.kind = details.kind;
    this.status = details.status;
    this.i18nKey = details.i18nKey;
    this.fieldErrors = details.fieldErrors;
    this.code = details.code;
    this.details = details.details;
    this.raw = details.raw;

    // Restore prototype chain
    Object.setPrototypeOf(this, NormalizedApiError.prototype);
  }

  get isTokenExpired(): boolean {
    return this.code === "token_expired";
  }

  get isValidation(): boolean {
    return this.kind === "VALIDATION";
  }

  get isUnauthorized(): boolean {
    return this.kind === "UNAUTHORIZED";
  }

  get isForbidden(): boolean {
    return this.kind === "FORBIDDEN";
  }

  get isNotFound(): boolean {
    return this.kind === "NOT_FOUND";
  }

  get isConflict(): boolean {
    return this.kind === "CONFLICT";
  }

  get isRateLimited(): boolean {
    return this.kind === "RATE_LIMITED";
  }

  get isServerError(): boolean {
    return this.kind === "SERVER_ERROR";
  }

  get isNetworkError(): boolean {
    return this.kind === "NETWORK_ERROR";
  }

  get isTimeout(): boolean {
    return this.kind === "TIMEOUT";
  }

  get isAuthError(): boolean {
    return this.isUnauthorized || this.isForbidden;
  }

  /**
   * Returns the first error message for a specific field, if any.
   */
  getFieldError(field: string): string | undefined {
    const errors = this.fieldErrors[field];
    return errors && errors.length > 0 ? errors[0] : undefined;
  }

  /**
   * Returns all error messages for a specific field.
   */
  getFieldErrors(field: string): string[] {
    return this.fieldErrors[field] || [];
  }

  /**
   * Checks if this error contains any field-level validation errors.
   */
  hasFieldErrors(): boolean {
    return Object.keys(this.fieldErrors).length > 0;
  }

  /**
   * Type guard to check if an unknown value is a NormalizedApiError instance.
   */
  static isNormalizedApiError(error: unknown): error is NormalizedApiError {
    return (
      error instanceof NormalizedApiError ||
      (typeof error === "object" &&
        error !== null &&
        "isNormalizedApiError" in error &&
        (error as { isNormalizedApiError: boolean }).isNormalizedApiError === true)
    );
  }
}

/**
 * Extracts field-level validation errors from backend response structures.
 * Supports API_CONTRACT.md format: { status: "validation_error", errors: [{ field, message }] }
 * and standardized backend format: { status: "error", details: [...] }
 */
function extractFieldErrors(data: unknown): FieldErrorsMap {
  const result: FieldErrorsMap = {};

  if (!data || typeof data !== "object") {
    return result;
  }

  const obj = data as Record<string, unknown>;

  // Format 1: errors array of { field, message } (API_CONTRACT.md specification)
  if (Array.isArray(obj.errors)) {
    for (const item of obj.errors) {
      if (
        item &&
        typeof item === "object" &&
        "field" in item &&
        "message" in item &&
        typeof item.field === "string" &&
        typeof item.message === "string"
      ) {
        if (!result[item.field]) {
          result[item.field] = [];
        }
        result[item.field].push(item.message);
      }
    }
  }

  // Format 2: details array of { field, message } or { path, message } (standardized backend format)
  if (Array.isArray(obj.details)) {
    for (const item of obj.details) {
      if (item && typeof item === "object") {
        const itemObj = item as Record<string, unknown>;
        const field =
          typeof itemObj.field === "string"
            ? itemObj.field
            : typeof itemObj.path === "string"
            ? itemObj.path
            : Array.isArray(itemObj.path)
            ? itemObj.path.join(".")
            : undefined;

        const message =
          typeof itemObj.message === "string"
            ? itemObj.message
            : undefined;

        if (field && message) {
          if (!result[field]) {
            result[field] = [];
          }
          if (!result[field].includes(message)) {
            result[field].push(message);
          }
        }
      }
    }
  }

  // Format 3: errors object with field -> string[] or field -> string
  if (obj.errors && typeof obj.errors === "object" && !Array.isArray(obj.errors)) {
    const errorMap = obj.errors as Record<string, unknown>;
    for (const [field, value] of Object.entries(errorMap)) {
      if (Array.isArray(value)) {
        result[field] = value.filter((v): v is string => typeof v === "string");
      } else if (typeof value === "string") {
        result[field] = [value];
      }
    }
  }

  return result;
}

/**
 * Safely extracts backend error message if present in response data.
 */
function extractMessage(data: unknown, fallback: string): string {
  if (typeof data === "object" && data !== null && "message" in data) {
    const msg = (data as { message: unknown }).message;
    if (typeof msg === "string" && msg.trim().length > 0) {
      return msg;
    }
  }
  return fallback;
}

/**
 * Normalizes any unknown error into a typed, consistent NormalizedApiError.
 */
export function normalizeApiError(error: unknown): NormalizedApiError {
  if (NormalizedApiError.isNormalizedApiError(error)) {
    return error;
  }

  // Handle HttpError instances from HttpClient
  if (HttpError.isHttpError(error)) {
    const status = error.status;
    const data = error.data;
    const backendMessage = extractMessage(data, error.message);

    let code: string | undefined = undefined;
    let details: unknown[] | undefined = undefined;

    if (typeof data === "object" && data !== null) {
      const dataObj = data as Record<string, unknown>;
      if (typeof dataObj.code === "string") {
        code = dataObj.code;
      }
      if (Array.isArray(dataObj.details)) {
        details = dataObj.details;
      }
    }

    // Token expired error (can arrive as 401 or with code: "token_expired")
    if (code?.toLowerCase() === "token_expired") {
      return new NormalizedApiError({
        kind: "UNAUTHORIZED",
        status: status || 401,
        message: backendMessage || "Token expired",
        i18nKey: "errors.unauthorized",
        fieldErrors: {},
        code,
        details,
        raw: error,
      });
    }

    // 400 Bad Request / Validation Error
    if (status === 400) {
      const fieldErrors = extractFieldErrors(data);
      const isValidation =
        Object.keys(fieldErrors).length > 0 ||
        (typeof data === "object" &&
          data !== null &&
          "status" in data &&
          ((data as { status: string }).status === "validation_error" ||
            (data as { status: string }).status === "error" && Array.isArray((data as { details?: unknown }).details)));

      if (isValidation) {
        return new NormalizedApiError({
          kind: "VALIDATION",
          status: 400,
          message: backendMessage || "Request validation failed",
          i18nKey: "errors.validationFailed",
          fieldErrors,
          code,
          details,
          raw: error,
        });
      }

      return new NormalizedApiError({
        kind: "UNKNOWN",
        status: 400,
        message: backendMessage || "Bad Request",
        i18nKey: "errors.generic",
        fieldErrors: {},
        code,
        details,
        raw: error,
      });
    }

    // 401 Unauthorized
    if (status === 401) {
      return new NormalizedApiError({
        kind: "UNAUTHORIZED",
        status: 401,
        message: backendMessage || "Unauthorized",
        i18nKey: "errors.unauthorized",
        fieldErrors: {},
        code,
        details,
        raw: error,
      });
    }

    // 403 Forbidden
    if (status === 403) {
      return new NormalizedApiError({
        kind: "FORBIDDEN",
        status: 403,
        message: backendMessage || "Forbidden",
        i18nKey: "errors.forbidden",
        fieldErrors: {},
        code,
        details,
        raw: error,
      });
    }

    // 404 Not Found
    if (status === 404) {
      return new NormalizedApiError({
        kind: "NOT_FOUND",
        status: 404,
        message: backendMessage || "Not Found",
        i18nKey: "errors.notFound",
        fieldErrors: {},
        code,
        details,
        raw: error,
      });
    }

    // 409 Conflict
    if (status === 409) {
      return new NormalizedApiError({
        kind: "CONFLICT",
        status: 409,
        message: backendMessage || "Conflict",
        i18nKey: "errors.conflict",
        fieldErrors: {},
        code,
        details,
        raw: error,
      });
    }

    // 422 Unprocessable Entity
    if (status === 422) {
      const fieldErrors = extractFieldErrors(data);
      return new NormalizedApiError({
        kind: "VALIDATION",
        status: 422,
        message: backendMessage || "Validation failed",
        i18nKey: "errors.validationFailed",
        fieldErrors,
        code,
        details,
        raw: error,
      });
    }

    // 429 Rate Limited
    if (status === 429) {
      return new NormalizedApiError({
        kind: "RATE_LIMITED",
        status: 429,
        message: backendMessage || "Too many requests. Please try again later.",
        i18nKey: "errors.rateLimit",
        fieldErrors: {},
        code,
        details,
        raw: error,
      });
    }

    // 500-599 Server Errors
    if (status >= 500 && status < 600) {
      return new NormalizedApiError({
        kind: "SERVER_ERROR",
        status,
        message: backendMessage || "Internal Server Error",
        i18nKey: "errors.serverError",
        fieldErrors: {},
        code,
        details,
        raw: error,
      });
    }

    // Other HTTP status codes
    return new NormalizedApiError({
      kind: "UNKNOWN",
      status,
      message: backendMessage || error.statusText || `Request failed with status ${status}`,
      i18nKey: "errors.generic",
      fieldErrors: {},
      code,
      details,
      raw: error,
    });
  }

  // Handle Abort & Timeout errors
  if (error instanceof Error) {
    const isTimeout =
      error.name === "TimeoutError" ||
      error.message.toLowerCase().includes("timed out") ||
      (error instanceof DOMException && error.name === "TimeoutError");

    if (isTimeout) {
      return new NormalizedApiError({
        kind: "TIMEOUT",
        status: null,
        message: error.message || "Request timed out",
        i18nKey: "errors.network",
        fieldErrors: {},
        raw: error,
      });
    }

    const isAbort =
      error.name === "AbortError" ||
      (error instanceof DOMException && error.name === "AbortError");

    if (isAbort) {
      return new NormalizedApiError({
        kind: "TIMEOUT",
        status: null,
        message: error.message || "Request was aborted",
        i18nKey: "errors.network",
        fieldErrors: {},
        raw: error,
      });
    }

    const isNetwork =
      error.name === "NetworkError" ||
      error.message.toLowerCase().includes("failed to fetch") ||
      error.message.toLowerCase().includes("network error") ||
      error.message.toLowerCase().includes("econnrefused");

    if (isNetwork) {
      return new NormalizedApiError({
        kind: "NETWORK_ERROR",
        status: null,
        message: error.message || "Network connection error",
        i18nKey: "errors.network",
        fieldErrors: {},
        raw: error,
      });
    }

    return new NormalizedApiError({
      kind: "UNKNOWN",
      status: null,
      message: error.message || "Something went wrong",
      i18nKey: "errors.generic",
      fieldErrors: {},
      raw: error,
    });
  }

  // Fallback for non-Error values (strings, null, unknown objects)
  return new NormalizedApiError({
    kind: "UNKNOWN",
    status: null,
    message: typeof error === "string" ? error : "Something went wrong",
    i18nKey: "errors.generic",
    fieldErrors: {},
    raw: error,
  });
}
