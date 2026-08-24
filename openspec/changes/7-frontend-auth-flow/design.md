# Design: Frontend Authentication Flow

## Decisions

| Area | Decision | Reason |
|---|---|---|
| State | One feature-owned provider/hook owns the in-memory access token, session, bootstrap status, and actions | Prevents duplicated tenant truth and persistent token exposure |
| Protection | Client gates in an App Router session layout; Server Components remain the default | Interactivity and navigation require client state; no middleware or BFF is justified |
| Bootstrap coordination | Skip refresh when memory has a token; share one in-flight refresh across duplicate effects; generation-gate every auth operation | Prevents the duplicate effect/remount races covered by the state harness without persistent storage |
| HTTP | Extend the existing API client with opt-in credentials, Bearer headers, typed error data, and empty `204` handling | Avoids a second client and preserves health behavior |
| Validation | Runtime guards for session, membership, and error envelopes | Backend data is external and no new schema dependency is approved |
| Capability header | Keep proposal `New Capabilities: frontend-auth-flow` and spec `## ADDED Requirements` | Strict validator accepts this new capability form |

## Data Flow

```text
session layout -> provider -> POST /api/auth/refresh (credentials: include)
                         -> GET /api/auth/me (Authorization: Bearer)
login/register -> full session + Set-Cookie -> dashboard or selector
selector -> POST /api/auth/select-organization (Bearer) -> full session -> dashboard
refresh -> auth metadata only; never refresh token JSON
logout -> POST /api/auth/logout (Bearer, credentials) -> 204 -> clear memory -> login
```

The session model follows the backend exactly: `memberships[]` has nested `organization` and roles; `activeMembership` has membership fields and roles without nested organization. Registration always creates/selects one organization. One active membership auto-selects. Before selection, multiple active memberships set both active fields to `null`; after selection, the backend retains all memberships and identifies one matching active organization/membership. Zero active memberships is `NO_ACTIVE_MEMBERSHIP`.

## Components and Boundaries

- API adapters under `src/features/auth/api` own HTTP calls, credentials, Bearer headers, response guards, and safe error mapping.
- The provider owns a module-memory token/session snapshot and monotonic generation. Login, registration, selection, and logout invalidate older work; token and session publish atomically, and stale bootstrap completion is ignored.
- Route pages compose small Client Components only for state, effects, events, and navigation; visual components remain presentational.
- Existing `Button`, `Card`, `Badge`, and `Separator` primitives and semantic tokens are reused. No dependency or global style change is planned.
- `/`, `/health`, and unrelated backend files remain unchanged.

## Contract and Error Boundary

Use `/api/auth/register` (`201`, `credentials: include`), `/login` (`200`, `credentials: include`), `/me` (`200`, Bearer), `/select-organization` (`200`, Bearer, new access token), `/refresh` (`200`, cookie-only with `credentials: include`, auth metadata), and `/logout` (`204`, Bearer plus `credentials: include`). Use the `legacylift_refresh` cookie with `HttpOnly`, `SameSite=Lax`, production-only `Secure`, and `Path=/api/auth`.

Map `EMAIL_ALREADY_REGISTERED`, `INVALID_CREDENTIALS`, `USER_NOT_ACTIVE`, `NO_ACTIVE_MEMBERSHIP`, `ORGANIZATION_ACCESS_DENIED`, `SESSION_EXPIRED`, `SESSION_REVOKED`, and `UNAUTHORIZED` to safe contextual feedback. Treat malformed, network, timeout, and other unrecognized failures generically. Do not convert every bootstrap failure to `SESSION_EXPIRED`; browser code cannot inspect an `HttpOnly` cookie, so first-visit versus expired/revoked status depends on an observable HTTP signal. When the initial refresh fails on `/auth/login` or `/auth/register`, leave the user anonymous without a session notice; preserve specific session notices when the same failure begins on `/dashboard` or `/auth/select-organization`. The current backend returns `SESSION_REVOKED` without a refresh cookie instead of `UNAUTHORIZED`; this route-aware mitigation does not resolve the backend contract blocker.

The documented port/origin mismatch remains recorded: backend default `3001`, frontend README/scripts and `FRONTEND_URL` references to `3000`/`3001`. Maintainer cookie/CORS verification passed against the configured environment; this remains a testing note, not a proposed contract change.

## Verification Strategy

- Vitest contract tests mock every endpoint and assert method, path, body, expected status, credentials, Bearer requirements, response guards, nested membership organization, auth-only refresh response, observed `Set-Cookie` headers, and `204` empty logout. Frontend JavaScript does not claim visibility into HttpOnly cookie attributes.
- Selected-session fixtures model ACTIVE `org123` and `org321` memberships, select `org321`, and allow its empty roles. Role comparison remains order-sensitive because no backend evidence requires set equivalence; changing that semantic is intentionally out of scope.
- Vitest state tests mount the real provider with mocked adapters and prove Strict Mode duplicate effects share one bootstrap. They also settle organization selection before an older refresh and prove generation invalidation prevents the stale `/me` request. A focused integration test keeps production `auth-api.ts` real, mocks `fetch` plus `next/navigation`, and proves `requireResponse(..., isFullSession)` accepts the retained org123/org321 response before the provider atomically adopts its session and selected token. The exact restarted-server, incognito browser flow also passed after selecting `org321` once, with no follow-up `401` or `SESSION_REVOKED`.
- Maintainer manual verification is complete for desktop/mobile UI, keyboard/focus, responsive layout, auth endpoint contract cases, cookie/CORS behavior, first visit/reload, expired/revoked session, zero/one/multiple memberships, redirects, retry/error states, no token in storage/URL, `/`, and `/health`.
- Evidence is complete for final verification: 16 Vitest tests passed on clean commit `a8a2f4b`, prior validations passed, and the exact remediated browser flow passed. Archive remains pending a passing verify report.

## Rollout and Rollback

No migration, dependency, package, backend, or persisted frontend data change. Do not implement before `PLAN APPROVED`. Roll back only the approved auth implementation while preserving `/` and `/health`.
