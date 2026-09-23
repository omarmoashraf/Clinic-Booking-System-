import * as React from "react";
import { DoctorAppointmentDetailView } from "@/features/appointments/components/doctor/doctor-appointment-detail-view";

export default async function DoctorAppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DoctorAppointmentDetailView appointmentId={id} />;
}

