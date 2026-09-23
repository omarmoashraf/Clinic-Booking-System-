"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Accessible skeleton loader for Doctor Profile page
 * Preserves structural dimensions to avoid layout shift.
 */
export function DoctorProfileSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading profile"
      className="space-y-6 animate-pulse"
    >
      <span className="sr-only">Loading doctor profile...</span>

      {/* Account Card Skeleton */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-subtle space-y-6">
        <div className="flex items-center gap-4 border-b border-border/60 pb-5">
          <Skeleton className="size-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg border border-border/60"
            >
              <Skeleton className="size-8 rounded-lg" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-4 w-36 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Professional Form Skeleton */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-subtle space-y-5">
        <div className="space-y-1.5 border-b border-border/60 pb-4">
          <Skeleton className="h-5 w-40 rounded" />
          <Skeleton className="h-3.5 w-64 rounded" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

