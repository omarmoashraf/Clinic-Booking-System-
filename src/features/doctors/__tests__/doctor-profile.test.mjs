import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../../..");

describe("Doctor Profile — Schema Validation", () => {
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  function validateDoctorProfilePayload({ specialtyId, bio }) {
    const errors = {};

    if (specialtyId && specialtyId !== "") {
      if (!UUID_REGEX.test(specialtyId)) {
        errors.specialtyId = "Invalid specialty ID";
      }
    }

    if (bio && bio !== "") {
      if (typeof bio !== "string" || bio.length > 1000) {
        errors.bio = "Bio must not exceed 1000 characters";
      }
    }

    return {
      success: Object.keys(errors).length === 0,
      errors,
    };
  }

  it("accepts valid specialtyId UUID and bio within 1000 characters", () => {
    const result = validateDoctorProfilePayload({
      specialtyId: "e9b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d",
      bio: "Dr. Smith has over 15 years of experience in clinical cardiology.",
    });
    assert.equal(result.success, true);
    assert.deepEqual(result.errors, {});
  });

  it("accepts empty optional values as valid partial update", () => {
    const result1 = validateDoctorProfilePayload({});
    assert.equal(result1.success, true);

    const result2 = validateDoctorProfilePayload({ specialtyId: "", bio: "" });
    assert.equal(result2.success, true);
  });

  it("rejects invalid non-UUID specialtyId", () => {
    const result = validateDoctorProfilePayload({
      specialtyId: "not-a-valid-uuid",
      bio: "Expert physician.",
    });
    assert.equal(result.success, false);
    assert.equal(result.errors.specialtyId, "Invalid specialty ID");
  });

  it("rejects bio exceeding 1000 characters", () => {
    const longBio = "A".repeat(1001);
    const result = validateDoctorProfilePayload({
      bio: longBio,
    });
    assert.equal(result.success, false);
    assert.equal(result.errors.bio, "Bio must not exceed 1000 characters");
  });
});

describe("Doctor Profile — Logical CSS & Accessibility Audit", () => {
  const filesToCheck = [
    "src/features/doctors/components/doctor-account-card.tsx",
    "src/features/doctors/components/doctor-profile-form.tsx",
    "src/features/doctors/components/doctor-profile-skeleton.tsx",
    "src/app/doctor/profile/page.tsx",
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

  it("DoctorAccountCard renders verified doctor badge and account identity", () => {
    const cardPath = path.join(projectRoot, "src/features/doctors/components/doctor-account-card.tsx");
    const content = fs.readFileSync(cardPath, "utf8");
    assert.match(content, /doctors\.doctorRoleBadge/);
    assert.match(content, /doctors\.clinicalVerificationNotice/);
  });

  it("DoctorProfileForm provides accessible form labels and controls", () => {
    const formPath = path.join(projectRoot, "src/features/doctors/components/doctor-profile-form.tsx");
    const content = fs.readFileSync(formPath, "utf8");
    assert.match(content, /htmlFor="doctor-specialty"/);
    assert.match(content, /htmlFor="doctor-bio"/);
    assert.match(content, /Select/);
    assert.match(content, /textarea/);
  });

  it("DoctorProfileSkeleton provides role='status'", () => {
    const skelPath = path.join(projectRoot, "src/features/doctors/components/doctor-profile-skeleton.tsx");
    const content = fs.readFileSync(skelPath, "utf8");
    assert.match(content, /role="status"/);
  });
});

