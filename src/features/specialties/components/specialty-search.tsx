"use client";

import * as React from "react";
import { Search, X, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";

export interface SpecialtySearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  className?: string;
}

/**
 * Search toolbar for Specialties directory page
 * Supports live query input with debounce/instant clear.
 */
export function SpecialtySearch({
  value,
  onChange,
  onClear,
  className,
}: SpecialtySearchProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 sm:p-5 shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5",
        className
      )}
      role="search"
      aria-label={t("specialties.pageTitle")}
    >
      <div className="relative flex-1 min-w-0">
        <Search
          className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("specialties.searchPlaceholder")}
          className="ps-9 pe-8 h-10 text-sm"
          aria-label={t("specialties.searchPlaceholder")}
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute end-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={t("specialties.clearSearch")}
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {value && (
        <div className="flex items-center justify-end shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <RotateCcw className="size-3" />
            <span>{t("specialties.clearSearch")}</span>
          </Button>
        </div>
      )}
    </div>
  );
}

