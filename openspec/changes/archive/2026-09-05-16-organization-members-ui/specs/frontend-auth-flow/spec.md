## MODIFIED Requirements

### Requirement: Authentication endpoints use the exact backend contract

The application MUST use the following methods, paths, credentials, statuses, response semantics, and cookie behavior. Access tokens MUST remain in memory only.

| Operation | Request and credentials | Success | Response and cookie |
|---|---|---|---|
| Normal register | `POST /api/auth/register`, body `email`, `password`, `firstName`, `lastName`, `organizationName`; no `invitationToken`; `credentials: include`; no Bearer | `201` | Full session (`user`, `auth`, `activeOrganization`, `activeMembership` with `roles` and `permissions`, `memberships`, `requiresOrganizationSelection: false`) and `Set-Cookie` |
| Invitation register | `POST /api/auth/register`, body `password`, `firstName`, `lastName`, `invitationToken`; no `email` or `organizationName`; `credentials: include`; no Bearer | `201` | Full session with invited organization active, MEMBER role and permissions, and `Set-Cookie` |
| Login | `POST /api/auth/login`, body `email`, `password`; `credentials: include`; no Bearer | `200` | Full session and `Set-Cookie` |
| Me | `GET /api/auth/me`, Bearer required; no session cookie requirement | `200` | Session context without `auth`; active membership includes current `roles` and `permissions` |
| Select organization | `POST /api/auth/select-organization`, Bearer required, body `organizationId` from a listed membership | `200` | Full session with a new access token, selection false, selected active context with `roles` and `permissions`, and all memberships retained; no new refresh-token JSON field is assumed |
| Refresh | `POST /api/auth/refresh`, refresh cookie credentials; Bearer not required | `200` | Auth metadata only (`accessToken`, `tokenType`, `expiresIn`); refresh token is never JSON and cookie may rotate |
| Logout | `POST /api/auth/logout`, Bearer required and cookie credentials | `204` | No response body; refresh cookie is cleared |

The refresh cookie MUST be named `legacylift_refresh`, `HttpOnly`, `SameSite=Lax`, `Secure` only in production, and `Path=/api/auth`. Requests needing it MUST use `credentials: include`.

The current backend has a contract discrepancy: refresh without a `legacylift_refresh` cookie returns `SESSION_REVOKED` instead of the anonymous `UNAUTHORIZED` distinction. On `/auth/login` and `/auth/register`, the frontend treats a failed initial refresh as anonymous without showing a session notice; on protected routes, it preserves returned `SESSION_EXPIRED` or `SESSION_REVOKED` feedback. This is a route-aware frontend mitigation and remains a backend discrepancy for contract-level coordination; it is not changed by this frontend update.

#### Scenario: Registration establishes one organization
- **GIVEN** valid normal registration data
- **WHEN** the backend returns `201`
- **THEN** the frontend stores the access token only in memory, uses the returned full session with active permissions, and navigates to `/dashboard` without organization selection

#### Scenario: Invitation registration establishes the invited organization
- **GIVEN** valid invitation registration data containing `invitationToken` and no email or organization name
- **WHEN** the backend returns `201`
- **THEN** the frontend stores the access token only in memory, adopts the invited organization and MEMBER permissions, and navigates to `/dashboard`

#### Scenario: Registration modes are not mixed
- **GIVEN** registration is operating in invitation mode
- **WHEN** the request is built
- **THEN** it omits `email` and `organizationName`
- **AND** normal registration omits `invitationToken`

#### Scenario: Login resolves membership count
- **GIVEN** valid credentials
- **WHEN** login returns one active membership
- **THEN** the returned organization is active, current permissions are retained, and the frontend navigates to `/dashboard`
- **WHEN** login returns multiple active memberships
- **THEN** `activeOrganization` and `activeMembership` are `null`, `requiresOrganizationSelection` is `true`, and the frontend shows the selector unless a validated invitation return is pending
- **WHEN** login returns zero active memberships
- **THEN** the frontend preserves the safe `NO_ACTIVE_MEMBERSHIP` error and does not enter an authenticated tenant state

### Requirement: Session shape and organization selection are contract-driven

Each `memberships[]` item MUST contain a nested `organization` and `roles`. `activeMembership` MUST contain only its membership fields, `roles`, and `permissions`; it MUST NOT contain a nested organization. `permissions` MUST be an array of permission keys supplied by backend and MUST NOT be inferred from roles. The selector MUST render only validated `ACTIVE` `memberships[]` options, including nested organization name and roles, and MUST NOT accept arbitrary organization IDs or authorize from client data. Runtime validation MUST reject duplicate membership or organization identifiers and incoherent active organization/membership pairs. A selected session MAY retain multiple ACTIVE memberships; it is coherent when the active membership exists in `memberships`, is ACTIVE, and matches the selected organization and roles. Empty role and permission arrays are valid.

#### Scenario: Valid selection returns the new session
- **GIVEN** a session with `requiresOrganizationSelection: true`
- **WHEN** the user selects a listed organization and `POST /api/auth/select-organization` returns `200`
- **THEN** the frontend accepts all retained memberships, replaces the whole session, uses the returned new access token in memory, retains returned permissions, and navigates to `/dashboard`

