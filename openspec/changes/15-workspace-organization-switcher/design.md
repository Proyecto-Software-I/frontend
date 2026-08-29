# Design: Workspace Organization Switcher

## Technical Approach

Add a feature-local client `OrganizationSwitcher` to the existing client `WorkspaceShell`: desktop header and mobile navigation aside. The App Router workspace layout remains a Server Component. The switcher derives its display from the canonical Auth session and delegates selection to `chooseOrganization`.

## Architecture Decisions

| Decision | Alternatives considered | Rationale |
|---|---|---|
| Reuse `SessionContext`, `Membership`, `ACTIVE_MEMBERSHIP_STATUS`, and `useAuth` | Feature-local types or provider | Auth validates membership coherence and owns the in-memory token/session; a second source could be stale. |
| Use a feature-local client switcher with a synchronous single-flight guard | Put selection logic in `WorkspaceShell` or Auth | It isolates menu state and errors while synchronously preventing overlapping selections before Auth invocation. Auth remains transport and atomic-session owner. |
| Add the smallest shadcn/Radix dropdown-menu primitive | Custom menu or another UI library | No menu primitive exists. This supplies semantic menu behavior and focus management without a new package. |
| Redirect only after successful selection | Navigate before the request or refresh the route | `chooseOrganization` replaces the full session/token before resolving, preventing mixed tenant state. |

## Component Boundaries

- `OrganizationSwitcher` reads `session` and `chooseOrganization` from `useAuth`, filters `memberships` to `ACTIVE`, and returns static context below two options.
- `WorkspaceShell` supplies desktop/mobile placement and retains logout/mobile-aside state. No navigation model is added.
- `AuthProvider` and `auth-api` are reused: `selectOrganization` validates the `FullSession`; `adoptFullSession` publishes session and access token together only after confirmation.
- `DashboardContent` already reads `session.activeMembership.roles`; it updates naturally when Auth publishes the replacement session.

## Data Flow

```text
active Auth session
  -> OrganizationSwitcher filters ACTIVE memberships
  -> user chooses a different organization
  -> chooseOrganization -> POST select-organization
  -> validated FullSession -> atomic Auth publish (session + token)
  -> switcher closes -> router.replace("/dashboard")
  -> Shell/Dashboard rerender organization and current roles
```

The switcher keeps only `open`, `pending`, and safe `error` locally. Before invoking Auth for a different organization, its handler MUST synchronously acquire a feature-local single-flight guard; it retains that guard through promise settlement and releases it in the settlement path. This guard, not React `pending` state, prevents immediate duplicate or different selections from starting a second request. `pending` mirrors the in-flight interaction for disabled UI until settlement. The active ID is a no-op: no request, stale feedback cleared, menu closed. On `ORGANIZATION_ACCESS_DENIED` or another failure, Auth has not published a replacement, so prior organization, roles, and token remain canonical. Clear `pending`, keep `open`, announce mapped safe feedback, and allow retry; a new choice clears the error. Success clears error, closes, then calls `router.replace("/dashboard")`. No tenant ID is persisted or accepted outside validated memberships.

## Accessible Responsive Behavior

Use shadcn/Radix `DropdownMenu` with a visible labelled active-organization trigger. Items contain only organization name and active marker. Preserve Enter/Space, arrow keys, Escape, focus restoration, and pending disabled state. Apply existing semantic tokens and `focus-visible` treatment. The desktop trigger replaces static header context only when available; the mobile trigger is in the open existing aside and does not close it on access denial.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/components/ui/dropdown-menu.tsx` | Create | Generate the approved shadcn/Radix primitive; no new dependency. |
| `src/features/workspace/components/organization-switcher.tsx` | Create | Client interaction, active-membership derivation, pending/error/reset behavior, and routing. |
| `src/features/workspace/components/workspace-shell.tsx` | Modify | Compose static-or-switchable organization context in desktop header and mobile aside. |
| `tests/organization-switcher.test.tsx` | Create | DOM-level component behavior and keyboard/accessibility states. |
| `tests/auth-provider.state.test.tsx` | Modify | Prove failed selection preserves session and roles. |

## Interfaces / Contracts

No backend or public type changes. `chooseOrganization(organizationId)` sends the existing Bearer-authenticated `POST /api/auth/select-organization`. The switcher passes only an ID from canonical filtered `Membership[]`; authorization stays server-side. Runtime guards reject malformed, duplicate, inactive, or incoherent replacements.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Component | Active-only visibility, static fallback, name/marker-only options, current no-op, pending disable, error reset, denied retry/open state | Vitest + jsdom DOM rendering with mocked Auth/router. |
| Provider/API | Immediate two-selection single flight, atomic adoption, and unchanged context on denied selection | Use a deferred `/auth/select-organization` response; trigger two different selections synchronously and assert exactly one request starts. |
| Manual | Desktop/mobile, keyboard, route replacement, updated roles | Run both widths; inspect console and hydration errors. |

## Migration / Rollout

No migration, feature flag, backend change, or persistence. Rollback removes the switcher and tests; Auth and server contract remain unchanged.

## Open Questions

None.
