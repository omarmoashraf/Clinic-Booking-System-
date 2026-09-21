/**
 * Internationalization Configuration & Utilities
 * Clinic Management System
 */

export type Locale = "en" | "ar";
export type Direction = "ltr" | "rtl";

export const DEFAULT_LOCALE: Locale = "en";

export const SUPPORTED_LOCALES: readonly Locale[] = ["en", "ar"] as const;

export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";
export const LOCALE_STORAGE_KEY = "clinic_locale";

export const LOCALE_DIRECTIONS: Record<Locale, Direction> = {
  en: "ltr",
  ar: "rtl",
};

export const LOCALE_LABELS: Record<
  Locale,
  {
    name: string;
    nativeName: string;
    code: Locale;
    dir: Direction;
  }
> = {
  en: {
    name: "English",
    nativeName: "English",
    code: "en",
    dir: "ltr",
  },
  ar: {
    name: "Arabic",
    nativeName: "العربية",
    code: "ar",
    dir: "rtl",
  },
};

/**
 * Validates whether a value is a supported Locale.
 */
export function isValidLocale(value: unknown): value is Locale {
  return typeof value === "string" && (value === "en" || value === "ar");
}

/**
 * Resolves the reading direction ('ltr' or 'rtl') for a given locale.
 */
export function getDirection(locale: Locale): Direction {
  return LOCALE_DIRECTIONS[locale] ?? "ltr";
}

/**
 * Helper to check if a locale requires right-to-left text direction.
 */
export function isRtlLocale(locale: Locale): boolean {
  return getDirection(locale) === "rtl";
}

