import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function DoctorDashboardSkeleton() {
  return (
    <div
      className="space-y-8 animate-in fade-in duration-200"
      role="status"
      aria-label="Loading doctor dashboard..."
    >
      {/* Banner Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-44 rounded-lg shrink-0" />
      </div>

      {/* Stats Grid Skeleton (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-5 rounded-xl border border-border bg-card"
          >
            <Skeleton className="size-12 rounded-xl shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
        ))}
      </div>

      {/* Next Patient Card Skeleton */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-border">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-border bg-card space-y-3"
            >
              <Skeleton className="size-11 rounded-xl" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Appointments Skeleton */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <Skeleton className="h-5 w-40" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

