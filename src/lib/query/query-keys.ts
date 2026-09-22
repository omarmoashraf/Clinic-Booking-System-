/**
 * Hierarchical Query Key Factory for TanStack Query
 * Aligned with API_CONTRACT.md endpoints.
 */

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export const doctorKeys = {
  all: ["doctors"] as const,
  lists: () => [...doctorKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...doctorKeys.lists(), filters ?? {}] as const,
  details: () => [...doctorKeys.all, "detail"] as const,
  detail: (id: string) => [...doctorKeys.details(), id] as const,
  availabilities: () => [...doctorKeys.all, "availability"] as const,
  availability: (doctorId: string, date?: string) =>
    [...doctorKeys.availabilities(), doctorId, date ?? "all"] as const,
};

export const specialtyKeys = {
  all: ["specialties"] as const,
  lists: () => [...specialtyKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...specialtyKeys.lists(), filters ?? {}] as const,
  detail: (id: string) => [...specialtyKeys.all, "detail", id] as const,
};

export const appointmentKeys = {
  all: ["appointments"] as const,
  mine: (filters?: Record<string, unknown>) =>
    [...appointmentKeys.all, "me", filters ?? {}] as const,
  detail: (id: string) => [...appointmentKeys.all, "detail", id] as const,
};

export const adminKeys = {
  all: ["admin"] as const,
  users: (filters?: Record<string, unknown>) =>
    [...adminKeys.all, "users", filters ?? {}] as const,
  appointments: (filters?: Record<string, unknown>) =>
    [...adminKeys.all, "appointments", filters ?? {}] as const,
};

/**
 * Unified queryKeys export
 */
export const queryKeys = {
  auth: authKeys,
  doctors: doctorKeys,
  specialties: specialtyKeys,
  appointments: appointmentKeys,
  admin: adminKeys,
} as const;

