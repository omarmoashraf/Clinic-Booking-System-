import * as React from "react";
import { DoctorDetailClient } from "./doctor-detail-client";

export default async function DoctorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DoctorDetailClient doctorId={id} />;
}

