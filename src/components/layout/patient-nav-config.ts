export type PatientNavIconName =
  | "LayoutDashboard"
  | "Calendar"
  | "Stethoscope"
  | "User";

export interface PatientNavItem {
  href: string;
  labelKey: string;
  iconName: PatientNavIconName;
}

export const PATIENT_NAV_ITEMS: PatientNavItem[] = [
  {
    href: "/patient/dashboard",
    labelKey: "nav.dashboard",
    iconName: "LayoutDashboard",
  },
  {
    href: "/patient/appointments",
    labelKey: "nav.myAppointments",
    iconName: "Calendar",
  },
  {
    href: "/patient/doctors",
    labelKey: "nav.findDoctors",
    iconName: "Stethoscope",
  },
  {
    href: "/patient/profile",
    labelKey: "nav.profile",
    iconName: "User",
  },
];

/**
 * Determine if a navigation link is currently active based on pathname
 */
export function isRouteActive(pathname: string, href: string): boolean {
  if (href === "/patient/dashboard" || href === "/") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Extract 1-2 initials from full name or email for the avatar circle
 */
export function getInitials(nameOrEmail?: string | null): string {
  if (!nameOrEmail) return "P";
  const trimmed = nameOrEmail.trim();
  if (!trimmed) return "P";
  if (trimmed.includes("@")) {
    return trimmed.charAt(0).toUpperCase();
  }
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

