/**
 * API Type Definitions for Clinic Management System
 * Based on API_CONTRACT.md and AGENT.md specifications.
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QueryParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | (string | number | boolean)[];

export type QueryParams = Record<string, QueryParamValue>;

/**
 * Standard non-paginated API success response shape
 * As defined in API_CONTRACT.md: { status: "success", data: ... }
 */
export interface ApiResponse<T> {
  status: "success";
  data: T;
}

/**
 * Pagination metadata format
 * As defined in API_CONTRACT.md: { page, limit, total, totalPages }
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Standard paginated API success response shape
 * As defined in API_CONTRACT.md: { status: "success", data: [...], meta: { ... } }
 */
export interface PaginatedApiResponse<T> {
  status: "success";
  data: T[];
  meta: PaginationMeta;
}

/**
 * Standard API error response format
 * As defined in API_CONTRACT.md: { status: "error", message: "..." }
 */
export interface ApiErrorResponse {
  status: "error";
  message: string;
}

/**
 * Individual field validation error
 */
export interface ValidationErrorItem {
  field: string;
  message: string;
}

/**
 * Standard API validation error response format
 * As defined in API_CONTRACT.md: { status: "validation_error", message: "...", errors: [...] }
 */
export interface ApiValidationErrorResponse {
  status: "validation_error";
  message: string;
  errors: ValidationErrorItem[];
}

/**
 * Standard API rate limit (429) error response format
 * As defined in API_CONTRACT.md: { message: "Too many requests. Please try again later." }
 */
export interface ApiRateLimitResponse {
  message: string;
}

export type ApiResponseEnvelope<T> =
  | ApiResponse<T>
  | PaginatedApiResponse<T>
  | ApiErrorResponse
  | ApiValidationErrorResponse
  | ApiRateLimitResponse;

export type ResponseType = "json" | "text" | "blob" | "void";

/**
 * Request options for individual HTTP requests
 */
export interface RequestConfig {
  params?: QueryParams;
  headers?: Record<string, string | undefined> | Headers;
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
  token?: string | null;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  responseType?: ResponseType;
  skipAuthRefresh?: boolean;
  _isRetry?: boolean;
}

export interface InternalRequestConfig extends RequestConfig {
  url: string;
  method: HttpMethod;
}

/**
 * Configuration options for HttpClient initialization
 */
export interface HttpClientConfig {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  timeoutMs?: number;
  getAccessToken?: () => string | null | Promise<string | null>;
  refreshToken?: () => Promise<string | null>;
  onRequest?: (
    config: InternalRequestConfig
  ) => InternalRequestConfig | Promise<InternalRequestConfig>;
  onResponse?: (response: Response) => Response | Promise<Response>;
  onError?: (error: unknown) => void | Promise<void>;
  fetchFn?: typeof fetch;
}

