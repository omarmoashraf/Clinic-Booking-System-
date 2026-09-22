"use client";

import * as React from "react";
import { AuthProvider } from "./auth-provider";
import { I18nProvider } from "./i18n-provider";
import { QueryProvider } from "./query-provider";
import type { Locale } from "@/lib/i18n/config";

export interface ProvidersProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export function Providers({ children, initialLocale }: ProvidersProps) {
  return (
    <QueryProvider>
      <I18nProvider initialLocale={initialLocale}>
        <AuthProvider>{children}</AuthProvider>
      </I18nProvider>
    </QueryProvider>
  );
}

export { I18nProvider } from "./i18n-provider";
export { AuthProvider } from "./auth-provider";
export { QueryProvider } from "./query-provider";
