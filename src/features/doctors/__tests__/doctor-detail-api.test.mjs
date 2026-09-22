import test from "node:test";
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(process.cwd());

const { getDoctorById } = jiti("./src/features/doctors/api/get-doctor-by-id.ts");
const { apiClient } = jiti("./src/lib/api/http-client.ts");

test("Doctors API — getDoctorById", async (t) => {
  const originalGet = apiClient.get;

  t.afterEach(() => {
    apiClient.get = originalGet;
  });

  await t.test("calls /doctors/:id with properly encoded doctor ID", async () => {
    let capturedUrl = "";

    apiClient.get = async (url) => {
      capturedUrl = url;
      return {
        status: "success",
        data: {
          id: "doc-123",
          fullName: "Dr. Gregory House",
          specialty: { id: "spec-1", name: "Diagnostic Medicine" },
          bio: "Head of Diagnostic Medicine",
        },
      };
    };

    const res = await getDoctorById("doc-123");

    assert.strictEqual(capturedUrl, "/doctors/doc-123");
    assert.strictEqual(res.status, "success");
    assert.strictEqual(res.data.fullName, "Dr. Gregory House");
    assert.strictEqual(res.data.specialty?.name, "Diagnostic Medicine");
  });
});

