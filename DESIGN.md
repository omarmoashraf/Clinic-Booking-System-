# DESIGN.md

# Clinic Management System — Frontend Design Specification

## 1. Product Overview

This application is the frontend for an existing Clinic Management System API.

The product serves three currently supported roles:

```text
PATIENT
DOCTOR
ADMIN
```

The frontend must provide different experiences for each role while maintaining one consistent product identity.

The product should feel like a:

> Modern, premium healthcare SaaS platform.

It should NOT feel like a generic hospital website or a basic CRUD dashboard.

---

# 2. Product Positioning

The visual and UX direction is:

```text
Modern Healthcare
+
Premium SaaS
+
Operational Simplicity
+
Trust
+
Human-centered UX
```

The product should communicate:

* Trust
* Calmness
* Professionalism
* Modern technology
* Reliability
* Simplicity

Avoid:

* Generic hospital aesthetics
* Excessive medical imagery
* Excessive blue
* Cheap-looking gradients
* Excessive rounded cards
* Dashboard clutter
* Excessive animations
* Decorative elements without purpose

---

# 3. Roles

## 3.1 Patient

The Patient is the end user who:

* Discovers doctors
* Views doctor information
* Views available appointment slots
* Books appointments
* Views appointments
* Manages their profile

Exact capabilities must follow the backend API contract.

---

## 3.2 Doctor

The Doctor is a medical professional using the platform to:

* Manage their profile
* Manage availability
* View appointments
* Manage supported appointment statuses

Exact capabilities must follow the backend API contract.

---

## 3.3 Admin

The Admin represents:

> Clinic Administrator / Clinic Manager / Platform Administrator

The Admin manages the operation of the platform.

Current admin responsibilities include areas such as:

* Doctors
* Users
* Specialties
* Appointments

Exact capabilities must follow the backend API contract.

---

## 3.4 Receptionist

Receptionist is NOT currently a supported role.

Do not design or implement a Receptionist role unless the backend contract explicitly introduces it.

If a future requirement needs receptionist functionality, document it as a backend/product gap first.

---

# 4. Languages

The application is bilingual:

```text
English
Arabic
```

The application must support:

```text
English → LTR
Arabic   → RTL
```

Language switching should be easily accessible.

The language preference should persist according to the chosen i18n implementation.

All user-facing text must be translated.

Do not hardcode English or Arabic strings inside random components.

---

# 5. Brand Direction

The visual identity should be recognizable and sophisticated.

Do not default to:

```text
Medical Blue + White
```

as the entire identity.

Instead use a refined healthcare-inspired palette built around:

* Deep sophisticated primary color
* Soft healthcare-inspired secondary accent
* Neutral off-white background
* Clean white surfaces
* Dark slate/charcoal text
* Restrained semantic colors

The final exact colors should be selected during design implementation and documented as design tokens.

---

# 6. Color System

The system should contain semantic tokens rather than arbitrary colors.

Conceptually:

```text
Background
Surface
Surface Muted

Text Primary
Text Secondary
Text Muted
Text Disabled

Primary
Primary Hover
Primary Active
Primary Foreground

Secondary
Secondary Foreground

Success
Warning
Error
Info

Border
Border Muted
Focus Ring
```

Components must consume semantic tokens.

Do not scatter arbitrary hex values throughout the codebase.

---

# 7. Typography

Typography should feel:

```text
Modern
Clean
Professional
Readable
```

The typography system must support both Arabic and English.

Define:

```text
Display
H1
H2
H3
H4
Body Large
Body
Body Small
Caption
Label
```

Arabic typography must be intentionally selected rather than relying on an English-only font.

The final typography choices should be implemented as reusable design tokens.

---

# 8. Spacing

Use a consistent spacing scale.

Avoid random values such as:

```text
13px
19px
27px
37px
```

unless there is a specific design reason.

Use a consistent spacing system based on the project's design tokens.

---

# 9. Border Radius

Use a restrained radius system.

Example conceptual scale:

```text
Small
Medium
Large
XL
Full
```

Do not make every element excessively rounded.

Buttons, inputs, cards, dialogs, and containers should have consistent geometry.

---

# 10. Shadows

Shadows should be subtle.

Prefer:

```text
Borders
+
Surface contrast
+
Very subtle shadows
```

instead of heavy floating-card shadows.

---

# 11. Iconography

Use a consistent icon library.

Preferred:

```text
Lucide React
```

