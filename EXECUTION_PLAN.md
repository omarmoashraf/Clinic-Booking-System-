# EXECUTION_PLAN.md

# Clinic Management System — Frontend Execution Plan

## 1. Execution Philosophy

The frontend must be implemented incrementally.

Do NOT build the entire frontend in one pass.

Work:

```text
Milestone
    ↓
Task
    ↓
Implementation
    ↓
Verification
    ↓
Security Review
    ↓
UX Review
    ↓
Completion
    ↓
Next Task
```

Never start the next task until the current task has passed its verification gate.

---

# 2. Required Source of Truth

Before implementation begins, the agent must read:

```text
AGENT.md
DESIGN.md
Backend API Contract
```

The backend API contract is authoritative for all API behavior.

---

# 3. Global Task Completion Gate

Every task must pass the following checks as applicable.

## Code

* TypeScript passes
* ESLint passes
* No obvious dead code
* No unnecessary duplication
* No giant components
* No unrelated changes

## API

* Endpoint matches API contract
* Request matches contract
* Response handling matches contract
* Error handling matches contract

## Security

Check:

* Authentication behavior
* Authorization behavior
* Sensitive data exposure
* Browser storage
* Logging
* User-controlled content
* Input handling
* Error leakage
* Token handling

## UX

Check:

* Loading state
* Empty state
* Error state
* Success state
* Disabled state
* Mobile behavior
* Keyboard behavior
* Accessibility

## i18n

Where applicable:

* English works
* Arabic works
* LTR works
* RTL works
* No hardcoded UI text

## Tests

Run all relevant tests.

A task is not complete because the UI "looks correct".

---

# 4. Milestone 00 — Product and Architecture Validation

### Goal

Confirm the frontend architecture before writing substantial UI code.

### Tasks

#### M00-T01 — Validate Documentation

Read:

* `AGENT.md`
* `DESIGN.md`
* Backend API Contract

Verify that:

* Roles are clear
* Supported capabilities are clear
* API boundaries are clear
* Language requirements are clear
* Design direction is clear

If conflicts exist, document them before coding.

---

#### M00-T02 — Backend Gap Analysis

Compare required frontend experiences with the API contract.

Create:

```text
BACKEND_GAPS.md
```

Only if gaps exist.

Each gap should contain:

```text
Gap
Why frontend needs it
Current backend support
Required backend change
Impact
```

Do not implement fake functionality.

### Verification Gate

* No unresolved architecture ambiguity
* No invented API behavior
* Backend gaps documented

---

# 5. Milestone 01 — Frontend Foundation

### Goal

Create the application foundation.

### M01-T01 — Initialize Project

Set up:

* Next.js
* TypeScript
* Tailwind
* shadcn/ui
* TanStack Query
* React Hook Form
* Zod
* Lucide React

Configure the project cleanly.

---

### M01-T02 — Folder Architecture

Create the approved structure:

```text
app/
components/
features/
lib/
hooks/
providers/
types/
config/
```

Do not create unnecessary directories.

---

### M01-T03 — Design Tokens

Implement:

* Colors
* Typography
* Spacing
* Radius
* Shadows
* Focus styles
* Semantic states

Use design tokens rather than scattered values.

---

### M01-T04 — Base UI Components

Implement foundational components required by the design:

* Button
* Input
* Select
* Label
* Badge
* Dialog
* Dropdown
* Skeleton
* Alert
* Toast
* etc.

Only implement components actually required.

### Verification Gate

* Project builds
* TypeScript passes
* Lint passes
* Design tokens work
* Base components work
* No accessibility regressions
* No unnecessary dependencies

---

# 6. Milestone 02 — Internationalization

### Goal

Make bilingual support a first-class architecture concern.

### M02-T01 — i18n Infrastructure

Implement:

```text
English
Arabic
```

with appropriate locale handling.

---

### M02-T02 — RTL/LTR

Implement direction switching.

Verify:

* Sidebar
* Navbar
* Forms
* Dialogs
* Tables
* Icons
* Spacing
* Alignment

---

### M02-T03 — Translation Structure

Create organized translation resources.

Do not put translations randomly inside components.

### Verification Gate

Test the same screens in:

```text
English / LTR
Arabic / RTL
```

No visual-breaking directional issues.

---

# 7. Milestone 03 — API Infrastructure

### Goal

Create a reliable API integration layer.

### M03-T01 — HTTP Client

Implement centralized HTTP communication.

Handle:

* Base URL
* Headers
* Request configuration
* Response parsing

---

### M03-T02 — API Error Normalization

Support backend error structures.

Handle at minimum where applicable:

```text
400
401
403
404
409
422
429
500
Network failure
```

