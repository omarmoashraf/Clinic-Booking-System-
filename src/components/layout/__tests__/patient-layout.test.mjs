import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const {
  PATIENT_NAV_ITEMS,
  isRouteActive,
  getInitials,
} = jiti("./src/components/layout/patient-nav-config.ts");

const { getTranslation } = jiti("./src/lib/i18n/translator.ts");

test("Patient Navigation — Items & Route Matching", async (t) => {
  await t.test("PATIENT_NAV_ITEMS defines the essential patient routes", () => {
    const hrefs = PATIENT_NAV_ITEMS.map((item) => item.href);
    assert.deepStrictEqual(hrefs, [
      "/patient/dashboard",
      "/patient/appointments",
      "/patient/doctors",
      "/patient/profile",
    ]);
  });

  await t.test("every nav item has valid translations in en and ar", () => {
    for (const item of PATIENT_NAV_ITEMS) {
      const enText = getTranslation("en", item.labelKey);
      const arText = getTranslation("ar", item.labelKey);

      assert.ok(enText && enText !== item.labelKey, `Missing EN for ${item.labelKey}`);
      assert.ok(arText && arText !== item.labelKey, `Missing AR for ${item.labelKey}`);
    }
  });

  await t.test("isRouteActive accurately identifies active routes", () => {
    assert.strictEqual(isRouteActive("/patient/dashboard", "/patient/dashboard"), true);
    assert.strictEqual(isRouteActive("/patient/appointments", "/patient/dashboard"), false);

    assert.strictEqual(isRouteActive("/patient/appointments", "/patient/appointments"), true);
    assert.strictEqual(
      isRouteActive("/patient/appointments/apt-123", "/patient/appointments"),
      true
    );

    assert.strictEqual(isRouteActive("/patient/doctors", "/patient/doctors"), true);
    assert.strictEqual(isRouteActive("/patient/doctors/doc-456", "/patient/doctors"), true);
    assert.strictEqual(isRouteActive("/patient/profile", "/patient/profile"), true);
  });

  await t.test("getInitials formats names and emails correctly", () => {
    assert.strictEqual(getInitials("Jane Doe"), "JD");
    assert.strictEqual(getInitials("John"), "JO");
    assert.strictEqual(getInitials("patient@example.com"), "P");
    assert.strictEqual(getInitials(null), "P");
    assert.strictEqual(getInitials(undefined), "P");
    assert.strictEqual(getInitials(""), "P");
    assert.strictEqual(getInitials("  Alice   Wonderland  "), "AW");
  });
});

test("Patient Layout — Accessibility & Logical Properties Audit", async (t) => {
  const filesToAudit = [
    "src/components/layout/patient-sidebar.tsx",
    "src/components/layout/patient-header.tsx",
    "src/components/layout/patient-mobile-nav.tsx",
    "src/components/layout/patient-shell.tsx",
    "src/components/layout/role-guard.tsx",
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

  await t.test("sidebar uses logical border-e and start-0 positioning", () => {
    const content = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/layout/patient-sidebar.tsx"),
      "utf-8"
    );
    assert.match(content, /border-e/);
    assert.match(content, /start-0/);
    assert.match(content, /aria-label=/);
    assert.match(content, /aria-current=/);
  });

  await t.test("header includes accessible mobile controls and titles", () => {
    const content = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/layout/patient-header.tsx"),
      "utf-8"
    );
    assert.match(content, /aria-expanded=/);
    assert.match(content, /aria-controls="patient-mobile-nav"/);
  });

  await t.test("mobile nav implements dialog role, aria-modal, and escape listener", () => {
    const content = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/layout/patient-mobile-nav.tsx"),
      "utf-8"
    );
    assert.match(content, /role="dialog"/);
    assert.match(content, /aria-modal="true"/);
    assert.match(content, /Escape/);
    assert.match(content, /start-0/);
    assert.match(content, /border-e/);
  });

  await t.test("patient shell provides an accessible skip to content link", () => {
    const content = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/layout/patient-shell.tsx"),
      "utf-8"
    );
    assert.match(content, /href="#patient-main-content"/);
    assert.match(content, /id="patient-main-content"/);
  });

  await t.test("role guard enforces PATIENT role restriction and accessible loading", () => {
    const content = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/layout/role-guard.tsx"),
      "utf-8"
    );
    assert.match(content, /router\.replace/);
    assert.match(content, /\/doctor\/dashboard/);
    assert.match(content, /\/admin\/dashboard/);
    assert.match(content, /\/patient\/dashboard/);
    assert.match(content, /role="status"/);
    assert.match(content, /aria-live="polite"/);
  });
});
