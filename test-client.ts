import { HttpClient } from "./src/lib/api/http-client";

const client = new HttpClient({
  baseUrl: "http://localhost:8080/api/v1",
  fetchFn: async (url, config) => {
    console.log("URL:", url);
    console.log("METHOD:", config.method);
    console.log("HEADERS:", Array.from(config.headers.entries()));
    console.log("BODY:", config.body);
    return new Response(JSON.stringify({ status: "success", data: {} }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
});

client.request("POST", "/auth/login", { body: { email: "a", password: "b" } }).then(console.log).catch(console.error);
