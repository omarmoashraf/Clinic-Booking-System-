import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const {
  getNextDoctorAppointment,
  getDoctorAppointmentMetrics,
} = jiti("./src/features/doctors/utils/dashboard-helpers.ts");

const {
  updateAppointmentStatus,
} = jiti("./src/features/appointments/api/update-appointment-status.ts");

const mockAppointments = [
  {
    id: "apt-past-completed",
    status: "COMPLETED",
    notes: "Follow-up concluded",
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-01T11:00:00Z",
    patient: { id: "p1", fullName: "Jane Doe" },
    doctor: { id: "d1", fullName: "Dr. Smith", specialty: { id: "s1", name: "Cardiology" } },
    availability: { id: "av1", date: "2026-08-01", startTime: "09:00", endTime: "10:00" },
  },
  {
    id: "apt-upcoming-later",
    status: "CONFIRMED",
    notes: "Regular checkup",
    createdAt: "2026-09-01T10:00:00Z",
    updatedAt: "2026-09-01T10:00:00Z",
    patient: { id: "p2", fullName: "John Carter" },
    doctor: { id: "d1", fullName: "Dr. Smith", specialty: { id: "s1", name: "Cardiology" } },
    availability: { id: "av2", date: "2026-11-15", startTime: "14:00", endTime: "15:00" },
  },
  {
    id: "apt-upcoming-soonest",
    status: "PENDING",
    notes: "Urgent heart consultation",
    createdAt: "2026-09-10T10:00:00Z",
    updatedAt: "2026-09-10T10:00:00Z",
    patient: { id: "p3", fullName: "Alice Walker" },
    doctor: { id: "d1", fullName: "Dr. Smith", specialty: { id: "s1", name: "Cardiology" } },
    availability: { id: "av3", date: "2026-10-05", startTime: "10:30", endTime: "11:30" },
  },
  {
    id: "apt-cancelled",
    status: "CANCELLED",
    notes: null,
    createdAt: "2026-09-05T10:00:00Z",
    updatedAt: "2026-09-05T11:00:00Z",
    patient: { id: "p4", fullName: "Robert Paulson" },
    doctor: { id: "d1", fullName: "Dr. Smith", specialty: { id: "s1", name: "Cardiology" } },
    availability: { id: "av4", date: "2026-09-20", startTime: "08:00", endTime: "09:00" },
  },
];

test("Doctor Dashboard Logic — Next Patient Appointment", async (t) => {
  await t.test("identifies the earliest active appointment chronologically", () => {
    const next = getNextDoctorAppointment(mockAppointments);
    assert.ok(next);
    assert.strictEqual(next.id, "apt-upcoming-soonest");
    assert.strictEqual(next.patient.fullName, "Alice Walker");
    assert.strictEqual(next.availability.date, "2026-10-05");
  });

  await t.test("returns null when no active appointments exist", () => {
    const inactiveOnly = mockAppointments.filter(
      (a) => a.status === "COMPLETED" || a.status === "CANCELLED"
    );
    const next = getNextDoctorAppointment(inactiveOnly);
    assert.strictEqual(next, null);
  });

  await t.test("returns null for empty appointment array", () => {
    assert.strictEqual(getNextDoctorAppointment([]), null);
  });
});

test("Doctor Dashboard Logic — Operational Metrics Calculation", async (t) => {
  await t.test("accurately counts pending, confirmed, completed, and total appointments", () => {
    const metrics = getDoctorAppointmentMetrics(mockAppointments, 42);
    assert.strictEqual(metrics.pendingCount, 1);
    assert.strictEqual(metrics.confirmedCount, 1);
    assert.strictEqual(metrics.completedCount, 1);
    assert.strictEqual(metrics.totalSchedule, 42);
  });

  await t.test("handles zero counts gracefully", () => {
    const metrics = getDoctorAppointmentMetrics([], 0);
    assert.strictEqual(metrics.pendingCount, 0);
    assert.strictEqual(metrics.confirmedCount, 0);
    assert.strictEqual(metrics.completedCount, 0);
    assert.strictEqual(metrics.totalSchedule, 0);
  });
});

const { apiClient } = jiti("./src/lib/api/http-client.ts");

test("Doctor Dashboard API — Status Transition Helper", async (t) => {
  const originalPatch = apiClient.patch;

  t.afterEach(() => {
    apiClient.patch = originalPatch;
  });

  await t.test("updateAppointmentStatus creates properly formatted status patch request", async () => {
    let capturedUrl = "";
    let capturedBody = null;

    apiClient.patch = async (url, body) => {
      capturedUrl = url;
      capturedBody = body;
      return {
        status: "success",
        data: { id: "apt-123", status: "CONFIRMED" },
      };
    };

    const res = await updateAppointmentStatus("apt-123", "CONFIRMED");
    assert.strictEqual(res.status, "success");
    assert.strictEqual(capturedUrl, "/appointments/apt-123/status");
    assert.deepStrictEqual(capturedBody, { status: "CONFIRMED" });
  });

  await t.test("supports COMPLETED and CANCELLED status values", async () => {
    let capturedBody = null;
    apiClient.patch = async (url, body) => {
      capturedBody = body;
      return { status: "success", data: { id: "apt-123", status: body.status } };
    };

    await updateAppointmentStatus("apt-123", "COMPLETED");
    assert.deepStrictEqual(capturedBody, { status: "COMPLETED" });

    await updateAppointmentStatus("apt-123", "CANCELLED");
    assert.deepStrictEqual(capturedBody, { status: "CANCELLED" });
  });
});

test("Doctor Dashboard — Accessibility & Logical Properties Audit", async (t) => {
  const filesToAudit = [
    "src/features/doctors/components/dashboard/doctor-stats.tsx",
    "src/features/doctors/components/dashboard/doctor-next-appointment-card.tsx",
    "src/features/doctors/components/dashboard/doctor-recent-appointments-table.tsx",
    "src/features/doctors/components/dashboard/doctor-quick-actions.tsx",
    "src/features/doctors/components/dashboard/doctor-status-dialog.tsx",
    "src/features/doctors/components/dashboard/doctor-dashboard-skeleton.tsx",
    "src/app/doctor/dashboard/page.tsx",
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

  await t.test("doctor status dialog implements modal and error alert communication", () => {
    const content = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "src/features/doctors/components/dashboard/doctor-status-dialog.tsx"
      ),
      "utf-8"
    );
    assert.match(content, /Dialog/);
    assert.match(content, /DialogTitle/);
    assert.match(content, /DialogDescription/);
    assert.match(content, /Alert/);
  });

  await t.test("doctor dashboard skeleton provides status role for screen readers", () => {
    const content = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "src/features/doctors/components/dashboard/doctor-dashboard-skeleton.tsx"
      ),
      "utf-8"
    );
    assert.match(content, /role="status"/);
  });
});