Do not assume all statuses exist if the backend contract says otherwise.

---

### M03-T03 — Authentication Infrastructure

Implement authentication according to the API contract.

Handle:

* Login
* Session restoration
* Refresh
* Logout
* Expiration
* Unauthorized responses

Do not invent token behavior.

---

### M03-T04 — TanStack Query Infrastructure

Configure:

* Query client
* Defaults
* Error handling
* Cache behavior

Avoid global configuration that creates unexpected behavior.

### Verification Gate

* API requests work
* Authentication works
* Unauthorized behavior works
* Refresh behavior works
* Errors are normalized
* No tokens/secrets are logged

---

# 8. Milestone 04 — Public Experience

### Goal

Build the public-facing experience.

Potential areas:

```text
Home
Doctors
Doctor Details
Specialties
Login
Register
```

Only implement pages supported by the product specification and API.

### Tasks

```text
M04-T01 Home
M04-T02 Doctors Discovery
M04-T03 Doctor Details
M04-T04 Specialties
M04-T05 Authentication Pages
```

Each task must include:

* Responsive UI
* Loading state
* Empty state
* Error state
* Accessibility
* Arabic/English

### Verification Gate

A user can navigate the public experience without broken states.

---

# 9. Milestone 05 — Patient Experience

### Goal

Build the patient workflow.

### M05-T01 — Patient Layout

Implement:

* Patient navigation
* Header
* Mobile navigation
* Role protection

---

### M05-T02 — Patient Dashboard

Show only meaningful backend-supported information.

No fake analytics.

---

### M05-T03 — Doctor Discovery

Connect patient-facing doctor discovery to the real API.

---

### M05-T04 — Booking Flow

Implement:

```text
Doctor
 ↓
Date
 ↓
Available Slot
 ↓
Confirmation
 ↓
Success
```

Respect backend availability and booking rules.

Handle conflicts such as a slot becoming unavailable.

Never assume that a slot remains available after it was displayed.

---

### M05-T05 — Patient Appointments

Implement:

* List
* Details where supported
* Status
* Cancellation where supported

---

### M05-T06 — Patient Profile

Implement profile functionality according to the API contract.

### Verification Gate

Test:

```text
Patient login
Doctor discovery
Availability
Booking
Duplicate/conflict scenario
Appointment display
Cancellation
Profile
```

Verify mobile and RTL.

---

# 10. Milestone 06 — Doctor Experience

### Goal

Build the Doctor workflow.

### M06-T01 — Doctor Layout

Implement role-specific navigation and route protection.

---

### M06-T02 — Doctor Dashboard

Show useful operational information.

Avoid meaningless charts.

---

### M06-T03 — Doctor Appointments

Implement supported appointment views and actions.

Respect the backend state machine.

Do not invent state transitions.

---

### M06-T04 — Doctor Availability

Implement availability management according to the API contract.

Handle:

* Date
* Time
* Existing slots
* Validation
* Conflicts
* Loading
* Errors
* Success

---

### M06-T05 — Doctor Profile

Implement supported profile functionality.

### Verification Gate

Test:

```text
Doctor login
Dashboard
Appointments
Availability
Profile
Appointment state transitions
Invalid operations
Unauthorized operations
```

---

# 11. Milestone 07 — Admin Experience

### Goal

Build the Admin operational dashboard.

### M07-T01 — Admin Layout

Implement:

* Sidebar
* Header
* Responsive navigation
* Admin route protection

---

### M07-T02 — Admin Dashboard

Use only real backend-supported metrics.

Potential categories:

```text
Doctors
Users
Appointments
Pending operations
```

Do not implement revenue unless supported by backend.

---

### M07-T03 — User Management

Implement supported user management.

Include appropriate:

* Search
* Filters
* Pagination
* Loading
* Empty
* Error

---

### M07-T04 — Doctor Management

Implement supported doctor management.

---

### M07-T05 — Specialty Management

Implement:

* List
* Create
* Update
* Delete

only if supported by the API contract.

---

### M07-T06 — Appointment Management

Implement admin appointment management supported by the API.

### Verification Gate

Test:

```text
Admin login
Dashboard
Users
Doctors
Specialties
Appointments
Authorization
Pagination
Filtering
Errors
```

---

# 12. Milestone 08 — Shared UX Polish

### Goal

Improve the entire product consistently.

### Tasks

#### M08-T01 — Loading States

Audit every async screen.

---

#### M08-T02 — Empty States

Audit every list/table.

---

#### M08-T03 — Error States

Audit all API failures.

---

#### M08-T04 — Success Feedback

Audit all important mutations.

---

#### M08-T05 — Responsive Audit

Test:

```text
Mobile
Tablet
Desktop
```

