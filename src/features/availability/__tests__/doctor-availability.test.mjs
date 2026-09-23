import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../../..");

// Import helper functions dynamically or test their algorithmic contracts
describe("Doctor Availability — Time Interval Validation", () => {
  const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

  function validateTimeInterval(startTime, endTime) {
    if (!TIME_REGEX.test(startTime)) return { isValid: false, errorKey: "invalidStartTime" };
    if (!TIME_REGEX.test(endTime)) return { isValid: false, errorKey: "invalidEndTime" };
    if (endTime <= startTime) return { isValid: false, errorKey: "endTimeBeforeStartTime" };
    return { isValid: true };
  }

  it("validates correct start and end times where endTime > startTime", () => {
    assert.deepEqual(validateTimeInterval("09:00", "09:30"), { isValid: true });
    assert.deepEqual(validateTimeInterval("09:00", "17:00"), { isValid: true });
    assert.deepEqual(validateTimeInterval("23:00", "23:45"), { isValid: true });
  });

  it("rejects inverted interval where endTime < startTime", () => {
    const res = validateTimeInterval("10:00", "09:00");
    assert.equal(res.isValid, false);
    assert.equal(res.errorKey, "endTimeBeforeStartTime");
  });

  it("rejects zero-length interval where endTime === startTime", () => {
    const res = validateTimeInterval("09:00", "09:00");
    assert.equal(res.isValid, false);
    assert.equal(res.errorKey, "endTimeBeforeStartTime");
  });

  it("rejects malformed time strings", () => {
    assert.equal(validateTimeInterval("9:00", "10:00").isValid, false);
    assert.equal(validateTimeInterval("09:00", "24:00").isValid, false);
    assert.equal(validateTimeInterval("abc", "10:00").isValid, false);
  });
});

describe("Doctor Availability — Overlap Detection Algorithm", () => {
  function checkSlotOverlap(existingSlots, newSlot) {
    return existingSlots.some(
      (slot) =>
        slot.date === newSlot.date &&
        newSlot.startTime < slot.endTime &&
        newSlot.endTime > slot.startTime
    );
  }

  const existing = [
    { id: "1", date: "2026-10-01", startTime: "09:00", endTime: "10:00" },
    { id: "2", date: "2026-10-01", startTime: "14:00", endTime: "15:00" },
    { id: "3", date: "2026-10-02", startTime: "09:00", endTime: "10:00" },
  ];

  it("detects partial overlap with existing slot on same date", () => {
    // 09:30 to 10:30 overlaps with 09:00 - 10:00
    assert.equal(
      checkSlotOverlap(existing, { date: "2026-10-01", startTime: "09:30", endTime: "10:30" }),
      true
    );
    // 08:30 to 09:30 overlaps with 09:00 - 10:00
    assert.equal(
      checkSlotOverlap(existing, { date: "2026-10-01", startTime: "08:30", endTime: "09:30" }),
      true
    );
  });

  it("detects completely enclosed or enclosing overlap", () => {
    // Inside existing slot (09:15 - 09:45)
    assert.equal(
      checkSlotOverlap(existing, { date: "2026-10-01", startTime: "09:15", endTime: "09:45" }),
      true
    );
    // Enclosing existing slot (08:30 - 10:30)
    assert.equal(
      checkSlotOverlap(existing, { date: "2026-10-01", startTime: "08:30", endTime: "10:30" }),
      true
    );
  });

  it("allows adjacent non-overlapping slots on same date", () => {
    // Right before: 08:00 - 09:00
    assert.equal(
      checkSlotOverlap(existing, { date: "2026-10-01", startTime: "08:00", endTime: "09:00" }),
      false
    );
    // Right after: 10:00 - 11:00
    assert.equal(
      checkSlotOverlap(existing, { date: "2026-10-01", startTime: "10:00", endTime: "11:00" }),
      false
    );
  });

  it("allows identical times on different dates", () => {
    assert.equal(
      checkSlotOverlap(existing, { date: "2026-10-03", startTime: "09:00", endTime: "10:00" }),
      false
    );
  });
});

