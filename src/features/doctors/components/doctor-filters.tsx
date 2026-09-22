"use client";

import * as React from "react";
import { Search, X, RotateCcw, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSpecialtiesQuery } from "@/features/specialties/hooks/use-specialties";
import { useTranslation } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";

export interface DoctorFiltersProps {
  selectedSpecialty: string;
  onSpecialtyChange: (specialty: string) => void;
  searchName: string;
  onSearchNameChange: (name: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  className?: string;
}

/**
 * Filter and Search toolbar for Doctors Discovery page
 * Supports dynamic specialty fetching and client-side doctor name filter.
 */
export function DoctorFilters({
  selectedSpecialty,
  onSpecialtyChange,
  searchName,
  onSearchNameChange,
  onClearFilters,
  hasActiveFilters,
  className,
}: DoctorFiltersProps) {
  const { t } = useTranslation();
  const { data: specialtiesData, isLoading: isSpecialtiesLoading } =
    useSpecialtiesQuery({ limit: 100 });

  const specialties = specialtiesData?.data ?? [];

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 sm:p-5 shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5",
        className
      )}
      role="search"
      aria-label="Filter Doctors"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 min-w-0">
        {/* Name Search Input */}
        <div className="relative flex-1 min-w-48">
          <Search
            className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            type="text"
            value={searchName}
            onChange={(e) => onSearchNameChange(e.target.value)}
            placeholder={t("doctors.searchByNamePlaceholder")}
            className="ps-9 pe-8 h-9 text-sm"
            aria-label={t("doctors.searchByNamePlaceholder")}
          />
          {searchName && (
            <button
              type="button"
              onClick={() => onSearchNameChange("")}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground hover:text-foreground"
              aria-label="Clear name search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Specialty Filter Dropdown */}
        <div className="w-full sm:w-56 shrink-0">
          <Select
            value={selectedSpecialty || "all"}
            onValueChange={(val) => {
              const strVal = String(val ?? "");
              onSpecialtyChange(strVal === "all" ? "" : strVal);
            }}
          >
            <SelectTrigger className="w-full h-9 text-sm">
              <div className="flex items-center gap-2 truncate">
                <Filter className="size-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                <SelectValue
                  placeholder={
                    isSpecialtiesLoading
                      ? t("common.loading")
                      : t("doctors.allSpecialties")
                  }
                />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("doctors.allSpecialties")}</SelectItem>
              {specialties.map((spec) => (
                <SelectItem key={spec.id} value={spec.name}>
                  {spec.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="flex items-center justify-end shrink-0 pt-1 md:pt-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <RotateCcw className="size-3" />
            <span>{t("doctors.clearFilters")}</span>
          </Button>
        </div>
      )}
    </div>
  );
}

