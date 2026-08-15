# Public Landing Page Delta Spec

## ADDED Requirements

### Requirement: Public Landing Replaces Provisional Home

The application SHALL render a public LegacyLift Landing Page at `/` instead of the current provisional home page.

#### Scenario: Static Landing state applicability is clear

Given the Landing Page is static presentation content
When the page behavior is specified
Then the success state applies as the Landing rendering all required content correctly
And the loading state does not apply to the main content because there is no asynchronous data loading
And the empty state does not apply because the page does not depend on dynamic collections
And validation states do not apply because this issue does not implement forms or user input
And error states do not apply to the main content because the Landing does not request data
And no artificial loaders, empty states, forms, or errors are introduced only to satisfy state categories

#### Scenario: Visitor opens the public home page

Given a visitor navigates to `/`
When the page renders
Then the page shows the LegacyLift Landing Page
And the page includes the message `Understand first. Modernize safely.`
And the page does not show provisional lorem ipsum content
And the page does not require authentication
And the page does not call backend product endpoints

#### Scenario: Health route remains available

Given a visitor navigates to `/health`
When the page renders
Then the existing health check page remains available
And the existing backend health-check behavior is not changed by the Landing Page implementation

### Requirement: Header Navigation And CTAs

The Landing Page SHALL include a header that identifies LegacyLift and provides navigation to Landing sections and auth entry links.

#### Scenario: Header content is visible

Given a visitor opens `/`
When the header is displayed
Then it shows `LegacyLift`
And it includes internal navigation for `Producto`, `Cómo funciona`, `Tecnologías`, `Seguridad`, and `Precios`
And it includes an `Iniciar sesión` link to `/auth/login`
And it includes a `Comenzar` link to `/auth/register`

#### Scenario: Internal header navigation uses anchors

Given a visitor is on `/`
When the visitor activates a header section link
Then the browser navigates to the corresponding section on the same page
And the section has an accessible target that can be reached by keyboard and direct hash navigation

#### Scenario: Auth CTAs are navigation only

Given a visitor is on `/`
When the visitor activates `Iniciar sesión` or `Comenzar`
Then the browser navigates to `/auth/login` or `/auth/register` respectively
And no authentication form, session logic, backend request, or route implementation is added by this change

### Requirement: Hero Communicates LegacyLift Value

The Landing Page SHALL provide a hero section that clearly communicates what LegacyLift does, who it is for, and why it reduces modernization risk.

#### Scenario: Hero explains the product without prior context

Given a visitor has no prior knowledge of LegacyLift
When the visitor reads the hero section
Then the visitor can understand that LegacyLift is an AI-assisted legacy software modernization platform
And the visitor can understand that LegacyLift emphasizes understanding, planning, progressive modernization, and behavior verification
And the visitor can understand that LegacyLift is intended for organizations modernizing critical existing systems

#### Scenario: Hero CTAs are available

Given a visitor reads the hero section
When the CTAs are displayed
Then the primary CTA `Comenzar` links to `/auth/register`
And the secondary CTA `Ver cómo funciona` navigates to the product flow section on the same page

### Requirement: Legacy System Problem Is Represented

The Landing Page SHALL include a problem section focused on customer pain points of legacy systems.

#### Scenario: Visitor reads legacy problem section

Given a visitor scrolls to the problem section
When the section is visible
Then it represents issues such as incomplete documentation, hard-to-understand architecture, old dependencies, hidden business rules, high change risk, costly migrations, difficult validation, and knowledge concentrated in few people
And it frames these as customer problems rather than implementation details of LegacyLift

### Requirement: Product Flow Is Represented

The Landing Page SHALL represent the core LegacyLift flow: DISCOVER -> UNDERSTAND -> PLAN -> MODERNIZE -> VERIFY.

#### Scenario: Visitor sees the product flow

Given a visitor scrolls to `Cómo funciona`
When the section is visible
Then the steps `DISCOVER`, `UNDERSTAND`, `PLAN`, `MODERNIZE`, and `VERIFY` are visible in order
And each step includes a concise explanation consistent with the issue scope
And the visual relationship between the steps communicates a progressive modernization flow

#### Scenario: Flow descriptions avoid implementation promises

Given a visitor reads the product flow
When the visitor reaches `MODERNIZE` or `VERIFY`
Then the content describes the platform approach at a presentation level
And it does not claim that real code transformation, AI execution, or behavior verification is implemented by this frontend issue

### Requirement: Main Capabilities Are Represented

The Landing Page SHALL present the main LegacyLift product areas.

#### Scenario: Visitor sees product capabilities

Given a visitor scrolls to the capabilities section
When the section is visible
Then it includes `Legacy Discovery`, `System Knowledge`, `Technical Debt Assessment`, `Modernization Planning`, `AI-Assisted Modernization`, and `Behavior Verification`
And each capability has concise explanatory copy
And the content does not imply that this issue implements those capabilities functionally

