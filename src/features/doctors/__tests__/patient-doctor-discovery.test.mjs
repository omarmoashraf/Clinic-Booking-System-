import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Patient Doctor Discovery — Component & Route Architecture", async (t) => {
  await t.test("Patient discovery route file imports and configures DoctorsDiscoveryView with /patient/doctors", () => {
    const routePath = path.resolve(
      process.cwd(),
      "src/app/patient/doctors/page.tsx"
    );
    assert.ok(fs.existsSync(routePath), "src/app/patient/doctors/page.tsx must exist");
    const content = fs.readFileSync(routePath, "utf-8");
    assert.match(
      content,
      /DoctorsDiscoveryView/,
      "Must render DoctorsDiscoveryView"
    );
    assert.match(
      content,
      /basePath="\/patient\/doctors"/,
      "Must specify basePath='/patient/doctors'"
    );
  });

  await t.test("Patient doctor detail route file imports and configures DoctorDetailView with /patient/doctors", () => {
    const routePath = path.resolve(
      process.cwd(),
      "src/app/patient/doctors/[id]/page.tsx"
    );
    assert.ok(
      fs.existsSync(routePath),
      "src/app/patient/doctors/[id]/page.tsx must exist"
    );
    const content = fs.readFileSync(routePath, "utf-8");
    assert.match(content, /DoctorDetailView/, "Must render DoctorDetailView");
    assert.match(
      content,
      /basePath="\/patient\/doctors"/,
      "Must specify basePath='/patient/doctors'"
    );
  });

  await t.test("Public doctors page renders DoctorsDiscoveryView with /doctors", () => {
    const routePath = path.resolve(
      process.cwd(),
      "src/app/(public)/doctors/page.tsx"
    );
    assert.ok(fs.existsSync(routePath), "src/app/(public)/doctors/page.tsx must exist");
    const content = fs.readFileSync(routePath, "utf-8");
    assert.match(
      content,
      /DoctorsDiscoveryView/,
      "Must render DoctorsDiscoveryView"
    );
    assert.match(
      content,
      /basePath="\/doctors"/,
      "Must specify basePath='/doctors'"
    );
  });

  await t.test("DoctorCard source generates correct href based on basePath prop", () => {
    const cardPath = path.resolve(
      process.cwd(),
      "src/components/shared/doctor-card.tsx"
    );
    const content = fs.readFileSync(cardPath, "utf-8");
    assert.match(
      content,
      /basePath\s*=\s*"\/doctors"/,
      "Must default basePath to /doctors"
    );
    assert.match(
      content,
      /`\$\{basePath\}\/\$\{doctor\.id\}`/,
      "Must interpolate basePath with doctor.id"
    );
  });

  await t.test("DoctorDetailView handles patient portal breadcrumbs, back link, and slot booking", () => {
    const detailPath = path.resolve(
      process.cwd(),
      "src/features/doctors/components/doctor-detail-view.tsx"
    );
    const content = fs.readFileSync(detailPath, "utf-8");

    assert.match(
      content,
      /isPatientPortal\s*=\s*basePath\.startsWith\("\/patient"\)/,
      "Must detect if basePath is patient portal"
    );
    assert.match(
      content,
      /isPatientPortal \? "\/patient\/dashboard" : "\/"/,
      "Must route breadcrumb home link appropriately"
    );
    assert.match(
      content,
      /href=\{basePath\}/,
      "Must link back button to basePath"
    );
    assert.match(
      content,
      /\/patient\/appointments\/new\?doctorId=/,
      "Must navigate to appointment booking flow for authenticated patients"
    );
  });
});

test("Doctor Discovery — Accessibility & Logical Properties Audit", async (t) => {
  const filesToAudit = [
    "src/features/doctors/components/doctors-discovery-view.tsx",
    "src/features/doctors/components/doctor-detail-view.tsx",
    "src/components/shared/doctor-card.tsx",
    "src/features/doctors/components/doctor-filters.tsx",
    "src/features/doctors/components/doctor-profile-header.tsx",
    "src/features/doctors/components/availability-slot-card.tsx",
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

  await t.test("doctor-filters component uses logical spacing and directional icons", () => {
    const content = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "src/features/doctors/components/doctor-filters.tsx"
      ),
      "utf-8"
    );
    assert.match(content, /ps-9/, "Search input must use logical ps-9 for icon padding");
    assert.match(content, /start-3/, "Search icon must be positioned with start-3");
    assert.match(content, /aria-label=/, "Must provide accessible aria-labels");
  });

  await t.test("doctor discovery view uses logical text alignment and skeleton loading", () => {
    const content = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "src/features/doctors/components/doctors-discovery-view.tsx"
      ),
      "utf-8"
    );
    assert.match(content, /text-start/, "Headings must use logical text-start");
    assert.match(content, /DoctorGridSkeleton/, "Must display grid skeleton during loading");
    assert.match(content, /EmptyState/, "Must display empty state when no doctors match");
  });
});