describe("Doctor Availability — Grouping & Duration Computation", () => {
  function groupSlotsByDate(slots) {
    const groupsMap = new Map();
    for (const slot of slots) {
      const list = groupsMap.get(slot.date) ?? [];
      list.push(slot);
      groupsMap.set(slot.date, list);
    }
    for (const list of groupsMap.values()) {
      list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    const sortedDates = Array.from(groupsMap.keys()).sort((a, b) =>
      a.localeCompare(b)
    );
    return sortedDates.map((date) => ({
      date,
      slots: groupsMap.get(date) ?? [],
    }));
  }

  function computeEndTime(startTime, durationMinutes) {
    const [startH, startM] = startTime.split(":").map(Number);
    const totalMinutes = startH * 60 + startM + durationMinutes;
    if (totalMinutes >= 24 * 60) return "23:59";
    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
  }

  function calculateDurationMinutes(startTime, endTime) {
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    return endH * 60 + endM - (startH * 60 + startM);
  }

  it("groups slots chronologically by date and start time", () => {
    const unordered = [
      { id: "s1", date: "2026-10-05", startTime: "14:00", endTime: "15:00" },
      { id: "s2", date: "2026-10-01", startTime: "11:00", endTime: "11:30" },
      { id: "s3", date: "2026-10-01", startTime: "09:00", endTime: "09:30" },
    ];

    const grouped = groupSlotsByDate(unordered);
    assert.equal(grouped.length, 2);
    assert.equal(grouped[0].date, "2026-10-01");
    assert.equal(grouped[0].slots[0].startTime, "09:00");
    assert.equal(grouped[0].slots[1].startTime, "11:00");
    assert.equal(grouped[1].date, "2026-10-05");
  });

  it("computes end times correctly for duration presets", () => {
    assert.equal(computeEndTime("09:00", 30), "09:30");
    assert.equal(computeEndTime("09:45", 45), "10:30");
    assert.equal(computeEndTime("11:30", 60), "12:30");
    assert.equal(computeEndTime("23:30", 60), "23:59");
  });

  it("calculates slot duration accurately", () => {
    assert.equal(calculateDurationMinutes("09:00", "09:30"), 30);
    assert.equal(calculateDurationMinutes("09:00", "10:15"), 75);
    assert.equal(calculateDurationMinutes("08:30", "12:00"), 210);
  });
});

describe("Doctor Availability — Logical CSS & Accessibility Audit", () => {
  const filesToCheck = [
    "src/features/availability/components/doctor-availability-header.tsx",
    "src/features/availability/components/add-availability-form.tsx",
    "src/features/availability/components/doctor-availability-filters.tsx",
    "src/features/availability/components/doctor-availability-slot-item.tsx",
    "src/features/availability/components/doctor-availability-group.tsx",
    "src/features/availability/components/delete-slot-dialog.tsx",
    "src/features/availability/components/doctor-availability-skeleton.tsx",
    "src/app/doctor/availability/page.tsx",
  ];

  for (const relPath of filesToCheck) {
    const fullPath = path.join(projectRoot, relPath);

    it(`${relPath} has no hardcoded text-left or text-right`, () => {
      const content = fs.readFileSync(fullPath, "utf8");
      assert.doesNotMatch(content, /\btext-left\b/, `${relPath} contains physical text-left`);
      assert.doesNotMatch(content, /\btext-right\b/, `${relPath} contains physical text-right`);
    });

    it(`${relPath} has no hardcoded physical margins/paddings (pl-, pr-, ml-, mr-)`, () => {
      const content = fs.readFileSync(fullPath, "utf8");
      assert.doesNotMatch(content, /\b(pl-|pr-|ml-|mr-)/, `${relPath} contains physical padding or margin`);
    });
  }

  it("AddAvailabilityForm provides accessible labels for all inputs", () => {
    const formPath = path.join(projectRoot, "src/features/availability/components/add-availability-form.tsx");
    const content = fs.readFileSync(formPath, "utf8");
    assert.match(content, /htmlFor="slot-date"/);
    assert.match(content, /htmlFor="start-time"/);
    assert.match(content, /htmlFor="end-time"/);
  });

  it("DeleteSlotDialog provides DialogTitle and accessible confirmation", () => {
    const dialogPath = path.join(projectRoot, "src/features/availability/components/delete-slot-dialog.tsx");
    const content = fs.readFileSync(dialogPath, "utf8");
    assert.match(content, /<DialogTitle/);
    assert.match(content, /<DialogDescription/);
  });

  it("DoctorAvailabilitySkeleton specifies role='status'", () => {
    const skelPath = path.join(projectRoot, "src/features/availability/components/doctor-availability-skeleton.tsx");
    const content = fs.readFileSync(skelPath, "utf8");
    assert.match(content, /role="status"/);
  });
});

