# Delta for frontend-auth-flow

## ADDED Requirements

### Requirement: Authentication endpoints use the exact backend contract

The application MUST use the following methods, paths, credentials, statuses, response semantics, and cookie behavior. Access tokens MUST remain in memory only.

| Operation | Request and credentials | Success | Response and cookie |
|---|---|---|---|
| Register | `POST /api/auth/register`, body `email`, `password`, `firstName`, `lastName`, `organizationName`; `credentials: include`; no Bearer | `201` | Full session (`user`, `auth`, `activeOrganization`, `activeMembership`, `memberships`, `requiresOrganizationSelection: false`) and `Set-Cookie` |
| Login | `POST /api/auth/login`, body `email`, `password`; `credentials: include`; no Bearer | `200` | Full session and `Set-Cookie` |
| Me | `GET /api/auth/me`, Bearer required; no session cookie requirement | `200` | Session context without `auth` |
| Select organization | `POST /api/auth/select-organization`, Bearer required, body `organizationId` from a listed membership | `200` | Full session with a new access token and selection false; no new refresh-token JSON field is assumed |
| Refresh | `POST /api/auth/refresh`, refresh cookie credentials; Bearer not required | `200` | Auth metadata only (`accessToken`, `tokenType`, `expiresIn`); refresh token is never JSON and cookie may rotate |
| Logout | `POST /api/auth/logout`, Bearer required and cookie credentials | `204` | No response body; refresh cookie is cleared |

The refresh cookie MUST be named `legacylift_refresh`, `HttpOnly`, `SameSite=Lax`, `Secure` only in production, and `Path=/api/auth`. Requests needing it MUST use `credentials: include`.

The current backend has a contract discrepancy: refresh without a `legacylift_refresh` cookie returns `SESSION_REVOKED` instead of the anonymous `UNAUTHORIZED` distinction. On `/auth/login` and `/auth/register`, the frontend treats a failed initial refresh as anonymous without showing a session notice; on protected routes, it preserves returned `SESSION_EXPIRED` or `SESSION_REVOKED` feedback. This is a route-aware frontend mitigation and remains a backend discrepancy for contract-level coordination; it is not changed by this frontend update.

#### Scenario: Registration establishes one organization

- **GIVEN** valid registration data
- **WHEN** the backend returns `201`
- **THEN** the frontend stores the access token only in memory, uses the returned full session, and navigates to `/dashboard` without organization selection

#### Scenario: Login resolves membership count

- **GIVEN** valid credentials
- **WHEN** login returns one active membership
- **THEN** the returned organization is active and the frontend navigates to `/dashboard`
- **WHEN** login returns multiple active memberships
- **THEN** `activeOrganization` and `activeMembership` are `null`, `requiresOrganizationSelection` is `true`, and the frontend shows the selector
- **WHEN** login returns zero active memberships
- **THEN** the frontend preserves the safe `NO_ACTIVE_MEMBERSHIP` error and does not enter an authenticated tenant state

### Requirement: Session shape and organization selection are contract-driven

Each `memberships[]` item MUST contain a nested `organization` and `roles`. `activeMembership` MUST contain only its membership fields and `roles`; it MUST NOT contain a nested organization. The selector MUST render only validated `ACTIVE` `memberships[]` options, including nested organization name and roles, and MUST NOT accept arbitrary organization IDs or authorize from client data. Runtime validation MUST reject duplicate membership or organization identifiers and incoherent active organization/membership pairs.

#### Scenario: Valid selection returns the new session

- **GIVEN** a session with `requiresOrganizationSelection: true`
- **WHEN** the user selects a listed organization and `POST /api/auth/select-organization` returns `200`
- **THEN** the frontend replaces the whole session, uses the returned new access token in memory, and navigates to `/dashboard`

#### Scenario: Selection failure is retryable

- **GIVEN** a selection request fails
- **WHEN** the error is handled
- **THEN** the selector remains visible, displays safe feedback, and allows retry without inventing an option

### Requirement: Bootstrap distinguishes first visit from failed session restoration

Bootstrap MUST perform one bounded `POST /api/auth/refresh` followed by authenticated `GET /api/auth/me`; it MUST NOT recursively refresh. A browser cannot inspect `HttpOnly`, so the frontend MUST distinguish a first visit with no cookie from an expired or revoked session only when an HTTP signal makes that distinction observable. It MUST NOT map every bootstrap failure to `SESSION_EXPIRED`.

#### Scenario: Valid reload

- **GIVEN** a valid refresh cookie
- **WHEN** refresh and `/me` succeed
- **THEN** the tenant context is restored before protected content is shown

#### Scenario: First visit without a cookie

- **GIVEN** no refresh cookie and no observable prior session
- **WHEN** bootstrap reports an unauthenticated first visit
- **THEN** the frontend shows login without falsely reporting an expired session

#### Scenario: Expired or revoked session

