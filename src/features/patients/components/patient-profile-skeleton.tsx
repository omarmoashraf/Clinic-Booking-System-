import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function PatientProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse" aria-busy="true">
      {/* Editable Form Card Skeleton */}
      <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-subtle space-y-6">
        <div className="space-y-2 border-b border-border pb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          <div className="pt-2">
            <Skeleton className="h-10 w-36 rounded-md" />
          </div>
        </div>
      </div>

      {/* Read-Only Account Details Skeleton */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-subtle space-y-6 h-fit">
        <div className="space-y-2 border-b border-border pb-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-56" />
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-5 w-36" />
          </div>
        </div>
      </div>
    </div>
  );
}

