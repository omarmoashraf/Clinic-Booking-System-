import {
  CONTENT_TYPES,
  DEFAULT_API_BASE_URL,
  DEFAULT_REQUEST_TIMEOUT_MS,
  HTTP_HEADERS,
} from "../../config/api";
import type {
  HttpClientConfig,
  HttpMethod,
  InternalRequestConfig,
  QueryParams,
  RequestConfig,
} from "../../types/api";
import { HttpError } from "./http-error";

/**
 * Normalizes and joins base URL with endpoint without double or missing slashes.
 */
export function buildUrl(baseUrl: string, endpoint: string): string {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanEndpoint = endpoint.replace(/^\/+/, "");

  if (!cleanBase) {
    return `/${cleanEndpoint}`;
  }
  if (!cleanEndpoint) {
    return cleanBase;
  }
  return `${cleanBase}/${cleanEndpoint}`;
}

/**
 * Serializes query parameters into a query string.
 * Omits undefined and null values; supports repeated keys for arrays.
 */
export function serializeQueryParams(params: QueryParams): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item));
        }
      }
    } else {
      searchParams.append(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Appends query parameters to a URL string.
 */
export function appendQueryParams(url: string, params?: QueryParams): string {
  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  const queryString = serializeQueryParams(params);
  if (!queryString) {
    return url;
  }

  const hasQuery = url.includes("?");
  return `${url}${hasQuery ? "&" + queryString.slice(1) : queryString}`;
}

/**
 * Checks if a value is a plain JavaScript object.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

let defaultGetAccessToken:
  | (() => string | null | Promise<string | null>)
  | undefined;
let defaultRefreshToken: (() => Promise<string | null>) | undefined;

/**
 * Connects global authentication token providers to HttpClient.
 */
export function configureApiAuth(hooks: {
  getAccessToken?: () => string | null | Promise<string | null>;
  refreshToken?: () => Promise<string | null>;
}): void {
  if (hooks.getAccessToken !== undefined) {
    defaultGetAccessToken = hooks.getAccessToken;
  }
  if (hooks.refreshToken !== undefined) {
    defaultRefreshToken = hooks.refreshToken;
  }
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly timeoutMs: number;
  private readonly getAccessToken?: () => string | null | Promise<string | null>;
  private readonly refreshToken?: () => Promise<string | null>;
  private readonly onRequest?: (
    config: InternalRequestConfig
  ) => InternalRequestConfig | Promise<InternalRequestConfig>;
  private readonly onResponse?: (response: Response) => Response | Promise<Response>;
  private readonly onError?: (error: unknown) => void | Promise<void>;
  private readonly fetchFn: typeof fetch;

  constructor(config: HttpClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? DEFAULT_API_BASE_URL;
    this.defaultHeaders = {
      [HTTP_HEADERS.ACCEPT]: CONTENT_TYPES.JSON,
      ...(config.defaultHeaders ?? {}),
    };
    this.timeoutMs = config.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
    this.getAccessToken = config.getAccessToken;
    this.refreshToken = config.refreshToken;
    this.onRequest = config.onRequest;
    this.onResponse = config.onResponse;
    this.onError = config.onError;
    this.fetchFn = config.fetchFn ?? globalThis.fetch.bind(globalThis);
  }

  /**
   * Dispatches an HTTP request with full configuration and error handling.
   */
  async request<T>(
    method: HttpMethod,
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    let reqConfig: InternalRequestConfig = {
      ...config,
      method,
      url: endpoint,
    };

    if (this.onRequest) {
      reqConfig = await this.onRequest(reqConfig);
    }

    const fullUrl = buildUrl(this.baseUrl, reqConfig.url);
    const urlWithParams = appendQueryParams(fullUrl, reqConfig.params);

    // Resolve authentication token
    let token: string | null | undefined = reqConfig.token;
    if (token === undefined) {
      const getAccessTokenFn = this.getAccessToken ?? defaultGetAccessToken;
      if (getAccessTokenFn) {
        token = await getAccessTokenFn();
      }
    }

    // Build headers
    const headers = new Headers();

    for (const [key, val] of Object.entries(this.defaultHeaders)) {
      headers.set(key, val);
    }

    if (token) {
      headers.set(HTTP_HEADERS.AUTHORIZATION, `Bearer ${token}`);
    }

    if (reqConfig.headers) {
      if (reqConfig.headers instanceof Headers) {
        reqConfig.headers.forEach((value, key) => {
          headers.set(key, value);
        });
      } else {
        for (const [key, val] of Object.entries(reqConfig.headers)) {
          if (val !== undefined) {
            headers.set(key, val);
          }
        }
      }
    }

    // Serialize body
    let bodyInit: BodyInit | null | undefined = undefined;
    if (reqConfig.body !== undefined && reqConfig.body !== null) {
      const rawBody = reqConfig.body;
      if (
        typeof rawBody === "string" ||
        rawBody instanceof FormData ||
        rawBody instanceof URLSearchParams ||
        rawBody instanceof Blob ||
        rawBody instanceof ArrayBuffer
      ) {
        bodyInit = rawBody as BodyInit;
        // If body is FormData, delete Content-Type so browser sets boundary automatically
        if (rawBody instanceof FormData) {
          headers.delete(HTTP_HEADERS.CONTENT_TYPE);
        }
      } else if (isPlainObject(rawBody) || Array.isArray(rawBody)) {
        bodyInit = JSON.stringify(rawBody);
        if (!headers.has(HTTP_HEADERS.CONTENT_TYPE)) {
          headers.set(HTTP_HEADERS.CONTENT_TYPE, CONTENT_TYPES.JSON);
        }
      } else {
        bodyInit = String(rawBody);
      }
    }

    // Setup cancellation and timeout
    const timeout = reqConfig.timeoutMs ?? this.timeoutMs;
    const abortController = new AbortController();
    let timeoutId: NodeJS.Timeout | number | undefined = undefined;

    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        abortController.abort(new DOMException("Request timed out", "TimeoutError"));
      }, timeout);
    }

    const effectiveSignal: AbortSignal = abortController.signal;
    if (reqConfig.signal) {
      if (reqConfig.signal.aborted) {
        abortController.abort(reqConfig.signal.reason);
      } else {
        reqConfig.signal.addEventListener("abort", () => {
          abortController.abort(reqConfig.signal?.reason);
        });
      }
    }

    if (effectiveSignal.aborted) {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      throw effectiveSignal.reason instanceof Error
        ? effectiveSignal.reason
        : new DOMException(
            String(effectiveSignal.reason || "This operation was aborted"),
            "AbortError"
          );
    }

    try {
      let response = await this.fetchFn(urlWithParams, {
        method: reqConfig.method,
        headers,
        body: bodyInit,
        signal: effectiveSignal,
        credentials: reqConfig.credentials,
        cache: reqConfig.cache,
      });

      if (this.onResponse) {
        response = await this.onResponse(response);
      }

      // Handle non-2xx responses
      if (!response.ok) {
        // Attempt automatic refresh & retry on 401 Unauthorized
        const refreshTokenFn = this.refreshToken ?? defaultRefreshToken;
        if (
          response.status === 401 &&
          refreshTokenFn &&
          !reqConfig.skipAuthRefresh &&
          !reqConfig._isRetry &&
          !reqConfig.url.includes("/auth/login") &&
          !reqConfig.url.includes("/auth/refresh") &&
          !reqConfig.url.includes("/auth/register")
        ) {
          const newToken = await refreshTokenFn();
          if (newToken) {
            return this.request<T>(method, endpoint, {
              ...config,
              token: newToken,
              _isRetry: true,
            });
          }
        }

        const errorData = await this.parseResponseBody(response);
        const errorMessage =
          this.extractErrorMessage(errorData) ||
          response.statusText ||
          `Request failed with status ${response.status}`;

        const httpError = new HttpError({
          message: errorMessage,
          status: response.status,
          statusText: response.statusText,
          data: errorData,
          url: urlWithParams,
          method: reqConfig.method,
          headers: response.headers,
        });

        if (this.onError) {
          await this.onError(httpError);
        }

        throw httpError;
      }

      // Handle 204 No Content or 205 Reset Content
      if (response.status === 204 || response.status === 205) {
        return undefined as unknown as T;
      }

      if (reqConfig.responseType === "void") {
        return undefined as unknown as T;
      }

      if (reqConfig.responseType === "text") {
        return (await response.text()) as unknown as T;
      }

      if (reqConfig.responseType === "blob") {
        return (await response.blob()) as unknown as T;
      }

      // Default: parse as JSON
      return (await this.parseResponseBody(response)) as T;
    } catch (error) {
      if (HttpError.isHttpError(error)) {
        throw error;
      }

      // Re-throw or wrap other errors
      if (this.onError) {
        await this.onError(error);
      }
      throw error;
    } finally {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    }
  }

  get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>("GET", endpoint, config);
  }

  post<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>("POST", endpoint, { ...config, body });
  }

  put<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>("PUT", endpoint, { ...config, body });
  }

  patch<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>("PATCH", endpoint, { ...config, body });
  }

  delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>("DELETE", endpoint, config);
  }

  /**
   * Helper to safely parse response body according to content-type and content-length.
   */
  private async parseResponseBody(response: Response): Promise<unknown> {
    const contentLength = response.headers.get("content-length");
    if (contentLength === "0") {
      return null;
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json") || contentType.includes("+json")) {
      try {
        return await response.json();
      } catch {
        return null;
      }
    }

    try {
      const text = await response.text();
      return text ? text : null;
    } catch {
      return null;
    }
  }

  /**
   * Helper to extract human-readable error message from backend error responses.
   * Matches API_CONTRACT.md format: { status: "error", message: "..." } or { message: "..." }
   */
  private extractErrorMessage(data: unknown): string | null {
    if (typeof data === "object" && data !== null && "message" in data) {
      const msg = (data as { message: unknown }).message;
      if (typeof msg === "string") {
        return msg;
      }
    }
    return null;
  }
}

/**
 * Shared default singleton instance of HttpClient configured with application defaults.
 */
export const apiClient = new HttpClient();
