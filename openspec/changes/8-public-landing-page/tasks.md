# Tasks: Public Landing Page

## 1. Preparation

- [x] Confirm the branch is `feat/8-public-landing-page`.
- [x] Confirm the worktree status before implementation.
- [x] Ensure dependencies and tools are available locally, including `node_modules` and the OpenSpec CLI required by `npm run check`.
- [x] Review the approved OpenSpec artifacts and confirm there is a `PLAN APPROVED` comment before writing implementation code.
- [x] Review the relevant local Next.js documentation from the installed version before using Next.js APIs or conventions.

## 2. Route Scope

- [x] Update only the implementation needed for the public `/` Landing Page.
- [x] Keep `/health` and `src/features/health/**` unchanged.
- [x] Keep `src/app/layout.tsx` unchanged.
- [x] Do not create `/auth/login` or `/auth/register` routes.
- [x] Do not add backend calls, API routes, auth logic, billing logic, dashboard code, AI execution, or functional Migration Packs.

## 3. Landing Structure

- [x] Decide whether `src/app/page.tsx` remains readable as one file or whether feature-specific presentational components under `src/features/landing/components/` are needed.
- [x] Keep the Landing route as a Server Component by default.
- [x] Avoid adding `"use client"` to the whole page.
- [x] If any Client Component is needed, isolate it to the smallest interactive part and document the reason in the implementation notes.

## 4. Static Content Data

- [x] Define static content for header navigation anchors.
- [x] Define static content for legacy system problem points.
- [x] Define static content for DISCOVER, UNDERSTAND, PLAN, MODERNIZE, and VERIFY.
- [x] Define static content for main capabilities.
- [x] Define static content for modernization strategies.
- [x] Define static content for technology examples and Migration Pack messaging.
- [x] Define static content for private AI and security messaging.
- [x] Define static content for target customers/use cases.
- [x] Define static content for Developer, Team, and Enterprise plans without prices.

## 5. Header And Hero

- [x] Implement the header with `LegacyLift` identity.
- [x] Implement internal anchor links for `Producto`, `Cómo funciona`, `Tecnologías`, `Seguridad`, and `Precios`.
- [x] Implement `Iniciar sesión` as navigation to `/auth/login` only.
- [x] Implement `Comenzar` as navigation to `/auth/register` only.
- [x] Implement the hero with `Understand first. Modernize safely.` as the central proposition.
- [x] Implement the hero primary CTA to `/auth/register`.
- [x] Implement the hero secondary CTA to the product flow section.

## 6. Required Sections

- [x] Implement the problem section focused on customer pain points.
- [x] Implement the `Cómo funciona` section with DISCOVER -> UNDERSTAND -> PLAN -> MODERNIZE -> VERIFY in order.
- [x] Implement the main capabilities section.
- [x] Implement the modernization strategies section.
- [x] Implement the technologies and Migration Packs section with explicit future/current availability distinction.
- [x] Implement the private AI and security section without unsupported certification or compliance claims.
- [x] Implement the target customers/use cases section.
- [x] Implement the Developer, Team, and Enterprise plans section without checkout, billing, or invented prices.
- [x] Implement the footer without inventing routes for unavailable pages.

## 7. UI Components And Styling

- [x] Reuse existing `Button` for navigation CTAs.
- [x] Reuse existing `Card` for grouped product, problem, capability, plan, or security content where appropriate.
- [x] Reuse existing `Badge` for labels and compact status/context markers where appropriate.
- [x] Use `Separator` only if it clearly improves the layout and the Client Component tradeoff is acceptable.
- [x] Add official shadcn/ui components only if existing components are insufficient and the added component has a concrete, documented need for the Landing.
- [x] Use `lucide-react` only if icons improve comprehension; do not add icon or animation dependencies.
- [x] Do not add unrelated external dependencies or install anything only for visual effects or convenience.
- [x] Use semantic tokens and existing Tailwind/shadcn conventions.
- [x] Avoid direct Tailwind color palettes, hex values, inline visual styles, arbitrary radii, custom shadows, and global token changes.

## 8. Accessibility And Responsive Behavior

- [x] Use semantic `header`, `main`, `section`, `nav`, and `footer` elements.
- [x] Ensure the page has one primary `h1` and logical section headings.
- [x] Ensure links and buttons are semantically correct and visually distinguishable.
- [x] Ensure focus-visible behavior is preserved for all interactive elements.
- [x] Ensure internal anchor targets are reachable and not obscured by any sticky header.
- [x] Verify mobile layout has no horizontal scrolling and remains readable.
- [x] Verify tablet layout remains readable and scannable.
- [x] Verify desktop layout uses available space without becoming visually overloaded.
- [x] Verify content does not rely on hover-only interactions.

## 9. Content Safety Review

- [x] Confirm no content claims functional auth, backend analysis, billing, dashboard, AI execution, or functional Migration Packs are implemented by this issue.
- [x] Confirm technology examples are framed as platform vision/capability or examples, not guaranteed current availability.
- [x] Confirm security copy does not claim certifications, regulatory compliance, or guarantees not defined by the issue.
- [x] Confirm plan cards do not include invented pricing or checkout behavior.
- [x] Confirm footer does not invent new unavailable routes.

## 10. Manual Verification

- [x] Visit `/` and confirm the Landing renders correctly.
- [x] Confirm the header navigates to each required section.
- [x] Confirm `Iniciar sesión` navigates to `/auth/login`.
- [x] Confirm `Comenzar` navigates to `/auth/register`.
- [x] Confirm the hero communicates LegacyLift clearly without prior context.
- [x] Confirm the problem section is present.
- [x] Confirm DISCOVER -> UNDERSTAND -> PLAN -> MODERNIZE -> VERIFY is visible in order.
- [x] Confirm the main capabilities are present.
- [x] Confirm modernization strategies are present.
- [x] Confirm technology and Migration Pack messaging distinguishes future/capability from current availability.
- [x] Confirm private AI/security messaging is present and not overstated.
- [x] Confirm Developer, Team, and Enterprise plans are present without prices or checkout.
- [x] Visit `/health` and confirm it still renders and performs the existing health check.
- [x] Test mobile viewport behavior.
- [x] Test tablet viewport behavior.
- [x] Test desktop viewport behavior.
- [x] Test keyboard navigation through header links, CTAs, and relevant page controls.
- [x] Check for console and hydration errors during normal navigation.

## 11. Final Validation

- [x] Run `git diff --check`.
- [x] Run `git status`.
- [x] Run `npm run check`.
- [x] If `npm run check` cannot run because dependencies or OpenSpec CLI are unavailable, document the exact cause and what remains unverified.
- [x] Confirm the implementation matches the approved OpenSpec plan before requesting review.
