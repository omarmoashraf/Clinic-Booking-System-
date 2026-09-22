import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const {
  getNextUpcomingAppointment,
  getPatientAppointmentMetrics,
} = jiti("./src/features/patients/utils/dashboard-helpers.ts");

const mockAppointments = [
  {
    id: "apt-past-completed",
    status: "COMPLETED",
    notes: "Follow up done",
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-01T11:00:00Z",
    patient: { id: "p1", fullName: "Jane Doe" },
    doctor: { id: "d1", fullName: "Dr. Smith", specialty: { id: "s1", name: "Cardiology" } },
    availability: { id: "av1", date: "2026-08-01", startTime: "09:00", endTime: "10:00" },
  },
  {
    id: "apt-upcoming-later",
    status: "CONFIRMED",
    notes: "Next month check",
    createdAt: "2026-09-01T10:00:00Z",
    updatedAt: "2026-09-01T10:00:00Z",
    patient: { id: "p1", fullName: "Jane Doe" },
    doctor: { id: "d2", fullName: "Dr. Adams", specialty: { id: "s2", name: "Dermatology" } },
    availability: { id: "av2", date: "2026-11-15", startTime: "14:00", endTime: "15:00" },
  },
  {
    id: "apt-upcoming-soonest",
    status: "PENDING",
    notes: "Urgent consult",
    createdAt: "2026-09-10T10:00:00Z",
    updatedAt: "2026-09-10T10:00:00Z",
    patient: { id: "p1", fullName: "Jane Doe" },
    doctor: { id: "d3", fullName: "Dr. Brown", specialty: { id: "s3", name: "Neurology" } },
    availability: { id: "av3", date: "2026-10-05", startTime: "10:30", endTime: "11:30" },
  },
  {
    id: "apt-cancelled",
    status: "CANCELLED",
    notes: null,
    createdAt: "2026-09-05T10:00:00Z",
    updatedAt: "2026-09-05T11:00:00Z",
    patient: { id: "p1", fullName: "Jane Doe" },
    doctor: { id: "d1", fullName: "Dr. Smith", specialty: { id: "s1", name: "Cardiology" } },
    availability: { id: "av4", date: "2026-09-20", startTime: "08:00", endTime: "09:00" },
  },
];

test("Patient Dashboard Logic — Next Upcoming Appointment", async (t) => {
  await t.test("identifies the earliest active appointment", () => {
    const next = getNextUpcomingAppointment(mockAppointments);
    assert.ok(next);
    assert.strictEqual(next.id, "apt-upcoming-soonest");
    assert.strictEqual(next.availability.date, "2026-10-05");
  });

  await t.test("returns null when no active appointments exist", () => {
    const inactiveOnly = mockAppointments.filter(
      (a) => a.status === "COMPLETED" || a.status === "CANCELLED"
    );
    const next = getNextUpcomingAppointment(inactiveOnly);
    assert.strictEqual(next, null);
  });

  await t.test("returns null for empty appointment array", () => {
    assert.strictEqual(getNextUpcomingAppointment([]), null);
  });
});

test("Patient Dashboard Logic — Metrics Calculation", async (t) => {
  await t.test("accurately counts active, completed, and total bookings", () => {
    const metrics = getPatientAppointmentMetrics(mockAppointments, 42);
    // 2 active (CONFIRMED + PENDING), 1 completed, total = 42
    assert.strictEqual(metrics.activeCount, 2);
    assert.strictEqual(metrics.completedCount, 1);
    assert.strictEqual(metrics.totalBookings, 42);
  });

  await t.test("handles zero counts gracefully", () => {
    const metrics = getPatientAppointmentMetrics([], 0);
    assert.strictEqual(metrics.activeCount, 0);
    assert.strictEqual(metrics.completedCount, 0);
    assert.strictEqual(metrics.totalBookings, 0);
  });
});

test("Patient Dashboard — Accessibility & Logical Properties Audit", async (t) => {
  const filesToAudit = [
    "src/features/patients/components/patient-stats.tsx",
    "src/features/patients/components/next-appointment-card.tsx",
    "src/features/patients/components/recent-appointments-table.tsx",
    "src/features/patients/components/patient-quick-actions.tsx",
    "src/features/patients/components/cancel-appointment-dialog.tsx",
    "src/features/patients/components/patient-dashboard-skeleton.tsx",
    "src/app/patient/dashboard/page.tsx",
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

  await t.test("cancellation dialog implements modal and error alert communication", () => {
    const content = fs.readFileSync(
      path.resolve(process.cwd(), "src/features/patients/components/cancel-appointment-dialog.tsx"),
      "utf-8"
    );
    assert.match(content, /Dialog/);
    assert.match(content, /DialogTitle/);
    assert.match(content, /DialogDescription/);
    assert.match(content, /Alert/);
  });

  await t.test("dashboard skeleton provides status role for screen readers", () => {
    const content = fs.readFileSync(
      path.resolve(process.cwd(), "src/features/patients/components/patient-dashboard-skeleton.tsx"),
      "utf-8"
    );
    assert.match(content, /role="status"/);
  });
});

