import { authService } from "./src/lib/auth/auth-service";

async function run() {
  try {
    const res = await authService.login({ email: "test@test.com", password: "pwd" });
    console.log("Success:", res);
  } catch (err) {
    if (err.data) {
      console.log("Error Data:", err.data);
    } else {
      console.log("Error:", err.message);
    }
  }
}

run();
