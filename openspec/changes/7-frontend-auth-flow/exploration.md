## Exploration: Multi-tenant frontend authentication flow

### Current State

The frontend is a small Next.js 16.2.12 App Router application using strict TypeScript, feature folders, shared shadcn/ui primitives, and `NEXT_PUBLIC_API_URL`. The current routes are `/`, `/health`, and the root layout; `/auth/login`, `/auth/register`, `/auth/select-organization`, and `/dashboard` do not exist. The existing landing page already links to the two auth entry routes.

`src/lib/api/api-client.ts` provides the only HTTP client and currently supplies `Accept: application/json`, timeout cancellation, and generic JSON/text parsing. It does not currently add `credentials: "include"` or an `Authorization` header. `ApiError` preserves HTTP status and the untyped response body, which is sufficient to inspect the backend error envelope but does not yet provide typed error-code handling.

The existing health feature demonstrates the repository pattern: endpoint access under `src/features/health/api`, client-side state under `src/features/health/hooks`, runtime response validation, and user-safe error messages. No authentication state, route guard, browser storage token persistence, auth feature module, or protected route exists yet.

The local sibling backend implements the contract from `Proyecto-Software-I/backend#5`:

- `POST /api/auth/register` returns HTTP 201 and a full auth response with an active organization and `requiresOrganizationSelection: false`.
- `POST /api/auth/login` returns HTTP 200. One active membership is selected automatically; two or more active memberships return `activeOrganization: null`, `activeMembership: null`, and `requiresOrganizationSelection: true`.
- `GET /api/auth/me` requires `Authorization: Bearer <accessToken>` and returns session context without an access token.
- `POST /api/auth/select-organization` requires Bearer authentication, accepts `{ organizationId }`, validates an active membership, and returns a full auth response with the selected tenant.
- `POST /api/auth/refresh` reads the HttpOnly `legacylift_refresh` cookie and returns only `auth.accessToken`, `tokenType`, and `expiresIn`; it does not require Bearer authentication.
- `POST /api/auth/logout` requires Bearer authentication, clears the refresh cookie, and returns HTTP 204.
- Successful auth responses contain `user`, `auth`, `activeOrganization`, `activeMembership`, `memberships`, and `requiresOrganizationSelection`. Membership entries contain a nested `organization` object and `roles`.
- The backend auth specification defines `SESSION_EXPIRED` for an expired session and `SESSION_REVOKED` for a revoked session. Generic authentication failures may be observed as `UNAUTHORIZED`; these cases remain distinguishable from the specific session codes at the frontend error boundary.

The backend enables CORS with credentials and uses the refresh cookie at path `/api/auth`, so browser requests to refresh and other cookie-dependent auth calls must include credentials. The access token must remain in memory only, per frontend issue #7 and the repository security rules.

### Affected Areas

- `src/lib/api/api-client.ts` — extend the shared request boundary for credentials, Bearer headers, and auth-safe request behavior without creating a second HTTP client.
- `src/lib/api/api-error.ts` — preserve or type the backend `{ statusCode, code, message }` envelope so feature code can map known auth codes to safe user messages.
- `src/features/auth/api/*` — add endpoint adapters for register, login, refresh, current-session lookup, organization selection, and logout using the shared client and exact backend DTO/response shapes.
- `src/features/auth/types/*` — define the single auth response/session model, including nested membership organizations, nullable active tenant fields, token metadata, and explicit state flags.
- `src/features/auth/hooks/*` and/or a feature-level provider — own the in-memory auth state and restoration lifecycle instead of duplicating it across pages.
- `src/features/auth/components/*` — provide form, organization-selection, loading, error, and success presentations using existing `src/components/ui/button.tsx`, `card.tsx`, and available primitives.
- `src/app/auth/login/page.tsx` — implement the login entry route and redirect based on the backend tenant-resolution flags.
- `src/app/auth/register/page.tsx` — implement registration and direct navigation to `/dashboard` after the backend-created organization is active.
- `src/app/auth/select-organization/page.tsx` — render only the backend-provided `memberships[]` options and submit the selected organization ID.
- `src/app/dashboard/page.tsx` — add the temporary authenticated placeholder, active organization/roles display, logout action, and `/health` link.
- `src/app/layout.tsx` and route protection boundary — potentially affected only if the chosen session bootstrap or navigation strategy requires a provider/layout boundary; no change is justified yet.
- `src/app/page.tsx` and `src/app/health/page.tsx` — behavior must remain available; the landing auth links must become valid routes and the health integration must remain unchanged.
- `package.json` — no change is expected. `npm run check` already exists and runs strict OpenSpec validation, lint, and build.

