import { QueryClient, type DefaultOptions } from "@tanstack/react-query";
import { HttpError } from "../api/http-error";

/**
 * Intelligent retry policy:
 * - Never retries client errors (400, 401, 403, 404, 409, 422) except rate limits (429)
 * - Retries transient network failures and 5xx server errors up to 2 times
 */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) {
    return false;
  }

  if (HttpError.isHttpError(error)) {
    // 4xx errors should fail immediately without retry (except 429 rate limit which can be retried)
    if (error.isClientError && error.status !== 429) {
      return false;
    }
  }

  return true;
}

export const DEFAULT_QUERY_CONFIG: NonNullable<DefaultOptions["queries"]> = {
  staleTime: 60 * 1000, // 1 minute
  gcTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: false,
  retry: shouldRetryQuery,
};

export const DEFAULT_MUTATION_CONFIG: NonNullable<DefaultOptions["mutations"]> = {
  retry: false, // Never auto-retry mutations to prevent accidental duplicate actions
};

/**
 * Creates a configured QueryClient instance.
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: DEFAULT_QUERY_CONFIG,
      mutations: DEFAULT_MUTATION_CONFIG,
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Returns a QueryClient instance.
 * On the server, always creates a new client per request to prevent cross-user data leakage.
 * In the browser, lazily initializes and reuses a singleton instance.
 */
export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

