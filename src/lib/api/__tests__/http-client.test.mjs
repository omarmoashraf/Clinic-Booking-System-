import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const {
  HttpClient,
  apiClient,
  buildUrl,
  serializeQueryParams,
  appendQueryParams,
} = jiti("./src/lib/api/http-client.ts");

const { HttpError } = jiti("./src/lib/api/http-error.ts");
const { HTTP_HEADERS, CONTENT_TYPES } = jiti(
  "./src/config/api.ts"
);

test("HTTP Client — URL Building & Query Parameters", async (t) => {
  await t.test("buildUrl normalizes base URL and endpoint slashes", () => {
    assert.strictEqual(
      buildUrl("http://localhost:3000/api/v1", "/doctors"),
      "http://localhost:3000/api/v1/doctors"
    );
    assert.strictEqual(
      buildUrl("http://localhost:3000/api/v1/", "doctors"),
      "http://localhost:3000/api/v1/doctors"
    );
    assert.strictEqual(
      buildUrl("http://localhost:3000/api/v1/", "/doctors"),
      "http://localhost:3000/api/v1/doctors"
    );
    assert.strictEqual(
      buildUrl("http://localhost:3000/api/v1", "doctors"),
      "http://localhost:3000/api/v1/doctors"
    );
  });

  await t.test("buildUrl preserves absolute URLs regardless of base", () => {
    assert.strictEqual(
      buildUrl("http://localhost:3000/api/v1", "https://external.example.com/api"),
      "https://external.example.com/api"
    );
    assert.strictEqual(
      buildUrl("http://localhost:3000/api/v1", "http://external.example.com/api"),
      "http://external.example.com/api"
    );
  });

  await t.test("buildUrl works with relative base path", () => {
    assert.strictEqual(buildUrl("/api/v1", "/doctors"), "/api/v1/doctors");
    assert.strictEqual(buildUrl("/api/v1/", "doctors"), "/api/v1/doctors");
  });

  await t.test("serializeQueryParams handles basic types and omits null/undefined", () => {
    const params = {
      page: 1,
      limit: 10,
      specialty: "cardiology",
      active: true,
      emptyField: undefined,
      nullField: null,
    };
    const serialized = serializeQueryParams(params);
    assert.strictEqual(
      serialized,
      "?page=1&limit=10&specialty=cardiology&active=true"
    );
  });

  await t.test("serializeQueryParams handles repeated array values", () => {
    const params = {
      status: ["CONFIRMED", "PENDING"],
      role: "PATIENT",
    };
    const serialized = serializeQueryParams(params);
    assert.strictEqual(
      serialized,
      "?status=CONFIRMED&status=PENDING&role=PATIENT"
    );
  });

  await t.test("serializeQueryParams properly URL-encodes special characters", () => {
    const params = {
      search: "Dr. John & Jane",
      filter: "a=b",
    };
    const serialized = serializeQueryParams(params);
    assert.strictEqual(
      serialized,
      "?search=Dr.+John+%26+Jane&filter=a%3Db"
    );
  });

  await t.test("appendQueryParams safely appends to URLs with or without existing query", () => {
    assert.strictEqual(
      appendQueryParams("http://localhost:3000/api/v1/doctors", { page: 1 }),
      "http://localhost:3000/api/v1/doctors?page=1"
    );
    assert.strictEqual(
      appendQueryParams("http://localhost:3000/api/v1/doctors?sort=asc", { page: 2 }),
      "http://localhost:3000/api/v1/doctors?sort=asc&page=2"
    );
    assert.strictEqual(
      appendQueryParams("http://localhost:3000/api/v1/doctors", {}),
      "http://localhost:3000/api/v1/doctors"
    );
  });
});

