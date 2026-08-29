# Delta for frontend-auth-flow

## MODIFIED Requirements

### Requirement: Session shape and organization selection are contract-driven

Each `memberships[]` item MUST contain a nested `organization` and `roles`. `activeMembership` MUST contain only its membership fields and `roles`; it MUST NOT contain a nested organization. The selector and App Shell switcher MUST render only validated `ACTIVE` `memberships[]` options and MUST NOT accept arbitrary organization IDs or authorize from client data. The selector MAY show roles; the App Shell switcher MUST show organization name and active marker only. Runtime validation MUST reject duplicate membership or organization identifiers and incoherent active organization/membership pairs. A selected session MAY retain multiple ACTIVE memberships; it is coherent when the active membership exists in `memberships`, is ACTIVE, and matches the selected organization and roles. Empty role arrays are valid. Auth MUST replace the whole session and in-memory token only after confirmed selection.

(Previously: Selection options included organization names and roles without distinguishing the App Shell switcher, and the replacement timing was not explicit.)

#### Scenario: Valid selection returns the new session

- **GIVEN** a session with `requiresOrganizationSelection: true` or an authenticated App Shell session
- **WHEN** the user selects a different listed active organization and `POST /api/auth/select-organization` returns `200`
- **THEN** the frontend accepts all retained memberships, replaces the whole session, uses the returned new access token in memory, and navigates to `/dashboard`

#### Scenario: Selection failure is retryable

- **GIVEN** a selection request fails
- **WHEN** the error is handled
- **THEN** the selector remains visible, displays safe feedback, and allows retry without inventing an option

#### Scenario: Access denial preserves an App Shell session

- GIVEN an App Shell selection returns `ORGANIZATION_ACCESS_DENIED`
- WHEN Auth handles the error
- THEN it retains the prior session, token, and roles
- AND it reports safe retryable feedback without navigating

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
| `403 ORGANIZATION_ACCESS_DENIED` | Selection feedback; retain prior App Shell Auth context, keep its switcher open, and remain retryable |
| `401 UNAUTHORIZED`, `403 FORBIDDEN`, `409 CONFLICT`, other HTTP errors, malformed responses, network and timeout failures | Generic safe authentication feedback unless a more specific code above applies; never expose raw body, token, stack trace, or implementation detail |

(Previously: `ORGANIZATION_ACCESS_DENIED` remained retryable but did not explicitly preserve App Shell context or menu visibility.)

#### Scenario: Logout accepts no content

- **GIVEN** a Bearer-authenticated session
- **WHEN** logout returns `204`
- **THEN** the frontend treats the empty body as success, clears memory, and navigates to login
