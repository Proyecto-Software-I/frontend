## Context

La base actual ya contiene Vitest 3, jsdom, `vitest.config.ts`, un setup mínimo y cinco pruebas enfocadas en contratos/API y estado de Auth. `npm test` inicia Vitest en modo watch, `npm run test:watch` no existe y `npm run check` no incluye tests. No están instalados React Testing Library, jest-dom ni user-event. La Landing reside en el Server Component `src/app/page.tsx`; Auth usa componentes cliente sobre `AuthProvider`, rutas App Router y `src/features/auth/api/auth-api.ts` como frontera HTTP.

## Goals / Non-Goals

**Goals:**
- Completar el harness existente para pruebas de comportamiento de componentes en jsdom.
- Ejecutar pruebas de forma determinista en CI y como modo watch explícito en desarrollo.
- Probar rutas y componentes de Landing/Auth mediante accesibilidad, interacción y navegación observable.
- Mantener todas las solicitudes de Auth dentro de mocks del cliente API.

**Non-Goals:**
- No agregar pruebas E2E, navegadores reales, Jest, Cypress, Playwright ni llamadas reales al backend.
- No cambiar contratos backend, rutas, comportamiento visual ni componentes de producción, salvo una extracción presentacional mínima de Landing si el Server Component no puede montarse de forma confiable.
- No reescribir la suite existente solo por cambiar la herramienta de renderizado.

## Decisions

### Reutilizar Vitest y jsdom existentes, y completar solo las dependencias faltantes

Se conservarán `vitest`, `jsdom`, `vitest.config.ts`, el alias `@/*` y el directorio `tests/`. Se agregarán como devDependencies `@testing-library/react`, `@testing-library/jest-dom` y `@testing-library/user-event`; React Testing Library aporta queries centradas en accesibilidad, jest-dom los matchers de DOM y user-event secuencias de interacción realistas. Vitest ya soporta TypeScript/JSX y la configuración actual ya replica el alias, por lo que no se planifica un plugin adicional de Vite.

Alternativa descartada: reinstalar o migrar a Jest. Duplicaría tooling y contradice la issue. Alternativa descartada: agregar un plugin React sin una necesidad detectada; la configuración actual ya ejecuta archivos TSX con Vitest.

### Extender el setup compartido actual

`tests/setup.ts` conservará la configuración de `act` y registrará jest-dom para todas las pruebas. La configuración Vitest conservará `jsdom`, el patrón de pruebas y `@/*`, y seguirá cargando ese setup. Esto evita importaciones repetidas y habilita reutilización para features futuras.

### Separar la frontera API de las pruebas de interfaz

Las pruebas de formularios, selector, restauración y logout mockearán exports de `src/features/auth/api/auth-api.ts`; no mockearán `fetch` ni abrirán conexiones al backend. Las fixtures de sesión existentes se reutilizarán o ampliarán solo para expresar las respuestas ya definidas por `frontend-auth-flow`.

Las pruebas de navegación mockearán `next/navigation` con un router observable y pathname controlable. Las aserciones verificarán destinos como `/dashboard`, `/auth/select-organization` y `/auth/login`, no detalles internos del router ni del provider.

### Probar la Landing por comportamiento, sin acoplarla al CSS

Primero se montará la Landing actual y se consultará contenido por roles, nombres accesibles y texto visible. Si el Server Component no es compatible con el renderer, se extraerá la presentación estática mínima a un componente sin cambiar su contenido, rutas ni composición; el test cubrirá ese componente. No se usarán snapshots completos ni selectores de clases.

### Integrar scripts sin duplicar CI

`npm test` ejecutará Vitest en modo run y `npm run test:watch` conservará el modo interactivo. `npm run check` encadenará la suite una sola vez junto con validación OpenSpec, lint y build. No se agregará un workflow ni un paso CI adicional: no existe un workflow versionado actualmente, y cualquier pipeline que invoque `npm run check` heredará los tests.

### Documentar comandos, no una guía nueva

README incorporará únicamente `npm test` y `npm run test:watch` a sus scripts/verificación y eliminará la afirmación desactualizada de que no existe suite automatizada. No se añadirá documentación extensa de testing.

## Risks / Trade-offs

- [El montaje directo de `src/app/page.tsx` puede no ser compatible con el entorno de componentes] → Primero se intentará el montaje actual; solo se extraerá una presentación estática mínima si es necesario y se documentará el motivo.
- [Los tests de Auth pueden quedar acoplados al provider] → Los mocks se ubicarán en el cliente API y las aserciones se limitarán a controles, mensajes, destinos y argumentos contractuales observables.
- [Estado de módulo compartido del provider entre tests] → Cada prueba restablecerá el estado y mocks mediante los helpers existentes y cleanup de React Testing Library.
- [El README describe un CI no presente en `.github/workflows`] → La implementación solo corregirá los comandos de testing solicitados; no introducirá o modificará CI fuera del alcance.

## Migration Plan

1. Instalar únicamente las tres devDependencies faltantes con npm para actualizar el lockfile de forma consistente.
2. Ajustar configuración, setup y scripts; ejecutar las pruebas actuales y las nuevas en modo run.
3. Incorporar cobertura de Landing y Auth en unidades pequeñas, manteniendo los tests actuales que siguen aportando evidencia de contrato.
4. Actualizar README de forma acotada y ejecutar `npm run check`.
5. Rollback: revertir el cambio de planificación/implementación, incluyendo dependencias de desarrollo, scripts, configuración y tests; no hay datos persistidos ni migraciones.
