import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const { getDirection, isRtlLocale, LOCALE_DIRECTIONS } = jiti(
  "./src/lib/i18n/config.ts"
);

test("RTL/LTR Direction Architecture", async (t) => {
  await t.test("locale direction mapping is correctly defined", () => {
    assert.strictEqual(LOCALE_DIRECTIONS.en, "ltr");
    assert.strictEqual(LOCALE_DIRECTIONS.ar, "rtl");
  });

  await t.test("getDirection returns correct direction for each locale", () => {
    assert.strictEqual(getDirection("en"), "ltr");
    assert.strictEqual(getDirection("ar"), "rtl");
  });

  await t.test("isRtlLocale detects RTL accurately", () => {
    assert.strictEqual(isRtlLocale("en"), false);
    assert.strictEqual(isRtlLocale("ar"), true);
  });
});

test("UI Components Logical Properties Audit", async (t) => {
  const filesToAudit = [
    "src/components/ui/dialog.tsx",
    "src/components/ui/select.tsx",
    "src/components/ui/dropdown-menu.tsx",
    "src/components/ui/alert.tsx",
    "src/components/ui/table.tsx",
    "src/components/ui/button.tsx",
  ];

  for (const relativePath of filesToAudit) {
    const fullPath = path.resolve(process.cwd(), relativePath);
    const content = fs.readFileSync(fullPath, "utf-8");

    await t.test(`${relativePath} uses logical alignment (no hardcoded text-left)`, () => {
      assert.doesNotMatch(
        content,
        /text-left\b/,
        `${relativePath} contains hardcoded 'text-left'; should use 'text-start'`
      );
    });
  }

  await t.test("dialog close button uses logical end positioning", () => {
    const dialogContent = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/ui/dialog.tsx"),
      "utf-8"
    );
    assert.match(
      dialogContent,
      /end-2/,
      "Dialog close button must use 'end-2' for bidirectional placement"
    );
    assert.doesNotMatch(
      dialogContent,
      /top-2 right-2/,
      "Dialog close button must not use hardcoded 'top-2 right-2'"
    );
  });

  await t.test("table component uses logical text-start on headers and cells", () => {
    const tableContent = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/ui/table.tsx"),
      "utf-8"
    );
    assert.match(
      tableContent,
      /text-start align-middle/,
      "TableHead and TableCell must use logical text-start"
    );
  });

  await t.test("select component uses logical padding and positioning", () => {
    const selectContent = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/ui/select.tsx"),
      "utf-8"
    );
    assert.match(
      selectContent,
      /absolute end-2/,
      "SelectItem indicator must use 'absolute end-2'"
    );
    assert.match(
      selectContent,
      /text-start/,
      "SelectValue must use 'text-start'"
    );
  });
});

