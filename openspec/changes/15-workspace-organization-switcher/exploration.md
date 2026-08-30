## Exploration: Workspace organization switcher

### Current State

Issue `Proyecto-Software-I/frontend#15` is open and assigned. It depends on the now-merged auth flow and authenticated workspace shell; `main` is at `22749ec`, and the checked-out feature branch is clean and based on that merge.

The application already has one canonical, client-side authentication state owner: `AuthProvider` in `src/features/auth/hooks/auth-provider.tsx`. Its module-memory state holds the access token and complete `SessionContext`; it exposes `chooseOrganization(organizationId)`, which delegates to the existing `POST /api/auth/select-organization` adapter and atomically adopts the returned full session only after backend confirmation. The adapter sends the current Bearer token and the selected `organizationId`; no new endpoint, provider, tenant context, or HTTP client is needed.

The canonical `Membership`, `Organization`, `ActiveMembership`, `FullSession`, and `SessionContext` types are in `src/features/auth/types/auth.ts`. Runtime guards already ensure unique membership and organization identifiers, only accept an `ACTIVE` active membership, and require the active membership, organization, and roles to agree. The complete response adoption replaces the in-memory access token, active organization, active membership, memberships, and selection flag together.

`AuthProvider` already serializes auth operations with a monotonic generation. A late bootstrap result cannot overwrite a newer login, registration, organization selection, or logout result. It does not, however, reject overlapping selection calls; the switcher must acquire a synchronous feature-local single-flight guard before calling the adapter and retain it until settlement. React `pending` state and disabled controls only reflect that guarded in-flight interaction; they cannot provide mutual exclusion.

The workspace composition is `WorkspaceBoundary` followed by `WorkspaceShell` in `src/app/(session)/(workspace)/layout.tsx`. The boundary prevents private content from rendering during bootstrap, redirects anonymous users to login, and redirects selection-required sessions to the existing pre-entry selector. `WorkspaceShell` is already a client component because it consumes Auth, controls mobile navigation, and handles logout. It shows the active organization in the desktop header and has a responsive mobile `<aside>` opened by the existing menu control; that aside does not currently display the active organization and is a planned switcher integration point. `DashboardContent` reads the same Auth context and renders the active organization and `activeMembership.roles`, so a successful full-session replacement will immediately update all current tenant and role displays without a second local state.

Only `Button`, `Card`, `Badge`, and `Separator` shadcn primitives are currently installed. The existing pre-entry `OrganizationSelector` demonstrates the repository pattern for filtering `ACTIVE` memberships, safe API error mapping, disabled pending controls, and role display, but it is a separate full-page radio form for the selection-required state. It should not be repurposed as a second tenant-state owner.

### Affected Areas

- `src/features/auth/hooks/auth-provider.tsx` — reuse `chooseOrganization` and the existing atomic full-session adoption; only a narrowly scoped provider change is justified if the UI cannot safely serialize calls by itself.
- `src/features/auth/types/auth.ts` — reuse `Membership`, `Organization`, `ActiveMembership`, and `ACTIVE_MEMBERSHIP_STATUS`; do not duplicate tenant models.
- `src/features/auth/api/auth-api.ts` — reuse `selectOrganization`; preserve its existing `POST /api/auth/select-organization` request contract.
- `src/features/workspace/components/workspace-shell.tsx` — integrate the switcher at the existing desktop organization context and in the existing mobile navigation aside. This is the primary composition and responsive reuse point.
- `src/features/workspace/components/dashboard-content.tsx` — no parallel role state is needed; its existing `session.activeMembership.roles` rendering is the verification surface for immediate role replacement.
- `src/features/auth/auth-error.ts` — reuse the selection-context error mapping for `ORGANIZATION_ACCESS_DENIED` and existing invalid-session behavior rather than exposing backend details.
- `tests/auth-provider.state.test.tsx` and `tests/auth-provider.api-integration.test.tsx` — extend the existing provider/API test pattern for token/session replacement and stale-operation safety only if required by an Auth-boundary change.
- New focused workspace switcher tests under `tests/` — verify the visible one-versus-many membership behavior, current-selection no-op, synchronous single-flight behavior, rollback on failure, dashboard redirect, and role display after replacement. Reuse the existing Vitest/jsdom harness and auth fixtures.

### Contract And Data Flow

```text
Auth session.memberships (ACTIVE entries only)
        -> Workspace switcher options
        -> chooseOrganization(selected organization.id)
        -> POST /api/auth/select-organization with current Bearer token
        -> backend full session confirmation
        -> AuthProvider atomically replaces token + session context
        -> router.replace("/dashboard")
        -> workspace and dashboard rerender from the same Auth context
```

