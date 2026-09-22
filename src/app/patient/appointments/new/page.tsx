"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingWizard } from "@/features/appointments/components/booking/booking-wizard";

function BookingPageSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-pulse">
      <div className="h-4 w-28 bg-muted rounded" />
      <div className="h-10 w-full bg-muted rounded-xl" />
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function NewAppointmentPage() {
  return (
    <React.Suspense fallback={<BookingPageSkeleton />}>
      <BookingWizard />
    </React.Suspense>
  );
}

