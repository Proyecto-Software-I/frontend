## Purpose

Defines the frontend repository CI/CD behavior required to validate Pull Requests, deploy production from `main`, provide previews, and document safe environment-variable handling.

## ADDED Requirements

### Requirement: Pull Request CI Validation
The repository SHALL validate every Pull Request targeting `main` through GitHub Actions before merge review, using explicit steps for dependency installation, OpenSpec validation, lint, and build.

#### Scenario: Pull Request validation succeeds
- **GIVEN** a Pull Request targets `main`
- **WHEN** GitHub Actions runs the frontend CI workflow and `npm ci`, `npm run spec:validate`, `npm run lint`, and `npm run build` all pass
- **THEN** the Pull Request SHALL show a successful CI status for the required frontend validations

#### Scenario: Pull Request validation fails
- **GIVEN** a Pull Request targets `main`
- **WHEN** any required frontend validation exits with a non-zero status
- **THEN** the CI workflow SHALL fail and the Pull Request SHALL show a failed CI status

#### Scenario: Pull Request targets a branch other than main
- **GIVEN** a Pull Request targets a branch other than `main`
- **WHEN** the Pull Request is opened or updated
- **THEN** the frontend CI workflow SHALL NOT be required by this change to run for that target branch

### Requirement: Automated Test Execution When Available
The repository SHALL run automated tests in CI when an applicable test script exists in the frontend project.

#### Scenario: No automated tests are configured
- **GIVEN** the frontend project has no test script and no applicable automated test suite
- **WHEN** the CI workflow validates a Pull Request
- **THEN** the CI workflow SHALL complete using the required install, OpenSpec validation, lint, and build validations without inventing or requiring a test command

#### Scenario: Automated tests are configured
- **GIVEN** the frontend project has an applicable automated test script
- **WHEN** that script exists before the issue is completed and remains within the approved scope
- **THEN** the CI workflow SHALL execute that test script and SHALL fail if the tests fail

#### Scenario: No npm test step is added by default
- **GIVEN** the current repository has no automated test suite
- **WHEN** the CI workflow is implemented
- **THEN** it SHALL NOT include `npm test` by default

### Requirement: Vercel Platform Selection
The CI/CD plan SHALL select Vercel as the deployment platform and SHALL document Firebase App Hosting as technically valid but less suitable for issue #11 constraints.

#### Scenario: Vercel decision is documented
- **GIVEN** the OpenSpec plan is reviewed before implementation
- **WHEN** the platform decision is inspected
- **THEN** the plan SHALL identify Vercel as selected for CD before `PLAN APPROVED` is requested

#### Scenario: Firebase comparison respects issue constraints
- **GIVEN** Firebase App Hosting is compared with Vercel
- **WHEN** the comparison is documented
- **THEN** it SHALL state that Firebase App Hosting is technically valid but not selected because App Hosting requires Blaze/pay-as-you-go for App Hosting while the issue forbids billing or resources with cost without express authorization

### Requirement: Production Deployment From Main
Vercel SHALL be configured through its native Git integration to deploy production only from the `main` branch.

#### Scenario: Main branch is deployed to production
- **GIVEN** the frontend repository is connected to the selected deployment platform
- **WHEN** changes are integrated into `main`
- **THEN** the platform SHALL create a production deployment from `main`

#### Scenario: Development branch does not replace production
- **GIVEN** a development branch receives a commit
- **WHEN** Vercel processes that branch
- **THEN** the branch deployment SHALL NOT replace the production deployment

### Requirement: Pull Request Preview Deployments
Vercel SHALL provide Preview Deployments for Pull Requests and branches when the native Git integration permits it.

#### Scenario: Pull Request preview is available
- **GIVEN** a Pull Request is opened or updated from a non-production branch
- **WHEN** Vercel successfully builds the branch
- **THEN** the Pull Request SHALL have a preview deployment URL or deployment status available for review

#### Scenario: Preview deployment fails
- **GIVEN** a Pull Request preview build fails on the selected deployment platform
- **WHEN** the platform reports the failed deployment
- **THEN** the Pull Request SHALL show that the preview deployment failed without affecting production

#### Scenario: Main deployment remains production-only
- **GIVEN** Vercel has `main` configured as the Production Branch
- **WHEN** a Pull Request branch receives commits
- **THEN** Vercel SHALL create preview output for that branch rather than promoting it to production

