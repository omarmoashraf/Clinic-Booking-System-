# Backend Gaps and Alignment Notes

This document tracks endpoints, parameters, or behaviors where frontend requirements differ from or exceed current backend capabilities, per `API_CONTRACT.md`.

---

## 1. Doctors Module

### GAP-01: Missing Doctor Name Search Parameter on `GET /doctors`
* **Endpoint**: `GET /doctors`
* **Supported Query Parameters** (per `API_CONTRACT.md`): `page`, `limit`, `specialty`
* **Limitation**: The backend only supports filtering by `specialty` (specialty ID or name case-insensitively). Unlike `GET /specialties` which accepts a `search` query parameter, `GET /doctors` does not accept `search` or `name` parameters.
* **Frontend Handling**:
  - The frontend passes `page`, `limit`, and `specialty` to `GET /doctors`.
  - Client-side doctor name filtering is applied over the fetched page results.
  - No fake query parameters are sent to the backend.

