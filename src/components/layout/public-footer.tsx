"use client";

import * as React from "react";
import Link from "next/link";
import { Activity, Clock, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/hooks/use-i18n";

/**
 * Public Footer Component
 * Conforms to DESIGN.md Section 13 (Public Experience) and brand guidelines.
 */
export function PublicFooter() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card text-card-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
              aria-label={t("common.appName")}
            >
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-subtle">
                <Activity className="size-4" />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground">
                {t("common.appName")}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              {t("home.footerTagline")}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <ShieldCheck className="size-4 text-primary shrink-0" aria-hidden="true" />
              <span>Certified Healthcare SaaS Platform</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-semibold tracking-wide text-foreground uppercase">
              {t("home.footerQuickLinks")}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link href="/doctors" className="hover:text-foreground transition-colors">
                  {t("nav.doctors")}
                </Link>
              </li>
              <li>
                <Link href="/specialties" className="hover:text-foreground transition-colors">
                  {t("nav.specialties")}
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  {t("nav.login")}
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-foreground transition-colors">
                  {t("nav.register")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinic Information Column */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-sm font-semibold tracking-wide text-foreground uppercase">
              {t("home.footerClinicInfo")}
            </h4>
            <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <Clock className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <p className="leading-relaxed">
                {t("home.footerHours")}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            &copy; {currentYear} {t("common.appName")}. {t("home.footerRights")}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/doctors" className="hover:text-foreground transition-colors">
              {t("home.findDoctors")}
            </Link>
            <span>&bull;</span>
            <Link href="/specialties" className="hover:text-foreground transition-colors">
              {t("home.exploreSpecialties")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

