import { DEFAULT_LOCALE, type Locale } from "./config";
import { dictionaries } from "./dictionaries";
import type { TranslationParams } from "./types";

/**
 * Resolves a nested key in an object using dot notation (e.g. 'common.appName').
 */
function resolvePath(obj: unknown, path: string): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;

  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return typeof current === "string" ? current : undefined;
}

/**
 * Interpolates variables in a template string. Supports both {param} and {{param}} patterns.
 */
function interpolate(template: string, params?: TranslationParams): string {
  if (!params || Object.keys(params).length === 0) {
    return template;
  }

  return template.replace(/\{\{?([a-zA-Z0-9_-]+)\}?\}/g, (match, key) => {
    if (key in params) {
      return String(params[key]);
    }
    return match;
  });
}

/**
 * Core translation resolver:
 * 1. Checks requested locale dictionary
 * 2. Falls back to default locale (English) if missing
 * 3. Falls back to raw key if not found in any dictionary
 * 4. Applies parameter interpolation
 */
export function getTranslation(
  locale: Locale,
  key: string,
  params?: TranslationParams
): string {
  const primaryDict = dictionaries[locale];
  let text = resolvePath(primaryDict, key);

  // Fallback to English if not found in primary dictionary
  if (text === undefined && locale !== DEFAULT_LOCALE) {
    const fallbackDict = dictionaries[DEFAULT_LOCALE];
    text = resolvePath(fallbackDict, key);
  }

  // Fallback to key itself if no translation found
  if (text === undefined) {
    text = key;
  }

  return interpolate(text, params);
}

/**
 * Creates a bound translation function for a specific locale.
 */
export function createTranslator(locale: Locale) {
  return (key: string, params?: TranslationParams) =>
    getTranslation(locale, key, params);
}

