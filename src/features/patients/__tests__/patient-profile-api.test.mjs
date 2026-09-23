import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const { getPatientProfile } = jiti(
  "./src/features/patients/api/get-patient-profile.ts"
);
const { updatePatientProfile } = jiti(
  "./src/features/patients/api/update-patient-profile.ts"
);
const { apiClient } = jiti("./src/lib/api/http-client.ts");
const { HttpError } = jiti("./src/lib/api/http-error.ts");

const mockPatientProfile = {
  id: "user-uuid-1",
  email: "jane.patient@example.com",
  fullName: "Jane Doe",
  phone: "+201012345678",
  role: "PATIENT",
  isActive: true,
  createdAt: "2025-01-15T10:00:00.000Z",
  updatedAt: "2025-01-15T10:00:00.000Z",
  patient: {
    id: "patient-uuid-1",
    dateOfBirth: "1995-06-15",
  },
};

test("Patients API — getPatientProfile (GET /users/me)", async (t) => {
  const originalGet = apiClient.get;

  t.afterEach(() => {
    apiClient.get = originalGet;
  });

  await t.test("calls /users/me and returns merged patient profile data", async () => {
    let capturedUrl = "";

    apiClient.get = async (url) => {
      capturedUrl = url;
      return {
        status: "success",
        data: mockPatientProfile,
      };
    };

    const res = await getPatientProfile();

    assert.strictEqual(capturedUrl, "/users/me");
    assert.strictEqual(res.id, "user-uuid-1");
    assert.strictEqual(res.email, "jane.patient@example.com");
    assert.strictEqual(res.fullName, "Jane Doe");
    assert.strictEqual(res.role, "PATIENT");
    assert.strictEqual(res.patient?.dateOfBirth, "1995-06-15");
  });

  await t.test("propagates 401 HttpError when unauthenticated", async () => {
    apiClient.get = async () => {
      throw new HttpError({
        message: "Missing or invalid access token",
        status: 401,
        statusText: "Unauthorized",
        data: { status: "error", message: "Missing or invalid access token" },
        url: "/users/me",
        method: "GET",
      });
    };

    await assert.rejects(
      async () => {
        await getPatientProfile();
      },
      (err) => {
        assert(HttpError.isHttpError(err));
        assert.strictEqual(err.status, 401);
        return true;
      }
    );
  });
});

test("Patients API — updatePatientProfile (PATCH /patients/me)", async (t) => {
  const originalPatch = apiClient.patch;

  t.afterEach(() => {
    apiClient.patch = originalPatch;
  });

  await t.test("dispatches PATCH /patients/me with sanitized payload and returns updated profile", async () => {
    let capturedUrl = "";
    let capturedBody = null;

    apiClient.patch = async (url, body) => {
      capturedUrl = url;
      capturedBody = body;
      return {
        status: "success",
        data: {
          ...mockPatientProfile,
          fullName: "Jane Updated",
          phone: "+201099999999",
          patient: {
            ...mockPatientProfile.patient,
            dateOfBirth: "1994-08-20",
          },
        },
      };
    };

    const updated = await updatePatientProfile({
      fullName: "  Jane Updated  ",
      phone: "  +201099999999  ",
      dateOfBirth: "1994-08-20",
    });

    assert.strictEqual(capturedUrl, "/patients/me");
    assert.deepStrictEqual(capturedBody, {
      fullName: "Jane Updated",
      phone: "+201099999999",
      dateOfBirth: "1994-08-20",
    });
    assert.strictEqual(updated.fullName, "Jane Updated");
    assert.strictEqual(updated.phone, "+201099999999");
    assert.strictEqual(updated.patient?.dateOfBirth, "1994-08-20");
  });

  await t.test("omits empty or whitespace-only optional fields from payload", async () => {
    let capturedBody = null;

    apiClient.patch = async (url, body) => {
      capturedBody = body;
      return {
        status: "success",
        data: {
          ...mockPatientProfile,
          fullName: "Jane Doe Only",
        },
      };
    };

    await updatePatientProfile({
      fullName: "Jane Doe Only",
      phone: "   ",
      dateOfBirth: "",
    });

    assert.deepStrictEqual(capturedBody, {
      fullName: "Jane Doe Only",
    });
  });

  await t.test("propagates 400 HttpError for invalid date format or validation failure", async () => {
    apiClient.patch = async () => {
      throw new HttpError({
        message: "Invalid date format",
        status: 400,
        statusText: "Bad Request",
        data: { status: "error", message: "Invalid date format" },
        url: "/patients/me",
        method: "PATCH",
      });
    };

    await assert.rejects(
      async () => {
        await updatePatientProfile({
          dateOfBirth: "invalid-date",
        });
      },
      (err) => {
        assert(HttpError.isHttpError(err));
        assert.strictEqual(err.status, 400);
        return true;
      }
    );
  });

  await t.test("propagates 403 HttpError when caller does not have PATIENT role", async () => {
    apiClient.patch = async () => {
      throw new HttpError({
        message: "Only patients may update patient profile",
        status: 403,
        statusText: "Forbidden",
        data: { status: "error", message: "Only patients may update patient profile" },
        url: "/patients/me",
        method: "PATCH",
      });
    };

    await assert.rejects(
      async () => {
        await updatePatientProfile({ fullName: "Dr Trying To Update" });
      },
      (err) => {
        assert(HttpError.isHttpError(err));
        assert.strictEqual(err.status, 403);
        return true;
      }
    );
  });
});

