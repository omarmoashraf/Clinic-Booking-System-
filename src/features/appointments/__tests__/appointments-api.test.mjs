import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const { getMyAppointments } = jiti("./src/features/appointments/api/get-my-appointments.ts");
const { cancelAppointment } = jiti("./src/features/appointments/api/cancel-appointment.ts");
const { apiClient } = jiti("./src/lib/api/http-client.ts");

test("Appointments API — getMyAppointments", async (t) => {
  const originalGet = apiClient.get;

  t.afterEach(() => {
    apiClient.get = originalGet;
  });

  await t.test("calls /appointments/me with default undefined parameters", async () => {
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

    const res = await getMyAppointments();

    assert.strictEqual(capturedUrl, "/appointments/me");
    assert.deepStrictEqual(capturedConfig?.params, {
      page: undefined,
      limit: undefined,
      status: undefined,
    });
    assert.strictEqual(res.status, "success");
    assert.deepStrictEqual(res.data, []);
  });

  await t.test("passes page, limit, and status filters properly", async () => {
    let capturedConfig = null;

    apiClient.get = async (url, config) => {
      capturedConfig = config;
      return {
        status: "success",
        data: [
          {
            id: "apt-1",
            status: "CONFIRMED",
            notes: "Routine checkup",
            createdAt: "2026-09-01T10:00:00Z",
            updatedAt: "2026-09-01T10:00:00Z",
            patient: { id: "pat-1", fullName: "Jane Doe" },
            doctor: {
              id: "doc-1",
              fullName: "Dr. Who",
              specialty: { id: "spec-1", name: "Cardiology" },
            },
            availability: {
              id: "avail-1",
              date: "2026-10-01",
              startTime: "09:00",
              endTime: "10:00",
            },
          },
        ],
        meta: { page: 2, limit: 5, total: 12, totalPages: 3 },
      };
    };

    const res = await getMyAppointments({
      page: 2,
      limit: 5,
      status: "CONFIRMED",
    });

    assert.deepStrictEqual(capturedConfig?.params, {
      page: 2,
      limit: 5,
      status: "CONFIRMED",
    });
    assert.strictEqual(res.data.length, 1);
    assert.strictEqual(res.data[0].id, "apt-1");
  });
});

test("Appointments API — cancelAppointment", async (t) => {
  const originalPatch = apiClient.patch;

  t.afterEach(() => {
    apiClient.patch = originalPatch;
  });

  await t.test("calls PATCH /appointments/:id/status with { status: 'CANCELLED' }", async () => {
    let capturedUrl = "";
    let capturedBody = null;

    apiClient.patch = async (url, body, config) => {
      capturedUrl = url;
      capturedBody = body;
      return {
        status: "success",
        data: {
          id: "apt-123",
          status: "CANCELLED",
        },
      };
    };

    const res = await cancelAppointment("apt-123");

    assert.strictEqual(capturedUrl, "/appointments/apt-123/status");
    assert.deepStrictEqual(capturedBody, { status: "CANCELLED" });
    assert.strictEqual(res.status, "success");
    assert.strictEqual(res.data.status, "CANCELLED");
  });
});

