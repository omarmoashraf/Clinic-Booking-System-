"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Menu, X, LogIn, UserPlus, LogOut, LayoutDashboard } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";

/**
 * Public Header Component
 * Shared across all public routes.
 * Supports desktop nav, accessible mobile drawer, language switching, and auth status.
 */
export function PublicHeader() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const [prevPathname, setPrevPathname] = React.useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Handle escape key to close mobile menu
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/doctors", label: t("nav.doctors") },
    { href: "/specialties", label: t("nav.specialties") },
  ];

  const getDashboardHref = (role?: string) => {
    switch (role) {
      case "PATIENT":
        return "/patient/dashboard";
      case "DOCTOR":
        return "/doctor/dashboard";
      case "ADMIN":
        return "/admin/dashboard";
      default:
        return "/patient/dashboard";
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md px-4 sm:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1"
          aria-label={t("common.appName")}
        >
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-subtle">
            <Activity className="size-5" />
          </div>
          <div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-foreground block">
              {t("common.appName")}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-6 text-sm font-medium"
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-foreground py-1 border-b-2",
                  isActive
                    ? "text-primary border-primary font-semibold"
                    : "text-muted-foreground border-transparent"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions (i18n & Auth) */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />

          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              {user?.role && (
                <Badge variant="outline" className="text-xs capitalize font-normal">
                  {user.role.toLowerCase()}
                </Badge>
              )}
              <Link
                href={getDashboardHref(user?.role)}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "gap-1.5",
                })}
              >
                <LayoutDashboard className="size-3.5" />
                <span>{t("nav.dashboard")}</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                aria-label={t("nav.logout")}
                title={t("nav.logout")}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "gap-1.5",
                })}
              >
                <LogIn className="size-3.5" />
                <span>{t("nav.login")}</span>
              </Link>
              <Link
                href="/register"
                className={buttonVariants({
                  size: "sm",
                  className: "gap-1.5",
                })}
              >
                <UserPlus className="size-3.5" />
                <span>{t("nav.register")}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher showLabel={false} size="icon" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-menu"
            aria-label={mobileMenuOpen ? t("common.close") : "Open navigation menu"}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          className="md:hidden pt-4 pb-3 border-t border-border mt-3 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-base font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-1 text-sm text-muted-foreground">
                  <span>Role:</span>
                  <Badge variant="outline" className="capitalize">
                    {user?.role?.toLowerCase()}
                  </Badge>
                </div>
                <Link
                  href={getDashboardHref(user?.role)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={buttonVariants({
                    variant: "outline",
                    className: "w-full justify-start gap-2",
                  })}
                >
                  <LayoutDashboard className="size-4" />
                  <span>{t("nav.dashboard")}</span>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                >
                  <LogOut className="size-4" />
                  <span>{t("nav.logout")}</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={buttonVariants({
                    variant: "outline",
                    className: "w-full",
                  })}
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className={buttonVariants({
                    className: "w-full",
                  })}
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
