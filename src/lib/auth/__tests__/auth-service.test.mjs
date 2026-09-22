import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const { TokenStorage } = jiti("./src/lib/auth/token-storage.ts");
const { TokenRefreshManager } = jiti("./src/lib/auth/token-refresh.ts");
const {
  AuthService,
  isPatient,
  isDoctor,
  isAdmin,
} = jiti("./src/lib/auth/auth-service.ts");
const { HttpClient } = jiti("./src/lib/api/http-client.ts");

test("Authentication — TokenStorage", async (t) => {
  await t.test("stores, retrieves, and clears tokens", () => {
    const storage = new TokenStorage();

    assert.strictEqual(storage.hasTokens(), false);
    assert.strictEqual(storage.getAccessToken(), null);
    assert.strictEqual(storage.getRefreshToken(), null);

    storage.setTokens({
      accessToken: "access-123",
      refreshToken: "refresh-456",
    });

    assert.strictEqual(storage.hasTokens(), true);
    assert.strictEqual(storage.getAccessToken(), "access-123");
    assert.strictEqual(storage.getRefreshToken(), "refresh-456");

    storage.clearTokens();
    assert.strictEqual(storage.hasTokens(), false);
    assert.strictEqual(storage.getAccessToken(), null);
    assert.strictEqual(storage.getRefreshToken(), null);
  });
});

test("Authentication — Role Helpers", async (t) => {
  await t.test("correctly checks patient, doctor, and admin roles", () => {
    assert.strictEqual(isPatient("PATIENT"), true);
    assert.strictEqual(isPatient("DOCTOR"), false);
    assert.strictEqual(isPatient("ADMIN"), false);
    assert.strictEqual(isPatient(null), false);

    assert.strictEqual(isDoctor("DOCTOR"), true);
    assert.strictEqual(isDoctor("PATIENT"), false);
    assert.strictEqual(isDoctor("ADMIN"), false);

    assert.strictEqual(isAdmin("ADMIN"), true);
    assert.strictEqual(isAdmin("PATIENT"), false);
    assert.strictEqual(isAdmin("DOCTOR"), false);
  });
});

