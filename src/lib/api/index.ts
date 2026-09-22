/**
 * Centralized API infrastructure entry point
 */

export {
  HttpClient,
  apiClient,
  configureApiAuth,
  buildUrl,
  serializeQueryParams,
  appendQueryParams,
} from "./http-client";

export { HttpError } from "./http-error";
export type { HttpErrorParams } from "./http-error";

export {
  NormalizedApiError,
  normalizeApiError,
} from "./error-normalizer";

export type {
  HttpMethod,
  QueryParamValue,
  QueryParams,
  ApiResponse,
  PaginationMeta,
  PaginatedApiResponse,
  ApiErrorResponse,
  ValidationErrorItem,
  ApiValidationErrorResponse,
  ApiRateLimitResponse,
  ApiResponseEnvelope,
  ResponseType,
  RequestConfig,
  InternalRequestConfig,
  HttpClientConfig,
} from "../../types/api";

export type {
  ApiErrorKind,
  FieldErrorsMap,
  NormalizedErrorDetails,
} from "../../types/errors";