- **GIVEN** bootstrap returns an observable expired/revoked session error
- **WHEN** the bounded attempt ends
- **THEN** memory auth is cleared, login is shown with safe session feedback, and the response is handled as `SESSION_EXPIRED` or `SESSION_REVOKED` as returned; `SESSION_REVOKED` is allowed for an expired refresh in the current backend

#### Scenario: Public initial refresh stays anonymous

- **GIVEN** `/auth/login` or `/auth/register` is the current route and no observable authenticated session exists
- **WHEN** the initial refresh fails with `SESSION_EXPIRED` or `SESSION_REVOKED`
- **THEN** the frontend clears in-memory auth, remains anonymous, and does not show a session notice

#### Scenario: Protected initial refresh preserves session feedback

- **GIVEN** `/dashboard` or `/auth/select-organization` is the current route
- **WHEN** the initial refresh fails with `SESSION_EXPIRED` or `SESSION_REVOKED`
- **THEN** the frontend clears in-memory auth, remains anonymous, and preserves the safe session notice for the route gate/login flow

### Requirement: Protected navigation and UI states

The application MUST protect `/dashboard` and `/auth/select-organization`, redirect pending-selection sessions to the selector, redirect authenticated users from login/register to `/dashboard`, and preserve `/` and `/health`. Forms and selector MUST expose idle, loading, validation, success, empty, network, and safe error states; disable repeated submission while pending; and work on mobile, tablet, and desktop without horizontal scrolling. Labels, associated errors, semantic controls, keyboard operation, visible focus, and accessible status announcements are required.

The dashboard placeholder MUST show only user, active organization, roles, logout, and `/health`.

The implemented auth UI MUST retain associated field errors and status announcements, semantic radio controls for organization selection, visible selected and pending states, disabled repeated submission, semantic design tokens, visible focus treatment, and sufficient contrast for auth actions and dashboard content. The maintainer manually verified desktop/mobile UI, keyboard/focus, responsive layout, auth endpoint contract cases, cookie/CORS behavior, first visit/reload, expired/revoked session, zero/one/multiple memberships, redirects, retry/error states, no token in storage/URL, `/`, and `/health`.

#### Scenario: Protected routes and accessible pending states

- **GIVEN** an anonymous visitor opens `/dashboard`, a pending-selection session opens `/dashboard`, or an authenticated user opens login/register
- **WHEN** the route gate resolves the session state
- **THEN** the visitor is sent to login, the pending session is sent to the selector, or the authenticated user is sent to `/dashboard`; while forms or selection submit, controls are disabled and loading/error feedback remains labeled, keyboard-accessible, focused, and usable without horizontal scrolling

### Requirement: Error mapping is exact and safe

The frontend MUST preserve the backend error envelope `{ statusCode, code, message }` at the API boundary and map known codes without exposing raw responses. The matrix is:

| Status/code | Context and behavior |
|---|---|
| `400 VALIDATION_ERROR` | Show field/form validation feedback; preserve entered safe values |
| `409 EMAIL_ALREADY_REGISTERED` | Registration feedback; remain on register |
| `401 INVALID_CREDENTIALS` | Login feedback; do not distinguish unknown email from wrong password |
| `401 USER_NOT_ACTIVE` | Safe inactive-user feedback |
| `401 NO_ACTIVE_MEMBERSHIP` | Safe membership feedback; no tenant session |
| `401 SESSION_EXPIRED` | Session-expired feedback only when returned/observable as expired |
| `401 SESSION_REVOKED` | Session-revoked/expired-safe feedback; may represent an expired refresh in the current backend |
| `403 ORGANIZATION_ACCESS_DENIED` | Selection feedback; remain retryable on selector |
| `401 UNAUTHORIZED`, `403 FORBIDDEN`, `409 CONFLICT`, other HTTP errors, malformed responses, network and timeout failures | Generic safe authentication feedback unless a more specific code above applies; never expose raw body, token, stack trace, or implementation detail |

#### Scenario: Logout accepts no content

- **GIVEN** a Bearer-authenticated session
- **WHEN** logout returns `204`
- **THEN** the frontend treats the empty body as success, clears memory, and navigates to login

### Requirement: Local integration is a verification prerequisite

Browser-cookie contract testing MUST record the configured frontend origin, backend origin, backend port, CORS origin, `credentials: true`, cookie attributes, and `NEXT_PUBLIC_API_URL`. Current local documentation conflicts: backend defaults to `3001`, while frontend README/env and backend `FRONTEND_URL` references include `3000` and `3001`. This mismatch MUST be resolved or explicitly recorded as a blocker for local browser-cookie verification; it MUST NOT change the API contract.

#### Scenario: Contract verification matrix

- **GIVEN** the configured Vitest suite with mocked fetch boundaries
- **WHEN** the listed endpoint cases are executed
- **THEN** automated tests verify status, request credentials, Bearer requirements, full versus auth-only response shape, observed `Set-Cookie` headers, nested membership organization, and absence of refresh token in JSON; the current evidence also records 13 passing Vitest tests, strict OpenSpec validation, lint, TypeScript, build, git diff check, lockfile dry-run, and the maintainer's manual verification note above
