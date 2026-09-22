import type { ApiResponse } from "../../types/api";
import type { LoginResponseData } from "../../types/auth";
import { HttpClient } from "../api/http-client";
import { tokenStorage, TokenStorage } from "./token-storage";

export type SessionExpiredListener = () => void;

/**
 * Coordinates atomic refresh token rotation to prevent concurrent refresh storms.
 */
export class TokenRefreshManager {
  private inFlightPromise: Promise<string | null> | null = null;
  private readonly storage: TokenStorage;
  private readonly rawClient: HttpClient;
  private readonly listeners: Set<SessionExpiredListener> = new Set();

  constructor(
    storage: TokenStorage = tokenStorage,
    rawClient?: HttpClient
  ) {
    this.storage = storage;
    // Dedicated raw client without token interceptors to avoid recursive refresh loops
    this.rawClient =
      rawClient ??
      new HttpClient({
        // Do not attach authorization header to refresh request
        getAccessToken: undefined,
      });
  }

  /**
   * Registers a callback triggered when a refresh fails and the session terminates.
   */
  onSessionExpired(listener: SessionExpiredListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Atomically executes a token refresh. If a refresh is already in progress,
   * returns the existing in-flight promise.
   */
  async refresh(): Promise<string | null> {
    if (this.inFlightPromise) {
      return this.inFlightPromise;
    }

    this.inFlightPromise = this.executeRefresh().finally(() => {
      this.inFlightPromise = null;
    });

    return this.inFlightPromise;
  }

  private async executeRefresh(): Promise<string | null> {
    const refreshToken = this.storage.getRefreshToken();
    if (!refreshToken) {
      this.storage.clearTokens();
      this.notifySessionExpired();
      return null;
    }

    try {
      const response = await this.rawClient.post<ApiResponse<LoginResponseData>>(
        "/auth/refresh",
        { refreshToken }
      );

      const data = response?.data;
      if (!data?.accessToken || !data?.refreshToken) {
        throw new Error("Invalid refresh response envelope");
      }

      // Store new access token and rotated refresh token
      this.storage.setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      return data.accessToken;
    } catch {
      // Any refresh failure revokes local session per API_CONTRACT.md
      this.storage.clearTokens();
      this.notifySessionExpired();
      return null;
    }
  }

  private notifySessionExpired(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch {
        // Suppress listener errors
      }
    });
  }
}

/**
 * Shared default singleton instance of TokenRefreshManager
 */
export const tokenRefreshManager = new TokenRefreshManager();

