# Tasks: Public Landing Page

## 1. Preparation

- [ ] Confirm the branch is `feat/8-public-landing-page`.
- [ ] Confirm the worktree status before implementation.
- [ ] Ensure dependencies and tools are available locally, including `node_modules` and the OpenSpec CLI required by `npm run check`.
- [ ] Review the approved OpenSpec artifacts and confirm there is a `PLAN APPROVED` comment before writing implementation code.
- [ ] Review the relevant local Next.js documentation from the installed version before using Next.js APIs or conventions.

## 2. Route Scope

- [ ] Update only the implementation needed for the public `/` Landing Page.
- [ ] Keep `/health` and `src/features/health/**` unchanged.
- [ ] Keep `src/app/layout.tsx` unchanged.
- [ ] Do not create `/auth/login` or `/auth/register` routes.
- [ ] Do not add backend calls, API routes, auth logic, billing logic, dashboard code, AI execution, or functional Migration Packs.

## 3. Landing Structure

- [ ] Decide whether `src/app/page.tsx` remains readable as one file or whether feature-specific presentational components under `src/features/landing/components/` are needed.
- [ ] Keep the Landing route as a Server Component by default.
- [ ] Avoid adding `"use client"` to the whole page.
- [ ] If any Client Component is needed, isolate it to the smallest interactive part and document the reason in the implementation notes.

## 4. Static Content Data

- [ ] Define static content for header navigation anchors.
- [ ] Define static content for legacy system problem points.
- [ ] Define static content for DISCOVER, UNDERSTAND, PLAN, MODERNIZE, and VERIFY.
- [ ] Define static content for main capabilities.
- [ ] Define static content for modernization strategies.
- [ ] Define static content for technology examples and Migration Pack messaging.
- [ ] Define static content for private AI and security messaging.
- [ ] Define static content for target customers/use cases.
- [ ] Define static content for Developer, Team, and Enterprise plans without prices.

## 5. Header And Hero

- [ ] Implement the header with `LegacyLift` identity.
- [ ] Implement internal anchor links for `Producto`, `Cómo funciona`, `Tecnologías`, `Seguridad`, and `Precios`.
- [ ] Implement `Iniciar sesión` as navigation to `/auth/login` only.
- [ ] Implement `Comenzar` as navigation to `/auth/register` only.
- [ ] Implement the hero with `Understand first. Modernize safely.` as the central proposition.
- [ ] Implement the hero primary CTA to `/auth/register`.
- [ ] Implement the hero secondary CTA to the product flow section.

## 6. Required Sections

- [ ] Implement the problem section focused on customer pain points.
- [ ] Implement the `Cómo funciona` section with DISCOVER -> UNDERSTAND -> PLAN -> MODERNIZE -> VERIFY in order.
- [ ] Implement the main capabilities section.
- [ ] Implement the modernization strategies section.
- [ ] Implement the technologies and Migration Packs section with explicit future/current availability distinction.
- [ ] Implement the private AI and security section without unsupported certification or compliance claims.
- [ ] Implement the target customers/use cases section.
- [ ] Implement the Developer, Team, and Enterprise plans section without checkout, billing, or invented prices.
- [ ] Implement the footer without inventing routes for unavailable pages.

## 7. UI Components And Styling

- [ ] Reuse existing `Button` for navigation CTAs.
- [ ] Reuse existing `Card` for grouped product, problem, capability, plan, or security content where appropriate.
- [ ] Reuse existing `Badge` for labels and compact status/context markers where appropriate.
- [ ] Use `Separator` only if it clearly improves the layout and the Client Component tradeoff is acceptable.
- [ ] Use `lucide-react` only if icons improve comprehension; do not add icon or animation dependencies.
- [ ] Use semantic tokens and existing Tailwind/shadcn conventions.
- [ ] Avoid direct Tailwind color palettes, hex values, inline visual styles, arbitrary radii, custom shadows, and global token changes.

## 8. Accessibility And Responsive Behavior

- [ ] Use semantic `header`, `main`, `section`, `nav`, and `footer` elements.
- [ ] Ensure the page has one primary `h1` and logical section headings.
- [ ] Ensure links and buttons are semantically correct and visually distinguishable.
- [ ] Ensure focus-visible behavior is preserved for all interactive elements.
- [ ] Ensure internal anchor targets are reachable and not obscured by any sticky header.
- [ ] Verify mobile layout has no horizontal scrolling and remains readable.
- [ ] Verify tablet layout remains readable and scannable.
- [ ] Verify desktop layout uses available space without becoming visually overloaded.
- [ ] Verify content does not rely on hover-only interactions.

## 9. Content Safety Review

- [ ] Confirm no content claims functional auth, backend analysis, billing, dashboard, AI execution, or functional Migration Packs are implemented by this issue.
- [ ] Confirm technology examples are framed as platform vision/capability or examples, not guaranteed current availability.
- [ ] Confirm security copy does not claim certifications, regulatory compliance, or guarantees not defined by the issue.
- [ ] Confirm plan cards do not include invented pricing or checkout behavior.
- [ ] Confirm footer does not invent new unavailable routes.

## 10. Manual Verification

- [ ] Visit `/` and confirm the Landing renders correctly.
- [ ] Confirm the header navigates to each required section.
- [ ] Confirm `Iniciar sesión` navigates to `/auth/login`.
- [ ] Confirm `Comenzar` navigates to `/auth/register`.
- [ ] Confirm the hero communicates LegacyLift clearly without prior context.
- [ ] Confirm the problem section is present.
- [ ] Confirm DISCOVER -> UNDERSTAND -> PLAN -> MODERNIZE -> VERIFY is visible in order.
- [ ] Confirm the main capabilities are present.
- [ ] Confirm modernization strategies are present.
- [ ] Confirm technology and Migration Pack messaging distinguishes future/capability from current availability.
- [ ] Confirm private AI/security messaging is present and not overstated.
- [ ] Confirm Developer, Team, and Enterprise plans are present without prices or checkout.
- [ ] Visit `/health` and confirm it still renders and performs the existing health check.
- [ ] Test mobile viewport behavior.
- [ ] Test tablet viewport behavior.
- [ ] Test desktop viewport behavior.
- [ ] Test keyboard navigation through header links, CTAs, and relevant page controls.
- [ ] Check for console and hydration errors during normal navigation.

## 11. Final Validation

- [ ] Run `git diff --check`.
- [ ] Run `git status`.
- [ ] Run `npm run check`.
- [ ] If `npm run check` cannot run because dependencies or OpenSpec CLI are unavailable, document the exact cause and what remains unverified.
- [ ] Confirm the implementation matches the approved OpenSpec plan before requesting review.
