## Why

La aplicación ya incluye Landing y el flujo de autenticación multi-tenant, pero la infraestructura actual de Vitest es parcial: no ofrece React Testing Library, matchers de DOM, interacciones de usuario, ejecución única para CI ni integración de tests en `npm run check`. La Issue [#9](https://github.com/Proyecto-Software-I/frontend/issues/9) requiere una base reutilizable y cobertura inicial de esos comportamientos existentes.

## What Changes

- Completar la infraestructura de pruebas con Vitest, jsdom, React Testing Library, `@testing-library/jest-dom` y `@testing-library/user-event`, agregando solo las devDependencies que falten.
- Ajustar los scripts para que `npm test` ejecute una vez, `npm run test:watch` habilite el modo interactivo y `npm run check` incluya la suite sin duplicar pasos de CI.
- Reutilizar el setup de pruebas, el alias `@/*` y las fixtures/mocks existentes para pruebas de componentes y de estado.
- Agregar cobertura de comportamiento para la Landing estática y el flujo de Auth existente, usando el cliente `src/features/auth/api/auth-api.ts` como frontera de mocks y sin solicitudes reales al backend.
- Añadir al README únicamente los comandos de test necesarios.

## Capabilities

### New Capabilities
- `frontend-testing`: Base de pruebas reutilizable y cobertura automatizada de los comportamientos existentes de Landing y Auth.

### Modified Capabilities
- Ninguna. La Landing y Auth conservan sus requisitos de producto; esta issue agrega evidencia automatizada y tooling para verificarlos.

## Impact

- Código afectado al implementar: `package.json`, `package-lock.json`, `vitest.config.ts`, `tests/setup.ts`, nuevos tests bajo `tests/`, `README.md` y `src/app/page.tsx` solo si fuera imprescindible una extracción presentacional mínima para probar el Server Component.
- Rutas y componentes cubiertos: `/`, `/auth/login`, `/auth/register`, `/auth/select-organization`, `/dashboard`, `AuthProvider`, `SessionBoundary`, `WorkspaceShell`, formularios de Auth y selector de organización.
- Backend: no se modifica ningún endpoint ni contrato. Las pruebas de Auth mockean el cliente API existente.
- Dependencias de desarrollo pendientes de confirmar/instalar en la fase aprobada: `@testing-library/react`, `@testing-library/jest-dom` y `@testing-library/user-event`. Vitest y jsdom ya existen.
- No se incorpora Jest, Cypress, Playwright ni infraestructura E2E.
