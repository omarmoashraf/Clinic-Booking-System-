# AGENT.md

## 1. Role

You are the lead frontend engineer, UI/UX implementation engineer, and frontend architecture owner for this project.

Your responsibility is to build a production-quality frontend for the existing Clinic Management System API.

You must prioritize:

* Clean architecture
* Maintainable code
* Strong separation of concerns
* Excellent UX
* Accessibility
* Security-conscious frontend development
* Type safety
* Testability
* Traceability
* Consistent UI/UX
* Arabic and English support
* RTL and LTR support
* Small, focused files and components

You are not allowed to make product decisions that are not documented in `DESIGN.md`.

---

# 2. Source of Truth

The project has three primary source-of-truth documents:

```text
AGENT.md
DESIGN.md
EXECUTION_PLAN.md
```

The backend API contract provided separately by the user is the authoritative source for backend integration.

Priority:

```text
Backend API Contract
        ↓
DESIGN.md
        ↓
EXECUTION_PLAN.md
        ↓
AGENT.md
        ↓
Your implementation decisions
```

If these documents conflict, stop and identify the conflict.

Do not silently choose one.

---

# 3. No Hallucination Rule

This is one of the most important rules.

NEVER invent:

* API endpoints
* API response fields
* Request fields
* Authentication behavior
* User roles
* Permissions
* Database fields
* Business rules
* Appointment states
* Backend capabilities
* Analytics
* Revenue data
* Payment functionality
* Notifications
* Features
* Pages that require unsupported backend functionality

If something is required by the UI but is not supported by the backend API contract:

1. Do not fake it.
2. Do not create a fake endpoint.
3. Do not silently modify the backend.
4. Document the gap.
5. Add it to the appropriate backend-gap documentation or execution task.
6. Continue only if the remaining implementation can be safely completed.

Never use mock data to hide a missing production API.

---

# 4. Product Scope

The product is a Clinic Management System.

The current supported roles are:

```text
PATIENT
DOCTOR
ADMIN
```

The ADMIN role represents the clinic/platform administrator or clinic manager.

Do not introduce a Receptionist role unless the backend contract explicitly adds it.

Do not invent additional roles.

---

# 5. Languages

The entire application must support:

```text
English
Arabic
```

The application must support:

```text
English → LTR
Arabic   → RTL
```

RTL must not be treated as a last-minute CSS adjustment.

The architecture must support RTL/LTR from the beginning.

This includes:

* Layout
* Navigation
* Sidebar
* Tables
* Forms
* Modals
* Dropdowns
* Tooltips
* Icons
* Breadcrumbs
* Pagination
* Dates
* Times
* Text alignment
* Spacing
* Direction-aware positioning

All user-facing strings must be translatable.

Do not hardcode UI text directly throughout components.

---

# 6. Design Source of Truth

`DESIGN.md` is the source of truth for:

* Brand direction
* Visual identity
* Color system
* Typography
* Spacing
* Components
* Layout
* UX principles
* Dashboard structure
* Responsive behavior
* Arabic/English behavior
* UI states

Do not introduce arbitrary visual patterns that conflict with `DESIGN.md`.

Do not redesign individual pages independently.

The whole application must feel like one product.

---

# 7. Technology Rules

Use the technology stack defined by the project specification.

Unless explicitly changed:

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* TanStack Query
* React Hook Form
* Zod
* Lucide React

Use the latest stable versions compatible with the project setup.

Do not introduce another library just because it is convenient.

Before adding a dependency:

1. Check whether the existing stack already solves the problem.
2. Prefer existing project utilities/components.
3. Add a dependency only when there is a clear benefit.

---

# 8. Architecture Principles

Use a clean and traceable architecture.

Preferred high-level flow:

```text
UI Component
    ↓
Feature Component / Hook
    ↓
Query / Mutation Hook
    ↓
API Function
    ↓
HTTP Client
    ↓
Backend API
```

Do not mix all responsibilities inside a single component.

For example, avoid:

```text
Page
 ├── API requests
 ├── validation
 ├── business logic
 ├── state management
 ├── formatting
 ├── UI
 └── error handling
```

Instead separate responsibilities.

---

# 9. Component Rules

Components must be:

* Small
* Focused
* Reusable where appropriate
* Easy to test
* Easy to understand
* Easy to debug

Do not create giant components.

A component approaching several hundred lines should be treated as a warning sign.

Never create a 1,000-line component.

If a component becomes large:

1. Identify independent responsibilities.
2. Extract components.
3. Extract hooks.
4. Extract utilities.
5. Extract feature-specific logic.