test("Authentication — Login Flow", async (t) => {
  await t.test("calls /auth/login, stores tokens, and fetches user profile", async () => {
    const storage = new TokenStorage();
    const calls = [];

    const mockFetch = async (url, options) => {
      calls.push({ url, method: options.method, body: options.body, headers: options.headers });

      if (url.includes("/auth/login")) {
        return new Response(
          JSON.stringify({
            status: "success",
            data: {
              accessToken: "new-access-jwt",
              refreshToken: "new-refresh-opaque",
              user: { id: "user-1", role: "PATIENT" },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (url.includes("/users/me")) {
        return new Response(
          JSON.stringify({
            status: "success",
            data: {
              id: "user-1",
              email: "patient@example.com",
              fullName: "Jane Doe",
              role: "PATIENT",
              isActive: true,
              createdAt: "2026-01-01T00:00:00Z",
              updatedAt: "2026-01-01T00:00:00Z",
              patient: { id: "p-1", dateOfBirth: "1995-06-15" },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      throw new Error(`Unexpected URL: ${url}`);
    };

    const client = new HttpClient({
      baseUrl: "http://api.test/api/v1",
      fetchFn: mockFetch,
    });

    const refreshManager = new TokenRefreshManager(storage, client);
    const service = new AuthService(storage, refreshManager, client);

    const result = await service.login({
      email: "patient@example.com",
      password: "password123",
    });

    assert.strictEqual(calls.length, 2);
    assert.strictEqual(calls[0].url, "http://api.test/api/v1/auth/login");
    assert.strictEqual(calls[1].url, "http://api.test/api/v1/users/me");

    // Verified tokens stored
    assert.strictEqual(storage.getAccessToken(), "new-access-jwt");
    assert.strictEqual(storage.getRefreshToken(), "new-refresh-opaque");

    // Verified returned data
    assert.strictEqual(result.user.id, "user-1");
    assert.strictEqual(result.user.role, "PATIENT");
    assert.strictEqual(result.profile.email, "patient@example.com");
    assert.strictEqual(result.profile.patient?.dateOfBirth, "1995-06-15");
  });
});

test("Authentication — Single-Flight Token Refresh Mutex", async (t) => {
  await t.test("coalesces concurrent refresh calls into one single API request", async () => {
    const storage = new TokenStorage();
    storage.setTokens({
      accessToken: "expired-access",
      refreshToken: "valid-refresh-1",
    });

    let refreshCallCount = 0;

    const mockFetch = async () => {
      refreshCallCount++;
      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 30));

      return new Response(
        JSON.stringify({
          status: "success",
          data: {
            accessToken: "rotated-access-2",
            refreshToken: "rotated-refresh-2",
            user: { id: "user-1", role: "DOCTOR" },
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };

    const client = new HttpClient({
      baseUrl: "http://api.test/api/v1",
      fetchFn: mockFetch,
    });

    const refreshManager = new TokenRefreshManager(storage, client);

    // Call refresh simultaneously 3 times
    const [res1, res2, res3] = await Promise.all([
      refreshManager.refresh(),
      refreshManager.refresh(),
      refreshManager.refresh(),
    ]);

    // Only one network request occurred
    assert.strictEqual(refreshCallCount, 1);
    assert.strictEqual(res1, "rotated-access-2");
    assert.strictEqual(res2, "rotated-access-2");
    assert.strictEqual(res3, "rotated-access-2");

    // Storage was updated
    assert.strictEqual(storage.getAccessToken(), "rotated-access-2");
    assert.strictEqual(storage.getRefreshToken(), "rotated-refresh-2");
  });

  await t.test("clears tokens and notifies listeners when refresh fails", async () => {
    const storage = new TokenStorage();
    storage.setTokens({
      accessToken: "expired-access",
      refreshToken: "revoked-refresh",
    });

    let sessionExpiredCalled = false;

    const mockFetch = async () => {
      return new Response(
        JSON.stringify({ status: "error", message: "Token revoked" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    };

    const client = new HttpClient({
      baseUrl: "http://api.test/api/v1",
      fetchFn: mockFetch,
    });

    const refreshManager = new TokenRefreshManager(storage, client);
    refreshManager.onSessionExpired(() => {
      sessionExpiredCalled = true;
    });

    const result = await refreshManager.refresh();

    assert.strictEqual(result, null);
    assert.strictEqual(storage.hasTokens(), false);
    assert.strictEqual(sessionExpiredCalled, true);
  });
});

test("Authentication — Logout Flow", async (t) => {
  await t.test("calls /auth/logout with refreshToken and clears tokens locally", async () => {
    const storage = new TokenStorage();
    storage.setTokens({
      accessToken: "my-access-jwt",
      refreshToken: "my-refresh-opaque",
    });

    let capturedRequest = null;

    const mockFetch = async (url, options) => {
      capturedRequest = { url, options };
      return new Response(null, { status: 204 });
    };

    const client = new HttpClient({
      baseUrl: "http://api.test/api/v1",
      fetchFn: mockFetch,
    });

    const refreshManager = new TokenRefreshManager(storage, client);
    const service = new AuthService(storage, refreshManager, client);

    await service.logout();

    assert.ok(capturedRequest);
    assert.strictEqual(capturedRequest.url, "http://api.test/api/v1/auth/logout");
    assert.strictEqual(capturedRequest.options.method, "POST");
    assert.strictEqual(
      capturedRequest.options.headers.get("Authorization"),
      "Bearer my-access-jwt"
    );
    assert.strictEqual(
      capturedRequest.options.body,
      JSON.stringify({ refreshToken: "my-refresh-opaque" })
    );

    // Tokens cleared
    assert.strictEqual(storage.hasTokens(), false);
  });

  await t.test("cleans local tokens even if server logout returns error", async () => {
    const storage = new TokenStorage();
    storage.setTokens({
      accessToken: "expired-access",
      refreshToken: "opaque-refresh",
    });

    const mockFetch = async () => {
      return new Response(JSON.stringify({ status: "error" }), { status: 500 });
    };

    const client = new HttpClient({
      baseUrl: "http://api.test/api/v1",
      fetchFn: mockFetch,
    });

    const refreshManager = new TokenRefreshManager(storage, client);
    const service = new AuthService(storage, refreshManager, client);

    await service.logout();

    assert.strictEqual(storage.hasTokens(), false);
  });
});

test("Authentication — Session Restoration", async (t) => {
  await t.test("restores session when access token is valid", async () => {
    const storage = new TokenStorage();
    storage.setTokens({
      accessToken: "valid-access",
      refreshToken: "valid-refresh",
    });

    const mockFetch = async (url) => {
      if (url.includes("/users/me")) {
        return new Response(
          JSON.stringify({
            status: "success",
            data: {
              id: "doc-1",
              email: "doctor@clinic.com",
              fullName: "Dr. Gregory House",
              role: "DOCTOR",
              isActive: true,
              createdAt: "2026-01-01T00:00:00Z",
              updatedAt: "2026-01-01T00:00:00Z",
              doctor: {
                id: "d-1",
                specialty: { id: "s-1", name: "Diagnostics" },
                bio: "Head of Diagnostic Medicine",
              },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      throw new Error("Unexpected fetch");
    };

    const client = new HttpClient({ fetchFn: mockFetch });
    const refreshManager = new TokenRefreshManager(storage, client);
    const service = new AuthService(storage, refreshManager, client);

    const session = await service.restoreSession();

    assert.ok(session);
    assert.strictEqual(session.user.id, "doc-1");
    assert.strictEqual(session.user.role, "DOCTOR");
    assert.strictEqual(session.profile.doctor?.specialty.name, "Diagnostics");
  });

  await t.test("rotates token and restores session when access token is expired (401)", async () => {
    const storage = new TokenStorage();
    storage.setTokens({
      accessToken: "expired-access",
      refreshToken: "valid-refresh",
    });

    let meCallCount = 0;

    const mockFetch = async (url) => {
      if (url.includes("/users/me")) {
        meCallCount++;
        if (meCallCount === 1) {
          // First call with expired token returns 401
          return new Response(
            JSON.stringify({ status: "error", message: "Token expired" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
          );
        }
        // Second call with rotated token succeeds
        return new Response(
          JSON.stringify({
            status: "success",
            data: {
              id: "admin-1",
              email: "admin@clinic.com",
              fullName: "System Admin",
              role: "ADMIN",
              isActive: true,
              createdAt: "2026-01-01T00:00:00Z",
              updatedAt: "2026-01-01T00:00:00Z",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (url.includes("/auth/refresh")) {
        return new Response(
          JSON.stringify({
            status: "success",
            data: {
              accessToken: "fresh-access",
              refreshToken: "fresh-refresh",
              user: { id: "admin-1", role: "ADMIN" },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      throw new Error(`Unexpected URL ${url}`);
    };

    const client = new HttpClient({ fetchFn: mockFetch });
    const refreshManager = new TokenRefreshManager(storage, client);
    const service = new AuthService(storage, refreshManager, client);

    const session = await service.restoreSession();

    assert.ok(session);
    assert.strictEqual(session.user.role, "ADMIN");
    assert.strictEqual(storage.getAccessToken(), "fresh-access");
    assert.strictEqual(storage.getRefreshToken(), "fresh-refresh");
  });

  await t.test("returns null when no tokens stored", async () => {
    const storage = new TokenStorage();
    const service = new AuthService(storage);
    const session = await service.restoreSession();
    assert.strictEqual(session, null);
  });
});

test("Authentication — HTTP Client 401 Automatic Retry", async (t) => {
  await t.test("automatically retries failed 401 request after refreshing token", async () => {
    let callIndex = 0;
    const requestHeaders = [];

    const mockFetch = async (_url, options) => {
      callIndex++;
      requestHeaders.push(options.headers.get("Authorization"));

      if (callIndex === 1) {
        // First request returns 401 Unauthorized
        return new Response(
          JSON.stringify({ status: "error", message: "Token expired" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      // Second request (retry) succeeds with updated token
      return new Response(
        JSON.stringify({ status: "success", data: ["appointment-1"] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };

    let refreshCalled = false;
    const client = new HttpClient({
      baseUrl: "http://api.test/api/v1",
      fetchFn: mockFetch,
      getAccessToken: () => "expired-token",
      refreshToken: async () => {
        refreshCalled = true;
        return "refreshed-token";
      },
    });

    const result = await client.get("/appointments/me");

    assert.strictEqual(refreshCalled, true);
    assert.deepStrictEqual(result, { status: "success", data: ["appointment-1"] });
    assert.strictEqual(requestHeaders[0], "Bearer expired-token");
    assert.strictEqual(requestHeaders[1], "Bearer refreshed-token");
  });
});

test("Authentication — Register Flow", async (t) => {
  await t.test("calls /auth/register with valid payload and returns created user data", async () => {
    let capturedUrl = "";
    let capturedBody = null;

    const mockFetch = async (url, options) => {
      capturedUrl = url;
      capturedBody = JSON.parse(options.body);

      return new Response(
        JSON.stringify({
          status: "success",
          data: { id: "user-new-123", role: "PATIENT" },
        }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      );
    };

    const client = new HttpClient({
      baseUrl: "http://api.test/api/v1",
      fetchFn: mockFetch,
    });

    const service = new AuthService(undefined, undefined, client);

    const result = await service.register({
      email: "jane.doe@example.com",
      password: "Password123",
      fullName: "Jane Doe",
      phone: "+201000000000",
      role: "PATIENT",
    });

    assert.strictEqual(capturedUrl, "http://api.test/api/v1/auth/register");
    assert.strictEqual(capturedBody.email, "jane.doe@example.com");
    assert.strictEqual(capturedBody.role, "PATIENT");
    assert.strictEqual(result.id, "user-new-123");
    assert.strictEqual(result.role, "PATIENT");
  });

  await t.test("passes specialtyId for doctor registration", async () => {
    let capturedBody = null;

    const mockFetch = async (_url, options) => {
      capturedBody = JSON.parse(options.body);
      return new Response(
        JSON.stringify({
          status: "success",
          data: { id: "doctor-new-456", role: "DOCTOR" },
        }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      );
    };

    const client = new HttpClient({
      baseUrl: "http://api.test/api/v1",
      fetchFn: mockFetch,
    });

    const service = new AuthService(undefined, undefined, client);

    const result = await service.register({
      email: "dr.smith@example.com",
      password: "DoctorPass123",
      fullName: "Dr. Smith",
      role: "DOCTOR",
      specialtyId: "spec-uuid-789",
    });

    assert.strictEqual(capturedBody.specialtyId, "spec-uuid-789");
    assert.strictEqual(capturedBody.role, "DOCTOR");
    assert.strictEqual(result.role, "DOCTOR");
  });
});


