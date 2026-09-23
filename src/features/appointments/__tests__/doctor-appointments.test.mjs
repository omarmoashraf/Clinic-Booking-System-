import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const {
  canDoctorConfirmAppointment,
  canDoctorCompleteAppointment,
  canDoctorCancelAppointment,
  filterDoctorAppointmentsBySearch,
} = jiti("./src/features/appointments/utils/appointment-helpers.ts");

const mockAppointments = [
  {
    id: "apt-1",
    status: "PENDING",
    notes: "Severe migraine and dizziness",
    createdAt: "2026-09-10T10:00:00Z",
    updatedAt: "2026-09-10T10:00:00Z",
    patient: { id: "p1", fullName: "Arthur Dent" },
    doctor: { id: "d1", fullName: "Dr. Smith", specialty: { id: "s1", name: "Neurology" } },
    availability: { id: "av1", date: "2030-10-05", startTime: "10:30", endTime: "11:30" },
  },
  {
    id: "apt-2",
    status: "CONFIRMED",
    notes: "Follow-up after MRI scan",
    createdAt: "2026-09-01T10:00:00Z",
    updatedAt: "2026-09-01T10:00:00Z",
    patient: { id: "p2", fullName: "Ford Prefect" },
    doctor: { id: "d1", fullName: "Dr. Smith", specialty: { id: "s1", name: "Neurology" } },
    availability: { id: "av2", date: "2030-11-15", startTime: "14:00", endTime: "15:00" },
  },
  {
    id: "apt-3",
    status: "COMPLETED",
    notes: "Patient prescribed medication",
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-01T11:00:00Z",
    patient: { id: "p3", fullName: "Trillian Astra" },
    doctor: { id: "d1", fullName: "Dr. Smith", specialty: { id: "s1", name: "Neurology" } },
    availability: { id: "av3", date: "2026-08-01", startTime: "09:00", endTime: "10:00" },
  },
  {
    id: "apt-4",
    status: "CANCELLED",
    notes: "Cancelled by patient",
    createdAt: "2026-09-05T10:00:00Z",
    updatedAt: "2026-09-05T11:00:00Z",
    patient: { id: "p4", fullName: "Zaphod Beeblebrox" },
    doctor: { id: "d1", fullName: "Dr. Smith", specialty: { id: "s1", name: "Neurology" } },
    availability: { id: "av4", date: "2030-09-20", startTime: "08:00", endTime: "09:00" },
  },
];

test("Doctor Appointments State Machine Validation", async (t) => {
  await t.test("canDoctorConfirmAppointment: only PENDING appointments can be confirmed", () => {
    assert.strictEqual(canDoctorConfirmAppointment(mockAppointments[0]), true); // PENDING
    assert.strictEqual(canDoctorConfirmAppointment(mockAppointments[1]), false); // CONFIRMED
    assert.strictEqual(canDoctorConfirmAppointment(mockAppointments[2]), false); // COMPLETED
    assert.strictEqual(canDoctorConfirmAppointment(mockAppointments[3]), false); // CANCELLED
  });

  await t.test("canDoctorCompleteAppointment: only CONFIRMED appointments can be completed", () => {
    assert.strictEqual(canDoctorCompleteAppointment(mockAppointments[0]), false); // PENDING
    assert.strictEqual(canDoctorCompleteAppointment(mockAppointments[1]), true); // CONFIRMED
    assert.strictEqual(canDoctorCompleteAppointment(mockAppointments[2]), false); // COMPLETED
    assert.strictEqual(canDoctorCompleteAppointment(mockAppointments[3]), false); // CANCELLED
  });

  await t.test("canDoctorCancelAppointment: only future PENDING or CONFIRMED appointments can be cancelled", () => {
    assert.strictEqual(canDoctorCancelAppointment(mockAppointments[0]), true); // future PENDING
    assert.strictEqual(canDoctorCancelAppointment(mockAppointments[1]), true); // future CONFIRMED
    assert.strictEqual(canDoctorCancelAppointment(mockAppointments[2]), false); // COMPLETED (past)
    assert.strictEqual(canDoctorCancelAppointment(mockAppointments[3]), false); // CANCELLED

    // Past PENDING or CONFIRMED appointment cannot be cancelled
    const pastPending = {
      ...mockAppointments[0],
      availability: { ...mockAppointments[0].availability, date: "2020-01-01" },
    };
    assert.strictEqual(canDoctorCancelAppointment(pastPending), false);
  });
});

test("Doctor Appointments Filtering & Search", async (t) => {
  await t.test("filterDoctorAppointmentsBySearch matches patient full name", () => {
    const results = filterDoctorAppointmentsBySearch(mockAppointments, "Arthur");
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].patient.fullName, "Arthur Dent");
  });

  await t.test("filterDoctorAppointmentsBySearch matches consultation notes", () => {
    const results = filterDoctorAppointmentsBySearch(mockAppointments, "migraine");
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, "apt-1");
  });

  await t.test("filterDoctorAppointmentsBySearch matches slot date", () => {
    const results = filterDoctorAppointmentsBySearch(mockAppointments, "2030-11-15");
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, "apt-2");
  });

  await t.test("filterDoctorAppointmentsBySearch returns all for empty query", () => {
    const results = filterDoctorAppointmentsBySearch(mockAppointments, "   ");
    assert.strictEqual(results.length, mockAppointments.length);
  });
});

test("Doctor Appointments — Accessibility & Logical Properties Audit", async (t) => {
  const filesToAudit = [
    "src/features/appointments/components/doctor/doctor-appointments-table.tsx",
    "src/features/appointments/components/doctor/doctor-appointments-mobile-list.tsx",
    "src/features/appointments/components/doctor/doctor-appointment-detail-view.tsx",
    "src/app/doctor/appointments/page.tsx",
    "src/app/doctor/appointments/[id]/page.tsx",
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

  await t.test("doctor appointments table uses logical table headers and text-start", () => {
    const content = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "src/features/appointments/components/doctor/doctor-appointments-table.tsx"
      ),
      "utf-8"
    );
    assert.match(content, /text-start/);
    assert.match(content, /TableHead/);
    assert.match(content, /StatusBadge/);
  });

  await t.test("doctor appointment detail view provides back link and status notices", () => {
    const content = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "src/features/appointments/components/doctor/doctor-appointment-detail-view.tsx"
      ),
      "utf-8"
    );
    assert.match(content, /backToAppointments/);
    assert.match(content, /statusProgression/);
    assert.match(content, /DoctorStatusDialog/);
  });
});