test("HTTP Client — Header Management & Authorization", async (t) => {
  await t.test("sends default Accept header and merges custom headers", async () => {
    let capturedRequest;
    const mockFetch = async (url, options) => {
      capturedRequest = { url, options };
      return new Response(JSON.stringify({ status: "success", data: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const client = new HttpClient({
      baseUrl: "http://test.local/api/v1",
      defaultHeaders: { "X-Custom-Global": "global-val" },
      fetchFn: mockFetch,
    });

    await client.get("/test", {
      headers: { "X-Request-Specific": "request-val" },
    });

    assert.ok(capturedRequest);
    const headers = capturedRequest.options.headers;
    assert.strictEqual(headers.get(HTTP_HEADERS.ACCEPT), CONTENT_TYPES.JSON);
    assert.strictEqual(headers.get("X-Custom-Global"), "global-val");
    assert.strictEqual(headers.get("X-Request-Specific"), "request-val");
  });

  await t.test("automatically injects Authorization Bearer header when token provided in config", async () => {
    let capturedHeaders;
    const mockFetch = async (_url, options) => {
      capturedHeaders = options.headers;
      return new Response(JSON.stringify({ status: "success" }), { status: 200 });
    };

    const client = new HttpClient({
      baseUrl: "http://test.local/api/v1",
      fetchFn: mockFetch,
    });

    await client.get("/protected", { token: "my-jwt-access-token" });

    assert.strictEqual(
      capturedHeaders.get(HTTP_HEADERS.AUTHORIZATION),
      "Bearer my-jwt-access-token"
    );
  });

  await t.test("calls getAccessToken() hook when request does not specify token", async () => {
    let capturedHeaders;
    const mockFetch = async (_url, options) => {
      capturedHeaders = options.headers;
      return new Response(JSON.stringify({ status: "success" }), { status: 200 });
    };

    const client = new HttpClient({
      baseUrl: "http://test.local/api/v1",
      getAccessToken: async () => "hook-resolved-token",
      fetchFn: mockFetch,
    });

    await client.get("/protected");

    assert.strictEqual(
      capturedHeaders.get(HTTP_HEADERS.AUTHORIZATION),
      "Bearer hook-resolved-token"
    );
  });

  await t.test("automatically sets Content-Type to application/json for object bodies", async () => {
    let capturedHeaders;
    let capturedBody;
    const mockFetch = async (_url, options) => {
      capturedHeaders = options.headers;
      capturedBody = options.body;
      return new Response(JSON.stringify({ status: "success" }), { status: 200 });
    };

    const client = new HttpClient({
      baseUrl: "http://test.local/api/v1",
      fetchFn: mockFetch,
    });

    await client.post("/auth/login", { email: "test@example.com", password: "password123" });

    assert.strictEqual(
      capturedHeaders.get(HTTP_HEADERS.CONTENT_TYPE),
      CONTENT_TYPES.JSON
    );
    assert.strictEqual(
      capturedBody,
      JSON.stringify({ email: "test@example.com", password: "password123" })
    );
  });
});

test("HTTP Client — Request Methods & Body Handling", async (t) => {
  await t.test("dispatches GET, POST, PUT, PATCH, DELETE with correct methods", async () => {
    const capturedMethods = [];
    const mockFetch = async (_url, options) => {
      capturedMethods.push(options.method);
      return new Response(JSON.stringify({ status: "success", data: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const client = new HttpClient({
      baseUrl: "http://test.local/api/v1",
      fetchFn: mockFetch,
    });

    await client.get("/doctors");
    await client.post("/doctors", { name: "Dr. Smith" });
    await client.put("/doctors/1", { name: "Dr. Smith Jr." });
    await client.patch("/doctors/1", { bio: "Updated bio" });
    await client.delete("/doctors/1");

    assert.deepStrictEqual(capturedMethods, [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
    ]);
  });
});

test("HTTP Client — Response Parsing", async (t) => {
  await t.test("parses JSON responses correctly", async () => {
    const payload = {
      status: "success",
      data: { id: "123", fullName: "Jane Doe", role: "PATIENT" },
    };

    const mockFetch = async () =>
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    const client = new HttpClient({ fetchFn: mockFetch });
    const result = await client.get("/users/me");

    assert.deepStrictEqual(result, payload);
  });

  await t.test("handles 204 No Content without error, returning undefined", async () => {
    const mockFetch = async () =>
      new Response(null, {
        status: 204,
        statusText: "No Content",
      });

    const client = new HttpClient({ fetchFn: mockFetch });
    const result = await client.post("/auth/logout", { refreshToken: "opaque-str" });

    assert.strictEqual(result, undefined);
  });

  await t.test("handles 205 Reset Content returning undefined", async () => {
    const mockFetch = async () =>
      new Response(null, {
        status: 205,
        statusText: "Reset Content",
      });

    const client = new HttpClient({ fetchFn: mockFetch });
    const result = await client.delete("/session");

    assert.strictEqual(result, undefined);
  });

  await t.test("supports responseType: 'text'", async () => {
    const mockFetch = async () =>
      new Response("plain text response", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });

    const client = new HttpClient({ fetchFn: mockFetch });
    const result = await client.get("/health", { responseType: "text" });

    assert.strictEqual(result, "plain text response");
  });
});

test("HTTP Client — Error Handling & Status Classification", async (t) => {
  await t.test("throws HttpError for 400 Validation Error", async () => {
    const errorBody = {
      status: "validation_error",
      message: "Request validation failed",
      errors: [{ field: "email", message: "must be a valid email" }],
    };

    const mockFetch = async () =>
      new Response(JSON.stringify(errorBody), {
        status: 400,
        statusText: "Bad Request",
        headers: { "Content-Type": "application/json" },
      });

    const client = new HttpClient({ fetchFn: mockFetch });

    await assert.rejects(
      async () => {
        await client.post("/auth/register", { email: "invalid" });
      },
      (err) => {
        assert.ok(HttpError.isHttpError(err));
        assert.strictEqual(err.status, 400);
        assert.strictEqual(err.message, "Request validation failed");
        assert.strictEqual(err.isClientError, true);
        assert.strictEqual(err.isValidationError, true);
        assert.deepStrictEqual(err.data, errorBody);
        return true;
      }
    );
  });

  await t.test("throws HttpError for 401 Unauthorized", async () => {
    const errorBody = {
      status: "error",
      message: "Invalid email or password",
    };

    const mockFetch = async () =>
      new Response(JSON.stringify(errorBody), {
        status: 401,
        statusText: "Unauthorized",
        headers: { "Content-Type": "application/json" },
      });

    const client = new HttpClient({ fetchFn: mockFetch });

    await assert.rejects(
      async () => {
        await client.post("/auth/login", { email: "wrong@test.com", password: "wrong" });
      },
      (err) => {
        assert.ok(HttpError.isHttpError(err));
        assert.strictEqual(err.status, 401);
        assert.strictEqual(err.message, "Invalid email or password");
        assert.strictEqual(err.isUnauthorized, true);
        return true;
      }
    );
  });

  await t.test("throws HttpError for 403 Forbidden", async () => {
    const errorBody = {
      status: "error",
      message: "Forbidden resource",
    };

    const mockFetch = async () =>
      new Response(JSON.stringify(errorBody), {
        status: 403,
        statusText: "Forbidden",
        headers: { "Content-Type": "application/json" },
      });

    const client = new HttpClient({ fetchFn: mockFetch });

    await assert.rejects(
      async () => {
        await client.get("/admin/users");
      },
      (err) => {
        assert.ok(HttpError.isHttpError(err));
        assert.strictEqual(err.status, 403);
        assert.strictEqual(err.isForbidden, true);
        return true;
      }
    );
  });

  await t.test("throws HttpError for 404 Not Found", async () => {
    const errorBody = {
      status: "error",
      message: "Doctor not found",
    };

    const mockFetch = async () =>
      new Response(JSON.stringify(errorBody), {
        status: 404,
        statusText: "Not Found",
        headers: { "Content-Type": "application/json" },
      });

    const client = new HttpClient({ fetchFn: mockFetch });

    await assert.rejects(
      async () => {
        await client.get("/doctors/non-existent-id");
      },
      (err) => {
        assert.ok(HttpError.isHttpError(err));
        assert.strictEqual(err.status, 404);
        assert.strictEqual(err.isNotFound, true);
        return true;
      }
    );
  });

  await t.test("throws HttpError for 409 Conflict", async () => {
    const errorBody = {
      status: "error",
      message: "Appointment slot is already booked",
    };

    const mockFetch = async () =>
      new Response(JSON.stringify(errorBody), {
        status: 409,
        statusText: "Conflict",
        headers: { "Content-Type": "application/json" },
      });

    const client = new HttpClient({ fetchFn: mockFetch });

    await assert.rejects(
      async () => {
        await client.post("/appointments", { slotId: "123" });
      },
      (err) => {
        assert.ok(HttpError.isHttpError(err));
        assert.strictEqual(err.status, 409);
        assert.strictEqual(err.isConflict, true);
        return true;
      }
    );
  });

  await t.test("throws HttpError for 429 Rate Limit", async () => {
    const errorBody = {
      message: "Too many requests. Please try again later.",
    };

    const mockFetch = async () =>
      new Response(JSON.stringify(errorBody), {
        status: 429,
        statusText: "Too Many Requests",
        headers: { "Content-Type": "application/json" },
      });

    const client = new HttpClient({ fetchFn: mockFetch });

    await assert.rejects(
      async () => {
        await client.post("/auth/login", { email: "test@example.com", password: "pwd" });
      },
      (err) => {
        assert.ok(HttpError.isHttpError(err));
        assert.strictEqual(err.status, 429);
        assert.strictEqual(err.isRateLimited, true);
        assert.strictEqual(err.message, "Too many requests. Please try again later.");
        return true;
      }
    );
  });

  await t.test("throws HttpError for 500 Server Error", async () => {
    const mockFetch = async () =>
      new Response("Internal Server Error", {
        status: 500,
        statusText: "Internal Server Error",
        headers: { "Content-Type": "text/plain" },
      });

    const client = new HttpClient({ fetchFn: mockFetch });

    await assert.rejects(
      async () => {
        await client.get("/fail");
      },
      (err) => {
        assert.ok(HttpError.isHttpError(err));
        assert.strictEqual(err.status, 500);
        assert.strictEqual(err.isServerError, true);
        return true;
      }
    );
  });
});

test("HTTP Client — Interceptors & Hooks", async (t) => {
  await t.test("executes onRequest and onResponse hooks", async () => {
    const hookTrack = [];

    const mockFetch = async () => {
      hookTrack.push("fetch");
      return new Response(JSON.stringify({ status: "success" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const client = new HttpClient({
      baseUrl: "http://test.local/api/v1",
      fetchFn: mockFetch,
      onRequest: (config) => {
        hookTrack.push("onRequest");
        return {
          ...config,
          headers: { ...config.headers, "X-Intercepted": "yes" },
        };
      },
      onResponse: (res) => {
        hookTrack.push("onResponse");
        return res;
      },
    });

    await client.get("/test");

    assert.deepStrictEqual(hookTrack, ["onRequest", "fetch", "onResponse"]);
  });

  await t.test("executes onError hook when request fails", async () => {
    let capturedError = null;

    const mockFetch = async () =>
      new Response(JSON.stringify({ message: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });

    const client = new HttpClient({
      baseUrl: "http://test.local/api/v1",
      fetchFn: mockFetch,
      onError: (err) => {
        capturedError = err;
      },
    });

    await assert.rejects(async () => {
      await client.get("/forbidden");
    });

    assert.ok(capturedError);
    assert.strictEqual(capturedError.status, 403);
  });
});

test("HTTP Client — Timeout & AbortSignal", async (t) => {
  await t.test("aborts request when timeout triggers", async () => {
    const mockFetch = (_url, options) => {
      return new Promise((_resolve, reject) => {
        if (options.signal) {
          options.signal.addEventListener("abort", () => {
            reject(new Error("Aborted by signal"));
          });
        }
      });
    };

    const client = new HttpClient({
      fetchFn: mockFetch,
      timeoutMs: 50, // 50ms timeout
    });

    await assert.rejects(
      async () => {
        await client.get("/slow-endpoint");
      },
      (err) => {
        assert.match(err.message, /Aborted/);
        return true;
      }
    );
  });

  await t.test("aborts request when caller provides already aborted signal", async () => {
    const controller = new AbortController();
    controller.abort(new Error("Caller aborted"));

    const mockFetch = async () =>
      new Response(JSON.stringify({ status: "success" }), { status: 200 });

    const client = new HttpClient({ fetchFn: mockFetch });

    await assert.rejects(
      async () => {
        await client.get("/endpoint", { signal: controller.signal });
      },
      (err) => {
        assert.match(err.message, /Caller aborted/);
        return true;
      }
    );
  });
});

test("HTTP Client — Default Singleton Instance", async (t) => {
  await t.test("apiClient instance is initialized with DEFAULT_API_BASE_URL", () => {
    assert.ok(apiClient instanceof HttpClient);
  });
});

