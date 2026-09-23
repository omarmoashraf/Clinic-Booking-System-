import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const { updatePatientProfileSchema } = jiti(
  "./src/features/patients/schemas.ts"
);
const { patients: enPatients } = jiti(
  "./src/lib/i18n/resources/en/patients.ts"
);
const { patients: arPatients } = jiti(
  "./src/lib/i18n/resources/ar/patients.ts"
);

test("Patient Profile — Form Validation Schema", async (t) => {
  await t.test("accepts valid full profile data", () => {
    const result = updatePatientProfileSchema.safeParse({
      fullName: "Jane Doe",
      phone: "+201012345678",
      dateOfBirth: "1995-06-15",
    });
    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data.fullName, "Jane Doe");
      assert.strictEqual(result.data.phone, "+201012345678");
      assert.strictEqual(result.data.dateOfBirth, "1995-06-15");
    }
  });

  await t.test("rejects empty or whitespace-only fullName", () => {
    const emptyResult = updatePatientProfileSchema.safeParse({
      fullName: "",
    });
    assert.strictEqual(emptyResult.success, false);

    const whitespaceResult = updatePatientProfileSchema.safeParse({
      fullName: "   ",
    });
    assert.strictEqual(whitespaceResult.success, false);
  });

  await t.test("rejects fullName exceeding 150 characters", () => {
    const longName = "A".repeat(151);
    const result = updatePatientProfileSchema.safeParse({
      fullName: longName,
    });
    assert.strictEqual(result.success, false);
  });

  await t.test("rejects phone exceeding 30 characters", () => {
    const longPhone = "1".repeat(31);
    const result = updatePatientProfileSchema.safeParse({
      fullName: "Jane Doe",
      phone: longPhone,
    });
    assert.strictEqual(result.success, false);
  });

  await t.test("allows empty or omitted optional phone and dateOfBirth", () => {
    const result = updatePatientProfileSchema.safeParse({
      fullName: "Jane Doe",
      phone: "",
      dateOfBirth: "",
    });
    assert.strictEqual(result.success, true);
  });

  await t.test("rejects invalid dateOfBirth format", () => {
    const result = updatePatientProfileSchema.safeParse({
      fullName: "Jane Doe",
      dateOfBirth: "15-06-1995",
    });
    assert.strictEqual(result.success, false);
  });

  await t.test("rejects future dateOfBirth", () => {
    const futureYear = new Date().getFullYear() + 2;
    const result = updatePatientProfileSchema.safeParse({
      fullName: "Jane Doe",
      dateOfBirth: `${futureYear}-01-01`,
    });
    assert.strictEqual(result.success, false);
  });
});

test("Patient Profile — CSS Logical Properties & Accessibility Audit", async (t) => {
  const filesToAudit = [
    "src/features/patients/components/patient-profile-form.tsx",
    "src/features/patients/components/patient-profile-skeleton.tsx",
    "src/app/patient/profile/page.tsx",
  ];

  for (const relativePath of filesToAudit) {
    await t.test(`${relativePath} contains no hardcoded physical text alignment`, () => {
      const fullPath = path.resolve(process.cwd(), relativePath);
      const content = fs.readFileSync(fullPath, "utf-8");

      assert.strictEqual(
        content.includes("text-left"),
        false,
        `Found forbidden text-left in ${relativePath}`
      );
      assert.strictEqual(
        content.includes("text-right"),
        false,
        `Found forbidden text-right in ${relativePath}`
      );
    });

    await t.test(`${relativePath} uses logical margins and paddings`, () => {
      const fullPath = path.resolve(process.cwd(), relativePath);
      const content = fs.readFileSync(fullPath, "utf-8");

      const physicalPattern = /\b(pl-|pr-|ml-|mr-)\d+/;
      const match = content.match(physicalPattern);
      assert.strictEqual(
        match,
        null,
        `Found forbidden physical property ${match?.[0]} in ${relativePath}`
      );
    });
  }
});

test("Patient Profile — Bilingual Translation Keys Parity", async (t) => {
  const requiredKeys = [
    "profile",
    "personalInfo",
    "fullName",
    "fullNamePlaceholder",
    "email",
    "phone",
    "phonePlaceholder",
    "dateOfBirth",
    "accountDetails",
    "accountDetailsDesc",
    "joinedDate",
    "accountStatus",
    "statusActive",
    "statusInactive",
    "readOnlyNotice",
    "saveChanges",
    "saving",
    "updateError",
    "profileSubtitle",
    "validationFullNameRequired",
    "validationFullNameMax",
    "validationPhoneMax",
    "validationDateOfBirth",
  ];

  for (const key of requiredKeys) {
    await t.test(`key '${key}' exists in English and Arabic dictionaries`, () => {
      assert.ok(
        key in enPatients,
        `Key '${key}' is missing from English patients dictionary`
      );
      assert.ok(
        key in arPatients,
        `Key '${key}' is missing from Arabic patients dictionary`
      );
      assert.notStrictEqual(
        enPatients[key],
        "",
        `Key '${key}' has empty value in English dictionary`
      );
      assert.notStrictEqual(
        arPatients[key],
        "",
        `Key '${key}' has empty value in Arabic dictionary`
      );
    });
  }
});

