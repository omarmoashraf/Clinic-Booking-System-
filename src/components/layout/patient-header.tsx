"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LogOut, Menu, User } from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-i18n";
import { PATIENT_NAV_ITEMS, isRouteActive } from "./patient-nav-config";

export interface PatientHeaderProps {
  onOpenMobileNav: () => void;
  isMobileNavOpen: boolean;
}

/**
 * Responsive Header for the Patient Portal
 */
export function PatientHeader({
  onOpenMobileNav,
  isMobileNavOpen,
}: PatientHeaderProps) {
  const pathname = usePathname();
  const { profile, logout } = useAuth();
  const { t } = useTranslation();

  // Determine current section title based on active route
  const currentSection = React.useMemo(() => {
    const matched = PATIENT_NAV_ITEMS.find((item) =>
      isRouteActive(pathname, item.href)
    );
    return matched ? t(matched.labelKey) : t("patients.portalTitle");
  }, [pathname, t]);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 transition-colors">
      {/* Mobile Start: Hamburger & Brand */}
      <div className="flex md:hidden items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileNav}
          aria-expanded={isMobileNavOpen}
          aria-controls="patient-mobile-nav"
          aria-label={t("patients.menu")}
          className="size-9 text-foreground"
        >
          <Menu className="size-5" />
        </Button>

        <Link
          href="/patient/dashboard"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-0.5"
          aria-label={t("common.appName")}
        >
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-subtle">
            <Activity className="size-4.5" />
          </div>
          <span className="font-bold text-sm tracking-tight text-foreground truncate max-w-[140px] sm:max-w-none">
            {t("patients.portalTitle")}
          </span>
        </Link>
      </div>

      {/* Desktop Start: Contextual Section Title */}
      <div className="hidden md:flex items-center gap-3">
        <h1 className="text-base font-semibold text-foreground tracking-tight">
          {currentSection}
        </h1>
      </div>

      {/* End Actions: Language Switcher & User Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Switcher */}
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>
        <div className="sm:hidden">
          <LanguageSwitcher showLabel={false} size="icon" />
        </div>

        {/* User Greeting (Desktop) */}
        {profile?.fullName && (
          <div className="hidden lg:flex items-center gap-2 ps-3 border-s border-border text-sm">
            <span className="text-muted-foreground text-xs">
              {t("patients.welcome")},
            </span>
            <span className="font-semibold text-foreground text-xs truncate max-w-[150px]">
              {profile.fullName}
            </span>
          </div>
        )}

        {/* Quick Profile Link (Desktop) */}
        <Link
          href="/patient/profile"
          className="hidden md:inline-flex items-center justify-center size-8 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={t("nav.profile")}
          title={t("nav.profile")}
        >
          <User className="size-4" />
        </Link>

        {/* Logout Action (Desktop) */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => logout()}
          aria-label={t("nav.logout")}
          title={t("nav.logout")}
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}
