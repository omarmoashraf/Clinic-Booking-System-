"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Calendar,
  Globe,
  LayoutDashboard,
  LogOut,
  Stethoscope,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PATIENT_NAV_ITEMS,
  getInitials,
  isRouteActive,
  type PatientNavIconName,
} from "./patient-nav-config";

const NAV_ICONS: Record<PatientNavIconName, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Calendar,
  Stethoscope,
  User,
};

/**
 * Persistent Desktop Sidebar for Patient Portal
 */
export function PatientSidebar() {
  const pathname = usePathname();
  const { profile, user, logout } = useAuth();
  const { t } = useTranslation();

  const displayName = profile?.fullName || profile?.email || user?.id || "";
  const initials = getInitials(displayName);

  return (
    <aside
      className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 start-0 z-30 bg-card border-e border-border select-none"
      aria-label={t("patients.menu")}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-border">
        <Link
          href="/patient/dashboard"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1"
          aria-label={t("common.appName")}
        >
          <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-subtle">
            <Activity className="size-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm tracking-tight text-foreground truncate block leading-tight">
              {t("common.appName")}
            </span>
            <span className="text-xs text-primary font-medium mt-0.5 truncate block">
              {t("patients.portalTitle")}
            </span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 flex flex-col justify-between overflow-y-auto px-3 py-4 space-y-6">
        <nav className="space-y-1" aria-label={t("patients.menu")}>
          {PATIENT_NAV_ITEMS.map((item) => {
            const isActive = isRouteActive(pathname, item.href);
            const Icon = NAV_ICONS[item.iconName];
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-subtle font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                )}
              >
                <Icon
                  className={cn(
                    "size-4.5 shrink-0 transition-transform group-hover:scale-105",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span className="truncate">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Secondary Links: Back to Public Website */}
        <div className="pt-3 border-t border-border/60">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Globe className="size-4 shrink-0" />
            <span className="truncate">{t("nav.backToWebsite")}</span>
          </Link>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-border bg-muted/20">
        <div className="flex items-center justify-between gap-2.5">
          <Link
            href="/patient/profile"
            className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-85 transition-opacity rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={t("nav.profile")}
          >
            <div className="size-8 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center shrink-0 border border-primary/20">
              {initials}
            </div>
            <div className="min-w-0 flex-1 text-start">
              <p className="text-xs font-semibold text-foreground truncate leading-tight">
                {profile?.fullName || t("patients.roleLabel")}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Badge
                  variant="outline"
                  className="text-[10px] px-1 py-0 h-4 font-normal text-muted-foreground"
                >
                  {t("patients.roleLabel")}
                </Badge>
              </div>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
            onClick={() => logout()}
            aria-label={t("nav.logout")}
            title={t("nav.logout")}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

