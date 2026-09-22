import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const { getDoctorAvailability } = jiti(
  "./src/features/doctors/api/get-doctor-availability.ts"
);
const { apiClient } = jiti("./src/lib/api/http-client.ts");

test("Doctors API — getDoctorAvailability", async (t) => {
  const originalGet = apiClient.get;

  t.afterEach(() => {
    apiClient.get = originalGet;
  });

  await t.test("calls /doctors/:doctorId/availability with default parameters", async () => {
    let capturedUrl = "";
    let capturedConfig = null;

    apiClient.get = async (url, config) => {
      capturedUrl = url;
      capturedConfig = config;
      return {
        status: "success",
        data: [],
      };
    };

    const res = await getDoctorAvailability("doc-123");

    assert.strictEqual(capturedUrl, "/doctors/doc-123/availability");
    assert.deepStrictEqual(capturedConfig?.params, {
      from: undefined,
      to: undefined,
    });
    assert.strictEqual(res.status, "success");
    assert.deepStrictEqual(res.data, []);
  });

  await t.test("passes from and to date filter parameters accurately", async () => {
    let capturedConfig = null;

    apiClient.get = async (url, config) => {
      capturedConfig = config;
      return {
        status: "success",
        data: [
          {
            id: "slot-1",
            date: "2026-09-25",
            startTime: "10:00",
            endTime: "11:00",
          },
        ],
      };
    };

    const res = await getDoctorAvailability("doc-123", {
      from: "2026-09-25",
      to: "2026-09-30",
    });

    assert.deepStrictEqual(capturedConfig?.params, {
      from: "2026-09-25",
      to: "2026-09-30",
    });
    assert.strictEqual(res.status, "success");
    assert.strictEqual(res.data.length, 1);
    assert.strictEqual(res.data[0].startTime, "10:00");
  });
});

