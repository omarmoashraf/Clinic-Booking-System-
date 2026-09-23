import type { ApiResponse } from "../../types/api";
import type {
  AuthTokens,
  AuthUser,
  LoginCredentials,
  LoginResponseData,
  RegisterPayload,
  RegisterResponseData,
  UserProfile,
  UserRole,
} from "../../types/auth";
import { HttpClient } from "../api/http-client";
import { HttpError } from "../api/http-error";
import { tokenRefreshManager, TokenRefreshManager } from "./token-refresh";
import { tokenStorage, TokenStorage } from "./token-storage";

export class AuthService {
  private readonly storage: TokenStorage;
  private readonly refreshManager: TokenRefreshManager;
  private readonly client: HttpClient;

  constructor(
    storage: TokenStorage = tokenStorage,
    refreshManager: TokenRefreshManager = tokenRefreshManager,
    client?: HttpClient
  ) {
    this.storage = storage;
    this.refreshManager = refreshManager;
    this.client =
      client ??
      new HttpClient({
        getAccessToken: () => this.storage.getAccessToken(),
      });
  }

  /**
   * Authenticates user via POST /auth/login, stores tokens, and fetches the full profile.
   */
  async login(
    credentials: LoginCredentials
  ): Promise<{ tokens: AuthTokens; user: AuthUser; profile: UserProfile }> {
    const response = await this.client.request<ApiResponse<LoginResponseData>>(
      "POST",
      "/auth/login",
      { body: credentials }
    );

    const { accessToken, refreshToken, user } = response.data;
    const tokens: AuthTokens = { accessToken, refreshToken };

    this.storage.setTokens(tokens);

    // Fetch full user profile with the newly acquired token
    const profile = await this.getMe(accessToken);

    return { tokens, user, profile };
  }

  /**
   * Registers a new patient or doctor account via POST /auth/register.
   * Public endpoint. Does not auto-authenticate (tokens are not returned).
   */
  async register(payload: RegisterPayload): Promise<RegisterResponseData> {
    const response = await this.client.post<ApiResponse<RegisterResponseData>>(
      "/auth/register",
      payload
    );
    return response.data;
  }

  /**
   * Logs out the user via POST /auth/logout and clears local tokens.
   * Cleans up local state unconditionally, even if the backend call fails.
   */
  async logout(): Promise<void> {
    const refreshToken = this.storage.getRefreshToken();
    const accessToken = this.storage.getAccessToken();

    if (refreshToken && accessToken) {
      try {
        await this.client.post(
          "/auth/logout",
          { refreshToken },
          { token: accessToken }
        );
      } catch {
        // Backend failure or network drop should not prevent local cleanup
      }
    }

    this.storage.clearTokens();
  }

  /**
   * Retrieves the authenticated user's profile from GET /users/me.
   */
  async getMe(token?: string): Promise<UserProfile> {
    const response = await this.client.get<ApiResponse<UserProfile>>("/users/me", {
      token: token ?? this.storage.getAccessToken(),
    });
    return response.data;
  }

  /**
   * Refreshes the session tokens using TokenRefreshManager.
   */
  async refreshSession(): Promise<boolean> {
    const newToken = await this.refreshManager.refresh();
    return Boolean(newToken);
  }

  /**
   * Restores an existing session on startup.
   * Handles valid access tokens, expired tokens needing refresh, or unauthenticated state.
   */
  async restoreSession(): Promise<{ user: AuthUser; profile: UserProfile } | null> {
    const accessToken = this.storage.getAccessToken();
    const refreshToken = this.storage.getRefreshToken();

    if (!accessToken && !refreshToken) {
      return null;
    }

    // Attempt to validate current access token
    if (accessToken) {
      try {
        const profile = await this.getMe(accessToken);
        return {
          user: { id: profile.id, role: profile.role },
          profile,
        };
      } catch (error) {
        // If 401 Unauthorized, attempt refresh
        if (HttpError.isHttpError(error) && error.status === 401 && refreshToken) {
          return this.attemptRestoreViaRefresh();
        }
        this.storage.clearTokens();
        return null;
      }
    }

    // Only refresh token exists
    if (refreshToken) {
      return this.attemptRestoreViaRefresh();
    }

    return null;
  }

  private async attemptRestoreViaRefresh(): Promise<{
    user: AuthUser;
    profile: UserProfile;
  } | null> {
    const refreshedToken = await this.refreshManager.refresh();
    if (!refreshedToken) {
      this.storage.clearTokens();
      return null;
    }

    try {
      const profile = await this.getMe(refreshedToken);
      return {
        user: { id: profile.id, role: profile.role },
        profile,
      };
    } catch {
      this.storage.clearTokens();
      return null;
    }
  }
}

/**
 * Role helper utilities
 */
export function isPatient(role?: UserRole | null): boolean {
  return role === "PATIENT";
}

export function isDoctor(role?: UserRole | null): boolean {
  return role === "DOCTOR";
}

export function isAdmin(role?: UserRole | null): boolean {
  return role === "ADMIN";
}

/**
 * Shared default singleton instance of AuthService
 */
export const authService = new AuthService();

