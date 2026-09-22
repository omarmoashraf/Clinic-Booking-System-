"use client";

import * as React from "react";
import { DoctorsDiscoveryView } from "@/features/doctors/components/doctors-discovery-view";

export default function PatientDoctorsPage() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <DoctorsDiscoveryView basePath="/patient/doctors" showBreadcrumb={true} />
    </div>
  );
}

