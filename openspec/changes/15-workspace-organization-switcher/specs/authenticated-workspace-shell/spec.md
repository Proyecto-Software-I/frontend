# Delta for authenticated-workspace-shell

## ADDED Requirements

### Requirement: App Shell organization switching

The App Shell MUST show an organization switcher only when `session.memberships` contains at least two `ACTIVE` memberships; otherwise it MUST retain static organization context. Its visibility and options MUST derive only from those memberships. It MUST show each option's organization name and an active marker only, use the existing Auth operation for a different option, and MUST NOT duplicate tenant state. Before invoking `chooseOrganization`, it MUST synchronously acquire a feature-local single-flight guard, retain that guard until the request settles on either success or failure, and then release it. React pending state and disabled options MUST provide UI feedback only and MUST NOT serve as the concurrency or mutual-exclusion mechanism.

#### Scenario: Active memberships enable switching

- GIVEN an authenticated session with two or more `ACTIVE` memberships
- WHEN the App Shell renders on desktop or the existing mobile aside
- THEN it shows a keyboard-operable switcher with only those organizations
- AND the active organization is visibly identified with visible focus states

#### Scenario: Insufficient active memberships retain static context

- GIVEN an authenticated session with fewer than two `ACTIVE` memberships, including inactive memberships
- WHEN the App Shell renders
- THEN it shows static active-organization context without a switcher
- AND no inactive organization is selectable

#### Scenario: Current organization is not reselected

- GIVEN the switcher is open and the active organization is selected
- WHEN the selection is submitted
- THEN the control closes or remains open without an HTTP request
- AND the Auth session, token, and roles remain unchanged

#### Scenario: Selection retains and releases the concurrency guard

- GIVEN the switcher is open and a different active organization is selected
- WHEN `chooseOrganization` is invoked after the synchronous feature-local single-flight guard is acquired
- THEN the guard remains held until the request settles on success or failure and is then released
- AND React pending state and disabled options provide UI feedback only
- AND the current organization remains visibly active until confirmation

#### Scenario: Immediate selections start one request

- GIVEN the switcher is open with multiple different active organizations available
- WHEN two different organizations are selected immediately before the first selection settles
- THEN exactly one `chooseOrganization` selection request starts
- AND the second selection does not replace, cancel, or queue the first request

#### Scenario: Access is denied

- GIVEN the switcher is open for an authenticated organization
- WHEN selection returns `ORGANIZATION_ACCESS_DENIED`
- THEN the switcher remains open with safe error feedback
- AND the prior organization, token, and roles remain the App Shell context

## MODIFIED Requirements

### Requirement: El dashboard debe mostrar el contexto actual

`/dashboard` SHALL show LegacyLift, a greeting to the authenticated user, the active organization name, and the roles available in the current context. After Auth confirms a different organization selection, the App Shell MUST update its organization and current roles from the replacement session before navigating to `/dashboard`.

(Previously: The dashboard excluded an Organization Switcher and only displayed the current context.)

#### Scenario: Mostrar datos del usuario y tenant

- **GIVEN** the authenticated context contains a user, active organization, and roles
- **WHEN** `/dashboard` renders
- **THEN** it shows `LegacyLift`
- **AND** it shows the authenticated user's name
- **AND** it shows the active organization name
- **AND** it shows the available roles

#### Scenario: No adelantar funcionalidades fuera de alcance

- **GIVEN** the user opens the initial dashboard
- **WHEN** its content renders
- **THEN** it does not enable Projects, Legacy Systems, or other undefined functional pages
- **AND** the App Shell switcher is available only as specified by this change

#### Scenario: Context replacement updates the shell

- GIVEN Auth confirms a selected active organization and replacement session
- WHEN the App Shell receives that session
- THEN it shows the replacement organization and its current roles
- AND it navigates to `/dashboard`
