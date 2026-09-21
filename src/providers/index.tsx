"use client";

import * as React from "react";
import { I18nProvider } from "./i18n-provider";
import type { Locale } from "@/lib/i18n/config";

export interface ProvidersProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export function Providers({ children, initialLocale }: ProvidersProps) {
  return (
    <I18nProvider initialLocale={initialLocale}>
      {children}
    </I18nProvider>
  );
}

export { I18nProvider } from "./i18n-provider";

