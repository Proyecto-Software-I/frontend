# Tasks: Workspace Organization Switcher

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 500-650 of the actual 800-line project budget |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | This planning remediation is one planning PR; implementation slicing remains pending a risk decision before apply. |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

## Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|---|---|---|---|
| 1 | Deliver the isolated switcher and DOM behavior. | Pending | Potential implementation slice only; do not split this planning change. |
| 2 | Integrate both shell placements and prove Auth preservation. | Pending | Potential implementation slice only; decide the chain strategy before apply. |

## Phase 1: Menu Foundation

- [ ] 1.1 Generate `src/components/ui/dropdown-menu.tsx` with the approved shadcn/Radix primitive only. Verify generated checks; manually test arrows, Escape, and focus restoration. Rollback: remove this primitive with Unit 1.

## Phase 2: Switcher Behavior

- [ ] 2.1 Create `src/features/workspace/components/organization-switcher.tsx` using `useAuth`, canonical `Membership`, and `ACTIVE_MEMBERSHIP_STATUS`; retain static context below two active memberships. Verify active-only filtering; manually confirm no inactive option. Rollback: remove this component with Unit 1.
- [ ] 2.2 Add different-selection delegation, a synchronous single-flight guard acquired before Auth invocation and released only on settlement, local open/pending/error state, active-item no-op, successful `router.replace("/dashboard")`, and retryable denial without tenant state. Verify request/no-op, disabled pending, and preserved denied context; manually retry denial then confirm updated roles. Rollback: revert this behavior with the switcher.
- [ ] 2.3 Create `tests/organization-switcher.test.tsx` covering fallback, name/marker-only options, pending, no-op, error reset, denied-open retry, and keyboard operation with mocked Auth/router. Trigger two different selections immediately against a deferred `/auth/select-organization` response and prove exactly one request starts. Verify focused tests pass. Rollback: remove tests with Unit 1.

## Phase 3: Shell Integration

- [ ] 3.1 Modify `src/features/workspace/components/workspace-shell.tsx` for desktop-header and existing mobile-aside placement without navigation changes. Verify both use one Auth session; manually test both widths, focus, and denial in an open aside. Rollback: restore static shell context.
- [ ] 3.2 Modify `tests/auth-provider.state.test.tsx` for deferred success and denied selection, proving atomic adoption and unchanged session, token, organization, and roles. Verify focused tests pass. Rollback: revert tests with the integration slice.

## Phase 4: Final Verification

- [ ] 4.1 Run `npm run lint`, `npm run build`, and strict OpenSpec validation. Verify all pass; manually confirm desktop/mobile success, loading, denial, keyboard flow, and no console or hydration errors. Rollback: revert the failing work unit only.