### Approaches

1. **Feature-owned client auth provider with in-memory session** — keep endpoint adapters under `src/features/auth/api`, expose one auth state owner through a small provider/hook, bootstrap with refresh then `/me`, and let route pages perform state-based redirects.
   - Pros: matches the repository feature architecture; keeps token memory-only; centralizes restoration, logout, and tenant state; supports the required interactive forms without making unrelated routes client components.
   - Cons: requires careful bootstrap/redirect sequencing and a clear handling strategy for a missing or expired session.
   - Effort: Medium

2. **Route-level auth state in each page** — each auth/dashboard route calls the endpoint adapters and manages its own session transitions.
   - Pros: initially small and easy to localize.
   - Cons: duplicates the required source of truth; makes refresh, logout, protected navigation, and cross-route tenant state inconsistent; conflicts with issue #7's explicit no-duplication requirement.
   - Effort: Medium

3. **Server-side session or Next.js BFF/proxy** — move token/session coordination into server cookies or frontend route handlers.
   - Pros: could reduce client token exposure and simplify server-side protection.
   - Cons: changes the stated token-in-memory model, introduces a new frontend API boundary, and conflicts with `AGENTS.md` unless explicitly approved; backend refresh cookie path/CORS behavior would need a coordinated contract decision.
   - Effort: High

### Recommendation

Use the feature-owned in-memory auth provider/hook with shared API adapters. It is the smallest approach that satisfies the single-source-of-truth requirement, preserves the backend contract, supports refresh restoration, and avoids a second HTTP client or an unapproved BFF. Keep route components responsible for composition and navigation while keeping HTTP calls and auth state outside purely visual components.

The navigation state machine should be contract-driven:

```text
bootstrap -> POST /refresh -> GET /me
    | failure
    v
  logged out -> /auth/login

login/register success
    | requiresOrganizationSelection = false
    | activeOrganization != null
    v
  /dashboard

login success
    | requiresOrganizationSelection = true
    | activeOrganization = null
    v
  /auth/select-organization -> POST /select-organization -> /dashboard
```

The frontend issue's `/dashboard` route is the authoritative target for this change. The backend issue uses `/app` in its UX examples; this is a route naming difference, not a reason to alter the backend contract.

### Exact Contract Assumptions

- Request paths, methods, field names, HTTP statuses, and error envelope remain exactly as implemented locally in the backend.
- `auth.accessToken` is the only access-token location in successful register/login/select responses; it is never written to `localStorage`, `sessionStorage`, or a URL.
- `memberships[]` is the only source for organization choices; the user does not type an organization ID and the frontend does not authorize based on a URL or client-provided tenant value.
- `GET /api/auth/me` is needed after refresh because refresh returns token metadata only. It is also the source used to restore organization context.
- `credentials: "include"` is required for refresh and is compatible with the backend's CORS configuration and HttpOnly cookie.
- `POST /api/auth/logout` may return an empty 204 body; the shared client must not require JSON for that response.
- The current backend `selectOrganization` response does not set a new refresh cookie because the existing session cookie remains valid; the frontend should use the returned access token and not assume a refresh-token JSON field.

### Resolved Planning Notes And Remaining Constraints