---

#### M08-T06 — RTL Audit

Test all major flows in Arabic.

---

#### M08-T07 — Accessibility Audit

Check:

* Keyboard navigation
* Focus
* Labels
* Dialogs
* Contrast
* Screen readers
* Reduced motion

---

# 13. Milestone 09 — Security Review

### Goal

Perform a frontend security audit.

Review:

### Authentication

* Token handling
* Session expiration
* Refresh behavior
* Logout

### Authorization

* Route protection
* Role-based UI
* Unauthorized actions

### Data

* Sensitive data exposure
* Browser storage
* Console logs
* URLs
* Error messages

### Input

* Validation
* User-controlled content
* Unsafe HTML

### Dependencies

* Unnecessary packages
* Known risky patterns
* Outdated packages where relevant

Create:

```text
SECURITY_REVIEW.md
```

Document:

```text
Finding
Severity
Location
Impact
Fix
Verification
```

### Verification Gate

All high-priority findings must be resolved or explicitly documented as requiring backend/product changes.

---

# 14. Milestone 10 — Testing

### Goal

Test the application as a real product.

### M10-T01 — Unit Tests

Test important:

* Utilities
* Validation
* Business-independent frontend logic
* Hooks where appropriate

---

### M10-T02 — Component Tests

Test critical components and states.

---

### M10-T03 — Integration Tests

Test important flows involving API integration.

---

### M10-T04 — E2E Tests

Prioritize:

```text
Login
Registration
Doctor discovery
Booking
Appointment management
Availability
Admin management
Logout
```

Use real backend integration where appropriate.

Do not fake successful API behavior in end-to-end tests unless the test specifically requires a mocked scenario.

---

# 15. Milestone 11 — Production Readiness

### Goal

Prepare the frontend for deployment.

### M11-T01 — Build

Verify production build.

---

### M11-T02 — Environment Variables

Verify:

* No secrets exposed
* Public variables are intentional
* Environment configuration is documented

---

### M11-T03 — Error Monitoring Readiness

Ensure unexpected errors can be diagnosed without leaking sensitive information.

---

### M11-T04 — Performance Review

Check:

* Unnecessary requests
* Excessive re-renders
* Large bundles
* Image optimization
* Loading behavior
* Query caching

Do not prematurely optimize without evidence.

---

### M11-T05 — Final UX Review

Perform complete product walkthrough:

```text
Public
 ↓
Patient
 ↓
Doctor
 ↓
Admin
```

Test both:

```text
English
Arabic
```

and:

```text
LTR
RTL
```

---

# 16. Task Execution Rules

Every task must follow:

```text
READ
 ↓
UNDERSTAND
 ↓
PLAN
 ↓
IMPLEMENT
 ↓
TEST
 ↓
SECURITY REVIEW
 ↓
UX REVIEW
 ↓
FIX
 ↓
VERIFY
 ↓
MARK COMPLETE
```

Do not execute multiple unrelated tasks together.

---

# 17. Task Scope Rule

When working on:

```text
M05-T04 Booking Flow
```

do not simultaneously:

* redesign Admin
* refactor authentication
* rewrite unrelated components
* change backend behavior
* restructure the entire project

unless the current task genuinely requires it.

---

# 18. Dependency Rule

If Task B depends on Task A:

```text
Task A
  ↓
Verification
  ↓
Task B
```

Do not implement B prematurely.

---

# 19. Failure Rule

If a task fails verification:

```text
Do not mark complete.
```

Instead:

1. Identify failure.
2. Fix it.
3. Re-run verification.
4. Repeat until the gate passes.

---

# 20. Backend Gap Rule

If implementation reveals:

```text
Frontend requirement
        ↓
No backend support
```

do not create fake behavior.

Document:

```text
BACKEND_GAPS.md
```

and continue only with work that does not depend on the missing capability.

---

# 21. Final Definition of Done

The frontend is considered complete only when:

* All planned milestones are complete
* All tasks pass their verification gates
* API integration matches the backend contract
* No invented endpoints exist
* No fake production data exists
* Authentication works
* Authorization behavior is handled correctly
* Patient workflow works
* Doctor workflow works
* Admin workflow works
* Arabic works
* English works
* RTL works
* LTR works
* Responsive behavior works
* Loading states work
* Empty states work
* Error states work
* Success states work
* Accessibility has been reviewed
* Security has been reviewed
* Tests pass
* Production build passes
* No critical unresolved issues remain

---

# 22. Execution Principle

Do not optimize for:

> "Finish the frontend as fast as possible."

Optimize for:

> "Build a frontend that is clean, secure, maintainable, testable, visually consistent, and easy for another engineer to understand."