Do not manually draw icons.

Do not use unrelated icon styles throughout the application.

Icons must have consistent:

* Size
* Stroke
* Alignment
* Spacing

---

# 12. Design System Components

The application should establish reusable components for:

### Foundation

* Button
* Icon Button
* Input
* Textarea
* Select
* Checkbox
* Radio
* Switch
* Label

### Feedback

* Alert
* Toast
* Badge
* Skeleton
* Spinner
* Empty State
* Error State

### Navigation

* Navbar
* Sidebar
* Mobile Navigation
* Breadcrumb
* Tabs
* Pagination

### Data

* Table
* Data Row
* Stat
* Filter
* Search
* Sort
* Status Badge

### Overlay

* Modal
* Dialog
* Drawer
* Dropdown
* Tooltip
* Popover

### Healthcare-specific

* Doctor Card
* Appointment Card
* Availability Slot
* Appointment Status
* Doctor Summary
* Patient Summary

Only create components when they represent a meaningful reusable concept.

---

# 13. Public Experience

The public website should prioritize:

```text
Discover
Search
Understand
Book
```

Potential public areas include:

```text
Home
Doctors
Doctor Details
Specialties
Login
Register
```

Exact routes must follow the implementation plan and backend capabilities.

---

# 14. Patient Experience

The Patient experience should focus on:

```text
Appointments
Doctor Discovery
Booking
Profile
```

Potential areas:

```text
Patient Dashboard
Doctors
Appointments
Profile
```

The booking journey should be simple:

```text
Doctor
   ↓
Date
   ↓
Available Time
   ↓
Confirmation
   ↓
Success
```

The interface must make appointment state clear.

---

# 15. Doctor Experience

The Doctor dashboard should prioritize operational work.

Main concepts:

```text
Dashboard
Appointments
Availability
Profile
```

The Doctor should be able to understand quickly:

* What appointments are coming
* What requires attention
* What their availability looks like

Do not fill the dashboard with meaningless analytics.

---

# 16. Admin Experience

The Admin dashboard is an operational dashboard.

It should focus on actual supported backend data.

Potential areas:

```text
Dashboard
Users
Doctors
Specialties
Appointments
```

The dashboard may display metrics such as:

```text
Total Doctors
Total Patients / Users
Appointments
Pending Items
```

only if those values can be reliably obtained from the backend.

---

# 17. Revenue and Financial Data

Do NOT display:

```text
Revenue
Profit
Payments
Invoices
Financial analytics
```

unless the backend contract supports those domains.

Do not create fake financial metrics.

If financial functionality becomes a future requirement:

```text
Frontend requirement
        ↓
Backend capability
        ↓
API contract
        ↓
UI implementation
```

must be established first.

---

# 18. Dashboard Philosophy

Dashboards should answer:

> "What do I need to know or do right now?"

They should NOT answer:

> "How many cards can we put on the screen?"

Use:

* Clear hierarchy
* Relevant metrics
* Recent/important activity
* Upcoming appointments
* Actionable information

Avoid:

* Fake charts
* Decorative graphs
* Redundant statistics
* Excessive cards

---

# 19. Layout System

Desktop dashboards:

```text
┌──────────────┬────────────────────────────┐
│              │                            │
│   Sidebar    │         Main Content       │
│              │                            │
│              │                            │
└──────────────┴────────────────────────────┘
```

Mobile:

```text
┌─────────────────────────────┐
│ Header / Menu               │
├─────────────────────────────┤
│                             │
│ Main Content                │
│                             │
└─────────────────────────────┘
```

The navigation must adapt naturally to mobile.

---

# 20. Responsive Behavior

Design for:

```text
Mobile
Tablet
Desktop
Large Desktop
```

Responsive behavior must be intentional.

Examples:

### Desktop

* Persistent sidebar
* Multi-column layouts
* Full data tables

### Tablet

* Collapsible navigation
* Reduced columns
* Flexible layouts

### Mobile

* Navigation drawer
* Single-column layouts
* Stacked information
* Mobile-friendly appointment cards
* Horizontally scrollable sections only when appropriate

---

# 21. Tables

Admin-heavy areas may use tables.

Tables must support appropriate:

* Loading
* Empty
* Error
* Pagination
* Search
* Filtering
* Sorting

On mobile, tables should not become unusable.

Where appropriate, transform rows into responsive cards.

---

# 22. Appointment Status

