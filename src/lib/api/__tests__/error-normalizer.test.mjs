import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const {
  NormalizedApiError,
  normalizeApiError,
} = jiti("./src/lib/api/error-normalizer.ts");

const { HttpError } = jiti("./src/lib/api/http-error.ts");

test("API Error Normalization — Status 400 Validation Error", async (t) => {
  await t.test("normalizes API_CONTRACT validation error shape with errors array", () => {
    const errorPayload = {
      status: "validation_error",
      message: "Request validation failed",
      errors: [
        { field: "email", message: "must be a valid email" },
        { field: "password", message: "must be at least 8 characters" },
      ],
    };

    const httpError = new HttpError({
      message: "Request validation failed",
      status: 400,
      statusText: "Bad Request",
      data: errorPayload,
      url: "http://localhost:3000/api/v1/auth/register",
      method: "POST",
    });

    const normalized = normalizeApiError(httpError);

    assert.ok(NormalizedApiError.isNormalizedApiError(normalized));
    assert.strictEqual(normalized.kind, "VALIDATION");
    assert.strictEqual(normalized.status, 400);
    assert.strictEqual(normalized.message, "Request validation failed");
    assert.strictEqual(normalized.i18nKey, "errors.validationFailed");
    assert.strictEqual(normalized.isValidation, true);
    assert.strictEqual(normalized.hasFieldErrors(), true);
    assert.strictEqual(normalized.getFieldError("email"), "must be a valid email");
    assert.strictEqual(normalized.getFieldError("password"), "must be at least 8 characters");
    assert.strictEqual(normalized.getFieldError("unknown"), undefined);
    assert.deepStrictEqual(normalized.getFieldErrors("email"), ["must be a valid email"]);
  });

  await t.test("normalizes generic 400 without validation fields as UNKNOWN", () => {
    const httpError = new HttpError({
      message: "Malformed query string",
      status: 400,
      statusText: "Bad Request",
      data: { status: "error", message: "Malformed query string" },
      url: "http://localhost:3000/api/v1/doctors",
      method: "GET",
    });

    const normalized = normalizeApiError(httpError);

    assert.strictEqual(normalized.kind, "UNKNOWN");
    assert.strictEqual(normalized.status, 400);
    assert.strictEqual(normalized.message, "Malformed query string");
    assert.strictEqual(normalized.i18nKey, "errors.generic");
    assert.strictEqual(normalized.hasFieldErrors(), false);
  });
});

test("API Error Normalization — Status 401 Unauthorized", async (t) => {
  await t.test("normalizes 401 with backend message and auth flags", () => {
    const httpError = new HttpError({
      message: "Invalid email or password",
      status: 401,
      statusText: "Unauthorized",
      data: { status: "error", message: "Invalid email or password" },
      url: "http://localhost:3000/api/v1/auth/login",
      method: "POST",
    });

    const normalized = normalizeApiError(httpError);

    assert.strictEqual(normalized.kind, "UNAUTHORIZED");
    assert.strictEqual(normalized.status, 401);
    assert.strictEqual(normalized.message, "Invalid email or password");
    assert.strictEqual(normalized.i18nKey, "errors.unauthorized");
    assert.strictEqual(normalized.isUnauthorized, true);
    assert.strictEqual(normalized.isAuthError, true);
  });
});

test("API Error Normalization — Status 403 Forbidden", async (t) => {
  await t.test("normalizes 403 with forbidden kind and auth flags", () => {
    const httpError = new HttpError({
      message: "Forbidden",
      status: 403,
      statusText: "Forbidden",
      data: { status: "error", message: "Access denied" },
      url: "http://localhost:3000/api/v1/admin/users",
      method: "GET",
    });

    const normalized = normalizeApiError(httpError);

    assert.strictEqual(normalized.kind, "FORBIDDEN");
    assert.strictEqual(normalized.status, 403);
    assert.strictEqual(normalized.message, "Access denied");
    assert.strictEqual(normalized.i18nKey, "errors.forbidden");
    assert.strictEqual(normalized.isForbidden, true);
    assert.strictEqual(normalized.isAuthError, true);
  });
});

test("API Error Normalization — Status 404 Not Found", async (t) => {
  await t.test("normalizes 404 with notFound kind", () => {
    const httpError = new HttpError({
      message: "Doctor not found",
      status: 404,
      statusText: "Not Found",
      data: { status: "error", message: "Doctor not found" },
      url: "http://localhost:3000/api/v1/doctors/123",
      method: "GET",
    });

    const normalized = normalizeApiError(httpError);

    assert.strictEqual(normalized.kind, "NOT_FOUND");
    assert.strictEqual(normalized.status, 404);
    assert.strictEqual(normalized.message, "Doctor not found");
    assert.strictEqual(normalized.i18nKey, "errors.notFound");
    assert.strictEqual(normalized.isNotFound, true);
  });
});

test("API Error Normalization — Status 409 Conflict", async (t) => {
  await t.test("normalizes 409 with conflict kind", () => {
    const httpError = new HttpError({
      message: "Appointment slot is already booked",
      status: 409,
      statusText: "Conflict",
      data: { status: "error", message: "Appointment slot is already booked" },
      url: "http://localhost:3000/api/v1/appointments",
      method: "POST",
    });

    const normalized = normalizeApiError(httpError);

    assert.strictEqual(normalized.kind, "CONFLICT");
    assert.strictEqual(normalized.status, 409);
    assert.strictEqual(normalized.message, "Appointment slot is already booked");
    assert.strictEqual(normalized.i18nKey, "errors.conflict");
    assert.strictEqual(normalized.isConflict, true);
  });
});