#### Scenario: Selection failure is retryable
- **GIVEN** a selection request fails
- **WHEN** the error is handled
- **THEN** the selector remains visible, displays safe feedback, and allows retry without inventing an option

#### Scenario: Permission-based UI uses backend keys
- **GIVEN** an active membership contains `permissions`
- **WHEN** the frontend decides whether to present member-management navigation or actions
- **THEN** it checks `members.read` or `members.manage` in that array
- **AND** it does not use `OWNER` or another role name as authorization

### Requirement: Protected navigation and UI states

The application MUST protect `/dashboard`, `/settings/members`, and `/auth/select-organization`, redirect pending-selection sessions to the selector except when returning to a validated invitation route, redirect authenticated users from login/register to a validated internal invitation return or otherwise `/dashboard`, and preserve `/`, `/health`, and `/invite/[token]` as public routes. Forms and selector MUST expose idle, loading, validation, success, empty, network, and safe error states; disable repeated submission while pending; and work on mobile, tablet, and desktop without horizontal scrolling. Labels, associated errors, semantic controls, keyboard operation, visible focus, and accessible status announcements are required.

The dashboard placeholder MUST show only user, active organization, roles, logout, `/health`, and navigation explicitly introduced by an approved workspace capability.

The implemented auth UI MUST retain associated field errors and status announcements, semantic radio controls for organization selection, visible selected and pending states, disabled repeated submission, semantic design tokens, visible focus treatment, and sufficient contrast for auth actions and dashboard content. Invitation returns MUST accept only local paths matching `/invite/[token]`; arbitrary or external `returnTo` values MUST fall back to the normal safe destination.

#### Scenario: Protected routes and accessible pending states
- **GIVEN** an anonymous visitor opens `/dashboard` or `/settings/members`, a pending-selection session opens a tenant-protected route, or an authenticated user opens login/register
- **WHEN** the route gate resolves the session state
- **THEN** the anonymous visitor is sent to login, the pending tenant route is sent to the selector, or the authenticated user is sent to the validated invitation return or `/dashboard`; while forms or selection submit, controls are disabled and loading/error feedback remains labeled, keyboard-accessible, focused, and usable without horizontal scrolling

#### Scenario: Valid invitation return survives login
- **GIVEN** an anonymous visitor reached login from `/invite/[token]`
- **WHEN** authentication succeeds with an authenticated or selection-required session
- **THEN** the user returns to that same invitation route instead of being forced to `/dashboard`

#### Scenario: Unsafe return destination is rejected
- **GIVEN** login or register receives an external, malformed, or unsupported `returnTo`
- **WHEN** authentication succeeds
- **THEN** the frontend ignores that destination and uses the normal safe Auth route

### Requirement: Error mapping is exact and safe

The frontend MUST preserve the backend error envelope `{ statusCode, code, message }` at the API boundary and map known codes without exposing raw responses. The matrix is:

| Status/code | Context and behavior |
|---|---|
| `400 VALIDATION_ERROR` | Show field/form validation feedback; preserve entered safe values; reject mixed normal/invitation registration modes |
| `409 EMAIL_ALREADY_REGISTERED` | Registration feedback; remain on register |
| `401 INVALID_CREDENTIALS` | Login feedback; do not distinguish unknown email from wrong password |
| `401 USER_NOT_ACTIVE` | Safe inactive-user feedback |
| `401 NO_ACTIVE_MEMBERSHIP` | Safe membership feedback; no tenant session |
| `401 SESSION_EXPIRED` | Session-expired feedback only when returned/observable as expired |
| `401 SESSION_REVOKED` | Session-revoked/expired-safe feedback; may represent an expired refresh in the current backend |
| `403 ORGANIZATION_ACCESS_DENIED` | Selection feedback; remain retryable on selector |
| `404 INVITATION_NOT_FOUND` | Invitation registration/preview feedback; do not submit an alternate identity |
| `410 INVITATION_EXPIRED`, `410 INVITATION_REVOKED` | Invitation no longer usable; remain on explicit invalid state |
| `409 INVITATION_ALREADY_ACCEPTED` | Invitation already consumed; do not retry registration automatically |
| `403 INVITATION_EMAIL_MISMATCH` | Do not accept with the current account; offer the safe account-change path |
| `401 UNAUTHORIZED`, `403 FORBIDDEN`, `409 CONFLICT`, other HTTP errors, malformed responses, network and timeout failures | Generic safe authentication feedback unless a more specific code above applies; never expose raw body, token, stack trace, or implementation detail |

#### Scenario: Logout accepts no content
- **GIVEN** a Bearer-authenticated session
- **WHEN** logout returns `204`
- **THEN** the frontend treats the empty body as success, clears memory, and navigates to login

#### Scenario: Invitation registration error preserves safe fields
- **GIVEN** invitation registration returns a recognized invitation error
- **WHEN** the frontend handles it
- **THEN** first name and last name may remain available for correction
- **AND** password and invitation token are not displayed in error details