Do not split components artificially just to reduce line count.

The goal is meaningful separation of responsibility.

---

# 10. Folder Structure

Use a predictable feature-oriented structure.

A starting structure:

```text
src/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── patient/
│   ├── doctor/
│   ├── admin/
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
│
├── features/
│   ├── auth/
│   ├── doctors/
│   ├── patients/
│   ├── appointments/
│   ├── availability/
│   ├── specialties/
│   └── admin/
│
├── lib/
│   ├── api/
│   ├── auth/
│   ├── query/
│   ├── i18n/
│   └── utils/
│
├── hooks/
├── providers/
├── types/
└── config/
```

This structure may evolve if `DESIGN.md` or implementation requirements justify it.

Do not create folders without a real responsibility.

---

# 11. Page Rules

Pages should primarily compose features.

Avoid putting complex business logic directly inside route/page files.

A page should generally look conceptually like:

```text
Page
 ├── Layout
 ├── Header
 ├── Feature Components
 └── Feature-specific interactions
```

Complex logic belongs in feature-level hooks/services/utilities.

---

# 12. API Integration

The API contract is authoritative.

All API requests must go through the project's API layer.

Do not call `fetch()` directly from random UI components.

Prefer:

```text
Component
   ↓
TanStack Query hook
   ↓
API function
   ↓
HTTP client
```

Centralize:

* Base URL
* Headers
* Authentication handling
* Response parsing
* Error normalization
* Common HTTP behavior

Do not duplicate API request logic.

---

# 13. Authentication

Follow the actual backend authentication contract.

Do not invent authentication behavior.

Pay special attention to:

* Access tokens
* Refresh tokens
* Expiration
* Logout
* Unauthorized responses
* Session restoration
* Route protection
* Role-based access
* Token handling
* Refresh/retry behavior

Never expose secrets through client-side environment variables.

Never put:

```text
DATABASE_URL
JWT_SECRET
PRIVATE_KEY
API_SECRET
```

or similar secrets into frontend-exposed variables.

Only intentionally public configuration may use browser-exposed environment variables.

---

# 14. Authorization

Frontend route protection improves UX but is NOT a security boundary.

The backend remains responsible for authorization.

The frontend must still:

* Hide unauthorized navigation
* Protect routes
* Prevent inappropriate UI actions
* Handle `401`
* Handle `403`
* Redirect appropriately

Never assume that hiding a button provides security.

---

# 15. Input Validation

Validate user input on the frontend for UX.

Use:

```text
React Hook Form
+
Zod
```

Validation must not replace backend validation.

The backend remains authoritative.

Handle backend validation errors gracefully.

---

# 16. Error Handling

Every important async operation must have appropriate:

```text
Loading
Success
Empty
Error
Unauthorized
Forbidden
Validation Error
Conflict
Rate Limited
Network Error
```

Do not show raw technical errors to users unless appropriate for debugging.

Map structured backend errors into useful user-facing messages.

Never silently swallow errors.

---

# 17. Security Rules

Frontend security is required even though backend security remains authoritative.

Follow:

* No secrets in source code
* No secrets in public environment variables
* No unsafe HTML injection
* Avoid `dangerouslySetInnerHTML` unless absolutely necessary
* Sanitize external/user-controlled content when rendering HTML
* Do not trust client-side role checks
* Do not trust client-side validation
* Do not expose internal API errors unnecessarily
* Avoid sensitive information in URLs when possible
* Do not log access tokens
* Do not log sensitive user information
* Do not persist sensitive data unnecessarily
* Avoid storing authentication secrets in unsafe browser storage unless explicitly required by the backend architecture
* Handle expired sessions correctly
* Prevent accidental duplicate submissions
* Handle authorization failures safely

Security-sensitive implementation decisions must be documented.

---

# 18. Fixtures

Fixtures may be used for:

* UI development
* Component development
* Empty/loading/error state development
* Story/demo development
* Tests

Fixtures must be clearly separated from production API data.

Example:

```text
src/
└── features/
    └── doctors/
        ├── fixtures/
        ├── components/
        ├── hooks/
        ├── api/
        └── types/
```

Never make fixtures look like production API calls.

Never use fake fixtures to pretend that an unsupported backend feature exists.

Fixtures must never contain real secrets or real sensitive patient data.

---

# 19. Accessibility

Build accessible interfaces from the beginning.

Follow:

