"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Stethoscope, User } from "lucide-react";
import { useTranslation } from "@/hooks/use-i18n";
import { DirectionalIcon } from "@/components/shared/directional-icon";

export function PatientQuickActions() {
  const { t } = useTranslation();

  const actions = [
    {
      href: "/patient/doctors",
      title: t("patients.findDoctor"),
      description: t("patients.findDoctorDesc"),
      icon: Stethoscope,
      iconBg: "bg-primary/10 text-primary",
    },
    {
      href: "/patient/appointments",
      title: t("nav.myAppointments"),
      description: t("patients.viewAppointmentsDesc"),
      icon: Calendar,
      iconBg: "bg-secondary text-secondary-foreground",
    },
    {
      href: "/patient/profile",
      title: t("patients.manageProfile"),
      description: t("patients.manageProfileDesc"),
      icon: User,
      iconBg: "bg-accent text-accent-foreground",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground text-start">
        {t("patients.quickActions")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col justify-between p-5 rounded-xl border border-border bg-card shadow-subtle hover:border-primary/40 hover:shadow-card transition-all group text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div>
                <div
                  className={`size-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 ${action.iconBg}`}
                  aria-hidden="true"
                >
                  <Icon className="size-5.5" />
                </div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {action.description}
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-primary mt-4 pt-3 border-t border-border/50">
                <span>{action.title}</span>
                <DirectionalIcon
                  icon={ArrowRight}
                  className="size-3.5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

