import { apiClient, HttpClient } from "./http-client";
import type {
  ApiResponse,
  HttpMethod,
  PaginatedApiResponse,
  RequestConfig,
} from "../../types/api";
import type {
  AuthTokens,
  AuthUser,
  LoginCredentials,
  LoginResponseData,
  RegisterPayload,
  RegisterResponseData,
  UserProfile,
} from "../../types/auth";
import type { components, paths } from "../../types/api-contract";

export type ApiContractPaths = paths;
export type ApiContractSchemas = components["schemas"];

/**
 * Base API Service / Wrapper providing centralized access to all endpoints
 * defined in api-contract.json and docs/FRONTEND_INTEGRATION.md.
 */
export class BaseApiService {
  private readonly client: HttpClient;

  constructor(client: HttpClient = apiClient) {
    this.client = client;
  }

  /**
   * Dispatches a raw request via underlying HttpClient.
   */
  request<T>(
    method: HttpMethod,
    endpoint: string,
    config?: RequestConfig
  ): Promise<T> {
    return this.client.request<T>(method, endpoint, config);
  }

  get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.client.get<T>(endpoint, config);
  }

  post<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.client.post<T>(endpoint, body, config);
  }

  put<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.client.put<T>(endpoint, body, config);
  }

  patch<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.client.patch<T>(endpoint, body, config);
  }

  delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.client.delete<T>(endpoint, config);
  }

  /**
   * Health Check (/health)
   */
  readonly health = {
    check: (config?: RequestConfig): Promise<ApiResponse<{ message: string }>> => {
      return this.client.get<ApiResponse<{ message: string }>>("/health", config);
    },
  };

  /**
   * Authentication endpoints (/auth/*)
   */
  readonly auth = {
    register: (
      payload: RegisterPayload,
      config?: RequestConfig
    ): Promise<ApiResponse<RegisterResponseData>> => {
      return this.client.post<ApiResponse<RegisterResponseData>>(
        "/auth/register",
        payload,
        config
      );
    },

    login: (
      credentials: LoginCredentials,
      config?: RequestConfig
    ): Promise<ApiResponse<LoginResponseData>> => {
      return this.client.request<ApiResponse<LoginResponseData>>(
        "POST",
        "/auth/login",
        { ...config, body: credentials }
      );
    },

    refresh: (
      payload: { refreshToken: string },
      config?: RequestConfig
    ): Promise<ApiResponse<LoginResponseData>> => {
      return this.client.post<ApiResponse<LoginResponseData>>(
        "/auth/refresh",
        payload,
        { ...config, skipAuthRefresh: true }
      );
    },

    logout: (
      payload: { refreshToken: string },
      config?: RequestConfig
    ): Promise<void> => {
      return this.client.post<void>("/auth/logout", payload, config);
    },
  };

  /**
   * Users endpoints (/users/*)
   */
  readonly users = {
    getMe: (config?: RequestConfig): Promise<ApiResponse<UserProfile>> => {
      return this.client.get<ApiResponse<UserProfile>>("/users/me", config);
    },
  };

  /**
   * Patient profile endpoints (/patients/*)
   */
  readonly patients = {
    updateMe: (
      payload: { fullName?: string; phone?: string; dateOfBirth?: string },
      config?: RequestConfig
    ): Promise<ApiResponse<UserProfile>> => {
      return this.client.patch<ApiResponse<UserProfile>>("/patients/me", payload, config);
    },
  };

  /**
   * Doctors & Availability endpoints (/doctors/*)
   */
  readonly doctors = {
    list: <T = unknown>(
      params?: { page?: number; limit?: number; specialty?: string },
      config?: RequestConfig
    ): Promise<PaginatedApiResponse<T>> => {
      return this.client.get<PaginatedApiResponse<T>>("/doctors", {
        ...config,
        params: {
          page: params?.page,
          limit: params?.limit,
          specialty: params?.specialty,
          ...(config?.params ?? {}),
        },
      });
    },

    getById: <T = unknown>(
      id: string,
      config?: RequestConfig
    ): Promise<ApiResponse<T>> => {
      return this.client.get<ApiResponse<T>>(`/doctors/${id}`, config);
    },

    updateMe: <T = unknown>(
      payload: { bio?: string; specialtyId?: string },
      config?: RequestConfig
    ): Promise<ApiResponse<T>> => {
      return this.client.patch<ApiResponse<T>>("/doctors/me", payload, config);
    },

    getAvailability: <T = unknown>(
      doctorId: string,
      config?: RequestConfig
    ): Promise<ApiResponse<T[]>> => {
      return this.client.get<ApiResponse<T[]>>(
        `/doctors/${doctorId}/availability`,
        config
      );
    },

    createAvailability: <T = unknown>(
      payload: {
        date: string;       // YYYY-MM-DD (Africa/Cairo wall-clock date)
        startTime: string;  // HH:mm 24-hour format
        endTime: string;    // HH:mm 24-hour format, must be after startTime
      },
      config?: RequestConfig
    ): Promise<ApiResponse<T>> => {
      return this.client.post<ApiResponse<T>>(
        "/doctors/me/availability",
        payload,
        config
      );
    },

    deleteAvailability: (
      id: string,
      config?: RequestConfig
    ): Promise<void> => {
      return this.client.delete<void>(`/doctors/me/availability/${id}`, config);
    },
  };

  /**
   * Specialties endpoints (/specialties/*)
   */
  readonly specialties = {
    // Returns paginated response: { status, data: [...], meta: { page, limit, total, totalPages } }
    // Note: specialty objects use `created_at` (snake_case), not `createdAt`.
    list: <T = unknown>(
      params?: { page?: number; limit?: number; search?: string },
      config?: RequestConfig
    ): Promise<PaginatedApiResponse<T>> => {
      return this.client.get<PaginatedApiResponse<T>>("/specialties", {
        ...config,
        params: {
          page: params?.page,
          limit: params?.limit,
          search: params?.search,
          ...(config?.params ?? {}),
        },
      });
    },

    getById: <T = unknown>(
      id: string,
      config?: RequestConfig
    ): Promise<ApiResponse<T>> => {
      return this.client.get<ApiResponse<T>>(`/specialties/${id}`, config);
    },

    // ADMIN only. name: 2-100 chars, letters/spaces/hyphens/ampersands only.
    create: <T = unknown>(
      payload: { name: string },
      config?: RequestConfig
    ): Promise<ApiResponse<T>> => {
      return this.client.post<ApiResponse<T>>("/specialties", payload, config);
    },

    // ADMIN only. name: 2-100 chars (character allowlist NOT enforced on update).
    update: <T = unknown>(
      id: string,
      payload: { name: string },
      config?: RequestConfig
    ): Promise<ApiResponse<T>> => {
      return this.client.patch<ApiResponse<T>>(`/specialties/${id}`, payload, config);
    },

    delete: (id: string, config?: RequestConfig): Promise<void> => {
      return this.client.delete<void>(`/specialties/${id}`, config);
    },
  };

  /**
   * Appointments endpoints (/appointments/*)
   */
  readonly appointments = {
    // PATIENT only. patientId/doctorId/status must NOT be sent — they are ignored.
    // Patient identity comes from the access token; doctor comes from the availability slot.
    create: <T = unknown>(
      payload: { availabilityId: string; notes?: string },
      config?: RequestConfig
    ): Promise<ApiResponse<T>> => {
      return this.client.post<ApiResponse<T>>("/appointments", payload, config);
    },

    listMy: <T = unknown>(
      params?: { page?: number; limit?: number; status?: string },
      config?: RequestConfig
    ): Promise<PaginatedApiResponse<T>> => {
      return this.client.get<PaginatedApiResponse<T>>("/appointments/me", {
        ...config,
        params: {
          page: params?.page,
          limit: params?.limit,
          status: params?.status,
          ...(config?.params ?? {}),
        },
      });
    },

    getById: <T = unknown>(
      id: string,
      config?: RequestConfig
    ): Promise<ApiResponse<T>> => {
      return this.client.get<ApiResponse<T>>(`/appointments/${id}`, config);
    },

    updateStatus: <T = unknown>(
      id: string,
      payload: { status: "CONFIRMED" | "CANCELLED" | "COMPLETED" },
      config?: RequestConfig
    ): Promise<ApiResponse<T>> => {
      return this.client.patch<ApiResponse<T>>(
        `/appointments/${id}/status`,
        payload,
        config
      );
    },
  };

  /**
   * Admin endpoints (/admin/*)
   */
  readonly admin = {
    listUsers: <T = unknown>(
      params?: { page?: number; limit?: number; role?: string },
      config?: RequestConfig
    ): Promise<PaginatedApiResponse<T>> => {
      return this.client.get<PaginatedApiResponse<T>>("/admin/users", {
        ...config,
        params: {
          page: params?.page,
          limit: params?.limit,
          role: params?.role,
          ...(config?.params ?? {}),
        },
      });
    },

    updateUserStatus: <T = unknown>(
      id: string,
      payload: { isActive: boolean },
      config?: RequestConfig
    ): Promise<ApiResponse<T>> => {
      return this.client.patch<ApiResponse<T>>(`/admin/users/${id}`, payload, config);
    },

    listAppointments: <T = unknown>(
      params?: {
        page?: number;
        limit?: number;
        status?: string;
        doctorId?: string;
        patientId?: string;
      },
      config?: RequestConfig
    ): Promise<PaginatedApiResponse<T>> => {
      return this.client.get<PaginatedApiResponse<T>>("/admin/appointments", {
        ...config,
        params: {
          page: params?.page,
          limit: params?.limit,
          status: params?.status,
          doctorId: params?.doctorId,
          patientId: params?.patientId,
          ...(config?.params ?? {}),
        },
      });
    },
  };

  /**
   * Helper to safely unwrap .data from standard ApiResponse envelope
   */
  static async unwrap<T>(responsePromise: Promise<ApiResponse<T>>): Promise<T> {
    const response = await responsePromise;
    return response.data;
  }
}

/**
 * Shared singleton instance of BaseApiService
 */
export const baseApiService = new BaseApiService();

