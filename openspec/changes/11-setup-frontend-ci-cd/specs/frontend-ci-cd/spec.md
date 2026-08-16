## Purpose

Defines the frontend repository CI/CD behavior required to validate Pull Requests, deploy Preview and Production builds through GitHub Actions and Vercel CLI, and document safe environment-variable and secret handling.

## ADDED Requirements

### Requirement: Pull Request CI Validation
The repository SHALL validate every Pull Request targeting `main` through GitHub Actions before deployment or merge review, using explicit steps for dependency installation, OpenSpec validation, lint, and build.

#### Scenario: Pull Request validation succeeds
- **GIVEN** a Pull Request targets `main`
- **WHEN** GitHub Actions runs the frontend CI workflow and `npm ci`, `npm run spec:validate`, `npm run lint`, and `npm run build` all pass
- **THEN** the Pull Request SHALL show a successful CI status for the required frontend validations

#### Scenario: Pull Request validation fails
- **GIVEN** a Pull Request targets `main`
- **WHEN** any required frontend validation exits with a non-zero status
- **THEN** the CI workflow SHALL fail and deployment steps SHALL NOT run for that failed workflow execution

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

### Requirement: Vercel CLI Platform Selection
The CI/CD plan SHALL select Vercel as the deployment platform and SHALL use Vercel CLI from GitHub Actions instead of native Vercel Git integration for this issue.

#### Scenario: Vercel CLI decision is documented
- **GIVEN** the OpenSpec plan is reviewed before implementation
- **WHEN** the platform decision is inspected
- **THEN** the plan SHALL identify Vercel CLI from GitHub Actions as the selected CD mechanism before a new `PLAN APPROVED` is requested

#### Scenario: Native Git integration is not required
- **GIVEN** the current Vercel Hobby scope cannot use native Git integration for the organization repository
- **WHEN** CD is planned for this issue
- **THEN** the plan SHALL NOT require cloning the repository to a personal GitHub account or connecting native Vercel Git integration to satisfy deployment

#### Scenario: Firebase comparison remains out of scope
- **GIVEN** Firebase App Hosting is compared with Vercel
- **WHEN** the comparison is documented
- **THEN** it SHALL state that Firebase App Hosting is technically valid but not selected because App Hosting requires Blaze/pay-as-you-go for App Hosting while the issue forbids billing or resources with cost without express authorization

### Requirement: Vercel CLI Preview Deployments
Pull Requests targeting `main` SHALL create Vercel Preview Deployments through GitHub Actions and Vercel CLI only after required CI validations pass.

#### Scenario: Pull Request preview is deployed after CI succeeds
- **GIVEN** a Pull Request targets `main`
- **WHEN** required CI validations pass and Vercel secrets and project configuration are available
- **THEN** GitHub Actions SHALL invoke Vercel CLI to create a Preview Deployment

#### Scenario: Pull Request preview does not use production mode
- **GIVEN** a Pull Request workflow creates a Vercel deployment
- **WHEN** the Vercel CLI deploy step runs for Preview
- **THEN** the deployment SHALL NOT use `--prod`

#### Scenario: Preview URL is available
- **GIVEN** Vercel CLI successfully creates a Preview Deployment
- **WHEN** the GitHub Actions workflow completes the deployment step
- **THEN** the workflow SHALL make the Preview URL available through GitHub Actions output, logs, or job summary without printing secrets

#### Scenario: Preview deployment fails
- **GIVEN** a Pull Request preview build or deploy fails
- **WHEN** GitHub Actions reports the failed Vercel CLI step
- **THEN** the Pull Request SHALL show a failed deployment workflow status without affecting Production

### Requirement: Vercel CLI Production Deployment From Main
Production deployments SHALL be created through GitHub Actions and Vercel CLI only from changes already integrated into `main`.

#### Scenario: Main branch is deployed to production
- **GIVEN** required secrets and Vercel project configuration are available
- **WHEN** a push to `main` occurs and required validations pass
- **THEN** GitHub Actions SHALL invoke Vercel CLI in production mode to create a Production Deployment

