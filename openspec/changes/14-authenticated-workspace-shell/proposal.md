## Why

La ruta `/dashboard` debe dejar de ser una entrada temporal y convertirse en el punto de acceso al workspace autenticado de LegacyLift. Un App Shell común permitirá que las próximas funcionalidades compartan el contexto de usuario y organización sin duplicar estado de autenticación ni exponer información de otro tenant.

## What Changes

- Implementar un App Shell reutilizable para las rutas autenticadas del workspace.
- Mantener `/dashboard` como primera ruta del workspace.
- Proteger el workspace según los estados de restauración de sesión, autenticación y organización activa.
- Redirigir usuarios no autenticados a `/auth/login` y usuarios autenticados sin organización activa a `/auth/select-organization`.
- Mostrar en el dashboard el nombre del usuario, la organización activa y sus roles del contexto actual.
- Reutilizar la única fuente de verdad de Auth, sus hooks, providers, adapters, cliente API y tipos canónicos cuando estén disponibles.
- Mantener la organización activa proveniente de la sesión restaurada desde el backend; no usar URL, storage ni valores hardcodeados como fuente de verdad.
- Utilizar componentes existentes de shadcn/ui y mantener comportamiento responsive, accesible y en español.
- Configurar y utilizar Google Material Symbols según la issue, documentando la convención en `AGENTS.md` durante la implementación aprobada.
- Mantener Server Components por defecto y limitar los Client Components a la interactividad necesaria.

## Capabilities

### New Capabilities

- `authenticated-workspace-shell`: App Shell autenticado, protección de rutas, contexto visible de usuario y organización, y dashboard inicial.

### Modified Capabilities

No se modifican capacidades existentes. La especificación vigente de `public-landing-page` no cambia sus requisitos.

## Impact

- **Rutas**: `/dashboard` y el nuevo layout autenticado definido para las rutas del workspace. `/auth/login` y `/auth/select-organization` son destinos de redirección y no se implementan en este cambio.
- **Frontend**: composición bajo `src/app`, componentes de la feature workspace y reutilización de `src/features/auth`, `src/lib/api` y `src/components/ui` cuando estén disponibles en la base de implementación.
- **Contratos**: consumo del contrato existente de Auth, especialmente la sesión restaurada mediante `GET /api/auth/me` y la operación existente de logout. No se definen endpoints nuevos ni cambios de contrato.
- **Backend**: sin cambios esperados. La issue backend relacionada solo funciona como referencia del contrato de autenticación.
- **Dependencias**: no se agregan dependencias de npm. Google Material Symbols debe resolverse respetando las dependencias y convenciones existentes o mediante una decisión explícita en el diseño aprobado.
- **Fuera de alcance técnico**: no se implementan Auth, un segundo provider de Auth/Tenant, selector de organizaciones, Projects, Legacy Systems, administración de miembros, RBAC UI, persistencia del dashboard, estadísticas reales ni sidebar funcional con páginas inexistentes.
- **Riesgos**: el workspace no puede asumir que `src/features/auth/` existe en todos los estados de la rama; si el Auth requerido aún no está disponible, se debe coordinar su disponibilidad sin duplicarlo ni ampliar esta issue.
