import { authService } from "./src/lib/auth/auth-service";

authService.login({ email: "test@test.com", password: "password123" })
  .then(console.log)
  .catch(err => console.error(err.data));
