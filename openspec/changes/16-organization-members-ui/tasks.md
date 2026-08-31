## 1. Preparacion y contratos

- [ ] 1.1 Resolver la disponibilidad de `node_modules/next/dist/docs/`, consultar la documentacion de Next.js 16.2.12 para rutas dinamicas, route groups y `params`/`searchParams`, y registrar en el PR las guias revisadas antes de modificar codigo de aplicacion.
- [ ] 1.2 Contrastar los endpoints, bodies, respuestas y errores implementados contra `Proyecto-Software-I/backend/main/openspec/specs/organization-memberships/spec.md` y `Proyecto-Software-I/backend/main/openspec/specs/auth/spec.md`, verificando que no se asuma ningun campo o status no publicado.
- [ ] 1.3 Revisar `src/components/ui` y ejecutar `npx shadcn@latest info`; si siguen ausentes, agregar solamente `Input`, `Dialog` y `AlertDialog` mediante shadcn y verificar que no se incorpore otra biblioteca ni una dependencia innecesaria.

## 2. Auth canonico y permisos

- [ ] 2.1 Extender `ActiveMembership` con `permissions: string[]` y actualizar los guards de sesion para validar permisos sin inferirlos desde roles; verificar con pruebas de respuestas validas, arrays vacios y respuestas malformadas.
- [ ] 2.2 Modelar inputs de registro normal e invitacion como variantes mutuamente excluyentes y adaptar el adapter Auth para omitir `email` y `organizationName` en modo invitacion; verificar bodies y credenciales en contract tests.
- [ ] 2.3 Extender el Auth context existente con `hasPermission`, un accessor de token solo en memoria y una recarga coordinada de `/api/auth/me`; verificar que operaciones obsoletas no reemplacen una sesion mas nueva.
- [ ] 2.4 Incorporar el mapeo seguro de errores de invitacion en Auth y verificar que ningun mensaje visible incluya token, body crudo o detalle tecnico.
- [ ] 2.5 Implementar y probar un validador de retorno que acepte solo rutas locales `/invite/[token]` y rechace URLs externas, protocol-relative, vacias o no soportadas.
- [ ] 2.6 Adaptar `SessionBoundary`, login y registro para conservar un retorno de invitacion valido, incluyendo sesiones `selection-required`, y verificar que el comportamiento normal siga dirigiendo a selector o dashboard.
- [ ] 2.7 Adaptar el formulario de registro al modo invitacion con email read-only y sin `organizationName`, y verificar estados idle, validacion, loading, exito y errores funcionales.

## 3. Contratos de organizaciones

- [ ] 3.1 Crear tipos de `OrganizationMember`, `OrganizationInvitation`, preview y respuestas derivando la proyeccion de usuario desde `AuthUser`, y verificar que no exista una segunda definicion de User, Organization, Membership o Auth State.
- [ ] 3.2 Implementar validadores runtime para miembros, invitaciones, preview y creacion, incluyendo status, fechas, nested user, invitedBy, proposedRole y `acceptanceUrl`; verificar casos validos y malformados con tests.
- [ ] 3.3 Crear adapters para listar miembros e invitaciones con Bearer y verificar paths, metodos, ausencia de `organizationId` de cliente y responses `200` mediante contract tests.
- [ ] 3.4 Crear adapters para crear/revocar invitaciones y suspender/reactivar/remover memberships, y verificar request bodies, IDs codificados, Bearer y manejo de cualquier respuesta 2xx no especificada.
- [ ] 3.5 Crear adapters para preview publico sin Bearer y aceptacion autenticada con Bearer, y verificar metodos, paths y ausencia de credenciales inventadas.
- [ ] 3.6 Implementar el mapper seguro de errores funcionales de organizaciones y verificar todos los codigos publicados, incluidos `LAST_OWNER_REQUIRED` y `MEMBER_ACCESS_DENIED`.

## 4. Estado de miembros e invitaciones

- [ ] 4.1 Implementar el estado de lectura de miembros e invitaciones con carga independiente, retry y descarte de resultados obsoletos al cambiar tenant; verificar loading, exito, vacio, error parcial y cambio de organizacion.
- [ ] 4.2 Implementar creacion de invitacion sin optimistic update, refetch confirmado y almacenamiento temporal de `acceptanceUrl`; verificar que cerrar la confirmacion elimina el link en memoria.
- [ ] 4.3 Implementar copia al portapapeles con feedback de exito y fallo, y verificar ambos resultados sin persistir el link.
- [ ] 4.4 Implementar revocacion, suspend, reactivate y remove con pending por recurso, confirmacion y reconciliacion posterior; verificar que un fallo conserva el ultimo estado confirmado.
- [ ] 4.5 Implementar la secuencia accept -> reload `/me` -> resolver membership por slug -> select organization -> dashboard, y verificar exito, membership ausente, error de aceptacion y error de seleccion.

