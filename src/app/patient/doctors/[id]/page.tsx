import * as React from "react";
import { DoctorDetailView } from "@/features/doctors/components/doctor-detail-view";

export default async function PatientDoctorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DoctorDetailView doctorId={id} basePath="/patient/doctors" showBreadcrumb={true} />;
}

