import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface DoctorGridSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * Doctor Grid Loading Skeleton
 * Conforms to DESIGN.md Section 24 (Loading States).
 */
export function DoctorGridSkeleton({
  count = 8,
  className,
}: DoctorGridSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
        className
      )}
      aria-busy="true"
      aria-label="Loading doctors"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-subtle space-y-4"
        >
          <div>
            <div className="flex items-start gap-3.5 mb-4">
              <Skeleton className="size-12 rounded-full shrink-0" />
              <div className="space-y-2 flex-1 min-w-0">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3.5 w-20 rounded-md" />
              </div>
            </div>
            <div className="space-y-1.5 pt-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
          <div className="pt-3 border-t border-border/60">
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

