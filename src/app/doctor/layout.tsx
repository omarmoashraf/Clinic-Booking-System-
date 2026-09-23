import type { Metadata } from "next";
import { DoctorShell } from "@/components/layout/doctor-shell";

export const metadata: Metadata = {
  title: "Doctor Portal | Clinic Management System",
  description: "Doctor dashboard, appointment management, and availability scheduling",
};

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DoctorShell>{children}</DoctorShell>;
}

