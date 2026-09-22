import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const {
  makeQueryClient,
  getQueryClient,
  shouldRetryQuery,
  DEFAULT_QUERY_CONFIG,
  DEFAULT_MUTATION_CONFIG,
  queryKeys,
} = jiti("./src/lib/query/index.ts");

const { HttpError } = jiti("./src/lib/api/http-error.ts");

test("TanStack Query — Default Configuration", async (t) => {
  await t.test("sets correct staleTime, gcTime, and refetchOnWindowFocus", () => {
    assert.strictEqual(DEFAULT_QUERY_CONFIG.staleTime, 60_000); // 1 min
    assert.strictEqual(DEFAULT_QUERY_CONFIG.gcTime, 300_000); // 5 min
    assert.strictEqual(DEFAULT_QUERY_CONFIG.refetchOnWindowFocus, false);
  });

  await t.test("mutations never auto-retry by default", () => {
    assert.strictEqual(DEFAULT_MUTATION_CONFIG.retry, false);
  });

  await t.test("makeQueryClient creates a configured client instance", () => {
    const client = makeQueryClient();
    const queryDefaults = client.getDefaultOptions().queries;
    const mutationDefaults = client.getDefaultOptions().mutations;

    assert.strictEqual(queryDefaults?.staleTime, 60_000);
    assert.strictEqual(queryDefaults?.gcTime, 300_000);
    assert.strictEqual(queryDefaults?.refetchOnWindowFocus, false);
    assert.strictEqual(mutationDefaults?.retry, false);
  });

  await t.test("getQueryClient returns a valid client in SSR environment", () => {
    const client = getQueryClient();
    assert.ok(client);
    assert.strictEqual(client.getDefaultOptions().queries?.staleTime, 60_000);
  });
});

test("TanStack Query — Status-Aware Retry Policy", async (t) => {
  await t.test("stops retrying when failureCount >= 2", () => {
    const error500 = new HttpError({
      message: "Server Error",
      status: 500,
      statusText: "Internal Server Error",
      data: null,
      url: "http://api.test",
      method: "GET",
    });

    assert.strictEqual(shouldRetryQuery(0, error500), true);
    assert.strictEqual(shouldRetryQuery(1, error500), true);
    assert.strictEqual(shouldRetryQuery(2, error500), false);
    assert.strictEqual(shouldRetryQuery(3, error500), false);
  });

  await t.test("never retries 4xx client errors (400, 401, 403, 404, 409, 422)", () => {
    const clientStatuses = [400, 401, 403, 404, 409, 422];

    for (const status of clientStatuses) {
      const error = new HttpError({
        message: `Client error ${status}`,
        status,
        statusText: "Client Error",
        data: null,
        url: "http://api.test",
        method: "GET",
      });

      assert.strictEqual(
        shouldRetryQuery(0, error),
        false,
        `Expected status ${status} to NOT retry on attempt 0`
      );
    }
  });

  await t.test("allows retrying 429 rate limit up to threshold", () => {
    const rateLimitError = new HttpError({
      message: "Too Many Requests",
      status: 429,
      statusText: "Too Many Requests",
      data: null,
      url: "http://api.test",
      method: "GET",
    });

    assert.strictEqual(shouldRetryQuery(0, rateLimitError), true);
    assert.strictEqual(shouldRetryQuery(1, rateLimitError), true);
    assert.strictEqual(shouldRetryQuery(2, rateLimitError), false);
  });

  await t.test("allows retrying transient 5xx errors and network errors", () => {
    const serverError = new HttpError({
      message: "Internal Server Error",
      status: 500,
      statusText: "Server Error",
      data: null,
      url: "http://api.test",
      method: "GET",
    });

    const networkError = new TypeError("Failed to fetch");

    assert.strictEqual(shouldRetryQuery(0, serverError), true);
    assert.strictEqual(shouldRetryQuery(0, networkError), true);
  });
});

test("TanStack Query — Query Keys Factory", async (t) => {
  await t.test("generates hierarchical auth keys", () => {
    assert.deepStrictEqual(queryKeys.auth.all, ["auth"]);
    assert.deepStrictEqual(queryKeys.auth.me(), ["auth", "me"]);
  });

  await t.test("generates hierarchical doctor keys", () => {
    assert.deepStrictEqual(queryKeys.doctors.all, ["doctors"]);
    assert.deepStrictEqual(queryKeys.doctors.lists(), ["doctors", "list"]);
    assert.deepStrictEqual(queryKeys.doctors.list({ specialty: "cardiology" }), [
      "doctors",
      "list",
      { specialty: "cardiology" },
    ]);
    assert.deepStrictEqual(queryKeys.doctors.details(), ["doctors", "detail"]);
    assert.deepStrictEqual(queryKeys.doctors.detail("doc-123"), [
      "doctors",
      "detail",
      "doc-123",
    ]);
    assert.deepStrictEqual(
      queryKeys.doctors.availability("doc-123", "2026-09-25"),
      ["doctors", "availability", "doc-123", "2026-09-25"]
    );
  });

  await t.test("generates hierarchical specialty keys", () => {
    assert.deepStrictEqual(queryKeys.specialties.all, ["specialties"]);
    assert.deepStrictEqual(queryKeys.specialties.lists(), [
      "specialties",
      "list",
    ]);
    assert.deepStrictEqual(queryKeys.specialties.detail("spec-1"), [
      "specialties",
      "detail",
      "spec-1",
    ]);
  });

  await t.test("generates hierarchical appointment keys", () => {
    assert.deepStrictEqual(queryKeys.appointments.all, ["appointments"]);
    assert.deepStrictEqual(
      queryKeys.appointments.mine({ status: "CONFIRMED" }),
      ["appointments", "me", { status: "CONFIRMED" }]
    );
    assert.deepStrictEqual(queryKeys.appointments.detail("appt-99"), [
      "appointments",
      "detail",
      "appt-99",
    ]);
  });

  await t.test("generates hierarchical admin keys", () => {
    assert.deepStrictEqual(queryKeys.admin.all, ["admin"]);
    assert.deepStrictEqual(queryKeys.admin.users({ page: 1 }), [
      "admin",
      "users",
      { page: 1 },
    ]);
    assert.deepStrictEqual(queryKeys.admin.appointments({ status: "PENDING" }), [
      "admin",
      "appointments",
      { status: "PENDING" },
    ]);
  });
});