- **Error handling is contract-driven.** `SESSION_EXPIRED` is a defined backend code. The frontend maps it, `SESSION_REVOKED`, `UNAUTHORIZED`, and other known or generic failures safely according to the current proposal/spec/design, without changing or inventing backend behavior.
- **Cookie/CORS topology remains a testing prerequisite.** The documented frontend/backend `localhost` port and origin mismatch (`3000`/`3001`) must be aligned or explicitly recorded before browser verification of the HttpOnly `/api/auth` cookie. This is a verification blocker, not an unresolved product question or contract change.
- **Response values remain backend-owned.** The frontend must render returned identity and membership values, including `displayName`, rather than derive or normalize fields beyond the documented request/response contract.

### Implementation Constraints

- Use the approved feature-owned provider/session layout and one bounded `POST /refresh` followed by `GET /me`; do not add recursive refresh or a second auth client.
- Keep access tokens in memory only and use validated `memberships[]` data for organization selection.
- Treat first-visit versus expired/revoked bootstrap outcomes as distinct only when the HTTP response makes that distinction observable; never infer `SESSION_EXPIRED` from an opaque failure.
- Preserve the approved redirects and loading boundary for dashboard, selector, login, and registration routes.

### Scope And Non-goals

In scope: the four routes named by frontend issue #7; registration, login, bounded session restoration, exceptional organization selection, dashboard placeholder, logout, shared API-client auth support, centralized in-memory auth state, contract error mapping, responsive/accessibility states, and preserving `/health`.

Out of scope: changing the backend contract or backend implementation; creating a second HTTP client or frontend BFF; persistent access-token storage; the real dashboard/app shell; organization switching after entry; last-organization persistence; projects, legacy systems, settings, invitations, password recovery, email verification, OAuth, MFA, billing, role administration, and new testing infrastructure.

### Risks

- A contract mismatch in error codes or response shapes can produce incorrect user messaging or navigation; use the local backend implementation and tests as the baseline and stop for any required contract change.
- Client-side auth restoration can cause redirect loops or a flash of protected content if the approved provider and loading boundary are implemented inconsistently.
- Incorrect `credentials` or cookie-path handling will make refresh appear logged out after reload even when the backend session is valid.
- Treating `organizationId` as authorization rather than backend-selected context would violate the multi-tenant boundary.
- Making the full layout or all pages client components would increase coupling and contradict the existing Server Component default.
- The current frontend has no auth tests or established route-guard pattern; verification will need focused manual scenarios and the existing `npm run check` unless the approved plan justifies tests without adding infrastructure.

### Ready for Proposal

Yes. The backend contract and the current proposal/spec/design/tasks resolve the former error-code, route-protection, bootstrap, and redirect questions. The only remaining blocker is the documented local cookie/CORS topology prerequisite for browser verification; it does not block planning or require a contract change. In interactive mode, the next phase (`sdd-propose`) still requires explicit user approval before it starts, and exploration does not authorize implementation.

**Status**: planning-ready
**Executive Summary**: Explored frontend issue #7, which was successfully read from GitHub earlier, against the real frontend and sibling backend repositories. The recommended direction is a feature-owned, in-memory auth state over the existing API client; known and generic backend errors are mapped safely without changing the backend contract.
**Artifacts**: `openspec/changes/7-frontend-auth-flow/exploration.md`
**Next Recommended**: Implementation may proceed only after the existing planning approval gate; resolve or record the local cookie/CORS topology before browser-cookie verification.
**Risks**: Cross-origin refresh-cookie behavior remains dependent on the documented `3000`/`3001` topology prerequisite; unrecognized or non-observable failures must remain generic.
**Skill Resolution**: exact-path — loaded `C:\Users\brahi\.config\opencode\skills\sdd-explore\SKILL.md`, `C:\Users\brahi\.config\opencode\skills\_shared\SKILL.md`, and `C:\Users\brahi\.config\opencode\skills\cognitive-doc-design\SKILL.md`.