#### Scenario: Pull Request does not deploy production
- **GIVEN** a Pull Request workflow runs for a feature, chore, or development branch
- **WHEN** deployment steps execute for that Pull Request
- **THEN** the workflow SHALL NOT create a Production Deployment

#### Scenario: Development branch does not replace production
- **GIVEN** a non-`main` branch receives a commit
- **WHEN** GitHub Actions or Vercel CLI processes that branch under this change
- **THEN** the branch deployment SHALL NOT replace the Production Deployment

### Requirement: GitHub Secret Handling For Vercel
Vercel deployment credentials and project identifiers SHALL be stored as GitHub repository secrets and SHALL NOT be committed or printed.

#### Scenario: Required Vercel secrets are configured
- **GIVEN** the deployment workflows need to authenticate with Vercel
- **WHEN** implementation proceeds after the new `PLAN APPROVED`
- **THEN** the repository SHALL provide the required secrets, evaluating at minimum `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`, without showing their values

#### Scenario: Secret creation permission is missing
- **GIVEN** the assignee lacks permission to create GitHub repository secrets
- **WHEN** the assignee attempts or prepares to configure deployment secrets after approval
- **THEN** the blocker SHALL be documented and the repository owner SHALL be asked to add the required secrets

#### Scenario: Secrets are not exposed in logs
- **GIVEN** GitHub Actions runs Vercel CLI deployment steps
- **WHEN** the workflow outputs logs, summaries, or deployment URLs
- **THEN** secret values SHALL NOT be printed or committed

#### Scenario: Local Vercel state remains uncommitted
- **GIVEN** local Vercel linking creates `.vercel/project.json`
- **WHEN** org and project identifiers are obtained for CI configuration
- **THEN** those values SHALL be transferred to GitHub Secrets and `.vercel/` SHALL remain out of the repository

### Requirement: Safe Environment Variable Management
Deployment environment variables SHALL be managed through Vercel environment configuration or GitHub Secrets/Variables when approved, and secrets SHALL NOT be committed to the repository.

#### Scenario: Public backend URL is configured for deployment
- **GIVEN** the frontend needs `NEXT_PUBLIC_API_URL` during deployment
- **WHEN** production or preview deployments are configured
- **THEN** `NEXT_PUBLIC_API_URL` SHALL be configured for the appropriate Preview and Production environments using values provided or confirmed by the responsible maintainer

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
The repository SHALL document the frontend CI/CD flow, selected platform, environment variables, required secrets, and required external permissions.

#### Scenario: Documentation explains the configured flow
- **GIVEN** a contributor reads the repository documentation
- **WHEN** they review the CI/CD section
- **THEN** they SHALL be able to identify that Pull Requests to `main` run GitHub Actions CI before Vercel CLI Preview deployment and that `push` to `main` runs Vercel CLI Production deployment

#### Scenario: Documentation records platform decision
- **GIVEN** the issue requires documenting the selected deployment approach
- **WHEN** the CI/CD documentation and OpenSpec plan are reviewed
- **THEN** they SHALL identify Vercel CLI from GitHub Actions as the selected CD mechanism and explain why native Vercel Git integration is not used under the current Hobby scope constraint

#### Scenario: Documentation identifies out-of-scope repository settings
- **GIVEN** a contributor reads the CI/CD documentation
- **WHEN** they review repository administration guidance
- **THEN** they SHALL see that branch protections, GitHub rulesets, backend CI/CD, custom domains, paid services, and personal GitHub repository clones are outside this issue's scope

### Requirement: External Permission Handling
The implementation SHALL verify required external permissions before relying on Vercel CLI deployment behavior.

#### Scenario: Required permissions are available
- **GIVEN** the assignee has GitHub repository access, Vercel account or team access, permission to configure project settings, and permission to create GitHub repository secrets
- **WHEN** Vercel CLI deployment is configured
- **THEN** the assignee SHALL be able to configure the required secrets and environment settings without committing credentials

#### Scenario: Required permissions are missing
- **GIVEN** the assignee lacks a required GitHub or Vercel permission
- **WHEN** secret creation, Vercel project configuration, or deployment verification is blocked
- **THEN** the blocker SHALL be requested in issue #11 rather than bypassed with committed credentials or a personal repository clone

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