- `memberships` is the exclusive option source. The switcher must filter by `ACTIVE_MEMBERSHIP_STATUS`, render the nested organization name and available roles as needed, and never accept typed or URL-derived organization IDs.
- With one active membership, retain the existing non-interactive organization context; do not render a dropdown or equivalent switching control.
- With two or more active memberships, make the existing active organization context interactive and identify the active entry visually and accessibly.
- Selecting the currently active organization must close or leave the control without an HTTP request and without changing Auth state.
- A new selection must not alter visual active tenant, token, active membership, or roles until the backend response passes existing full-session validation and Auth adopts it.
- On a selection failure, the local pending state clears, safe mapped feedback is shown, and the previous Auth context remains intact. `ORGANIZATION_ACCESS_DENIED` must be user-facing without raw API details. Existing Auth/session-invalid behavior remains authoritative.
- After success, navigate with `router.replace("/dashboard")`, even from future tenant-scoped workspace routes. This is the current bounded invalidation strategy: the old route is abandoned and no new global cache or speculative tenant state is introduced. The present workspace has no other tenant-scoped data cache to clear.

### Approaches

1. **Feature-local switcher composed inside the existing WorkspaceShell** — add a small client component or local shell subtree that reads `useAuth`, derives active memberships, holds UI open/pending/error state, calls `chooseOrganization`, then replaces the route with `/dashboard`.
   - Pros: preserves one Auth source of truth; reuses the desktop header and mobile aside; scopes pending/error state to the interaction; requires no endpoint, provider, route group, or state library.
   - Cons: the Shell is already substantial, so extracting a feature component is preferable if inline logic harms readability.
   - Effort: Low to Medium.

2. **A WorkspaceOrganizationProvider or parallel tenant state** — duplicate active organization and memberships near the Shell.
   - Pros: superficially isolates the UI.
   - Cons: explicitly forbidden by the issue; creates stale token, role, and tenant risks; duplicates Auth's atomic adoption and concurrency coordination.
   - Effort: Medium and incorrect for this scope.

3. **Fetch organizations or session data again for the menu** — introduce `GET /organizations`, repeat `/me`, or a dedicated switch endpoint.
   - Pros: none for the current contract.
   - Cons: violates the memberships-only source requirement, duplicates data flow, and requires an unapproved backend contract change.
   - Effort: Medium to High and out of scope.

### Recommendation

Use a feature-local `OrganizationSwitcher` composed by `WorkspaceShell`, backed exclusively by `useAuth().session.memberships` and `useAuth().chooseOrganization`. Keep open/pending/error feedback local to that component, and use a synchronous feature-local single-flight guard for mutual exclusion; do not add a second provider or persist any tenant information. Reuse the Shell's desktop organization location and its existing mobile aside instead of creating a separate mobile navigation path.

Use the shadcn `DropdownMenu` generated through the approved workflow. The repository already declares shadcn `^4.16.1` and unified `radix-ui` `^1.6.7`; current shadcn new-york documentation imports this component from `radix-ui`, not an `@radix-ui/react-*` package. No dependency is required or will be added. Existing primitives alone do not include a menu/popover.

Before calling `chooseOrganization` for a different target, the handler must synchronously acquire a feature-local single-flight guard and release it only when the promise settles; a caller that cannot acquire it must return without starting another request. React `pending` state and disabled switch options mirror the guarded request for UI feedback only. The current organization remains a no-op. On success, wait for `chooseOrganization` to resolve, close the switcher dropdown and, on mobile, the containing `WorkspaceShell` aside/overlay before calling `router.replace("/dashboard")`. On rejection, keep the relevant dropdown and mobile aside/overlay open for retry and show mapped safe feedback. Since `chooseOrganization` only publishes after success and provider generation excludes stale bootstrap completions, this gives the required atomic result without preemptive tenant rendering.

### Responsive And Accessibility Requirements

- Desktop: replace the existing static organization label in the header with the switcher only when more than one active membership exists; retain the same visual context location and no duplicate tenant display.
- Mobile: place the same switcher interaction in the existing mobile navigation aside. On successful switch, close both the switcher dropdown and containing aside/overlay before redirecting to `/dashboard`; on denial, keep the relevant controls open for retry. Do not invent a separate mobile route or navigation model.
- The trigger must expose its expanded state and an accessible name. Menu/list options must be keyboard-operable, identify the current organization, retain visible focus, and communicate pending and error feedback.
- During the request, the acquired single-flight guard prevents repeat interaction and concurrent organization changes; disabled UI communicates that state but is not the lock. The active organization remains visible until confirmation; loading feedback must not imply a completed tenant change.
- Preserve the Shell's existing Escape and scroll-lock cleanup for the mobile overlay. The switcher must not introduce horizontal scrolling at mobile widths.

