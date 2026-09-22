/**
 * Authentication Infrastructure Entry Point
 */

import { configureApiAuth } from "../api/http-client";
import { tokenRefreshManager } from "./token-refresh";
import { tokenStorage } from "./token-storage";

// Automatically register token resolution & refresh on default API client
configureApiAuth({
  getAccessToken: () => tokenStorage.getAccessToken(),
  refreshToken: () => tokenRefreshManager.refresh(),
});

export { TokenStorage, tokenStorage } from "./token-storage";
export {
  TokenRefreshManager,
  tokenRefreshManager,
} from "./token-refresh";
export type { SessionExpiredListener } from "./token-refresh";

export {
  AuthService,
  authService,
  isPatient,
  isDoctor,
  isAdmin,
} from "./auth-service";

export type {
  UserRole,
  AuthUser,
  PatientProfile,
  DoctorProfile,
  UserProfile,
  AuthTokens,
  LoginCredentials,
  LoginResponseData,
  AuthStatus,
  AuthContextValue,
} from "../../types/auth";

