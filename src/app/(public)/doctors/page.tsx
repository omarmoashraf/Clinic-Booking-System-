"use client";

import * as React from "react";
import { DoctorsDiscoveryView } from "@/features/doctors/components/doctors-discovery-view";

export default function DoctorsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 w-full">
      <DoctorsDiscoveryView basePath="/doctors" showBreadcrumb={true} />
    </div>
  );
}
