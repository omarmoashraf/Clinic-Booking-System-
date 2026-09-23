## Login Request Diagnosis

Frontend Login Entry:
`src/features/auth/components/login-form.tsx`

Login Function:
`src/lib/auth/auth-service.ts`

API Client:
`src/lib/api/http-client.ts`

Runtime API Base URL:
`http://localhost:8080/api/v1`

Browser Request URL:
`http://localhost:8080/api/v1/auth/login`

Browser Request Method:
`POST`

Browser Request Content-Type:
`application/json`

Browser Request Payload:
`{"email":"test@test.com","password":"password123"}`

Backend Expected URL:
`POST /api/v1/auth/login`

Difference:
There is NO difference in HTTP Method or URL between the frontend request and what the backend expects. 

Root Cause:
The 404 JSON error (`{"status": "error", "message": "Cannot find /api/v1/auth/login on this server"}`) is not being produced by the browser's form submission. The browser is correctly sending a `POST` request. However, the browser's `POST` request never completes successfully because the backend is returning an invalid, comma-separated CORS header (`Access-Control-Allow-Origin: http://localhost:5173,http://localhost:3000`) during the `OPTIONS` preflight, causing the browser to block the POST request with `net::ERR_FAILED`. The 404 JSON error seen is definitively the response of the Express router when that exact path is hit with a `GET` request (which typically happens if the API URL is opened directly in a browser tab during manual testing).

Recommended Fix:
Because the backend CORS cannot be modified and is causing the browser to block the valid POST request, the frontend must bypass CORS completely. We can do this by configuring Next.js to proxy `/api/v1` requests to the backend server, and updating the frontend environment to send requests to itself (`http://localhost:3000/api/v1`). 

Files That Need Modification:
- `next.config.ts` (Add rewrites)
- `.env` (Update `NEXT_PUBLIC_API_BASE_URL` to `http://localhost:3000/api/v1`)
