import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const {
  HttpClient,
  buildUrl,
} = jiti("./src/lib/api/http-client.ts");
const { BaseApiService, baseApiService } = jiti(
  "./src/lib/api/base-api-service.ts"
);
const { HttpError } = jiti("./src/lib/api/http-error.ts");
const { normalizeApiError } = jiti("./src/lib/api/error-normalizer.ts");
const { DEFAULT_API_BASE_URL } = jiti("./src/config/api.ts");

test("Base API Service — Configuration & Contract Compliance", async (t) => {
  await t.test("default base URL is configured to http://localhost:3000/api/v1", () => {
    assert.strictEqual(DEFAULT_API_BASE_URL, "http://localhost:3000/api/v1");
  });

  await t.test("baseApiService singleton is initialized", () => {
    assert.ok(baseApiService instanceof BaseApiService);
  });
});

test("Network & Fetch Configuration — Headers and Content-Type", async (t) => {
  await t.test("explicitly sets Content-Type: application/json for POST, PUT, PATCH requests", async () => {
    const recordedCalls = [];
    const mockFetch = async (url, options) => {
      recordedCalls.push({
        method: options.method,
        headers: options.headers,
        body: options.body,
      });
      return new Response(JSON.stringify({ status: "success", data: {} }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const client = new HttpClient({
      baseUrl: "http://localhost:3000/api/v1",
      fetchFn: mockFetch,
    });
    const service = new BaseApiService(client);

    await service.post("/test-post", { key: "value" });
    await service.put("/test-put", { key: "value" });
    await service.patch("/test-patch", { key: "value" });

    assert.strictEqual(recordedCalls.length, 3);
    for (const call of recordedCalls) {
      assert.strictEqual(
        call.headers.get("content-type"),
        "application/json",
        `Expected application/json on ${call.method}`
      );
    }
  });

  await t.test("sends Authorization: Bearer <token> and does not rely on cookies", async () => {
    let capturedOptions;
    const mockFetch = async (url, options) => {
      capturedOptions = options;
      return new Response(JSON.stringify({ status: "success", data: {} }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const client = new HttpClient({
      baseUrl: "http://localhost:3000/api/v1",
      fetchFn: mockFetch,
      getAccessToken: () => "mock-access-bearer-token",
    });
    const service = new BaseApiService(client);

    await service.users.getMe();

    assert.ok(capturedOptions);
    assert.strictEqual(
      capturedOptions.headers.get("authorization"),
      "Bearer mock-access-bearer-token"
    );
    // Ensure credentials is not hardcoded to 'include'
    assert.notStrictEqual(capturedOptions.credentials, "include");
  });
});

test("Error Handling — Standardized Backend Error Format & token_expired Flow", async (t) => {
  await t.test("handles standardized error format { status: 'error', message, code, details }", async () => {
    const errorPayload = {
      status: "error",
      message: "Validation failed on fields",
      code: "validation_error",
      details: [
        { field: "email", message: "must be a valid email" },
        { field: "password", message: "must be at least 8 characters" },
      ],
    };

    const mockFetch = async () => {
      return new Response(JSON.stringify(errorPayload), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    };

    const client = new HttpClient({ fetchFn: mockFetch });
    const service = new BaseApiService(client);

    try {
      await service.post("/auth/register", {});
      assert.fail("Should have thrown HttpError");
    } catch (err) {
      assert.ok(HttpError.isHttpError(err));
      assert.strictEqual(err.code, "validation_error");
      assert.deepStrictEqual(err.details, errorPayload.details);

      const normalized = normalizeApiError(err);
      assert.strictEqual(normalized.kind, "VALIDATION");
      assert.strictEqual(normalized.code, "validation_error");
      assert.strictEqual(normalized.getFieldError("email"), "must be a valid email");
      assert.strictEqual(
        normalized.getFieldError("password"),
        "must be at least 8 characters"
      );
    }
  });

  await t.test("triggers token refresh flow when backend returns code: 'token_expired'", async () => {
    const requestCalls = [];
    let refreshInvoked = false;

    const mockFetch = async (url, options) => {
      requestCalls.push({ url, auth: options.headers.get("authorization") });

      // First call fails with code: "token_expired"
      if (requestCalls.length === 1) {
        return new Response(
          JSON.stringify({
            status: "error",
            code: "token_expired",
            message: "The access token has expired",
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Retry succeeds with new token
      return new Response(
        JSON.stringify({
          status: "success",
          data: { id: "u-123", email: "user@example.com" },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    };

    const client = new HttpClient({
      baseUrl: "http://localhost:3000/api/v1",
      fetchFn: mockFetch,
      getAccessToken: () => "initial-expired-token",
      refreshToken: async () => {
        refreshInvoked = true;
        return "brand-new-refreshed-token";
      },
    });
    const service = new BaseApiService(client);

    const result = await service.users.getMe();

    assert.strictEqual(refreshInvoked, true, "refreshToken should have been invoked");
    assert.deepStrictEqual(result, {
      status: "success",
      data: { id: "u-123", email: "user@example.com" },
    });
    assert.strictEqual(requestCalls.length, 2);
    assert.strictEqual(requestCalls[0].auth, "Bearer initial-expired-token");
    assert.strictEqual(requestCalls[1].auth, "Bearer brand-new-refreshed-token");
  });

  await t.test("triggers token refresh flow even if code: 'token_expired' arrives with 403 status", async () => {
    const requestCalls = [];
    let refreshInvoked = false;

    const mockFetch = async (url, options) => {
      requestCalls.push({ url, auth: options.headers.get("authorization") });

      if (requestCalls.length === 1) {
        return new Response(
          JSON.stringify({
            status: "error",
            code: "token_expired",
            message: "Token expired",
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          status: "success",
          data: [{ id: "appt-1" }],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    };

    const client = new HttpClient({
      baseUrl: "http://localhost:3000/api/v1",
      fetchFn: mockFetch,
      getAccessToken: () => "token-1",
      refreshToken: async () => {
        refreshInvoked = true;
        return "token-2";
      },
    });
    const service = new BaseApiService(client);

    const result = await service.appointments.listMy();
    assert.strictEqual(refreshInvoked, true);
    assert.deepStrictEqual(result.data, [{ id: "appt-1" }]);
  });
});

test("Base API Service — API Contract Endpoints Verification", async (t) => {
  const dispatched = [];
  const mockFetch = async (url, options) => {
    dispatched.push({
      url,
      method: options.method,
      body: options.body ? JSON.parse(options.body) : undefined,
    });
    return new Response(JSON.stringify({ status: "success", data: {} }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const client = new HttpClient({
    baseUrl: "http://localhost:3000/api/v1",
    fetchFn: mockFetch,
  });
  const service = new BaseApiService(client);

  await t.test("health.check calls GET /health", async () => {
    dispatched.length = 0;
    await service.health.check();
    assert.strictEqual(dispatched[0].url, "http://localhost:3000/api/v1/health");
    assert.strictEqual(dispatched[0].method, "GET");
  });

  await t.test("auth endpoints match contract", async () => {
    dispatched.length = 0;
    await service.auth.register({
      email: "test@example.com",
      password: "Password123",
      fullName: "Test User",
      role: "PATIENT",
    });
    assert.strictEqual(dispatched[0].url, "http://localhost:3000/api/v1/auth/register");
    assert.strictEqual(dispatched[0].method, "POST");

    await service.auth.login({
      email: "test@example.com",
      password: "Password123",
    });
    assert.strictEqual(dispatched[1].url, "http://localhost:3000/api/v1/auth/login");
    assert.strictEqual(dispatched[1].method, "POST");

    await service.auth.refresh({ refreshToken: "ref-123" });
    assert.strictEqual(dispatched[2].url, "http://localhost:3000/api/v1/auth/refresh");
    assert.strictEqual(dispatched[2].method, "POST");
    assert.deepStrictEqual(dispatched[2].body, { refreshToken: "ref-123" });

    await service.auth.logout({ refreshToken: "ref-123" });
    assert.strictEqual(dispatched[3].url, "http://localhost:3000/api/v1/auth/logout");
    assert.strictEqual(dispatched[3].method, "POST");
  });

  await t.test("doctors and availability endpoints match contract", async () => {
    dispatched.length = 0;
    await service.doctors.list({ page: 1, limit: 10, specialty: "cardiology" });
    assert.strictEqual(
      dispatched[0].url,
      "http://localhost:3000/api/v1/doctors?page=1&limit=10&specialty=cardiology"
    );
    assert.strictEqual(dispatched[0].method, "GET");

    await service.doctors.getById("doc-1");
    assert.strictEqual(dispatched[1].url, "http://localhost:3000/api/v1/doctors/doc-1");
    assert.strictEqual(dispatched[1].method, "GET");

    await service.doctors.updateMe({ bio: "Updated Bio" });
    assert.strictEqual(dispatched[2].url, "http://localhost:3000/api/v1/doctors/me");
    assert.strictEqual(dispatched[2].method, "PATCH");

    await service.doctors.getAvailability("doc-1");
    assert.strictEqual(
      dispatched[3].url,
      "http://localhost:3000/api/v1/doctors/doc-1/availability"
    );
    assert.strictEqual(dispatched[3].method, "GET");

    await service.doctors.createAvailability({
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "13:00",
      slotDurationMinutes: 30,
    });
    assert.strictEqual(
      dispatched[4].url,
      "http://localhost:3000/api/v1/doctors/me/availability"
    );
    assert.strictEqual(dispatched[4].method, "POST");

    await service.doctors.deleteAvailability("slot-1");
    assert.strictEqual(
      dispatched[5].url,
      "http://localhost:3000/api/v1/doctors/me/availability/slot-1"
    );
    assert.strictEqual(dispatched[5].method, "DELETE");
  });

  await t.test("specialties endpoints match contract", async () => {
    dispatched.length = 0;
    await service.specialties.list();
    assert.strictEqual(dispatched[0].url, "http://localhost:3000/api/v1/specialties");
    assert.strictEqual(dispatched[0].method, "GET");

    await service.specialties.create({ nameEn: "Dental", nameAr: "أسنان" });
    assert.strictEqual(dispatched[1].url, "http://localhost:3000/api/v1/specialties");
    assert.strictEqual(dispatched[1].method, "POST");

    await service.specialties.getById("spec-1");
    assert.strictEqual(dispatched[2].url, "http://localhost:3000/api/v1/specialties/spec-1");
    assert.strictEqual(dispatched[2].method, "GET");

    await service.specialties.update("spec-1", { nameEn: "Dentistry" });
    assert.strictEqual(dispatched[3].url, "http://localhost:3000/api/v1/specialties/spec-1");
    assert.strictEqual(dispatched[3].method, "PATCH");

    await service.specialties.delete("spec-1");
    assert.strictEqual(dispatched[4].url, "http://localhost:3000/api/v1/specialties/spec-1");
    assert.strictEqual(dispatched[4].method, "DELETE");
  });

  await t.test("appointments endpoints match contract", async () => {
    dispatched.length = 0;
    await service.appointments.create({
      doctorId: "doc-1",
      slotTime: "2026-10-01T10:00:00Z",
      notes: "Routine checkup",
    });
    assert.strictEqual(dispatched[0].url, "http://localhost:3000/api/v1/appointments");
    assert.strictEqual(dispatched[0].method, "POST");

    await service.appointments.listMy({ page: 2, limit: 5 });
    assert.strictEqual(
      dispatched[1].url,
      "http://localhost:3000/api/v1/appointments/me?page=2&limit=5"
    );
    assert.strictEqual(dispatched[1].method, "GET");

    await service.appointments.getById("appt-1");
    assert.strictEqual(
      dispatched[2].url,
      "http://localhost:3000/api/v1/appointments/appt-1"
    );
    assert.strictEqual(dispatched[2].method, "GET");

    await service.appointments.updateStatus("appt-1", { status: "CONFIRMED" });
    assert.strictEqual(
      dispatched[3].url,
      "http://localhost:3000/api/v1/appointments/appt-1/status"
    );
    assert.strictEqual(dispatched[3].method, "PATCH");
  });

  await t.test("admin endpoints match contract", async () => {
    dispatched.length = 0;
    await service.admin.listUsers({ page: 1, limit: 20, role: "DOCTOR" });
    assert.strictEqual(
      dispatched[0].url,
      "http://localhost:3000/api/v1/admin/users?page=1&limit=20&role=DOCTOR"
    );
    assert.strictEqual(dispatched[0].method, "GET");

    await service.admin.updateUserStatus("usr-1", { isActive: false });
    assert.strictEqual(
      dispatched[1].url,
      "http://localhost:3000/api/v1/admin/users/usr-1"
    );
    assert.strictEqual(dispatched[1].method, "PATCH");

    await service.admin.listAppointments({
      page: 1,
      limit: 10,
      status: "CONFIRMED",
    });
    assert.strictEqual(
      dispatched[2].url,
      "http://localhost:3000/api/v1/admin/appointments?page=1&limit=10&status=CONFIRMED"
    );
    assert.strictEqual(dispatched[2].method, "GET");
  });

  await t.test("unwrap helper extracts .data payload correctly", async () => {
    const wrappedPromise = Promise.resolve({
      status: "success",
      data: { result: "test-data" },
    });
    const data = await BaseApiService.unwrap(wrappedPromise);
    assert.deepStrictEqual(data, { result: "test-data" });
  });
});

