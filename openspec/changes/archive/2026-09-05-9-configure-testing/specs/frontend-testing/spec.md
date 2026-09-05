## Purpose

Define una base de testing reutilizable que permita validar comportamientos de interfaz de Landing y Auth sin depender de servicios externos ni de infraestructura E2E.

## ADDED Requirements

### Requirement: Frontend component tests have a reusable non-interactive command

El frontend SHALL proporcionar una configuración de pruebas de componentes con entorno DOM, matchers de DOM, interacción de usuario, soporte TypeScript/JSX y el alias `@/*`. El comando `npm test` SHALL ejecutar la suite una vez y terminar con un código de salida apto para CI; `npm run test:watch` SHALL iniciar el modo interactivo. `npm run check` SHALL fallar cuando cualquier test falle.

#### Scenario: Tests execute in CI mode
- **GIVEN** que las dependencias de desarrollo están instaladas
- **WHEN** se ejecuta `npm test`
- **THEN** la suite se ejecuta una vez sin interacción y su código de salida refleja el resultado de los tests

#### Scenario: Tests execute in development watch mode
- **GIVEN** que un desarrollador necesita iterar sobre una prueba
- **WHEN** ejecuta `npm run test:watch`
- **THEN** la suite queda disponible en modo interactivo de observación

#### Scenario: Unified validation includes tests
- **GIVEN** que existe al menos una prueba fallida
- **WHEN** se ejecuta `npm run check`
- **THEN** el comando falla antes de informar una validación completa exitosa

### Requirement: Landing behavior has automated component coverage

La suite SHALL verificar el comportamiento visible existente de la Landing pública sin snapshots completos ni aserciones sobre clases de Tailwind. La cobertura SHALL confirmar la propuesta principal, las CTAs de autenticación, las etapas de modernización y las capacidades principales definidas para `/`.

#### Scenario: Visitor sees the Landing proposition and auth entry points
- **GIVEN** que la Landing se renderiza en el entorno de componentes
- **WHEN** un visitante consulta el contenido principal
- **THEN** encuentra la propuesta `Understand first. Modernize safely.` y enlaces accesibles hacia `/auth/login` y `/auth/register`

#### Scenario: Visitor sees the complete modernization flow
- **GIVEN** que la Landing se renderiza
- **WHEN** un visitante revisa la sección de flujo de producto
- **THEN** están visibles `DISCOVER`, `UNDERSTAND`, `PLAN`, `MODERNIZE` y `VERIFY` en ese orden

#### Scenario: Visitor sees the main platform capabilities
- **GIVEN** que la Landing se renderiza
- **WHEN** un visitante revisa las capacidades
- **THEN** están visibles Legacy Discovery, System Knowledge, Technical Debt Assessment, Modernization Planning, AI-Assisted Modernization y Behavior Verification

### Requirement: Auth journey behavior has automated component coverage

La suite SHALL verificar el flujo existente de Login, Register, selección de organización, restauración y logout mediante interacciones accesibles y mocks del cliente API de Auth. Las pruebas SHALL evitar requests reales al backend, detalles privados de hooks, internals de shadcn/ui, conteos de render y snapshots completos.

#### Scenario: Login with one organization enters the dashboard
- **GIVEN** credenciales válidas y una respuesta de Login con organización activa y `requiresOrganizationSelection: false`
- **WHEN** el usuario envía el formulario de Login
- **THEN** no se muestra ni se atraviesa el selector y la navegación se dirige a `/dashboard`

#### Scenario: Login with multiple organizations enters selection
- **GIVEN** credenciales válidas y una respuesta de Login con organizaciones disponibles, sin organización activa y `requiresOrganizationSelection: true`
- **WHEN** el usuario envía el formulario de Login
- **THEN** la navegación se dirige a `/auth/select-organization`

#### Scenario: Invalid credentials show safe feedback
- **GIVEN** que Login devuelve `INVALID_CREDENTIALS`
- **WHEN** el usuario envía credenciales inválidas
- **THEN** el formulario muestra el mensaje seguro correspondiente y permite corregir el intento

#### Scenario: Registration sends the agreed input and enters the dashboard
- **GIVEN** valores válidos de email, password, firstName, lastName y organizationName
- **WHEN** el usuario envía el formulario de Register y recibe una sesión con organización activa
- **THEN** la operación recibe esos cinco campos, no se atraviesa el selector y la navegación se dirige a `/dashboard`

#### Scenario: Organization selection completes the active context
- **GIVEN** una sesión pendiente de selección con memberships activas
- **WHEN** el usuario elige una organización y confirma
- **THEN** se muestran las organizaciones disponibles, la operación recibe su `organizationId` y la navegación se dirige a `/dashboard`

#### Scenario: Auth interactions expose pending and retryable states
- **GIVEN** que Login, Register o selección están enviando una operación
- **WHEN** el usuario intenta enviarla nuevamente o la operación falla
- **THEN** los controles previenen el doble envío mientras están pendientes y el error seguro permite un nuevo intento cuando corresponda

#### Scenario: Session restoration succeeds or falls back to anonymous
- **GIVEN** que se inicia el proveedor de autenticación
- **WHEN** refresh y `/api/auth/me` son exitosos
- **THEN** se restaura una sesión autenticada antes de mostrar contenido protegido
- **WHEN** refresh falla
- **THEN** el estado queda no autenticado y no se realiza una solicitud real al backend

#### Scenario: Logout clears the session and returns to Login
- **GIVEN** una sesión autenticada dentro del workspace
- **WHEN** el usuario completa Logout con éxito
- **THEN** se limpia el estado de autenticación y la navegación se dirige a `/auth/login`
