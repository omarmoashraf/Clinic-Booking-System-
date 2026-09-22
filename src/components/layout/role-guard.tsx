"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Activity } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-i18n";
import { Spinner } from "@/components/ui/spinner";
import type { UserRole } from "@/types/auth";

export interface RoleGuardProps {
  /**
   * Roles permitted to access the protected content.
   */
  allowedRoles: UserRole[];
  children: React.ReactNode;
  /**
   * Optional custom fallback to show while evaluating session.
   */
  loadingFallback?: React.ReactNode;
}

/**
 * Route protection guard for role-specific application shells.
 * Enforces authentication and authorization based on user roles.
 */
const emptySubscribe = () => () => {};

export function RoleGuard({
  allowedRoles,
  children,
  loadingFallback,
}: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, isAuthenticated, isLoading, user } = useAuth();
  const { t } = useTranslation();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const rolesKey = allowedRoles.join(",");

  React.useEffect(() => {
    if (!mounted || isLoading || status === "loading") {
      return;
    }

    // Unauthenticated: redirect to login with return path
    if (!isAuthenticated || !user) {
      const redirectTarget = pathname
        ? `/login?redirect=${encodeURIComponent(pathname)}`
        : "/login";
      router.replace(redirectTarget);
      return;
    }

    // Role mismatch: redirect to the user's appropriate portal dashboard
    if (!allowedRoles.includes(user.role)) {
      if (user.role === "DOCTOR") {
        router.replace("/doctor/dashboard");
      } else if (user.role === "ADMIN") {
        router.replace("/admin/dashboard");
      } else if (user.role === "PATIENT") {
        router.replace("/patient/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [
    mounted,
    isLoading,
    status,
    isAuthenticated,
    user,
    rolesKey,
    allowedRoles,
    router,
    pathname,
  ]);

  // Loading state during SSR, mounting, or session restoration
  if (!mounted || isLoading || status === "loading") {
    return (
      loadingFallback ?? (
        <div
          className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-4 text-center max-w-sm">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-subtle animate-pulse">
              <Activity className="size-6" />
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground text-sm font-medium">
              <Spinner size="sm" />
              <span>{t("patients.loading")}</span>
            </div>
          </div>
        </div>
      )
    );
  }

  // Intermediate state while redirecting unauthenticated user
  if (!isAuthenticated || !user) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <Spinner size="md" />
          <p className="text-sm text-muted-foreground font-medium">
            {t("patients.redirecting")}
          </p>
        </div>
      </div>
    );
  }

  // Intermediate state while redirecting unauthorized role
  if (!allowedRoles.includes(user.role)) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground"
        role="alert"
      >
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="size-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive">
            <Activity className="size-6" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">
              {t("patients.unauthorized")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("patients.unauthorizedMessage")}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Spinner size="sm" />
            <span>{t("patients.redirecting")}</span>
          </div>
        </div>
      </div>
    );
  }

  // Access permitted
  return <>{children}</>;
}
