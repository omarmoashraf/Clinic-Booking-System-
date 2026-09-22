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
    return (
      this.status === 422 ||
      (this.status === 400 &&
        typeof this.data === "object" &&
        this.data !== null &&
        "status" in this.data &&
        (this.data as { status: string }).status === "validation_error")
    );
  }

  get isRateLimited(): boolean {
    return this.status === 429;
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
