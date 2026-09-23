import type { HttpMethod } from "../../types/api";

export interface HttpErrorParams {
  message: string;
  status: number;
  statusText: string;
  data: unknown;
  url: string;
  method: HttpMethod;
  headers?: Headers;
}

/**
 * Standardized HTTP Error thrown by HttpClient for non-2xx responses.
 * Provides rich error context and status classification helpers.
 */
export class HttpError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly data: unknown;
  readonly url: string;
  readonly method: HttpMethod;
  readonly headers?: Headers;
  readonly isHttpError = true;

  constructor({
    message,
    status,
    statusText,
    data,
    url,
    method,
    headers,
  }: HttpErrorParams) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.url = url;
    this.method = method;
    this.headers = headers;

    // Restore prototype chain for instanceof checks across transpiled environments
    Object.setPrototypeOf(this, HttpError.prototype);
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  get isValidationError(): boolean {
    if (this.status === 422) return true;
    if (this.status === 400) {
      if (typeof this.data === "object" && this.data !== null) {
        const obj = this.data as Record<string, unknown>;
        if (obj.status === "validation_error") return true;
        if (Array.isArray(obj.errors) || Array.isArray(obj.details)) return true;
      }
    }
    return false;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }

  get code(): string | undefined {
    if (typeof this.data === "object" && this.data !== null && "code" in this.data) {
      const codeVal = (this.data as { code: unknown }).code;
      if (typeof codeVal === "string") {
        return codeVal;
      }
    }
    return undefined;
  }

  get details(): unknown[] | undefined {
    if (typeof this.data === "object" && this.data !== null && "details" in this.data) {
      const detailsVal = (this.data as { details: unknown }).details;
      if (Array.isArray(detailsVal)) {
        return detailsVal;
      }
    }
    return undefined;
  }

  get isTokenExpired(): boolean {
    return this.code === "token_expired";
  }

  /**
   * Type guard to check if an unknown error is an HttpError instance.
   */
  static isHttpError(error: unknown): error is HttpError {
    return (
      error instanceof HttpError ||
      (typeof error === "object" &&
        error !== null &&
        "isHttpError" in error &&
        (error as { isHttpError: boolean }).isHttpError === true)
    );
  }
}
