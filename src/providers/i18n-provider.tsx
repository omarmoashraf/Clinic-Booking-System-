"use client";

import * as React from "react";
import {
  DEFAULT_LOCALE,
  getDirection,
  isValidLocale,
  LOCALE_COOKIE_NAME,
  LOCALE_STORAGE_KEY,
  type Direction,
  type Locale,
} from "@/lib/i18n/config";
import { getTranslation } from "@/lib/i18n/translator";
import type { I18nContextType, TranslationParams } from "@/lib/i18n/types";

export const I18nContext = React.createContext<I18nContextType | null>(null);

export interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: I18nProviderProps) {
  const [locale, setLocaleState] = React.useState<Locale>(initialLocale);

  // Sync with client localStorage if server did not receive a cookie on initial visit
  React.useEffect(() => {
    try {
      const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isValidLocale(storedLocale) && storedLocale !== initialLocale) {
        React.startTransition(() => {
          setLocaleState(storedLocale);
        });
      }
    } catch {
      // Storage access may be restricted
    }
  }, [initialLocale]);

  // Synchronize document attributes whenever locale changes
  React.useEffect(() => {
    const dir = getDirection(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale]);

  const setLocale = React.useCallback((nextLocale: Locale) => {
    if (!isValidLocale(nextLocale)) return;

    setLocaleState(nextLocale);

    try {
      // Persist in localStorage
      localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);

      // Persist in cookie for SSR layout rendering
      document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;

      // Update document root attributes immediately
      const dir = getDirection(nextLocale);
      document.documentElement.lang = nextLocale;
      document.documentElement.dir = dir;
    } catch {
      // Ignore browser storage write errors
    }
  }, []);

  const direction: Direction = getDirection(locale);
  const isRTL = direction === "rtl";

  const t = React.useCallback(
    (key: string, params?: TranslationParams) => {
      return getTranslation(locale, key, params);
    },
    [locale]
  );

  const contextValue = React.useMemo<I18nContextType>(
    () => ({
      locale,
      direction,
      isRTL,
      setLocale,
      t,
    }),
    [locale, direction, isRTL, setLocale, t]
  );

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

