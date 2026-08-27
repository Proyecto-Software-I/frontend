## Why

Proyecto-Software-I/frontend#16 (https://github.com/Proyecto-Software-I/frontend/issues/16) requiere que owners y administradores puedan consultar y administrar miembros e invitaciones de la organizacion activa, y que las personas invitadas puedan aceptar o registrarse desde una invitacion. El backend ya completo Proyecto-Software-I/backend#10 y publico el contrato necesario, por lo que el frontend puede planificar la integracion sin inventar endpoints, permisos ni estados.

## What Changes

- Agregar la ruta autenticada `/settings/members` dentro del workspace para consultar miembros e invitaciones de la organizacion activa.
- Adaptar la navegacion del App Shell para mostrar la entrada de miembros solo cuando `activeMembership.permissions` incluya `members.read`.
- Mostrar miembros en tabla para desktop y como cards o list items para mobile, con estados de carga, exito, vacio y error.
- Permitir a usuarios con `members.manage` crear una invitacion por email, copiar el `acceptanceUrl` mostrado una sola vez, revocar invitaciones pendientes y suspender, reactivar o remover miembros con las confirmaciones aplicables.
- Agregar la ruta publica `/invite/[token]` para previsualizar una invitacion valida y representar estados invalidos, expirados, revocados o ya aceptados.
- Permitir que una persona autenticada con el email correcto acepte la invitacion, seleccione la nueva organizacion mediante el flujo Auth existente y continue a `/dashboard`.
- Permitir que una persona anonima vuelva a la invitacion despues de iniciar sesion o se registre en modo invitacion sin `organizationName` y con el email de la invitacion no editable.
- Extender el contrato Auth canonico para validar y exponer `activeMembership.permissions`, sin crear un segundo provider ni persistir access tokens o tokens de invitacion.
- Consumir exclusivamente los contratos publicados en `Proyecto-Software-I/backend/main/openspec/specs/organization-memberships/spec.md` y `auth/spec.md`.

Fuera de alcance:

- Selector, creacion o edicion de roles y permisos.
- Reasignacion de roles, transferencia de ownership o restauracion de memberships `REMOVED`.
- Envio o reenvio de emails, proveedor de correo, teams, ProjectAccess o billing por seat.
- Configuracion general de organizaciones o un nuevo organization switcher.
- Cambios al backend o a sus contratos publicados.

## Capabilities

### New Capabilities

- `organization-members-ui`: Consulta y administracion responsive y accesible de miembros e invitaciones, junto con previsualizacion y aceptacion publica de invitaciones.

### Modified Capabilities

- `frontend-auth-flow`: El contexto Auth incorpora permisos del membership activo y login/registro soportan el retorno y el modo de registro por invitacion definidos por el backend.
- `authenticated-workspace-shell`: El workspace incorpora una ruta y entrada de navegacion para miembros condicionada por `members.read`.

## Impact

- Rutas afectadas: nuevas `/settings/members` y `/invite/[token]`; existentes `/auth/login`, `/auth/register`, `/auth/select-organization` y `/dashboard` por continuidad de navegacion y adopcion del tenant.
- Areas previstas: `src/app/(session)`, `src/features/auth`, `src/features/workspace`, una feature de organizaciones que siga la estructura existente, `src/lib/api` solo mediante reutilizacion, y pruebas bajo `tests/`.
- UI afectada: App Shell, listas responsive, formularios y dialogs de invitacion/confirmacion, feedback de acciones y estados de carga, vacio, exito, error y permisos insuficientes.
- API consumida: endpoints Auth existentes y endpoints de miembros e invitaciones publicados por Proyecto-Software-I/backend#10.
- Backend: no requiere cambios; la implementacion depende de que el contrato publicado este disponible en el entorno integrado.
- Dependencias: no se agregan paquetes; se reutilizan React, Next.js, shadcn/ui, Radix UI, el API client, `ApiError` y Vitest existentes.
- Seguridad: el backend sigue siendo autoridad; la UI usa permisos solo para presentacion, no acepta `organizationId` del cliente, no aplica optimistic updates sensibles y no persiste tokens de invitacion.