### Requirement: Modernization Strategies Are Represented

The Landing Page SHALL communicate that modernization strategy can vary by system or component.

#### Scenario: Visitor sees modernization strategies

Given a visitor scrolls to the strategy section
When the section is visible
Then it presents strategies including `Keep`, `Stabilize`, `Encapsulate`, `Rehost`, `Replatform`, `Refactor`, `Rearchitect`, `Rewrite`, `Replace`, and `Retire`
And it communicates that not every system must be rewritten
And it does not provide unsupported implementation guarantees

### Requirement: Technologies And Migration Packs Are Positioned Safely

The Landing Page SHALL explain LegacyLift's multi-technology and Migration Pack concept without misleading visitors about current implementation status.

#### Scenario: Visitor reads technology examples

Given a visitor scrolls to the technologies section
When technology examples are displayed
Then examples may include `COBOL`, `Java`, `.NET`, `Node.js`, and `JavaScript / TypeScript`
And the section explains that LegacyLift is designed around an extensible model
And the section distinguishes platform vision or capability from functionality currently available

#### Scenario: Migration Packs are described as a concept

Given a visitor reads about Migration Packs
When the explanation is visible
Then Migration Packs are described as specialized capabilities for analyzing or transforming technologies and scenarios
And the content does not claim that all shown Migration Packs are currently implemented

### Requirement: Private AI And Security Messaging Is Included

The Landing Page SHALL include a section for organizations working with sensitive code.

#### Scenario: Visitor reads security messaging

Given a visitor scrolls to the security section
When the section is visible
Then it communicates concepts such as organization isolation, source code protection, private processing, local or private model options, enterprise-oriented scenarios, and possible future controlled or on-premise deployments
And it does not claim certifications, regulatory compliance, guarantees, or security properties not defined by the issue

### Requirement: Target Customers And Plans Are Represented

The Landing Page SHALL include target customer examples and planned product plans without implementing billing.

#### Scenario: Visitor reads target customer section

Given a visitor scrolls to target customers or use cases
When the section is visible
Then it may include examples such as banking, insurance, government, telecommunications, industry, retail/logistics, consultancies/system integrators, and companies with legacy applications
And it does not create industry-specific pages or routes

#### Scenario: Visitor reads plans section

Given a visitor scrolls to pricing or plans
When the section is visible
Then it shows the planned `Developer`, `Team`, and `Enterprise` plans
And it does not invent prices
And it does not implement checkout, billing, subscriptions, or backend billing integration
And any CTA behavior remains navigation-only or clearly informational according to the approved design

### Requirement: Footer Avoids Invented Routes

The Landing Page SHALL include a footer that reinforces LegacyLift without inventing unavailable product pages.

#### Scenario: Visitor reaches the footer

Given a visitor scrolls to the footer
When the footer is visible
Then it includes `LegacyLift`
And it may include references to `Producto`, `Seguridad`, `Documentación`, and `GitHub` only when they are either valid page anchors, valid external links, omitted, or clearly non-navigational labels
And it does not add new frontend routes for unavailable pages

### Requirement: Responsive And Accessible Presentation

The Landing Page SHALL be usable on mobile, tablet, and desktop and meet basic accessibility expectations.

#### Scenario: Mobile layout is usable

Given a visitor opens `/` on a mobile-width viewport
When the Landing Page renders
Then content remains readable without horizontal scrolling
And primary navigation and CTAs remain accessible
And sections stack or adapt appropriately for small screens

#### Scenario: Tablet and desktop layouts are usable

Given a visitor opens `/` on tablet or desktop widths
When the Landing Page renders
Then content uses available space with clear hierarchy
And cards, flows, and plan sections are arranged for efficient scanning

#### Scenario: Keyboard navigation works

Given a visitor uses keyboard navigation
When the visitor tabs through the page
Then interactive elements receive visible focus
And links and buttons are semantically appropriate
And internal anchors can be reached and activated

#### Scenario: Visual accessibility basics are preserved

Given the Landing Page is rendered
When a visitor reads the content
Then text contrast uses existing semantic tokens
And headings follow a logical semantic structure
And buttons and links are visually and semantically differentiated
And decorative visuals do not block content comprehension

### Requirement: Performance And Scope Are Preserved

The Landing Page SHALL avoid unnecessary runtime and dependency cost.

#### Scenario: Landing renders without unnecessary client conversion

Given the Landing Page is implemented
When the page is inspected
Then the page remains a Server Component by default
And any Client Component is limited to a justified interactive subsection if needed
And no dependency is added for visual effects
And no heavy assets are introduced solely for decoration

#### Scenario: Final validation succeeds

Given the implementation is complete
When `npm run check` is executed in a properly installed environment
Then OpenSpec validation, lint, and production build pass