### Test Strategy

- Unit/component coverage using existing Vitest/jsdom fixtures: one active membership renders static context without switcher; multiple active memberships render only `ACTIVE` membership organizations and identify the current organization.
- Verify selecting the current organization sends no request.
- Verify two immediate different selections against a deferred response acquire the synchronous single-flight guard before `chooseOrganization` and start exactly one request; `pending`/disabled options reflect that request until settlement. Verify a successful mobile selection adopts the returned token/session through Auth, updates displayed organization and roles, closes both the switcher dropdown and mobile navigation aside/overlay, and redirects to `/dashboard`.
- Verify a rejected selection keeps the original organization and roles visible, retains the original Auth token/session behavior, leaves the relevant controls open, shows safe mapped feedback, and permits a retry.
- Retain or extend Auth provider tests that prove full-session atomic replacement and a stale bootstrap cannot overwrite a selection. Do not duplicate backend authorization tests owned by backend #5.
- Run the existing related tests, `npm run lint`, `npm run build`, and `npm run check` after implementation. Manual verification requires a user with at least two active memberships through Org A -> Org B -> Org A, including refresh, logout, desktop keyboard flow, and mobile overlay flow.

### Risks And Open Questions

- The issue says `memberships.length`, while the canonical Auth flow only permits `ACTIVE` memberships as selectable tenant context. The implementation should count and render active memberships only; inactive memberships must not make a switcher appear. This is consistent with the existing selector and Auth validation, but should be stated in the proposal/spec.
- Auth's generation guard protects against stale bootstrap results, but it does not itself reject overlapping `chooseOrganization` calls. The switcher must enforce a synchronous feature-local single-flight guard before invocation and through settlement; React `pending` state and disabled UI cannot be that guard. If future callers need the same guarantee, centralizing it in Auth would be a material design decision.
- No tenant-scoped query/cache exists at `22749ec`. Redirecting to `/dashboard` after a successful switch is sufficient today. Any cache invalidation mechanism must be added only if tenant-scoped data exists when implementation begins.
- The current backend contract's session-invalid error mapping and cookie refresh behavior remain owned by the merged Auth flow. This change must not add a parallel session recovery path.
- The final dropdown/popover primitive is not present in `src/components/ui`. Installing a shadcn primitive is allowed by the issue, but the proposal must choose it deliberately and avoid introducing a separate UI library.

### Scope And Non-goals

In scope: an App Shell organization switcher based on existing active memberships; desktop and existing-mobile-aside integration; reuse of the Auth operation and canonical types; atomic backend-confirmed switching; a synchronous feature-local single-flight guard with local UI feedback/error behavior; `/dashboard` redirect; current tenant/role display update; focused tests and existing validation.

Out of scope: new backend endpoints or schema changes; organization creation, invitations, membership administration, organization settings, projects, RBAC administration UI, last-organization persistence across distinct sessions, a new tenant/organization provider, persistent token storage, broad cache infrastructure, or a new mobile navigation system.

### Ready For Proposal

Yes. The issue contract, final merged Auth implementation, App Shell composition, test harness, and responsive integration point are available. The only planning choice is the smallest accessible menu/popover primitive for the existing Shell; it does not require a backend decision.

**Status**: success
**Executive Summary**: Explored frontend issue #15 against `main` at `22749ec`, the merged Auth provider, and Workspace App Shell. The smallest compliant approach is a feature-local switcher in `WorkspaceShell` that derives active options from canonical memberships, synchronously acquires a single-flight guard before delegating to existing `chooseOrganization`, and redirects to `/dashboard` only after atomic Auth confirmation.
**Artifacts**: `openspec/changes/15-workspace-organization-switcher/exploration.md`
**Next Recommended**: sdd-propose
**Risks**: Local switcher code must retain a synchronous single-flight guard through settlement because Auth currently coordinates stale operations but does not reject overlapping selections; React `pending` state and disabled UI cannot replace that guard. The future menu primitive must preserve keyboard and focus semantics.
**Skill Resolution**: none — direct instruction prohibited skill loading.
