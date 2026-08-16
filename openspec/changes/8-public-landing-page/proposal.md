# Proposal: Public Landing Page

## Issue

Proyecto-Software-I/frontend#8

## Objective

Implement the first public Landing Page for LegacyLift at `/`, replacing the current provisional home page with a clear product introduction centered on:

> Understand first. Modernize safely.

The page must explain the problem LegacyLift addresses, how the product approach works, the main product areas, modernization strategies, technology and Migration Pack positioning, private AI/security concerns, target customers, and the planned Developer, Team and Enterprise plans.

## Scope

- Replace only the public `/` route content with the LegacyLift Landing Page.
- Keep `/health` working and do not modify its health-check logic.
- Provide a header with LegacyLift identity, internal section navigation, and navigation-only links to `/auth/login` and `/auth/register`.
- Provide a hero section that communicates what LegacyLift does, who it is for, and how it reduces modernization risk.
- Include the required Landing sections:
  - Header.
  - Hero.
  - Problem.
  - How it works: DISCOVER -> UNDERSTAND -> PLAN -> MODERNIZE -> VERIFY.
  - Main capabilities.
  - Modernization strategies.
  - Technologies and Migration Packs.
  - Private AI and security.
  - Use cases / target customers.
  - Developer, Team and Enterprise plans.
  - Footer.
- Use Server Components by default.
- Avoid converting the whole Landing Page into a Client Component.
- Reuse existing shadcn/ui components first: `Button`, `Card`, `Badge`; use `Separator` only if it adds real value and does not introduce unnecessary Client Component usage.
- Install additional official shadcn/ui components only if they provide clear value to the Landing, are truly necessary, preserve the existing design system, follow project conventions, and are justified by a concrete implementation need.
- Reuse the existing `lucide-react` dependency only if icons materially improve readability.
- Use semantic design tokens and existing visual conventions.
- Implement internal navigation with anchors to sections on the same page.
- Keep authentication, billing, backend integrations, dashboard, AI execution, and functional Migration Packs out of scope.

## Out Of Scope

- Creating `/auth/login` or `/auth/register` routes.
- Implementing authentication behavior, forms, sessions, or authorization.
- Implementing dashboard, projects, analysis flows, backend API calls, billing, checkout, subscriptions, administration, AI functionality, or functional Migration Packs.
- Adding unrelated external dependencies or unnecessary dependencies.
- Changing backend contracts or adding frontend API routes.
- Changing global design tokens, `globals.css`, shared UI primitives, or global layout.
- Inventing prices, certifications, compliance guarantees, support terms, concrete Migration Pack availability, or unavailable product pages.

## Affected Areas

- `src/app/page.tsx`: replace provisional home page content with the Landing composition.
- Optional `src/features/landing/components/*`: create feature-specific presentational components only if splitting the Landing improves maintainability and readability.
- No global layout file is expected to change for this issue.

Areas intentionally not affected:

- `src/app/health/page.tsx`.
- `src/features/health/**`.
- `src/lib/api/**`.
- `src/components/ui/**`.
- `src/app/globals.css`.
- `src/app/layout.tsx`.
- `package.json` and `package-lock.json`.

## Backend Impact

No backend impact is expected.

The Landing Page is static presentation and navigation. It must not call backend endpoints. The existing `/health` page remains the only current frontend health integration and must continue to use the existing health feature unchanged.

## Interface States

- Successful static render of all Landing sections.
- Internal anchor navigation from header and hero secondary CTA.
- External route navigation from CTAs to `/auth/login` and `/auth/register` as links only.
- Responsive layouts for mobile, tablet, and desktop.
- Keyboard navigation through header, CTAs, cards/links where applicable.
- Focus-visible behavior inherited from existing UI primitives and semantic anchors.
- Clear future-capability language for technologies and Migration Packs.

No loading, empty, or error state is needed for the Landing content because this change does not fetch data or submit forms. The plan must still verify that static content renders correctly and that navigation states are accessible.

## Risks

- The auth routes do not currently exist, so `/auth/login` and `/auth/register` may resolve to 404 until the independent authentication issue implements them. This issue still requires the Landing links to point there as navigation only.
- The Landing could accidentally overstate future capabilities. The implementation must distinguish platform vision/capability from currently available functionality, especially for technologies and Migration Packs.
- A mobile hamburger menu would require client-side state or another shadcn/ui component. The preferred plan is to keep navigation simple and mostly server-rendered unless the approved design justifies a small Client Component.
- Using `Separator` imports an existing Client Component. Prefer semantic borders or spacing unless `Separator` is clearly useful.
- The local environment currently lacks `node_modules`, which blocks local Next.js documentation lookup and full project validation until dependencies are installed. OpenSpec CLI is available and the change validates successfully with `openspec validate 8-public-landing-page --strict --no-interactive`.

## Assumptions

- LegacyLift is an approved product name for this issue because the issue explicitly defines it.
- The `/auth/login` and `/auth/register` links are expected to be present even though the target routes are not implemented in this issue.
- Footer links to unavailable pages should be omitted or rendered only as non-navigational labels; no new routes should be invented.
- No unrelated external dependency is required to implement the Landing. Additional official shadcn/ui components may be installed only when justified by a concrete Landing implementation need and when existing components are insufficient.