### Requirement: Safe Environment Variable Management
Deployment environment variables SHALL be managed through Vercel Environment Variables or GitHub Secrets when applicable, and secrets SHALL NOT be committed to the repository.

#### Scenario: Public backend URL is configured for deployment
- **GIVEN** the frontend needs `NEXT_PUBLIC_API_URL` during deployment
- **WHEN** production or preview deployments are configured
- **THEN** `NEXT_PUBLIC_API_URL` SHALL be configured in Vercel Environment Variables for the appropriate Preview and Production environments

#### Scenario: Environment values are not invented
- **GIVEN** `NEXT_PUBLIC_API_URL` needs Preview and Production values
- **WHEN** deployment configuration is planned or implemented
- **THEN** the concrete values SHALL be provided or confirmed by the responsible maintainer rather than invented in the repository

#### Scenario: Local development remains local
- **GIVEN** a contributor runs the frontend locally
- **WHEN** they need local backend configuration
- **THEN** they SHALL continue using local environment configuration such as `.env.local` based on `.env.example`

#### Scenario: Secret material is not committed
- **GIVEN** CI/CD requires tokens, credentials, or private keys
- **WHEN** the CI/CD configuration is created
- **THEN** those values SHALL be stored outside the repository and SHALL NOT appear in committed files, OpenSpec artifacts, issues, or Pull Requests

### Requirement: CI/CD Documentation
The repository SHALL document the frontend CI/CD flow, selected platform, environment variables, and required external permissions.

#### Scenario: Documentation explains the configured flow
- **GIVEN** a contributor reads the repository documentation
- **WHEN** they review the CI/CD section
- **THEN** they SHALL be able to identify that Pull Requests to `main` run GitHub Actions with `npm ci`, OpenSpec validation, lint, and build; Pull Requests and branches create Vercel previews; and `main` deploys to Vercel production

#### Scenario: Documentation records platform decision
- **GIVEN** the issue requires comparing Vercel and Firebase App Hosting
- **WHEN** the CI/CD documentation and OpenSpec plan are reviewed
- **THEN** they SHALL identify Vercel as the selected platform and SHALL state that Firebase App Hosting was not selected because App Hosting requires Firebase Blaze/pay-as-you-go billing without express authorization

#### Scenario: Documentation identifies out-of-scope repository settings
- **GIVEN** a contributor reads the CI/CD documentation
- **WHEN** they review repository administration guidance
- **THEN** they SHALL see that branch protections, GitHub rulesets, backend CI/CD, custom domains, and paid services are outside this issue's scope

### Requirement: External Permission Handling
The implementation SHALL verify required external permissions before relying on Vercel deployment behavior.

#### Scenario: Required permissions are available
- **GIVEN** the assignee has GitHub repository access, Vercel account or team access, and permission to configure project settings
- **WHEN** Vercel is connected to the repository
- **THEN** the assignee SHALL be able to configure the Production Branch and Environment Variables without committing credentials

#### Scenario: Required permissions are missing
- **GIVEN** the assignee lacks a required GitHub or Vercel permission
- **WHEN** Vercel connection or configuration is blocked
- **THEN** the blocker SHALL be requested in issue #11 rather than bypassed with personal tokens committed to the repository

### Requirement: Backend CORS Coordination
The plan SHALL document backend CORS as a risk without changing backend code from this repository.

#### Scenario: Vercel frontend cannot reach backend
- **GIVEN** a Vercel Production or Preview Deployment attempts to call the backend
- **WHEN** the browser blocks requests because the backend does not allow that origin
- **THEN** the issue SHALL document the blocker and coordinate with the backend repository or issue #11 without modifying backend code here

### Requirement: No Frontend Product Behavior Change
The CI/CD change SHALL NOT alter frontend routes, visible page content, application interactions, or backend HTTP contracts.

#### Scenario: Application behavior remains unchanged
- **GIVEN** the CI/CD configuration and documentation are added
- **WHEN** the frontend application is built and run
- **THEN** existing routes, components, interface states, and backend API request formats SHALL remain unchanged

#### Scenario: Mobile and desktop interface remain unchanged
- **GIVEN** the change is limited to CI/CD planning, configuration, and documentation
- **WHEN** the application is viewed on mobile or desktop
- **THEN** no new layout, visual, keyboard-navigation, or accessibility behavior SHALL be introduced by this change
