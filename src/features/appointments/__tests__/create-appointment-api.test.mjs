import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const { createAppointment } = jiti(
  "./src/features/appointments/api/create-appointment.ts"
);
const { apiClient } = jiti("./src/lib/api/http-client.ts");
const { HttpError } = jiti("./src/lib/api/http-error.ts");

test("Appointments API — createAppointment (POST /appointments)", async (t) => {
  const originalPost = apiClient.post;

  t.afterEach(() => {
    apiClient.post = originalPost;
  });

  await t.test(
    "calls /appointments with availabilityId and trimmed notes",
    async () => {
      let capturedUrl = "";
      let capturedBody = null;

      apiClient.post = async (url, body) => {
        capturedUrl = url;
        capturedBody = body;
        return {
          status: "success",
          data: {
            id: "apt-123",
            status: "PENDING",
            notes: "Routine checkup",
            createdAt: "2026-09-22T10:00:00Z",
            updatedAt: "2026-09-22T10:00:00Z",
            patient: { id: "pat-1", fullName: "Jane Doe" },
            doctor: {
              id: "doc-1",
              fullName: "Dr. Smith",
              specialty: { id: "spec-1", name: "Cardiology" },
            },
            availability: {
              id: "slot-456",
              date: "2026-10-01",
              startTime: "10:00",
              endTime: "10:30",
            },
          },
        };
      };

      const res = await createAppointment({
        availabilityId: "slot-456",
        notes: "   Routine checkup   ",
      });

      assert.strictEqual(capturedUrl, "/appointments");
      assert.deepStrictEqual(capturedBody, {
        availabilityId: "slot-456",
        notes: "Routine checkup",
      });
      assert.strictEqual(res.status, "success");
      assert.strictEqual(res.data.id, "apt-123");
      assert.strictEqual(res.data.status, "PENDING");
    }
  );

  await t.test("omits notes if string is empty or only whitespace", async () => {
    let capturedBody = null;

    apiClient.post = async (url, body) => {
      capturedBody = body;
      return {
        status: "success",
        data: { id: "apt-789", status: "PENDING" },
      };
    };

    await createAppointment({
      availabilityId: "slot-999",
      notes: "     ",
    });

    assert.deepStrictEqual(capturedBody, {
      availabilityId: "slot-999",
    });
    assert.strictEqual(capturedBody.notes, undefined);
  });

  await t.test("propagates 409 Conflict error when slot is already booked", async () => {
    apiClient.post = async () => {
      throw new HttpError({
        message: "Appointment slot is already booked",
        status: 409,
        statusText: "Conflict",
        data: { status: "error", message: "Appointment slot is already booked" },
        url: "/appointments",
        method: "POST",
      });
    };

    await assert.rejects(
      async () => {
        await createAppointment({ availabilityId: "slot-booked" });
      },
      (err) => {
        assert.ok(err instanceof HttpError);
        assert.strictEqual(err.status, 409);
        assert.match(err.message, /already booked/);
        return true;
      }
    );
  });
});
