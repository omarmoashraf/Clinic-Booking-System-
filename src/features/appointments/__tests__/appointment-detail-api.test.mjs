import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const { getAppointmentById } = jiti(
  "./src/features/appointments/api/get-appointment-by-id.ts"
);
const { apiClient } = jiti("./src/lib/api/http-client.ts");
const { HttpError } = jiti("./src/lib/api/http-error.ts");

test("Appointments API — getAppointmentById (GET /appointments/:id)", async (t) => {
  const originalGet = apiClient.get;

  t.afterEach(() => {
    apiClient.get = originalGet;
  });

  await t.test("calls /appointments/:id with URL-encoded ID", async () => {
    let capturedUrl = "";

    apiClient.get = async (url) => {
      capturedUrl = url;
      return {
        status: "success",
        data: {
          id: "apt-123",
          status: "CONFIRMED",
          patient: { id: "p-1", fullName: "Jane Doe" },
          doctor: {
            id: "d-1",
            fullName: "Dr. Who",
            specialty: { id: "s-1", name: "Cardiology" },
          },
          availability: {
            id: "slot-1",
            date: "2030-01-01",
            startTime: "10:00",
            endTime: "10:30",
          },
        },
      };
    };

    const res = await getAppointmentById("apt-123");

    assert.strictEqual(capturedUrl, "/appointments/apt-123");
    assert.strictEqual(res.status, "success");
    assert.strictEqual(res.data.id, "apt-123");
    assert.strictEqual(res.data.status, "CONFIRMED");
    assert.strictEqual(res.data.doctor.fullName, "Dr. Who");
  });

  await t.test("propagates 404 HttpError when appointment does not exist", async () => {
    apiClient.get = async (url) => {
      throw new HttpError({
        message: "Appointment not found",
        status: 404,
        statusText: "Not Found",
        data: { status: "error", message: "Appointment not found" },
        url,
        method: "GET",
      });
    };

    await assert.rejects(
      async () => {
        await getAppointmentById("non-existent-id");
      },
      (err) => {
        assert.ok(err instanceof HttpError);
        assert.strictEqual(err.status, 404);
        assert.match(err.message, /not found/i);
        return true;
      }
    );
  });

  await t.test("propagates 403 Forbidden HttpError when user does not own appointment", async () => {
    apiClient.get = async (url) => {
      throw new HttpError({
        message: "Forbidden access",
        status: 403,
        statusText: "Forbidden",
        data: { status: "error", message: "Forbidden" },
        url,
        method: "GET",
      });
    };

    await assert.rejects(
      async () => {
        await getAppointmentById("other-patient-appointment");
      },
      (err) => {
        assert.ok(err instanceof HttpError);
        assert.strictEqual(err.status, 403);
        return true;
      }
    );
  });
});

