# Design: Public Landing Page

## Overview

The change replaces the provisional `/` page with a static, responsive, accessible Landing Page for LegacyLift. The design should feel B2B, technological, professional, modern, and oriented to enterprise software modernization while staying within the existing shadcn/ui and semantic token conventions.

The implementation should be presentation-only. It must not fetch data, integrate with authentication, integrate with billing, or call backend product endpoints.

## Current Architecture

- `src/app/page.tsx` currently renders a provisional home page using `Link`, `Badge`, `Button`, `Card`, and `Separator`.
- `src/app/health/page.tsx` renders the health page and imports `HealthCard` from `src/features/health/components/health-card.tsx`.
- `HealthCard` is the current Client Component for backend health status and uses the existing API client.
- Shared UI primitives currently available under `src/components/ui` are `Button`, `Card`, `Badge`, and `Separator`.
- Global tokens and shadcn/Tailwind setup live in `src/app/globals.css` and should not be modified for this Landing unless a separately approved need appears.

## Route And Component Structure

The primary route remains:

```text
src/app/page.tsx
```

The global layout is not part of this change:

```text
src/app/layout.tsx
```

Do not modify `src/app/layout.tsx` for this issue. If a future need for global metadata or layout changes appears, it must be handled through the normal approval flow before implementation.

Two implementation shapes are acceptable:

1. Keep the full Landing composition in `src/app/page.tsx` if the final file remains readable.
2. Extract feature-specific presentational sections under `src/features/landing/components/` if the page becomes hard to maintain.

If extraction is used, components should be specific to this feature, for example:

```text
src/features/landing/components/landing-header.tsx
src/features/landing/components/landing-hero.tsx
src/features/landing/components/landing-section.tsx
src/features/landing/components/landing-footer.tsx
```

Do not create generic shared components unless there is a real cross-feature reuse need.

## Server And Client Components

The Landing should remain server-rendered by default.

- `src/app/page.tsx` should not include `"use client"`.
- Static section data can be defined as typed arrays in the same file or near the feature components.
- Internal section navigation can use normal anchors and `next/link` without client state.
- A mobile navigation design should avoid client state when possible. For example, it can use a simplified responsive layout with visible CTAs and section links hidden or wrapped on small screens.
- If an interactive mobile menu becomes necessary, it must be isolated to the smallest possible Client Component and justified in the implementation notes. This is not the preferred default.

`Separator` is available but is a Client Component. Prefer semantic borders, spacing, and card grouping unless `Separator` materially improves clarity.

## Visual System

Use only semantic tokens and existing conventions:

- Backgrounds: `bg-background`, `bg-card`, `bg-muted`, `bg-secondary`, or token opacity variants where appropriate.
- Text: `text-foreground`, `text-muted-foreground`, `text-card-foreground`, `text-primary` when semantically correct.
- Borders/rings: `border-border`, `ring-foreground/10`, existing shadcn card/button focus styles.
- Avoid direct Tailwind color palettes, hex values, inline styles, custom shadows, arbitrary radii, or visual tokens named after colors.

The existing shadcn primitives should provide the visual base:

- `Button` for CTAs and navigation actions.
- `Card` for problem points, flow steps, capabilities, security points, and plans.
- `Badge` for compact labels, stage names, plan labels, or future-capability disclaimers.
- `Separator` only if justified despite its Client Component boundary.

Additional official shadcn/ui components may be installed only if the implementation has a concrete need that existing components do not satisfy. Any added shadcn/ui component must provide clear value to the Landing, preserve coherence with the existing design system, and follow the project's current conventions. Do not add unrelated external UI libraries or dependencies.

`lucide-react` is already installed and may be used sparingly for visual scanning if icons improve clarity. It should not be required for the page to make sense.

## Content Model

The Landing content should be static and local to the route/feature. Suggested data groups:

- `navItems`: internal section labels and `#id` targets.
- `problemPoints`: customer problems with legacy systems.
- `workflowSteps`: DISCOVER, UNDERSTAND, PLAN, MODERNIZE, VERIFY.
- `capabilities`: six product capability areas.
- `strategies`: Keep, Stabilize, Encapsulate, Rehost, Replatform, Refactor, Rearchitect, Rewrite, Replace, Retire.
- `technologies`: COBOL, Java, .NET, Node.js, JavaScript / TypeScript.
- `securityPoints`: private processing, organization isolation, source code protection, private/local model options, controlled deployment direction.
- `targetCustomers`: industries and customer groups listed by the issue.
- `plans`: Developer, Team, Enterprise without prices.

Copy must preserve the central proposition:

```text
Understand first. Modernize safely.
```

## Section Plan

