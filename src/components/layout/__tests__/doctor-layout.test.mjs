import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const {
  DOCTOR_NAV_ITEMS,
  isRouteActive,
  getInitials,
} = jiti("./src/components/layout/doctor-nav-config.ts");

const { getTranslation } = jiti("./src/lib/i18n/translator.ts");

test("Doctor Navigation — Items & Route Matching", async (t) => {
  await t.test("DOCTOR_NAV_ITEMS defines the essential doctor routes", () => {
    const hrefs = DOCTOR_NAV_ITEMS.map((item) => item.href);
    assert.deepStrictEqual(hrefs, [
      "/doctor/dashboard",
      "/doctor/appointments",
      "/doctor/availability",
      "/doctor/profile",
    ]);
  });

  await t.test("every nav item has valid translations in en and ar", () => {
    for (const item of DOCTOR_NAV_ITEMS) {
      const enText = getTranslation("en", item.labelKey);
      const arText = getTranslation("ar", item.labelKey);

      assert.ok(enText && enText !== item.labelKey, `Missing EN for ${item.labelKey}`);
      assert.ok(arText && arText !== item.labelKey, `Missing AR for ${item.labelKey}`);
    }
  });

  await t.test("isRouteActive accurately identifies active doctor routes", () => {
    assert.strictEqual(isRouteActive("/doctor/dashboard", "/doctor/dashboard"), true);
    assert.strictEqual(isRouteActive("/doctor/appointments", "/doctor/dashboard"), false);

    assert.strictEqual(isRouteActive("/doctor/appointments", "/doctor/appointments"), true);
    assert.strictEqual(
      isRouteActive("/doctor/appointments/apt-456", "/doctor/appointments"),
      true
    );

    assert.strictEqual(isRouteActive("/doctor/availability", "/doctor/availability"), true);
    assert.strictEqual(
      isRouteActive("/doctor/availability/slots", "/doctor/availability"),
      true
    );

    assert.strictEqual(isRouteActive("/doctor/profile", "/doctor/profile"), true);
  });

  await t.test("getInitials formats doctor names, titles, and emails correctly", () => {
    assert.strictEqual(getInitials("Dr. Gregory House"), "GH");
    assert.strictEqual(getInitials("Jane Doe"), "JD");
    assert.strictEqual(getInitials("Doctor"), "DO");
    assert.strictEqual(getInitials("doctor@example.com"), "D");
    assert.strictEqual(getInitials(null), "D");
    assert.strictEqual(getInitials(undefined), "D");
    assert.strictEqual(getInitials(""), "D");
    assert.strictEqual(getInitials("  Dr. Robert   Chase  "), "RC");
  });
});

test("Doctor Layout — Accessibility & Logical Properties Audit", async (t) => {
  const filesToAudit = [
    "src/components/layout/doctor-sidebar.tsx",
    "src/components/layout/doctor-header.tsx",
    "src/components/layout/doctor-mobile-nav.tsx",
    "src/components/layout/doctor-shell.tsx",
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

  await t.test("doctor sidebar uses logical border-e and start-0 positioning", () => {
    const content = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/layout/doctor-sidebar.tsx"),
      "utf-8"
    );
    assert.match(content, /border-e/);
    assert.match(content, /start-0/);
    assert.match(content, /aria-label=/);
    assert.match(content, /aria-current=/);
  });

  await t.test("doctor header includes accessible mobile controls and titles", () => {
    const content = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/layout/doctor-header.tsx"),
      "utf-8"
    );
    assert.match(content, /aria-expanded=/);
    assert.match(content, /aria-controls="doctor-mobile-nav"/);
  });

  await t.test("doctor mobile nav implements dialog role, aria-modal, and escape listener", () => {
    const content = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/layout/doctor-mobile-nav.tsx"),
      "utf-8"
    );
    assert.match(content, /role="dialog"/);
    assert.match(content, /aria-modal="true"/);
    assert.match(content, /Escape/);
    assert.match(content, /start-0/);
    assert.match(content, /border-e/);
  });

  await t.test("doctor shell provides an accessible skip to content link", () => {
    const content = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/layout/doctor-shell.tsx"),
      "utf-8"
    );
    assert.match(content, /href="#doctor-main-content"/);
    assert.match(content, /id="doctor-main-content"/);
  });

  await t.test("doctor shell enforces DOCTOR role restriction via RoleGuard", () => {
    const content = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/layout/doctor-shell.tsx"),
      "utf-8"
    );
    assert.match(content, /RoleGuard/);
    assert.match(content, /allowedRoles=\{?\["DOCTOR"\]\}?/);
  });

  await t.test("doctor root page redirects to /doctor/dashboard", () => {
    const content = fs.readFileSync(
      path.resolve(process.cwd(), "src/app/doctor/page.tsx"),
      "utf-8"
    );
    assert.match(content, /redirect\("\/doctor\/dashboard"\)/);
  });
});

