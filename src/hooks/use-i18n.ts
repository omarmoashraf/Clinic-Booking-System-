"use client";

import * as React from "react";
import { I18nContext } from "@/providers/i18n-provider";
import type { I18nContextType } from "@/lib/i18n/types";

/**
 * Access the full i18n context (locale, direction, isRTL, setLocale, t).
 * Throws an error if invoked outside an I18nProvider.
 */
export function useI18n(): I18nContextType {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

/**
 * Convenience hook to access translation function and current locale state.
 */
export function useTranslation() {
  const { t, locale, direction, isRTL } = useI18n();
  return { t, locale, direction, isRTL };
}

/**
 * Convenience hook to access and switch the current locale.
 */
export function useLocale() {
  const { locale, setLocale, direction, isRTL } = useI18n();
  return { locale, setLocale, direction, isRTL };
}

