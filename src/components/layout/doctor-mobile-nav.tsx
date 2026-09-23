"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Calendar,
  Clock,
  Globe,
  LayoutDashboard,
  LogOut,
  User,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";
import {
  DOCTOR_NAV_ITEMS,
  getInitials,
  isRouteActive,
  type DoctorNavIconName,
} from "./doctor-nav-config";

const NAV_ICONS: Record<DoctorNavIconName, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Calendar,
  Clock,
  User,
};

export interface DoctorMobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mobile Navigation Drawer for Doctor Portal
 */
export function DoctorMobileNav({ isOpen, onClose }: DoctorMobileNavProps) {
  const pathname = usePathname();
  const { profile, user, logout } = useAuth();
  const { t } = useTranslation();

  // Close on escape key
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when mobile nav is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const displayName = profile?.fullName || profile?.email || user?.id || "";
  const initials = getInitials(displayName);
  const specialtyLabel = profile?.doctor?.specialty?.name || t("doctors.roleLabel");

  return (
    <div
      id="doctor-mobile-nav"
      className="fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={t("doctors.menu")}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 start-0 z-50 w-72 max-w-[85vw] bg-card border-e border-border shadow-dialog flex flex-col justify-between animate-in slide-in-from-start duration-200">
        {/* Drawer Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-border">
            <Link
              href="/doctor/dashboard"
              onClick={onClose}
              className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1"
              aria-label={t("common.appName")}
            >
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-subtle">
                <Activity className="size-4.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs tracking-tight text-foreground truncate block leading-tight">
                  {t("common.appName")}
                </span>
                <span className="text-[11px] text-primary font-medium mt-0.5 truncate block">
                  {t("doctors.portalTitle")}
                </span>
              </div>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label={t("common.close")}
              className="size-8 text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1" aria-label={t("doctors.menu")}>
            {DOCTOR_NAV_ITEMS.map((item) => {
              const isActive = isRouteActive(pathname, item.href);
              const Icon = NAV_ICONS[item.iconName];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-subtle"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4.5 shrink-0",
                      isActive ? "text-primary-foreground" : "text-muted-foreground"
                    )}
                  />
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Secondary Link: Website Home */}
          <div className="px-3 pt-2">
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <Globe className="size-4 shrink-0" />
              <span>{t("nav.backToWebsite")}</span>
            </Link>
          </div>
        </div>

        {/* Drawer Footer: Doctor Profile, i18n & Logout */}
        <div className="p-4 border-t border-border bg-muted/20 space-y-3">
          {/* Doctor Info Card */}
          <Link
            href="/doctor/profile"
            onClick={onClose}
            className="flex items-center gap-3 p-2 rounded-lg bg-card border border-border/80 hover:bg-muted/40 transition-colors"
          >
            <div className="size-9 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center shrink-0 border border-primary/20">
              {initials}
            </div>
            <div className="min-w-0 flex-1 text-start">
              <p className="text-xs font-semibold text-foreground truncate">
                {profile?.fullName || t("doctors.roleLabel")}
              </p>
              {profile?.email && (
                <p className="text-[11px] text-muted-foreground truncate">
                  {profile.email}
                </p>
              )}
              <div className="mt-1">
                <Badge
                  variant="outline"
                  className="text-[10px] px-1 py-0 h-4 font-normal truncate max-w-[130px]"
                >
                  {specialtyLabel}
                </Badge>
              </div>
            </div>
          </Link>

          {/* Language Switcher */}
          <div className="pt-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Language / اللغة</span>
            <LanguageSwitcher size="sm" />
          </div>

          {/* Logout Button */}
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-destructive border-destructive/20 hover:bg-destructive/10 text-sm"
            onClick={async () => {
              onClose();
              await logout();
            }}
          >
            <LogOut className="size-4" />
            <span>{t("nav.logout")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

