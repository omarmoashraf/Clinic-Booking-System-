"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Accessible skeleton loader for Doctor Availability schedule
 * Preserves structural dimensions to avoid layout shift.
 */
export function DoctorAvailabilitySkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading availability"
      className="space-y-6 animate-pulse"
    >
      <span className="sr-only">Loading availability schedule...</span>

      {/* Filter skeleton */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-subtle flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-28 rounded" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
      </div>

      {/* Date Groups Skeletons */}
      {[1, 2].map((group) => (
        <div key={group} className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="p-3.5 rounded-lg border border-border bg-card flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-lg" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                </div>
                <Skeleton className="size-8 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

