import type { AuthTokens } from "../../types/auth";

const ACCESS_TOKEN_KEY = "clinic_access_token";
const REFRESH_TOKEN_KEY = "clinic_refresh_token";

/**
 * Storage manager for authentication tokens.
 * Interacts with localStorage in the browser with an in-memory fallback for SSR and testing.
 */
export class TokenStorage {
  private memoryTokens: Partial<AuthTokens> = {};

  getAccessToken(): string | null {
    if (this.isBrowser()) {
      try {
        return window.localStorage.getItem(ACCESS_TOKEN_KEY);
      } catch {
        return this.memoryTokens.accessToken ?? null;
      }
    }
    return this.memoryTokens.accessToken ?? null;
  }

  setAccessToken(token: string): void {
    this.memoryTokens.accessToken = token;
    if (this.isBrowser()) {
      try {
        window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
      } catch {
        // Fallback to in-memory if localStorage is disabled/restricted
      }
    }
  }

  getRefreshToken(): string | null {
    if (this.isBrowser()) {
      try {
        return window.localStorage.getItem(REFRESH_TOKEN_KEY);
      } catch {
        return this.memoryTokens.refreshToken ?? null;
      }
    }
    return this.memoryTokens.refreshToken ?? null;
  }

  setRefreshToken(token: string): void {
    this.memoryTokens.refreshToken = token;
    if (this.isBrowser()) {
      try {
        window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
      } catch {
        // Fallback to in-memory
      }
    }
  }

  setTokens(tokens: AuthTokens): void {
    this.setAccessToken(tokens.accessToken);
    this.setRefreshToken(tokens.refreshToken);
  }

  getTokens(): AuthTokens | null {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    if (!accessToken || !refreshToken) {
      return null;
    }
    return { accessToken, refreshToken };
  }

  clearTokens(): void {
    this.memoryTokens = {};
    if (this.isBrowser()) {
      try {
        window.localStorage.removeItem(ACCESS_TOKEN_KEY);
        window.localStorage.removeItem(REFRESH_TOKEN_KEY);
      } catch {
        // Ignore storage access errors
      }
    }
  }

  hasTokens(): boolean {
    return Boolean(this.getAccessToken() || this.getRefreshToken());
  }

  private isBrowser(): boolean {
    return (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined"
    );
  }
}

/**
 * Shared default singleton instance of TokenStorage
 */
export const tokenStorage = new TokenStorage();

