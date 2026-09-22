import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const { getTranslation } = jiti("./src/lib/i18n/translator.ts");

test("Patient Booking Flow — Component & Route Architecture", async (t) => {
  await t.test("Patient booking route file exists and wraps BookingWizard in Suspense", () => {
    const routePath = path.resolve(
      process.cwd(),
      "src/app/patient/appointments/new/page.tsx"
    );
    assert.ok(fs.existsSync(routePath), "src/app/patient/appointments/new/page.tsx must exist");
    const content = fs.readFileSync(routePath, "utf-8");
    assert.match(content, /BookingWizard/, "Must render BookingWizard");
    assert.match(content, /React\.Suspense/, "Must be wrapped in React.Suspense");
  });

  await t.test("BookingStepper defines all four sequential booking steps", () => {
    const stepperPath = path.resolve(
      process.cwd(),
      "src/features/appointments/components/booking/booking-stepper.tsx"
    );
    assert.ok(fs.existsSync(stepperPath));
    const content = fs.readFileSync(stepperPath, "utf-8");
    assert.match(content, /doctor/);
    assert.match(content, /slot/);
    assert.match(content, /confirm/);
    assert.match(content, /success/);
    assert.match(content, /aria-current=/);
  });

  await t.test("BookingConfirmForm enforces 1000-character limit and handles 409 conflict", () => {
    const formPath = path.resolve(
      process.cwd(),
      "src/features/appointments/components/booking/booking-confirm-form.tsx"
    );
    assert.ok(fs.existsSync(formPath));
    const content = fs.readFileSync(formPath, "utf-8");
    assert.match(content, /MAX_NOTES_LENGTH\s*=\s*1000/);
    assert.match(content, /err\.status\s*===\s*409/);
    assert.match(content, /slotConflictTitle/);
    assert.match(content, /slotConflictDesc/);
  });

  await t.test("BookingSuccessView provides direct navigation to appointments list and dashboard", () => {
    const successPath = path.resolve(
      process.cwd(),
      "src/features/appointments/components/booking/booking-success-view.tsx"
    );
    assert.ok(fs.existsSync(successPath));
    const content = fs.readFileSync(successPath, "utf-8");
    assert.match(content, /href="\/patient\/appointments"/);
    assert.match(content, /href="\/patient\/dashboard"/);
    assert.match(content, /StatusBadge/);
  });
});

test("Patient Booking Flow — Accessibility & Logical Properties Audit", async (t) => {
  const filesToAudit = [
    "src/features/appointments/components/booking/booking-stepper.tsx",
    "src/features/appointments/components/booking/booking-doctor-select.tsx",
    "src/features/appointments/components/booking/booking-slot-select.tsx",
    "src/features/appointments/components/booking/booking-confirm-form.tsx",
    "src/features/appointments/components/booking/booking-success-view.tsx",
    "src/features/appointments/components/booking/booking-wizard.tsx",
  ];

  for (const relativePath of filesToAudit) {
    const fullPath = path.resolve(process.cwd(), relativePath);
    const content = fs.readFileSync(fullPath, "utf-8");

    await t.test(`${relativePath} has no hardcoded text-left or text-right`, () => {
      assert.doesNotMatch(
        content,
        /\btext-(?:left|right)\b/,
        `${relativePath} contains hardcoded text-left/text-right; must use text-start/text-end`
      );
    });

    await t.test(`${relativePath} has no hardcoded physical margins/paddings (pl-, pr-, ml-, mr-)`, () => {
      assert.doesNotMatch(
        content,
        /\b(?:pl|pr|ml|mr)-\d+\b/,
        `${relativePath} contains physical spacing; must use logical properties (ps-, pe-, ms-, me-)`
      );
    });
  }
});

test("Patient Booking Flow — Bilingual Translation Keys", async (t) => {
  const bookingKeys = [
    "appointments.stepDoctor",
    "appointments.stepDateSlot",
    "appointments.stepConfirm",
    "appointments.stepSuccess",
    "appointments.selectDoctorPrompt",
    "appointments.chooseThisDoctor",
    "appointments.selectedDoctor",
    "appointments.changeDoctor",
    "appointments.selectedSlot",
    "appointments.changeSlot",
    "appointments.chooseSlotPrompt",
    "appointments.noSlotsForDoctor",
    "appointments.addNotes",
    "appointments.notesOptional",
    "appointments.notesPlaceholder",
    "appointments.notesMaxLength",
    "appointments.confirmAndBook",
    "appointments.bookingSlot",
    "appointments.bookingSummary",
    "appointments.clinicLocation",
    "appointments.cairoClinic",
    "appointments.slotConflictTitle",
    "appointments.slotConflictDesc",
    "appointments.pickAnotherSlot",
    "appointments.bookingSuccessTitle",
    "appointments.bookingSuccessSubtitle",
    "appointments.viewMyAppointments",
    "appointments.backToDashboard",
  ];

  for (const key of bookingKeys) {
    await t.test(`key '${key}' resolves in English and Arabic`, () => {
      const en = getTranslation("en", key);
      const ar = getTranslation("ar", key);
      assert.ok(en && en !== key, `Missing EN for ${key}`);
      assert.ok(ar && ar !== key, `Missing AR for ${key}`);
    });
  }
});

