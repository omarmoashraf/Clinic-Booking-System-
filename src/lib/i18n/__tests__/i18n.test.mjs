import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const {
  isValidLocale,
  getDirection,
  isRtlLocale,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  LOCALE_LABELS,
} = jiti("./src/lib/i18n/config.ts");

const { getTranslation, createTranslator } = jiti("./src/lib/i18n/translator.ts");
const { en } = jiti("./src/lib/i18n/resources/en/index.ts");
const { ar } = jiti("./src/lib/i18n/resources/ar/index.ts");

test("i18n Configuration & Helpers", async (t) => {
  await t.test("default locale is English", () => {
    assert.strictEqual(DEFAULT_LOCALE, "en");
  });

  await t.test("supported locales contains en and ar", () => {
    assert.deepStrictEqual([...SUPPORTED_LOCALES], ["en", "ar"]);
  });

  await t.test("isValidLocale validates supported locales correctly", () => {
    assert.strictEqual(isValidLocale("en"), true);
    assert.strictEqual(isValidLocale("ar"), true);
    assert.strictEqual(isValidLocale("fr"), false);
    assert.strictEqual(isValidLocale(""), false);
    assert.strictEqual(isValidLocale(null), false);
    assert.strictEqual(isValidLocale(undefined), false);
    assert.strictEqual(isValidLocale(123), false);
  });

  await t.test("getDirection returns correct direction", () => {
    assert.strictEqual(getDirection("en"), "ltr");
    assert.strictEqual(getDirection("ar"), "rtl");
  });

  await t.test("isRtlLocale identifies RTL locales", () => {
    assert.strictEqual(isRtlLocale("en"), false);
    assert.strictEqual(isRtlLocale("ar"), true);
  });

  await t.test("LOCALE_LABELS contains proper metadata", () => {
    assert.strictEqual(LOCALE_LABELS.en.nativeName, "English");
    assert.strictEqual(LOCALE_LABELS.ar.nativeName, "العربية");
    assert.strictEqual(LOCALE_LABELS.en.dir, "ltr");
    assert.strictEqual(LOCALE_LABELS.ar.dir, "rtl");
  });
});

test("Translation Engine & Fallbacks", async (t) => {
  await t.test("translates basic keys in English", () => {
    assert.strictEqual(
      getTranslation("en", "common.appName"),
      "Clinic Management System"
    );
    assert.strictEqual(getTranslation("en", "status.pending"), "Pending");
  });

  await t.test("translates basic keys in Arabic", () => {
    assert.strictEqual(
      getTranslation("ar", "common.appName"),
      "نظام إدارة العيادات"
    );
    assert.strictEqual(getTranslation("ar", "status.pending"), "قيد الانتظار");
  });

  await t.test("createTranslator returns a bound translation function", () => {
    const tEn = createTranslator("en");
    const tAr = createTranslator("ar");

    assert.strictEqual(tEn("nav.home"), "Home");
    assert.strictEqual(tAr("nav.home"), "الرئيسية");
  });

  await t.test("falls back to raw key if key not found anywhere", () => {
    assert.strictEqual(
      getTranslation("en", "nonexistent.key"),
      "nonexistent.key"
    );
    assert.strictEqual(
      getTranslation("ar", "nonexistent.key"),
      "nonexistent.key"
    );
  });

  await t.test("supports parameter interpolation with {param}", () => {
    assert.strictEqual(
      getTranslation("en", "doctors.experienceYears", { years: 10 }),
      "10 years experience"
    );
    assert.strictEqual(
      getTranslation("ar", "doctors.experienceYears", { years: 10 }),
      "خبرة 10 سنوات"
    );
  });
});

test("Modular Domain Resources Verification", async (t) => {
  const domains = [
    "common",
    "nav",
    "auth",
    "status",
    "home",
    "errors",
    "appointments",
    "doctors",
    "patients",
    "specialties",
    "admin",
    "verification",
  ];

  await t.test("all expected domains exist in both en and ar", () => {
    for (const domain of domains) {
      assert.ok(en[domain], `Domain ${domain} missing in English resources`);
      assert.ok(ar[domain], `Domain ${domain} missing in Arabic resources`);
    }
  });

  await t.test("resolves appointments domain keys", () => {
    assert.strictEqual(
      getTranslation("en", "appointments.bookSuccess"),
      "Appointment booked successfully"
    );
    assert.strictEqual(
      getTranslation("ar", "appointments.bookSuccess"),
      "تم حجز الموعد بنجاح"
    );
  });

  await t.test("resolves specialties domain keys", () => {
    assert.strictEqual(
      getTranslation("en", "specialties.cardiology"),
      "Cardiology"
    );
    assert.strictEqual(
      getTranslation("ar", "specialties.cardiology"),
      "أمراض القلب والأوعية الدموية"
    );
  });

  await t.test("resolves admin domain keys", () => {
    assert.strictEqual(
      getTranslation("en", "admin.manageUsers"),
      "Manage Users"
    );
    assert.strictEqual(
      getTranslation("ar", "admin.manageUsers"),
      "إدارة المستخدمين"
    );
  });
});

test("Dictionary Parity Check (English <-> Arabic)", async (t) => {
  function getKeys(obj, prefix = "") {
    let keys = [];
    for (const key of Object.keys(obj)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (
        obj[key] !== null &&
        typeof obj[key] === "object" &&
        !Array.isArray(obj[key])
      ) {
        keys = keys.concat(getKeys(obj[key], fullPath));
      } else {
        keys.push(fullPath);
      }
    }
    return keys;
  }

  const enKeys = getKeys(en);
  const arKeys = getKeys(ar);

  await t.test("every English key exists in Arabic dictionary", () => {
    const missingInArabic = enKeys.filter((key) => !arKeys.includes(key));
    assert.deepStrictEqual(
      missingInArabic,
      [],
      `Keys missing in Arabic dictionary: ${missingInArabic.join(", ")}`
    );
  });

  await t.test("every Arabic key exists in English dictionary", () => {
    const missingInEnglish = arKeys.filter((key) => !enKeys.includes(key));
    assert.deepStrictEqual(
      missingInEnglish,
      [],
      `Keys missing in English dictionary: ${missingInEnglish.join(", ")}`
    );
  });

  await t.test("no dictionary value is empty or undefined", () => {
    for (const key of enKeys) {
      const val = getTranslation("en", key);
      assert.ok(
        val && val.length > 0,
        `English translation for ${key} is empty`
      );
    }
    for (const key of arKeys) {
      const val = getTranslation("ar", key);
      assert.ok(
        val && val.length > 0,
        `Arabic translation for ${key} is empty`
      );
    }
  });
});
