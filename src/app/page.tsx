"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { DirectionalIcon } from "@/components/shared/directional-icon";
import { useTranslation } from "@/hooks/use-i18n";
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  FileText,
  LayoutDashboard,
  Stethoscope,
  Users,
} from "lucide-react";

export default function HomePage() {
  const { t, locale, direction, isRTL } = useTranslation();
  const [patientName, setPatientName] = React.useState("");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 1. NAVBAR PREVIEW */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Activity className="size-5" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg tracking-tight text-foreground block">
                {t("common.appName")}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:block">
                {t("home.subtitle")}
              </span>
            </div>
          </div>

          <nav
            className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground"
            aria-label="Main Navigation"
          >
            <span className="text-foreground">{t("nav.home")}</span>
            <span className="hover:text-foreground transition-colors cursor-pointer">
              {t("nav.doctors")}
            </span>
            <span className="hover:text-foreground transition-colors cursor-pointer">
              {t("nav.specialties")}
            </span>
            <span className="hover:text-foreground transition-colors cursor-pointer">
              {t("nav.appointments")}
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              {t("nav.login")}
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 2. SIDEBAR PREVIEW */}
        <aside className="lg:col-span-3">
          <div className="bg-card rounded-xl border border-border p-4 shadow-subtle space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("verification.sidebarTitle")}
              </h2>
              <Badge variant="secondary" className="text-[10px]">
                {direction.toUpperCase()}
              </Badge>
            </div>

            <nav className="space-y-1" aria-label="Sidebar navigation">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="size-4 shrink-0" />
                  <span>{t("nav.dashboard")}</span>
                </div>
                <DirectionalIcon icon={ChevronRight} className="size-4 shrink-0 opacity-70" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground text-sm font-medium transition-colors cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Stethoscope className="size-4 shrink-0" />
                  <span>{t("nav.doctors")}</span>
                </div>
                <DirectionalIcon icon={ChevronRight} className="size-4 shrink-0 opacity-40" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground text-sm font-medium transition-colors cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Calendar className="size-4 shrink-0" />
                  <span>{t("nav.myAppointments")}</span>
                </div>
                <DirectionalIcon icon={ChevronRight} className="size-4 shrink-0 opacity-40" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground text-sm font-medium transition-colors cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Compass className="size-4 shrink-0" />
                  <span>{t("nav.specialties")}</span>
                </div>
                <DirectionalIcon icon={ChevronRight} className="size-4 shrink-0 opacity-40" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground text-sm font-medium transition-colors cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Users className="size-4 shrink-0" />
                  <span>{t("nav.users")}</span>
                </div>
                <DirectionalIcon icon={ChevronRight} className="size-4 shrink-0 opacity-40" />
              </div>
            </nav>
          </div>
        </aside>

        {/* MAIN VERIFICATION WORKBENCH */}
        <main className="lg:col-span-9 space-y-8">
          {/* Active Locale & Direction Banner */}
          <Alert className="border-border">
            <CheckCircle2 className="size-4 text-success" />
            <AlertTitle>{t("home.alertTitle")}</AlertTitle>
            <AlertDescription className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>{t("home.alertDescription")}</span>
              <span className="font-semibold text-foreground">
                [Locale: {locale} | Direction: {direction.toUpperCase()} | RTL: {isRTL ? "Yes" : "No"}]
              </span>
            </AlertDescription>
          </Alert>

          {/* 3. FORMS & 4. DIALOGS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 3. FORMS PREVIEW */}
            <section className="bg-card rounded-xl border border-border p-5 shadow-subtle space-y-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                {t("verification.formsTitle")}
              </h2>

              <div className="space-y-3">
                <div className="space-y-1.5 text-start">
                  <Label htmlFor="patientName">{t("verification.patientName")}</Label>
                  <Input
                    id="patientName"
                    placeholder={t("verification.patientNamePlaceholder")}
                    defaultValue={locale === "ar" ? "أحمد محمود" : "John Smith"}
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 text-start">
                  <Label>{t("verification.selectDoctor")}</Label>
                  <Select defaultValue="cardio">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("verification.doctorPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardio">
                        {t("verification.doctorCardiology")}
                      </SelectItem>
                      <SelectItem value="neuro">
                        {t("verification.doctorNeurology")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    {t("common.cancel")}
                  </Button>
                  <Button size="sm">{t("common.save")}</Button>
                </div>
              </div>
            </section>

            {/* 4. DIALOGS PREVIEW */}
            <section className="bg-card rounded-xl border border-border p-5 shadow-subtle space-y-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                {t("verification.dialogsTitle")}
              </h2>

              <p className="text-sm text-muted-foreground text-start">
                {t("verification.dialogDesc")}
              </p>

              <div className="pt-4 flex items-center justify-start">
                <Dialog>
                  <DialogTrigger render={<Button variant="outline" />}>
                    {t("verification.openDialog")}
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-start">
                        {t("verification.dialogTitle")}
                      </DialogTitle>
                      <DialogDescription className="text-start">
                        {t("verification.dialogDesc")}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="py-2 space-y-2 text-start text-sm">
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">{t("verification.colDoctor")}:</span>
                        <span className="font-medium">{t("verification.doctorCardiology")}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">{t("verification.colStatus")}:</span>
                        <StatusBadge status="CONFIRMED" />
                      </div>
                    </div>

                    <DialogFooter className="sm:justify-end gap-2">
                      <Button variant="default">
                        {t("verification.dialogConfirm")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </section>
          </div>

          {/* 5. TABLES PREVIEW */}
          <section className="bg-card rounded-xl border border-border p-5 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                {t("verification.tablesTitle")}
              </h2>
              <span className="text-xs text-muted-foreground">
                {t("verification.colDate")}: 2026-09-22
              </span>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("verification.colDoctor")}</TableHead>
                  <TableHead>{t("verification.colSpecialty")}</TableHead>
                  <TableHead>{t("verification.colStatus")}</TableHead>
                  <TableHead className="text-end">{t("verification.colAction")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    {locale === "ar" ? "د. سارة جونسون" : "Dr. Sarah Johnson"}
                  </TableCell>
                  <TableCell>{t("verification.cardiology")}</TableCell>
                  <TableCell>
                    <StatusBadge status="CONFIRMED" />
                  </TableCell>
                  <TableCell className="text-end">
                    <Button variant="ghost" size="xs">
                      {t("verification.viewDetails")}
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    {locale === "ar" ? "د. مايكل تشين" : "Dr. Michael Chen"}
                  </TableCell>
                  <TableCell>{t("verification.pediatrics")}</TableCell>
                  <TableCell>
                    <StatusBadge status="PENDING" />
                  </TableCell>
                  <TableCell className="text-end">
                    <Button variant="ghost" size="xs">
                      {t("verification.viewDetails")}
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    {locale === "ar" ? "د. إيميلي بلانت" : "Dr. Emily Blunt"}
                  </TableCell>
                  <TableCell>{t("verification.cardiology")}</TableCell>
                  <TableCell>
                    <StatusBadge status="COMPLETED" />
                  </TableCell>
                  <TableCell className="text-end">
                    <Button variant="ghost" size="xs">
                      {t("verification.viewDetails")}
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>

          {/* 6. ICONS & 7. SPACING & ALIGNMENT PREVIEW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 6. ICONS */}
            <section className="bg-card rounded-xl border border-border p-5 shadow-subtle space-y-4">
              <h2 className="text-base font-semibold text-foreground">
                {t("verification.iconsTitle")}
              </h2>
              <p className="text-xs text-muted-foreground text-start">
                Directional forward navigation arrows auto-flip in RTL:
              </p>
              <div className="flex items-center gap-4 pt-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <span>{t("verification.next")}</span>
                  <DirectionalIcon icon={ArrowRight} className="size-4" />
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <DirectionalIcon icon={ChevronRight} className="size-4" />
                  <span>{t("verification.next")}</span>
                </Button>
              </div>
            </section>

            {/* 7. SPACING & ALIGNMENT */}
            <section className="bg-card rounded-xl border border-border p-5 shadow-subtle space-y-4">
              <h2 className="text-base font-semibold text-foreground">
                {t("verification.spacingTitle")}
              </h2>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-muted/60 flex justify-between">
                  <span>Inline Start (ps / ms):</span>
                  <span className="font-mono text-primary font-bold">
                    {isRTL ? "Right Side" : "Left Side"}
                  </span>
                </div>
                <div className="p-2 rounded bg-muted/60 flex justify-between">
                  <span>Inline End (pe / me):</span>
                  <span className="font-mono text-primary font-bold">
                    {isRTL ? "Left Side" : "Right Side"}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
