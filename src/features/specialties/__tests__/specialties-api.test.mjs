import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const { getSpecialties } = jiti("./src/features/specialties/api/get-specialties.ts");
const { apiClient } = jiti("./src/lib/api/http-client.ts");

test("Specialties API — getSpecialties", async (t) => {
  const originalGet = apiClient.get;

  t.afterEach(() => {
    apiClient.get = originalGet;
  });

  await t.test("calls /specialties with default parameters when none provided", async () => {
    let capturedUrl = "";
    let capturedConfig = null;

    apiClient.get = async (url, config) => {
      capturedUrl = url;
      capturedConfig = config;
      return {
        status: "success",
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
    };

    const res = await getSpecialties();

    assert.strictEqual(capturedUrl, "/specialties");
    assert.deepStrictEqual(capturedConfig?.params, {
      page: undefined,
      limit: undefined,
      search: undefined,
    });
    assert.strictEqual(res.status, "success");
    assert.deepStrictEqual(res.data, []);
  });

  await t.test("passes page, limit, and search parameters accurately", async () => {
    let capturedConfig = null;

    apiClient.get = async (url, config) => {
      capturedConfig = config;
      return {
        status: "success",
        data: [
          {
            id: "spec-1",
            name: "Cardiology",
            created_at: "2026-01-01T00:00:00.000Z",
          },
        ],
        meta: { page: 1, limit: 6, total: 1, totalPages: 1 },
      };
    };

    const res = await getSpecialties({ page: 1, limit: 6, search: "Cardio" });

    assert.deepStrictEqual(capturedConfig?.params, {
      page: 1,
      limit: 6,
      search: "Cardio",
    });
    assert.strictEqual(res.status, "success");
    assert.strictEqual(res.data.length, 1);
    assert.strictEqual(res.data[0].name, "Cardiology");
  });
});

