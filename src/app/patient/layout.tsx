import type { Metadata } from "next";
import { PatientShell } from "@/components/layout/patient-shell";

export const metadata: Metadata = {
  title: "Patient Portal | Clinic Management System",
  description: "Patient dashboard, appointment bookings, and medical profile management",
};

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PatientShell>{children}</PatientShell>;
}