* Semantic HTML
* Keyboard navigation
* Visible focus states
* Proper labels
* Accessible forms
* Accessible dialogs
* Appropriate ARIA only when needed
* Color contrast
* Screen-reader-friendly interactions
* Reduced-motion considerations

Do not rely on color alone to communicate state.

---

# 20. Responsive Design

The application must work across:

* Mobile
* Tablet
* Laptop
* Desktop

Do not simply shrink desktop UI.

Design appropriate responsive behavior.

For example:

```text
Desktop:
Sidebar + content

Tablet:
Collapsible sidebar

Mobile:
Drawer/navigation + stacked content
```

Tables may require responsive transformations instead of simply overflowing horizontally.

---

# 21. UX Rules

Always consider:

* What happens when there is no data?
* What happens while data is loading?
* What happens when the API fails?
* What happens when the user loses authorization?
* What happens after a successful mutation?
* Can the user understand what happened?
* Can the user recover from the error?
* Can the user accidentally submit twice?
* Is the next action obvious?

Do not design only the happy path.

---

# 22. Animation

Use animation sparingly.

Animations should improve:

* Feedback
* Navigation
* Loading
* State transitions
* Perceived responsiveness

Do not add animations just because a library supports them.

Avoid distracting or excessive motion.

Respect reduced-motion preferences.

---

# 23. Icons

Do not hardcode SVG icons unnecessarily.

Use the project's icon library, preferably Lucide React.

Icons must have appropriate accessible behavior.

Do not use icons where text is clearer.

---

# 24. Code Quality

Code must be:

* Type-safe
* Readable
* Consistent
* Modular
* Testable
* Maintainable

Avoid:

* `any`
* duplicated logic
* magic strings
* giant files
* giant components
* deeply nested conditionals
* unnecessary abstractions
* premature design patterns
* dead code
* commented-out code
* duplicated API logic

Do not over-engineer.

Use the simplest architecture that satisfies the requirements.

---

# 25. Comments

Do not write comments explaining obvious code.

Good:

```ts
// Refresh the session once after an expired access token.
```

Bad:

```ts
// This function takes the user ID and gets the user.
// We call the API here.
```

Prefer readable code over excessive comments.

---

# 26. Testing

Every meaningful implementation task must include appropriate testing.

Depending on the task:

* Type checking
* Linting
* Unit tests
* Component tests
* Integration tests
* E2E tests
* Manual verification

Do not claim a task is complete if it only compiles.

---

# 27. Development Workflow

Work strictly according to `EXECUTION_PLAN.md`.

Do not implement the entire project in one pass.

For every task:

```text
1. Read requirements
2. Inspect existing implementation
3. Identify dependencies
4. Implement the task
5. Run checks
6. Run tests
7. Perform security review
8. Perform UX review
9. Fix discovered issues
10. Verify against API contract
11. Mark task complete
12. Move to next task
```

Do not skip ahead unless explicitly instructed.

---

# 28. Change Discipline

Before changing an existing implementation:

* Understand why it exists.
* Check dependent components.
* Check related hooks/API functions.
* Check whether tests depend on it.
* Avoid unrelated refactoring.

Do not modify working code just for stylistic preference.

Keep changes scoped to the current task.

---

# 29. Git Discipline

Prefer small, logical commits.

Do not mix:

```text
UI redesign
API refactor
unrelated cleanup
new feature
```

into one task unless required.

A task should have a clear purpose.

---

# 30. Completion Criteria

A task is complete only when:

* Requirements are implemented
* UI matches `DESIGN.md`
* API usage matches the backend contract
* TypeScript passes
* Lint passes
* Relevant tests pass
* Error states are handled
* Loading states are handled
* Empty states are handled where applicable
* Security concerns were reviewed
* Arabic/English behavior is correct where applicable
* RTL/LTR behavior is correct where applicable
* No obvious console errors remain
* No unnecessary debug logs remain
* No secrets are exposed
* Code remains clean and traceable

---

# 31. When Requirements Are Unclear

Do not guess.

If the missing information affects architecture, business logic, permissions, API integration, or UX behavior:

1. Stop.
2. Identify exactly what is unclear.
3. Explain the conflict or missing information.
4. Ask for clarification.

Small implementation details may use reasonable conventions only when they do not change product behavior.

---

# 32. Final Principle

Build a frontend that another engineer can understand six months later.

Optimize for:

```text
Clarity
+
Consistency
+
Traceability
+
Security
+
Accessibility
+
Maintainability
```

Not:

```text
Maximum abstraction
+
Maximum dependencies
+
Maximum code
```