Appointment statuses must visually communicate state.

The current backend state model must be respected.

Conceptually:

```text
PENDING
CONFIRMED
COMPLETED
CANCELLED
```

Do not introduce statuses that are not supported by the backend.

Status colors must not be the only indicator.

Use:

```text
Color
+
Text
+
Optional icon
```

---

# 23. Forms

Forms must be:

* Simple
* Clearly labeled
* Keyboard accessible
* Validated
* Consistent

Every form should have:

```text
Default
Loading
Validation Error
Server Error
Success
```

states where appropriate.

Avoid unnecessarily long forms.

---

# 24. Loading States

Do not make users stare at blank screens.

Use:

* Skeletons
* Spinners where appropriate
* Disabled submit buttons
* Progress feedback
* Optimistic UI only when safe

Loading UI must preserve layout where possible.

---

# 25. Empty States

Every list-based screen must consider an empty state.

Example:

```text
No appointments yet

When you book an appointment,
it will appear here.
```

Provide a relevant action when appropriate.

Do not show empty charts or meaningless placeholders.

---

# 26. Error States

Errors should be:

* Clear
* Human-readable
* Actionable

Examples:

```text
Something went wrong.
Please try again.
```

or:

```text
This appointment is no longer available.
Please choose another time.
```

Do not expose internal stack traces or database errors.

---

# 27. Success States

Important actions should clearly confirm completion.

Examples:

```text
Appointment booked successfully.
```

or:

```text
Availability updated successfully.
```

Feedback should be immediate and understandable.

---

# 28. Authentication UX

Authentication should include:

```text
Login
Register
Session restoration
Logout
Unauthorized handling
Expired session handling
```

The UI must follow the backend authentication contract.

---

# 29. Route Architecture

The application should separate experiences by role.

Conceptually:

```text
/public
/auth
/patient
/doctor
/admin
```

Role-based route protection must be implemented.

The backend remains the ultimate authorization authority.

---

# 30. Accessibility

The application must be accessible by design.

Required:

* Semantic HTML
* Keyboard navigation
* Focus management
* Accessible labels
* Accessible dialogs
* Proper contrast
* Reduced motion support
* Screen-reader-friendly status communication

---

# 31. Motion

Motion should be subtle.

Good uses:

* Page transitions
* Dialog transitions
* Dropdown transitions
* Loading feedback
* Success feedback
* Hover/focus transitions

Avoid:

* Constant floating animations
* Large decorative motion
* Long transitions
* Distracting dashboard animations

---

# 32. UX Consistency

The same action must look and behave consistently.

For example:

All primary actions:

```text
Primary Button
```

All destructive actions:

```text
Destructive Button
```

All appointment statuses:

```text
Same Status Badge System
```

All forms:

```text
Same Input System
```

Consistency is more important than making every page visually unique.

---

# 33. Frontend Architecture

The frontend must be modular.

Preferred conceptual structure:

```text
Route
 ↓
Page
 ↓
Feature
 ├── Components
 ├── Hooks
 ├── API
 ├── Types
 ├── Validation
 └── Fixtures
```

Shared UI:

```text
components/ui
```

Shared layout:

```text
components/layout
```

Global infrastructure:

```text
lib/
providers/
config/
```

---

# 34. Clean Code Requirements

No:

* 1,000-line components
* Giant pages
* Giant hooks
* Giant API files
* Duplicated API calls
* Duplicated UI patterns
* Random utility files
* Circular dependencies
* Unused abstractions

A developer should be able to trace:

```text
Screen
 → Feature
 → Hook
 → API function
 → Backend endpoint
```

without navigating through an unnecessarily complex architecture.

---

# 35. Fixtures

Fixtures are allowed for development and testing.

They should support:

* Component development
* Loading states
* Empty states
* Error states
* UI previews
* Automated tests

Fixtures must never be confused with production data.

---

# 36. Backend Alignment

The backend API contract is authoritative.

If the UI requires functionality that the backend does not support:

```text
Do not fake it.
Do not invent an endpoint.
Do not invent response data.
Document the gap.
```

---

# 37. Design Quality Bar

The final product should feel:

```text
Premium
Modern
Calm
Trustworthy
Fast
Clear
Professional
```

It should not feel:

```text
Generic
Template-like
Overdesigned
Cluttered
Cheap
Hospital-themed
```

The goal is a modern SaaS product for healthcare operations, not a static clinic brochure website.
