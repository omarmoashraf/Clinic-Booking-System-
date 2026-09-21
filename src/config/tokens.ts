/**
 * Design Tokens for Clinic Management System
 * Based on DESIGN.md Sections 5-10, 22.
 */

export const APPOINTMENT_STATUS_TOKENS = {
  PENDING: {
    value: "PENDING",
    label: "Pending",
    labelAr: "قيد الانتظار",
    badgeClass: "bg-warning-muted text-warning-foreground border-warning/30",
    dotClass: "bg-warning",
  },
  CONFIRMED: {
    value: "CONFIRMED",
    label: "Confirmed",
    labelAr: "مؤكد",
    badgeClass: "bg-info-muted text-info-foreground border-info/30",
    dotClass: "bg-info",
  },
  COMPLETED: {
    value: "COMPLETED",
    label: "Completed",
    labelAr: "مكتمل",
    badgeClass: "bg-success-muted text-success-foreground border-success/30",
    dotClass: "bg-success",
  },
  CANCELLED: {
    value: "CANCELLED",
    label: "Cancelled",
    labelAr: "ملغي",
    badgeClass: "bg-destructive-muted text-destructive-foreground border-destructive/30",
    dotClass: "bg-destructive",
  },
} as const;

export type AppointmentStatusType = keyof typeof APPOINTMENT_STATUS_TOKENS;

export const TYPOGRAPHY_SCALE = {
  display: "text-4xl md:text-5xl font-bold tracking-tight",
  h1: "text-3xl md:text-4xl font-bold tracking-tight",
  h2: "text-2xl md:text-3xl font-semibold tracking-tight",
  h3: "text-xl md:text-2xl font-semibold",
  h4: "text-lg md:text-xl font-medium",
  bodyLarge: "text-lg leading-relaxed",
  body: "text-base leading-normal",
  bodySmall: "text-sm leading-normal",
  caption: "text-xs text-muted-foreground",
  label: "text-sm font-medium leading-none",
} as const;

export const RADIUS_TOKENS = {
  sm: "var(--radius-sm)",
  md: "var(--radius-md)",
  lg: "var(--radius-lg)",
  xl: "var(--radius-xl)",
  full: "var(--radius-full)",
} as const;

export const SHADOW_TOKENS = {
  subtle: "var(--shadow-subtle)",
  card: "var(--shadow-card)",
  dropdown: "var(--shadow-dropdown)",
  dialog: "var(--shadow-dialog)",
} as const;

