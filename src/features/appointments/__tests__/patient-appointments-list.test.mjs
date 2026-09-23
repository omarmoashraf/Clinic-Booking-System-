import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const {
  canCancelAppointment,
  filterAppointmentsBySearch,
} = jiti("./src/features/appointments/utils/appointment-helpers.ts");

const { getTranslation } = jiti("./src/lib/i18n/translator.ts");

test("Patient Appointments — Cancellation Rules State Machine", async (t) => {
  const baseAppointment = {
    id: "apt-1",
    notes: null,
    createdAt: "2026-09-22T00:00:00Z",
    updatedAt: "2026-09-22T00:00:00Z",
    patient: { id: "p-1", fullName: "Jane Doe" },
    doctor: {
      id: "d-1",
      fullName: "Dr. Smith",
      specialty: { id: "s-1", name: "Cardiology" },
    },
    availability: {
      id: "slot-1",
      date: "2030-10-15", // Future date
      startTime: "10:00",
      endTime: "10:30",
    },
  };

  await t.test("allows cancellation for future PENDING appointment", () => {
    const apt = { ...baseAppointment, status: "PENDING" };
    assert.strictEqual(canCancelAppointment(apt), true);
  });

  await t.test("allows cancellation for future CONFIRMED appointment", () => {
    const apt = { ...baseAppointment, status: "CONFIRMED" };
    assert.strictEqual(canCancelAppointment(apt), true);
  });

  await t.test("disallows cancellation for COMPLETED appointment", () => {
    const apt = { ...baseAppointment, status: "COMPLETED" };
    assert.strictEqual(canCancelAppointment(apt), false);
  });

  await t.test("disallows cancellation for CANCELLED appointment", () => {
    const apt = { ...baseAppointment, status: "CANCELLED" };
    assert.strictEqual(canCancelAppointment(apt), false);
  });

  await t.test("disallows cancellation for past appointments (date < today)", () => {
    const pastApt = {
      ...baseAppointment,
      status: "PENDING",
      availability: {
        ...baseAppointment.availability,
        date: "2020-01-01",
      },
    };
    assert.strictEqual(canCancelAppointment(pastApt), false);
  });
});

test("Patient Appointments — Search Filtering", async (t) => {
  const list = [
    {
      id: "1",
      doctor: { fullName: "Dr. Sarah Connor", specialty: { name: "Cardiology" } },
    },
    {
      id: "2",
      doctor: { fullName: "Dr. John Watson", specialty: { name: "Neurology" } },
    },
  ];

  await t.test("returns full list when search query is empty or whitespace", () => {
    assert.strictEqual(filterAppointmentsBySearch(list, "").length, 2);
    assert.strictEqual(filterAppointmentsBySearch(list, "   ").length, 2);
  });

  await t.test("filters by doctor full name case-insensitively", () => {
    const res = filterAppointmentsBySearch(list, "sarah");
    assert.strictEqual(res.length, 1);
    assert.strictEqual(res[0].id, "1");
  });

  await t.test("filters by specialty name case-insensitively", () => {
    const res = filterAppointmentsBySearch(list, "neuro");
    assert.strictEqual(res.length, 1);
    assert.strictEqual(res[0].id, "2");
  });

  await t.test("returns empty array when query does not match anything", () => {
    assert.strictEqual(filterAppointmentsBySearch(list, "pediatrics").length, 0);
  });
});

test("Patient Appointments — Accessibility & Logical Properties Audit", async (t) => {
  const filesToAudit = [
    "src/features/appointments/components/patient/appointments-filter-tabs.tsx",
    "src/features/appointments/components/patient/appointments-table.tsx",
    "src/features/appointments/components/patient/appointments-mobile-list.tsx",
    "src/features/appointments/components/patient/appointments-pagination.tsx",
    "src/features/appointments/components/patient/appointment-detail-view.tsx",
    "src/app/patient/appointments/page.tsx",
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

  await t.test("patient appointments route files exist", () => {
    assert.ok(
      fs.existsSync(
        path.resolve(process.cwd(), "src/app/patient/appointments/page.tsx")
      )
    );
    assert.ok(
      fs.existsSync(
        path.resolve(process.cwd(), "src/app/patient/appointments/[id]/page.tsx")
      )
    );
  });
});

test("Patient Appointments — Bilingual Translation Keys", async (t) => {
  const requiredKeys = [
    "appointments.tabAll",
    "appointments.tabPending",
    "appointments.tabConfirmed",
    "appointments.tabCompleted",
    "appointments.tabCancelled",
    "appointments.searchPlaceholder",
    "appointments.allStatus",
    "appointments.filterByStatus",
    "appointments.viewDetails",
    "appointments.actionCancel",
    "appointments.noAppointmentsMatch",
    "appointments.noAppointmentsYet",
    "appointments.noAppointmentsDesc",
    "appointments.detailsTitle",
    "appointments.backToAppointments",
    "appointments.doctorDetails",
    "appointments.scheduleDetails",
    "appointments.consultationNotes",
    "appointments.noNotes",
    "appointments.statusProgression",
    "appointments.pendingNotice",
    "appointments.confirmedNotice",
    "appointments.completedNotice",
    "appointments.cancelledNotice",
    "appointments.cancellationForbiddenPast",
    "appointments.notFoundTitle",
    "appointments.notFoundDesc",
  ];

  for (const key of requiredKeys) {
    await t.test(`key '${key}' exists in English and Arabic`, () => {
      const en = getTranslation("en", key);
      const ar = getTranslation("ar", key);
      assert.ok(en && en !== key, `Missing EN for ${key}`);
      assert.ok(ar && ar !== key, `Missing AR for ${key}`);
    });
  }
});

