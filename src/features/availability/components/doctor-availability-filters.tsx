"use client";

import * as React from "react";
import { Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/use-i18n";
import type { AvailabilityFilterRange } from "../types";

export interface DoctorAvailabilityFiltersProps {
  selectedFilter: AvailabilityFilterRange;
  onFilterChange: (range: AvailabilityFilterRange) => void;
  customFrom: string;
  customTo: string;
  onCustomDatesChange: (from: string, to: string) => void;
  className?: string;
}

const FILTER_OPTIONS: Array<{ key: AvailabilityFilterRange; labelKey: string }> = [
  { key: "all", labelKey: "doctors.filterAll" },
  { key: "today", labelKey: "doctors.filterToday" },
  { key: "week", labelKey: "doctors.filterWeek" },
  { key: "month", labelKey: "doctors.filterMonth" },
  { key: "custom", labelKey: "doctors.filterCustom" },
];

/**
 * Filter controls for Doctor Availability schedule
 * Allows toggling between predefined date ranges or entering custom date bounds.
 */
export function DoctorAvailabilityFilters({
  selectedFilter,
  onFilterChange,
  customFrom,
  customTo,
  onCustomDatesChange,
  className,
}: DoctorAvailabilityFiltersProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`rounded-xl border border-border bg-card p-4 shadow-subtle space-y-3 text-start ${
        className ?? ""
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Filter className="size-3.5 text-primary" aria-hidden="true" />
          <span>{t("doctors.filterSpecialty")}</span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTER_OPTIONS.map((opt) => {
            const isSelected = selectedFilter === opt.key;
            return (
              <Button
                key={opt.key}
                type="button"
                size="sm"
                variant={isSelected ? "default" : "outline"}
                onClick={() => onFilterChange(opt.key)}
                className="text-xs font-medium h-7 px-2.5 rounded-full"
              >
                {t(opt.labelKey)}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Custom Range Inputs */}
      {selectedFilter === "custom" && (
        <div className="pt-2 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="custom-from" className="text-xs font-medium">
              {t("doctors.fromDate")}
            </Label>
            <div className="relative">
              <Calendar
                className="absolute start-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <Input
                id="custom-from"
                type="date"
                value={customFrom}
                onChange={(e) => onCustomDatesChange(e.target.value, customTo)}
                className="ps-8 text-xs font-mono h-8"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="custom-to" className="text-xs font-medium">
              {t("doctors.toDate")}
            </Label>
            <div className="relative">
              <Calendar
                className="absolute start-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <Input
                id="custom-to"
                type="date"
                value={customTo}
                onChange={(e) => onCustomDatesChange(customFrom, e.target.value)}
                className="ps-8 text-xs font-mono h-8"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

