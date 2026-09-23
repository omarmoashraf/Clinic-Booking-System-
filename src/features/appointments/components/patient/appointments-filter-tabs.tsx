"use client";

import * as React from "react";
import { useTranslation } from "@/hooks/use-i18n";
import type { AppointmentStatus } from "@/features/appointments/types";
import { cn } from "@/lib/utils";

export type StatusTabKey = "ALL" | AppointmentStatus;

export interface AppointmentsFilterTabsProps {
  selectedStatus: StatusTabKey;
  onSelectStatus: (status: StatusTabKey) => void;
  className?: string;
}

const TABS: { key: StatusTabKey; labelKey: string }[] = [
  { key: "ALL", labelKey: "appointments.tabAll" },
  { key: "PENDING", labelKey: "appointments.tabPending" },
  { key: "CONFIRMED", labelKey: "appointments.tabConfirmed" },
  { key: "COMPLETED", labelKey: "appointments.tabCompleted" },
  { key: "CANCELLED", labelKey: "appointments.tabCancelled" },
];

export function AppointmentsFilterTabs({
  selectedStatus,
  onSelectStatus,
  className,
}: AppointmentsFilterTabsProps) {
  const { t } = useTranslation();

  return (
    <div
      role="tablist"
      aria-label="Appointments Status Filter"
      className={cn(
        "flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border overflow-x-auto no-scrollbar",
        className
      )}
    >
      {TABS.map((tab) => {
        const isSelected = selectedStatus === tab.key;

        return (
          <button
            key={tab.key}
            role="tab"
            type="button"
            aria-selected={isSelected}
            onClick={() => onSelectStatus(tab.key)}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isSelected
                ? "bg-background text-foreground shadow-subtle font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
            )}
          >
            {t(tab.labelKey)}
          </button>
        );
      })}
    </div>
  );
}

