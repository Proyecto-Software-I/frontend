# Delta for frontend-auth-flow

## ADDED Requirements

### Requirement: Registration And Login

The application MUST provide `/auth/register` and `/auth/login` while preserving the backend contract. Registration and single-organization login MUST navigate to `/dashboard`; authenticated visitors opening either form MUST redirect there.

#### Scenario: Register successfully
- GIVEN valid registration data
- WHEN the backend returns an active organization and `requiresOrganizationSelection: false`
- THEN the token is kept in memory and the user reaches `/dashboard`

#### Scenario: Login resolves one organization
- GIVEN valid credentials and one active membership
- WHEN login returns an active organization and selection false
- THEN no selector appears and the user reaches `/dashboard`

#### Scenario: Form operation states
- GIVEN a form is idle, loading, successful, or failed
- WHEN it renders or submits
- THEN it shows feedback and disables submit while loading

### Requirement: Exceptional Organization Selection

The application MUST show `/auth/select-organization` only for `requiresOrganizationSelection: true` with no active organization. Options MUST come from `memberships[]`, showing organization names and roles. Users MUST NOT enter an ID or authorize from client data.

#### Scenario: Login requires selection
- GIVEN login returns null active organization and selection true
- WHEN the response is accepted
- THEN the user reaches the selector with the backend membership options

#### Scenario: Valid selection
- GIVEN the user chooses a listed membership
- WHEN `POST /api/auth/select-organization` succeeds
- THEN the returned session is current and the user reaches `/dashboard`

#### Scenario: Selection error
- GIVEN selection returns an error
- WHEN the response is handled
- THEN the user stays on the selector, sees feedback, and can retry

### Requirement: Session Bootstrap And Security

The application MUST own one auth state containing user, in-memory token, active organization/membership, memberships, auth and loading status. Bootstrap MUST call refresh then `/me`, use `credentials: include`, and send `Authorization: Bearer <accessToken>`. The refresh token MUST remain an HttpOnly cookie; tokens MUST NOT enter browser storage, URLs, or client authorization decisions.

#### Scenario: Valid refresh
- GIVEN a reload with a valid HttpOnly refresh cookie
- WHEN refresh and `/me` succeed
- THEN tenant context is restored without protected-content flicker

#### Scenario: Failed refresh
- GIVEN refresh or bootstrap fails
- WHEN the bounded attempt completes
- THEN memory auth is cleared, login is shown with session-expired feedback, and no refresh loop occurs

### Requirement: Protected Navigation And Dashboard

The application MUST protect `/dashboard` and the selector, route pending-selection users to the selector, and preserve `/` and `/health`. Backend authorization MUST remain the tenant authority. The placeholder MUST show only user, active organization, roles, logout, and `/health`.

#### Scenario: Protected access and logout
- GIVEN no session, or an authenticated user activating logout
- WHEN the user opens `/dashboard`, or logout returns success including `204`
- THEN the unauthenticated user is redirected to login, or auth is cleared and login is shown

### Requirement: Safe, Accessible, Responsive Auth UI

The UI MUST map `EMAIL_ALREADY_REGISTERED`, `INVALID_CREDENTIALS`, `USER_NOT_ACTIVE`, `NO_ACTIVE_MEMBERSHIP`, `ORGANIZATION_ACCESS_DENIED`, `SESSION_EXPIRED`, `SESSION_REVOKED`, and validation failures safely; unknown failures MUST be generic. Controls MUST have labels, semantic roles, keyboard access, visible focus, associated errors, and disabled pending states. Layouts MUST work on mobile, tablet, and desktop without horizontal scrolling.

#### Scenario: Error handling
- GIVEN an auth request returns a known or unknown error
- WHEN the UI handles it
- THEN feedback preserves the form or selector and exposes no token, stack trace, or raw response

#### Scenario: Contract ambiguity
- GIVEN the backend emits `UNAUTHORIZED`, `SESSION_REVOKED`, or `SESSION_EXPIRED` on different paths
- WHEN the frontend maps the response
- THEN it handles observed codes safely and MUST NOT invent or alter the backend contract; coordination remains a dependency on backend#5

#### Scenario: Keyboard and responsive use
- GIVEN keyboard navigation at any supported viewport
- WHEN the user tabs through and submits a form or selector
- THEN focus remains visible and required actions remain operable