## 5. Pagina de miembros y App Shell

- [ ] 5.1 Agregar `/settings/members` bajo el layout del workspace mediante una pagina Server Component que componga el cliente de feature, y verificar que WorkspaceBoundary proteja la ruta y el tenant activo.
- [ ] 5.2 Actualizar la navegacion desktop y mobile para mostrar `Members` solo con `members.read` y derivar la entrada activa desde pathname; verificar Dashboard, Members y ausencia sin permiso.
- [ ] 5.3 Construir el encabezado con el titulo `Miembros` y la explicacion `Gestiona las personas que tienen acceso a esta organización.`, junto con los estados de acceso, carga, error y retry usando componentes y tokens semanticos existentes; verificar el copy y que no se expongan datos cuando falta `members.read`.
- [ ] 5.4 Renderizar miembros como tabla semantica en desktop y cards/list items en mobile con initials/avatar, nombre, email, roles, estado y acciones; verificar `ACTIVE`, `SUSPENDED`, unico owner y ausencia de `REMOVED`.
- [ ] 5.5 Renderizar `Pending invitations` con email, expiracion, invitador y rol, filtrar acciones a `PENDING`, y verificar el estado `No pending invitations.`.
- [ ] 5.6 Construir el dialog de invitacion y la confirmacion de link de un solo uso, y verificar label, error asociado, foco, Escape, pending y copy que no afirma envio de email.
- [ ] 5.7 Construir confirmaciones y feedback para revoke, suspend y remove, junto con reactivate, y verificar visibilidad exclusiva con `members.manage`, cancelacion y `LAST_OWNER_REQUIRED`.

## 6. Pagina publica de invitacion

- [ ] 6.1 Agregar `/invite/[token]` bajo Auth pero fuera del workspace mediante una pagina Server Component y verificar que sea accesible sin tenant activo.
- [ ] 6.2 Construir preview con carga, retry, estado valido y estados explicitos para not found, expired, revoked y accepted; verificar que estados invalidos no muestren acciones de aceptacion o registro.
- [ ] 6.3 Mostrar acciones anonimas hacia login y registro existentes conservando el token solo en URL/returnTo, y verificar que no se escriba en localStorage, sessionStorage ni cookies propias.
- [ ] 6.4 Mostrar `Join` solo para la cuenta autenticada correcta y el flujo de cambio de cuenta para email distinto; verificar que una cuenta incorrecta no pueda iniciar accept.
- [ ] 6.5 Integrar el registro por invitacion y la aceptacion de usuario existente hasta `/dashboard`, y verificar ambos recorridos contra un backend compatible o mocks de contrato equivalentes.

## 7. Pruebas automatizadas

- [ ] 7.1 Extender fixtures y contract tests Auth para `permissions`, registro por invitacion, retornos seguros y recarga de sesion; verificar con `npm test -- --run`.
- [ ] 7.2 Agregar contract tests de todos los adapters de organizaciones, validadores runtime y errores funcionales; verificar con `npm test -- --run`.
- [ ] 7.3 Agregar pruebas de comportamiento para `members.read` sin manage, manage completo, estados vacios, invitation link de un uso y mutaciones pesimistas; verificar con `npm test -- --run`.
- [ ] 7.4 Agregar pruebas de invitacion valida/invalida/expirada/revocada/aceptada, cuenta correcta/incorrecta y usuario nuevo/existente; verificar con `npm test -- --run`.

## 8. Verificacion manual

- [ ] 8.1 Verificar Members e invitation preview en mobile, tablet y desktop sin scroll horizontal, incluyendo tabla/cards, menu mobile, dialogs y acciones disponibles.
- [ ] 8.2 Verificar por teclado orden de foco, foco visible, apertura/cierre y retorno de dialogs, labels, anuncios live, disabled y confirmaciones destructivas.
- [ ] 8.3 Verificar loading, success, empty, error, retry, clipboard failure, permisos read/manage, cambio de tenant y ausencia de optimistic updates con el backend integrado.
- [ ] 8.4 Verificar que no existan errores de hidratacion o consola, tokens en storage/logs, mensajes de email no enviado, colores arbitrarios ni datos de otro tenant.

## 9. Validacion final

- [ ] 9.1 Ejecutar `npm test -- --run` y confirmar que toda la suite pasa sin debilitar pruebas.
- [ ] 9.2 Ejecutar `npm run lint` y corregir todos los errores dentro del alcance.
- [ ] 9.3 Ejecutar `npm run build` y confirmar que las rutas estaticas, dinamicas y autenticadas compilan con Next.js 16.2.12.
- [ ] 9.4 Ejecutar `npx --yes @fission-ai/openspec@latest validate 16-organization-members-ui --strict --no-interactive`, `npm run check`, `git diff --check` y `git status`, y confirmar que implementacion, specs y alcance coinciden antes de archivar.
