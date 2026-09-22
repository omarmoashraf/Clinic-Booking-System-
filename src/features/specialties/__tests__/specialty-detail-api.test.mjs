import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const { getSpecialtyById } = jiti("./src/features/specialties/api/get-specialty-by-id.ts");
const { apiClient } = jiti("./src/lib/api/http-client.ts");

test("Specialties API — getSpecialtyById", async (t) => {
  const originalGet = apiClient.get;

  t.afterEach(() => {
    apiClient.get = originalGet;
  });

  await t.test("fetches a single specialty by ID and encodes URI component", async () => {
    let capturedUrl = "";

    apiClient.get = async (url) => {
      capturedUrl = url;
      return {
        status: "success",
        data: {
          id: "spec-uuid-123",
          name: "Cardiology",
          created_at: "2026-01-01T00:00:00.000Z",
        },
      };
    };

    const res = await getSpecialtyById("spec-uuid-123");

    assert.strictEqual(capturedUrl, "/specialties/spec-uuid-123");
    assert.strictEqual(res.status, "success");
    assert.strictEqual(res.data.id, "spec-uuid-123");
    assert.strictEqual(res.data.name, "Cardiology");
  });

  await t.test("properly encodes special characters in specialty id", async () => {
    let capturedUrl = "";

    apiClient.get = async (url) => {
      capturedUrl = url;
      return {
        status: "success",
        data: {
          id: "spec/special#1",
          name: "Specialty",
          created_at: "2026-01-01T00:00:00.000Z",
        },
      };
    };

    await getSpecialtyById("spec/special#1");
    assert.strictEqual(capturedUrl, "/specialties/spec%2Fspecial%231");
  });
});

