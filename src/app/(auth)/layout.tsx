"use client";

import * as React from "react";
import Link from "next/link";
import { Activity } from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { useTranslation } from "@/hooks/use-i18n";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-muted/20 text-foreground relative selection:bg-primary/20 selection:text-primary">
      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg group"
          aria-label={t("common.appName")}
        >
          <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-subtle">
            <Activity className="size-5" aria-hidden="true" />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">
            {t("common.appName")}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
        </div>
      </header>

      {/* Centered Auth Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        {children}
      </main>

      {/* Clean Minimal Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 text-center text-xs text-muted-foreground border-t border-border/40">
        <p>
          &copy; {currentYear} {t("common.appName")}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

