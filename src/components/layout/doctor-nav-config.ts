export type DoctorNavIconName =
  | "LayoutDashboard"
  | "Calendar"
  | "Clock"
  | "User";

export interface DoctorNavItem {
  href: string;
  labelKey: string;
  iconName: DoctorNavIconName;
}

export const DOCTOR_NAV_ITEMS: DoctorNavItem[] = [
  {
    href: "/doctor/dashboard",
    labelKey: "nav.dashboard",
    iconName: "LayoutDashboard",
  },
  {
    href: "/doctor/appointments",
    labelKey: "nav.appointments",
    iconName: "Calendar",
  },
  {
    href: "/doctor/availability",
    labelKey: "nav.availability",
    iconName: "Clock",
  },
  {
    href: "/doctor/profile",
    labelKey: "nav.profile",
    iconName: "User",
  },
];

/**
 * Determine if a navigation link is currently active based on pathname
 */
export function isRouteActive(pathname: string, href: string): boolean {
  if (href === "/doctor/dashboard" || href === "/doctor") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Extract 1-2 initials from full name or email for the avatar circle.
 * Defaults to "D" for Doctor if missing or unparseable.
 */
export function getInitials(nameOrEmail?: string | null): string {
  if (!nameOrEmail) return "D";
  const trimmed = nameOrEmail.trim();
  if (!trimmed) return "D";
  if (trimmed.includes("@")) {
    return trimmed.charAt(0).toUpperCase();
  }
  // Strip "Dr." or "Dr " prefix if present before extracting initials, or keep standard initials
  const cleaned = trimmed.replace(/^dr\.?\s+/i, "");
  const parts = (cleaned || trimmed).split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (cleaned || trimmed).slice(0, 2).toUpperCase();
}