test("API Error Normalization — Status 422 Unprocessable Entity", async (t) => {
  await t.test("normalizes 422 as validation kind with field errors", () => {
    const httpError = new HttpError({
      message: "Semantic validation failure",
      status: 422,
      statusText: "Unprocessable Entity",
      data: {
        status: "validation_error",
        message: "Invalid date",
        errors: [{ field: "dateOfBirth", message: "Date must be in the past" }],
      },
      url: "http://localhost:3000/api/v1/patients/profile",
      method: "PUT",
    });

    const normalized = normalizeApiError(httpError);

    assert.strictEqual(normalized.kind, "VALIDATION");
    assert.strictEqual(normalized.status, 422);
    assert.strictEqual(normalized.message, "Invalid date");
    assert.strictEqual(normalized.i18nKey, "errors.validationFailed");
    assert.strictEqual(normalized.isValidation, true);
    assert.strictEqual(normalized.getFieldError("dateOfBirth"), "Date must be in the past");
  });
});

test("API Error Normalization — Status 429 Rate Limit", async (t) => {
  await t.test("normalizes 429 rate limit format from API_CONTRACT.md", () => {
    const httpError = new HttpError({
      message: "Too many requests. Please try again later.",
      status: 429,
      statusText: "Too Many Requests",
      data: { message: "Too many requests. Please try again later." },
      url: "http://localhost:3000/api/v1/auth/login",
      method: "POST",
    });

    const normalized = normalizeApiError(httpError);

    assert.strictEqual(normalized.kind, "RATE_LIMITED");
    assert.strictEqual(normalized.status, 429);
    assert.strictEqual(normalized.message, "Too many requests. Please try again later.");
    assert.strictEqual(normalized.i18nKey, "errors.rateLimit");
    assert.strictEqual(normalized.isRateLimited, true);
  });
});

test("API Error Normalization — Status 500-599 Server Errors", async (t) => {
  await t.test("normalizes 500 internal server error", () => {
    const httpError = new HttpError({
      message: "Internal Server Error",
      status: 500,
      statusText: "Internal Server Error",
      data: null,
      url: "http://localhost:3000/api/v1/doctors",
      method: "GET",
    });

    const normalized = normalizeApiError(httpError);

    assert.strictEqual(normalized.kind, "SERVER_ERROR");
    assert.strictEqual(normalized.status, 500);
    assert.strictEqual(normalized.i18nKey, "errors.serverError");
    assert.strictEqual(normalized.isServerError, true);
  });

  await t.test("normalizes 503 Service Unavailable", () => {
    const httpError = new HttpError({
      message: "Service Unavailable",
      status: 503,
      statusText: "Service Unavailable",
      data: null,
      url: "http://localhost:3000/api/v1/doctors",
      method: "GET",
    });

    const normalized = normalizeApiError(httpError);

    assert.strictEqual(normalized.kind, "SERVER_ERROR");
    assert.strictEqual(normalized.status, 503);
    assert.strictEqual(normalized.i18nKey, "errors.serverError");
    assert.strictEqual(normalized.isServerError, true);
  });
});

test("API Error Normalization — Network & Timeout Failures", async (t) => {
  await t.test("normalizes fetch network failure", () => {
    const typeError = new TypeError("Failed to fetch");
    const normalized = normalizeApiError(typeError);

    assert.strictEqual(normalized.kind, "NETWORK_ERROR");
    assert.strictEqual(normalized.status, null);
    assert.strictEqual(normalized.i18nKey, "errors.network");
    assert.strictEqual(normalized.isNetworkError, true);
  });

  await t.test("normalizes timeout error", () => {
    const timeoutError = new DOMException("Request timed out", "TimeoutError");
    const normalized = normalizeApiError(timeoutError);

    assert.strictEqual(normalized.kind, "TIMEOUT");
    assert.strictEqual(normalized.status, null);
    assert.strictEqual(normalized.i18nKey, "errors.network");
    assert.strictEqual(normalized.isTimeout, true);
  });

  await t.test("normalizes abort error as timeout", () => {
    const abortError = new DOMException("The operation was aborted", "AbortError");
    const normalized = normalizeApiError(abortError);

    assert.strictEqual(normalized.kind, "TIMEOUT");
    assert.strictEqual(normalized.status, null);
    assert.strictEqual(normalized.i18nKey, "errors.network");
    assert.strictEqual(normalized.isTimeout, true);
  });
});

test("API Error Normalization — Edge Cases & Idempotency", async (t) => {
  await t.test("is idempotent when passing already normalized error", () => {
    const first = normalizeApiError(new Error("Generic error"));
    const second = normalizeApiError(first);

    assert.strictEqual(first, second);
  });

  await t.test("gracefully handles unknown non-error primitives", () => {
    const normalizedString = normalizeApiError("Something broke");
    assert.strictEqual(normalizedString.kind, "UNKNOWN");
    assert.strictEqual(normalizedString.message, "Something broke");
    assert.strictEqual(normalizedString.i18nKey, "errors.generic");

    const normalizedNull = normalizeApiError(null);
    assert.strictEqual(normalizedNull.kind, "UNKNOWN");
    assert.strictEqual(normalizedNull.message, "Something went wrong");
    assert.strictEqual(normalizedNull.i18nKey, "errors.generic");
  });
});

