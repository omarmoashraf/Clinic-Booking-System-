import * as React from "react";
import { AppointmentDetailView } from "@/features/appointments/components/patient/appointment-detail-view";

export default async function PatientAppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AppointmentDetailView appointmentId={id} />;
}