```text
/
├── Header
│   ├── LegacyLift identity
│   ├── Internal anchors: Producto, Cómo funciona, Tecnologías, Seguridad, Precios
│   └── Auth navigation links: /auth/login, /auth/register
├── Hero
│   ├── Proposition and concise explanation
│   └── Primary and secondary CTAs
├── Problem
│   └── Legacy system customer pain points
├── How It Works
│   └── DISCOVER -> UNDERSTAND -> PLAN -> MODERNIZE -> VERIFY
├── Capabilities
│   └── Six product areas
├── Strategies
│   └── Multiple modernization strategy options
├── Technologies And Migration Packs
│   └── Extensible model plus future/availability distinction
├── Private AI And Security
│   └── Sensitive code and enterprise concerns without unsupported guarantees
├── Use Cases
│   └── Target industries and customer profiles
├── Plans
│   └── Developer, Team, Enterprise without prices or checkout
└── Footer
    └── Brand and valid anchors/allowed references only
```

## Navigation Behavior

- Header section links should use anchor `href` values such as `#producto`, `#como-funciona`, `#tecnologias`, `#seguridad`, and `#precios`.
- Sections should expose matching `id` values.
- Use `scroll-mt-*` classes so anchored sections are not hidden behind the header if the header is sticky.
- `Iniciar sesión` links to `/auth/login` only.
- `Comenzar` links to `/auth/register` only.
- Do not create the auth routes in this change.
- Do not add route guards or auth logic.

## `/health` Preservation

The implementation should not modify:

- `src/app/health/page.tsx`.
- `src/app/layout.tsx`.
- `src/features/health/components/health-card.tsx`.
- `src/features/health/hooks/use-health.ts`.
- `src/features/health/api/get-health.ts`.
- `src/lib/api/api-client.ts`.

Manual verification must include visiting `/health` after implementing `/`.

The link from `/health` back to `/` can remain unchanged and will naturally return to the new Landing.

## Accessibility

- Use one primary `h1` in the hero.
- Use semantic `header`, `main`, `section`, `nav`, and `footer` elements.
- Associate major sections with visible headings.
- Keep links as links and buttons as buttons. Use `Button asChild` with `Link` or `a` for navigation CTAs.
- Ensure keyboard users can tab through header links and CTAs with visible focus.
- Avoid clickable `div` elements.
- Ensure mobile layouts preserve reading order and do not require hover.
- Do not rely on icons alone to communicate meaning.

## Responsive Design

- Mobile: stacked content, readable line lengths, accessible CTAs, no horizontal scrolling.
- Tablet: compact grids where useful, still preserving vertical reading order.
- Desktop: multi-column layouts for cards, flow, capabilities, plans, and supporting sections.
- Header navigation should remain usable across widths. If section links are hidden on mobile, critical CTAs must remain visible and content must remain reachable by scrolling.

## Future Capability Safety

The technologies and Migration Packs section must explicitly distinguish:

- Platform vision/capability: LegacyLift is designed to support multiple technologies through an extensible model.
- Current availability: examples shown are not all guaranteed to be implemented today.

Security copy must avoid claiming:

- Certifications.
- Regulatory compliance.
- Formal guarantees.
- Specific deployment capabilities beyond the issue's allowed future-oriented wording.

Plans must avoid:

- Prices.
- Billing behavior.
- Subscription mechanics.
- Checkout or payment CTAs.

## Dependencies And shadcn/ui Additions

No unrelated external dependencies are planned.

Existing dependencies that may be used:

- `next/link` for navigation.
- `lucide-react` for optional icons.
- Existing shadcn/ui primitives.

Official shadcn/ui components may be added during implementation only when they are necessary for the approved Landing design and when the need is documented. Do not install a package or component only for visual effects or convenience if the same result can be achieved clearly with existing project capabilities.

## Validation Plan

Automated validation:

```bash
npm run check
```

Manual validation:

- `/` renders the Landing.
- `/health` continues to render and perform its existing health check.
- Header internal navigation reaches the expected sections.
- `Iniciar sesión` points to `/auth/login`.
- `Comenzar` points to `/auth/register`.
- Hero proposition is understandable without prior project context.
- Product flow is visible in order.
- Main capabilities, strategies, technologies/Migration Packs, security, target customers, plans, and footer are present.
- Future capabilities are not presented as implemented functionality.
- Mobile, tablet, and desktop layouts are usable.
- Keyboard navigation and focus-visible states work.
- No console or hydration errors appear during normal navigation.

## Known Environment Constraint

During initial planning, the local workspace did not have `node_modules` installed and the `openspec` command was not available in PATH. OpenSpec CLI is now available and this change validates successfully; before implementation or final review, install project dependencies and run the required validation commands in a properly configured environment.
