"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DirectionalIcon } from "@/components/shared/directional-icon";
import { useTranslation } from "@/hooks/use-i18n";
import { useDoctorDetailQuery } from "@/features/doctors/hooks/use-doctor-detail";
import { useDoctorAvailabilityQuery } from "@/features/doctors/hooks/use-doctor-availability";
import {
  BookingStepper,
  type BookingStep,
} from "./booking-stepper";
import { BookingDoctorSelect } from "./booking-doctor-select";
import { BookingSlotSelect } from "./booking-slot-select";
import { BookingConfirmForm } from "./booking-confirm-form";
import { BookingSuccessView } from "./booking-success-view";
import type { Doctor } from "@/features/doctors/types";
import type { AvailabilitySlot } from "@/features/availability/types";
import type { Appointment } from "@/features/appointments/types";

export function BookingWizard() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlDoctorId = searchParams.get("doctorId") ?? "";
  const urlSlotId = searchParams.get("slotId") ?? "";

  // Query doctor detail if doctorId is present in URL
  const { data: doctorResponse } = useDoctorDetailQuery(urlDoctorId);
  const fetchedDoctor = doctorResponse?.data ?? null;

  // Query doctor availability slots if doctorId is present
  const {
    data: availabilityResponse,
    refetch: refetchAvailability,
  } = useDoctorAvailabilityQuery(urlDoctorId);

  // Local state for manually chosen doctor/slot (overrides URL)
  const [manuallySelectedDoctor, setManuallySelectedDoctor] =
    React.useState<Doctor | null>(null);
  const [manuallySelectedSlot, setManuallySelectedSlot] =
    React.useState<AvailabilitySlot | null>(null);
  const [isDoctorCleared, setIsDoctorCleared] = React.useState(false);
  const [isSlotCleared, setIsSlotCleared] = React.useState(false);
  const [createdAppointment, setCreatedAppointment] =
    React.useState<Appointment | null>(null);
  const [stepOverride, setStepOverride] = React.useState<BookingStep | null>(
    null
  );

  // Derive active doctor: manual selection or fetched from URL (unless cleared)
  const activeDoctor = isDoctorCleared
    ? null
    : manuallySelectedDoctor ?? fetchedDoctor;

  // Derive active slot: manual selection or matched from URL (unless cleared)
  const matchedUrlSlot = React.useMemo(() => {
    if (!urlSlotId) return null;
    const list = availabilityResponse?.data ?? [];
    return list.find((s) => s.id === urlSlotId) ?? null;
  }, [urlSlotId, availabilityResponse?.data]);

  const activeSlot = isSlotCleared
    ? null
    : manuallySelectedSlot ?? matchedUrlSlot;

  // Derive current step
  const currentStep: BookingStep = React.useMemo(() => {
    if (stepOverride) return stepOverride;
    if (createdAppointment) return "success";
    if (activeDoctor && activeSlot) return "confirm";
    if (activeDoctor) return "slot";
    return "doctor";
  }, [stepOverride, createdAppointment, activeDoctor, activeSlot]);

  // Handlers for step navigation
  const handleSelectDoctor = (doctor: Doctor) => {
    setManuallySelectedDoctor(doctor);
    setIsDoctorCleared(false);
    setManuallySelectedSlot(null);
    setIsSlotCleared(true);
    setStepOverride("slot");

    const params = new URLSearchParams(searchParams.toString());
    params.set("doctorId", doctor.id);
    params.delete("slotId");
    params.delete("date");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleChangeDoctor = () => {
    setManuallySelectedDoctor(null);
    setIsDoctorCleared(true);
    setManuallySelectedSlot(null);
    setIsSlotCleared(true);
    setStepOverride("doctor");
    router.replace(pathname, { scroll: false });
  };

  const handleSelectSlot = (slot: AvailabilitySlot) => {
    setManuallySelectedSlot(slot);
    setIsSlotCleared(false);
    setStepOverride("confirm");

    const params = new URLSearchParams(searchParams.toString());
    params.set("slotId", slot.id);
    params.set("date", slot.date);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleChangeSlot = () => {
    setManuallySelectedSlot(null);
    setIsSlotCleared(true);
    setStepOverride("slot");

    const params = new URLSearchParams(searchParams.toString());
    params.delete("slotId");
    params.delete("date");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleConflict = () => {
    setManuallySelectedSlot(null);
    setIsSlotCleared(true);
    setStepOverride("slot");
    refetchAvailability();

    const params = new URLSearchParams(searchParams.toString());
    params.delete("slotId");
    params.delete("date");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleBookingSuccess = (appointment: Appointment) => {
    setCreatedAppointment(appointment);
    setStepOverride("success");
    router.replace(pathname, { scroll: false });
  };

  const handleReset = () => {
    setManuallySelectedDoctor(null);
    setIsDoctorCleared(true);
    setManuallySelectedSlot(null);
    setIsSlotCleared(true);
    setCreatedAppointment(null);
    setStepOverride("doctor");
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb Navigation */}
      {currentStep !== "success" && (
        <div className="flex items-center justify-between">
          <Link
            href="/patient/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            <DirectionalIcon
              icon={ArrowLeft}
              mirror={true}
              className="size-3.5 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5 transition-transform"
            />
            <span>{t("nav.dashboard")}</span>
          </Link>
        </div>
      )}

      {/* Booking Stepper */}
      <BookingStepper currentStep={currentStep} />

      {/* Main Step Content */}
      <div className="pt-2">
        {/* Step 1: Doctor Selection */}
        {currentStep === "doctor" && (
          <BookingDoctorSelect
            selectedDoctor={activeDoctor}
            onSelectDoctor={handleSelectDoctor}
            onChangeDoctor={handleChangeDoctor}
          />
        )}

        {/* Step 2: Slot Selection */}
        {currentStep === "slot" && activeDoctor && (
          <div className="space-y-6">
            <BookingDoctorSelect
              selectedDoctor={activeDoctor}
              onSelectDoctor={handleSelectDoctor}
              onChangeDoctor={handleChangeDoctor}
            />
            <BookingSlotSelect
              doctorId={activeDoctor.id}
              selectedSlot={activeSlot}
              onSelectSlot={handleSelectSlot}
              onBack={handleChangeDoctor}
            />
          </div>
        )}

        {/* Step 3: Booking Confirmation */}
        {currentStep === "confirm" && activeDoctor && activeSlot && (
          <BookingConfirmForm
            doctor={activeDoctor}
            slot={activeSlot}
            onSuccess={handleBookingSuccess}
            onBack={handleChangeSlot}
            onConflict={handleConflict}
          />
        )}

        {/* Step 4: Booking Success */}
        {currentStep === "success" && createdAppointment && (
          <BookingSuccessView
            appointment={createdAppointment}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}

