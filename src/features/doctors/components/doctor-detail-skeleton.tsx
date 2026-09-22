import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface DoctorDetailSkeletonProps {
  className?: string;
}

/**
 * Loading skeleton for Doctor Details page
 * Conforms to DESIGN.md Section 24 (Loading States).
 */
export function DoctorDetailSkeleton({ className }: DoctorDetailSkeletonProps) {
  return (
    <div className={cn("space-y-8 animate-pulse", className)} aria-busy="true" aria-label="Loading doctor details">
      {/* Profile Header Skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <Skeleton className="size-20 sm:size-24 rounded-full shrink-0" />
        <div className="space-y-3 flex-1 min-w-0 w-full">
          <Skeleton className="h-7 sm:h-8 w-48 sm:w-64" />
          <Skeleton className="h-5 w-32 rounded-md" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>

      {/* Availability Section Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-border bg-card space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

