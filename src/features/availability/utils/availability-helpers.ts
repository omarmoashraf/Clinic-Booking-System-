import type { AvailabilitySlot, AvailabilityFilterRange } from "../types";

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate that a time string matches HH:mm (24-hour format).
 */
export function isValidTimeString(time: string): boolean {
  return TIME_REGEX.test(time);
}

/**
 * Validate that a date string matches YYYY-MM-DD format.
 */
export function isValidDateString(date: string): boolean {
  if (!DATE_REGEX.test(date)) return false;
  const d = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === date;
}

/**
 * Validates start and end time interval for slot creation.
 * End time must be strictly after start time.
 */
export function validateTimeInterval(
  startTime: string,
  endTime: string
): { isValid: boolean; errorKey?: string } {
  if (!isValidTimeString(startTime)) {
    return { isValid: false, errorKey: "invalidStartTime" };
  }
  if (!isValidTimeString(endTime)) {
    return { isValid: false, errorKey: "invalidEndTime" };
  }
  if (endTime <= startTime) {
    return { isValid: false, errorKey: "endTimeBeforeStartTime" };
  }
  return { isValid: true };
}

/**
 * Checks if a proposed slot interval overlaps with any existing slot for the same date.
 * Per API_CONTRACT.md:
 * "For the same doctor and date, an attempted slot overlaps when newStart < existingEnd and newEnd > existingStart."
 */
export function checkSlotOverlap(
  existingSlots: AvailabilitySlot[],
  newSlot: { date: string; startTime: string; endTime: string }
): boolean {
  return existingSlots.some(
    (slot) =>
      slot.date === newSlot.date &&
      newSlot.startTime < slot.endTime &&
      newSlot.endTime > slot.startTime
  );
}

/**
 * Returns the first overlapping slot if one exists, or undefined.
 */
export function findOverlappingSlot(
  existingSlots: AvailabilitySlot[],
  newSlot: { date: string; startTime: string; endTime: string }
): AvailabilitySlot | undefined {
  return existingSlots.find(
    (slot) =>
      slot.date === newSlot.date &&
      newSlot.startTime < slot.endTime &&
      newSlot.endTime > slot.startTime
  );
}

export interface DateGroupedSlots {
  date: string;
  slots: AvailabilitySlot[];
}

/**
 * Groups availability slots by date and sorts both dates and slots chronologically.
 */
export function groupSlotsByDate(slots: AvailabilitySlot[]): DateGroupedSlots[] {
  const groupsMap = new Map<string, AvailabilitySlot[]>();

  for (const slot of slots) {
    const list = groupsMap.get(slot.date) ?? [];
    list.push(slot);
    groupsMap.set(slot.date, list);
  }

  // Sort slots inside each date group by startTime
  for (const list of groupsMap.values()) {
    list.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  // Sort date groups chronologically
  const sortedDates = Array.from(groupsMap.keys()).sort((a, b) =>
    a.localeCompare(b)
  );

  return sortedDates.map((date) => ({
    date,
    slots: groupsMap.get(date) ?? [],
  }));
}

/**
 * Calculate duration in minutes between two HH:mm strings.
 */
export function calculateDurationMinutes(startTime: string, endTime: string): number {
  if (!isValidTimeString(startTime) || !isValidTimeString(endTime)) {
    return 0;
  }
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const totalStart = startH * 60 + startM;
  const totalEnd = endH * 60 + endM;
  return Math.max(0, totalEnd - totalStart);
}

/**
 * Computes an endTime HH:mm from a given startTime HH:mm and duration in minutes.
 * Caps at "23:59" if exceeding end of day.
 */
export function computeEndTime(startTime: string, durationMinutes: number): string {
  if (!isValidTimeString(startTime)) return "";
  const [startH, startM] = startTime.split(":").map(Number);
  const totalMinutes = startH * 60 + startM + durationMinutes;

  if (totalMinutes >= 24 * 60) {
    return "23:59";
  }

  const endH = Math.floor(totalMinutes / 60);
  const endM = totalMinutes % 60;

  const paddedH = String(endH).padStart(2, "0");
  const paddedM = String(endM).padStart(2, "0");

  return `${paddedH}:${paddedM}`;
}

/**
 * Returns today's date in Africa/Cairo (UTC+2 standard) timezone formatted as YYYY-MM-DD.
 */
export function getTodayCairoDate(): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Cairo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/**
 * Computes date range query parameters based on quick filter selection.
 */
export function getDateRangeForFilter(
  filter: AvailabilityFilterRange,
  customFrom?: string,
  customTo?: string
): { from?: string; to?: string } {
  const today = getTodayCairoDate();

  if (filter === "all") {
    return {};
  }

  if (filter === "today") {
    return { from: today, to: today };
  }

  if (filter === "week") {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    return { from: today, to: d.toISOString().slice(0, 10) };
  }

  if (filter === "month") {
    const d = new Date(today);
    d.setDate(d.getDate() + 30);
    return { from: today, to: d.toISOString().slice(0, 10) };
  }

  if (filter === "custom") {
    return {
      from: customFrom || undefined,
      to: customTo || undefined,
    };
  }

  return {};
}

