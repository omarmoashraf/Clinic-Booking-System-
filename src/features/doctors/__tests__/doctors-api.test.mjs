import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const { getDoctors } = jiti("./src/features/doctors/api/get-doctors.ts");
const { apiClient } = jiti("./src/lib/api/http-client.ts");

test("Doctors API — getDoctors", async (t) => {
  const originalGet = apiClient.get;

  t.afterEach(() => {
    apiClient.get = originalGet;
  });

  await t.test("calls /doctors with default parameters when none provided", async () => {
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

    const res = await getDoctors();

    assert.strictEqual(capturedUrl, "/doctors");
    assert.deepStrictEqual(capturedConfig?.params, {
      page: undefined,
      limit: undefined,
      specialty: undefined,
    });
    assert.strictEqual(res.status, "success");
    assert.deepStrictEqual(res.data, []);
  });

  await t.test("passes page, limit, and specialty filters accurately", async () => {
    let capturedConfig = null;

    apiClient.get = async (url, config) => {
      capturedConfig = config;
      return {
        status: "success",
        data: [
          {
            id: "doc-1",
            fullName: "Dr. Sarah Johnson",
            specialty: { id: "spec-1", name: "Cardiology" },
            bio: "Experienced cardiologist",
          },
        ],
        meta: { page: 2, limit: 4, total: 10, totalPages: 3 },
      };
    };

    const res = await getDoctors({ page: 2, limit: 4, specialty: "Cardiology" });

    assert.deepStrictEqual(capturedConfig?.params, {
      page: 2,
      limit: 4,
      specialty: "Cardiology",
    });
    assert.strictEqual(res.status, "success");
    assert.strictEqual(res.data.length, 1);
    assert.strictEqual(res.data[0].fullName, "Dr. Sarah Johnson");
  });
});

