"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { RoleGuard } from "@/components/layout/role-guard";
import { DoctorSidebar } from "@/components/layout/doctor-sidebar";
import { DoctorHeader } from "@/components/layout/doctor-header";
import { DoctorMobileNav } from "@/components/layout/doctor-mobile-nav";
import { useTranslation } from "@/hooks/use-i18n";

export interface DoctorShellProps {
  children: React.ReactNode;
}

/**
 * DoctorShell Component
 * Foundational shell for the Doctor experience with desktop sidebar, mobile drawer,
 * sticky header, and role-based route protection.
 */
export function DoctorShell({ children }: DoctorShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();

  const [prevPathname, setPrevPathname] = React.useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileNavOpen(false);
  }

  return (
    <RoleGuard allowedRoles={["DOCTOR"]}>
      <div className="min-h-screen bg-background text-foreground flex">
        {/* Accessible Skip Link */}
        <a
          href="#doctor-main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-dialog focus:outline-none"
        >
          {t("doctors.skipToContent")}
        </a>

        {/* Desktop Sidebar (Persistent on md+) */}
        <DoctorSidebar />

        {/* Mobile Navigation Drawer */}
        <DoctorMobileNav
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 md:ps-64 transition-all">
          {/* Header */}
          <DoctorHeader
            onOpenMobileNav={() => setMobileNavOpen(true)}
            isMobileNavOpen={mobileNavOpen}
          />

          {/* Main Page Content */}
          <main
            id="doctor-main-content"
            className="flex-1 p-4 sm:p-6 lg:p-8 outline-none"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}

