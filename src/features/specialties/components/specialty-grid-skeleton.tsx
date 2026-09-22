import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface SpecialtyGridSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * Specialty Grid Skeleton
 * Matches the layout and dimensions of SpecialtyCard
 */
export function SpecialtyGridSkeleton({
  count = 12,
  className,
}: SpecialtyGridSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5",
        className
      )}
      aria-hidden="true"
      data-testid="specialty-grid-skeleton"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col justify-between p-5 rounded-xl border border-border bg-card shadow-subtle min-h-[120px]"
        >
          <div className="flex items-center gap-3.5 mb-3">
            <Skeleton className="size-11 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4 rounded" />
            </div>
          </div>
          <div className="pt-2 border-t border-border/50 flex items-center justify-between">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="size-3.5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

