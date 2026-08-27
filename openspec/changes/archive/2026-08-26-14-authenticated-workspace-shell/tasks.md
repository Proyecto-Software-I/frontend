## 1. Preparación e integración con Auth

- [x] 1.1 Integrar la implementación Auth de la PR 13 (`feat/7-frontend-auth-flow`) e identificar `AuthProvider`, `useAuth`, `SessionBoundary`, adapters, tipos canónicos y operación de logout sin crear abstracciones equivalentes.
- [x] 1.2 Confirmar el contrato consumido para restaurar la sesión mediante `GET /api/auth/me`, incluyendo usuario, `activeOrganization`, `requiresOrganizationSelection` y roles.
- [x] 1.3 Confirmar la estructura App Router vigente y ubicar el layout del workspace dentro del patrón `(session)` existente, sin modificar rutas de Auth ni crear endpoints del frontend.

## 2. Protección del workspace

- [x] 2.1 Crear la composición del layout autenticado para que las futuras rutas del workspace hereden la protección común.
- [x] 2.2 Implementar el estado de bootstrap que evita renderizar información privada mientras Auth restaura la sesión.
- [x] 2.3 Implementar las redirecciones a `/auth/login` y `/auth/select-organization` según el estado autenticado y la organización activa.
- [x] 2.4 Manejar errores de restauración con un estado `error` seguro que no exponga detalles técnicos ni datos de otro tenant.
- [x] 2.5 Verificar que el tenant mostrado provenga únicamente del contexto Auth y no de URL, `localStorage`, `sessionStorage` ni valores hardcodeados.

## 3. App Shell y dashboard

- [x] 3.1 Componer el App Shell con header, contenido principal, contexto de organización, contexto de usuario y control de logout reutilizando componentes shadcn/ui existentes.
- [x] 3.2 Implementar el logout mediante la operación Auth existente.
- [x] 3.3 Actualizar `/dashboard` para mostrar LegacyLift, saludo al usuario, organización activa y roles del contexto actual, sin habilitar funcionalidades fuera de alcance.
- [x] 3.4 Mantener Server Components por defecto y aislar en Client Components únicamente los eventos o hooks que requiera Auth o logout.
- [x] 3.5 Configurar y utilizar Google Material Symbols mediante la hoja de estilos de Google Fonts, sin agregar una biblioteca npm de iconos no aprobada.
- [x] 3.6 Documentar en `AGENTS.md` el uso de Google Material Symbols, la política de tipos canónicos y la responsabilidad de `src/features/*/types`.
- [x] 3.7 Componer la interfaz responsive de desktop y mobile usando tokens semánticos, sin navegación funcional no solicitada ni estilos arbitrarios.

## 4. Validación final

- [x] 4.1 Ejecutar `openspec validate 14-authenticated-workspace-shell --strict --no-interactive` y confirmar que las specs coinciden con la implementación.
- [x] 4.2 Ejecutar `npm run lint`.
