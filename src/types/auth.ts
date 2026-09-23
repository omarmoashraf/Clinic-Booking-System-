/**
 * Authentication and User Types for Clinic Management System
 * Based on API_CONTRACT.md Authentication and Users modules.
 */

export type UserRole = "PATIENT" | "DOCTOR" | "ADMIN";

/**
 * Minimal user payload returned by login and refresh endpoints
 */
export interface AuthUser {
  id: string;
  role: UserRole;
}

/**
 * Role-specific patient profile (returned within GET /users/me for PATIENT)
 */
export interface PatientProfile {
  id: string;
  dateOfBirth: string; // YYYY-MM-DD
}

/**
 * Role-specific doctor profile (returned within GET /users/me for DOCTOR)
 */
export interface DoctorProfile {
  id: string;
  specialty: {
    id: string;
    name: string;
  };
  bio?: string | null;
}

/**
 * Full authenticated user profile returned by GET /users/me
 */
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  patient?: PatientProfile;
  doctor?: DoctorProfile;
}

/**
 * Token pair stored locally
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Credentials for POST /auth/login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Payload returned in data property of POST /auth/login and POST /auth/refresh
 */
export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

/**
 * Payload for POST /auth/register
 * Aligned with API_CONTRACT.md Auth Module
 */
export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: "PATIENT" | "DOCTOR";
  specialtyId?: string;
}

/**
 * Response payload returned in data property of POST /auth/register
 */
export interface RegisterResponseData {
  id: string;
  role: "PATIENT" | "DOCTOR";
}

/**
 * Lifecycle status of authentication
 */
export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

/**
 * Context value exposed to UI via useAuth
 */
export interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPatient: boolean;
  isDoctor: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<UserProfile>;
  register: (payload: RegisterPayload) => Promise<RegisterResponseData>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  updateProfile: (profile: UserProfile) => void;
}


