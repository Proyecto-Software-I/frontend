# organization-members-ui Specification

## Purpose

Define la experiencia tenant-scoped para consultar y administrar miembros e invitaciones, y el recorrido publico y autenticado para aceptar una invitacion de organizacion.

## Requirements

### Requirement: La pagina de miembros debe usar el tenant y los permisos autenticados
La aplicacion SHALL proporcionar `/settings/members` dentro del workspace autenticado con el titulo `Miembros` y la explicacion `Gestiona las personas que tienen acceso a esta organización.`. La aplicacion SHALL usar `activeOrganization` como contexto visible y `activeMembership.permissions` como fuente de presentacion. La UI SHALL requerir `members.read` para mostrar el contenido y SHALL tratar al backend como autoridad final de autorizacion.

#### Scenario: Usuario con permiso de lectura abre miembros
- **GIVEN** una sesion autenticada con organizacion activa y `members.read`
- **WHEN** el usuario abre `/settings/members`
- **THEN** muestra el titulo y explicacion para la organizacion activa y solicita miembros e invitaciones sin enviar un `organizationId` elegido por cliente

#### Scenario: Usuario sin permiso de lectura intenta acceso directo
- **GIVEN** una sesion autenticada con organizacion activa pero sin `members.read`
- **WHEN** el usuario abre `/settings/members` directamente
- **THEN** no muestra miembros ni invitaciones y presenta un estado seguro de acceso denegado

#### Scenario: Backend rechaza una lectura aparentemente permitida
- **GIVEN** la UI conserva `members.read` en una sesion ya no autorizada por backend
- **WHEN** backend responde `403 MEMBER_ACCESS_DENIED`
- **THEN** muestra feedback seguro sin respuesta tecnica ni datos de otro tenant

### Requirement: La pagina debe consultar y representar miembros actuales
La aplicacion SHALL consumir `GET /api/organizations/current/members` con Bearer y validar `{ members: OrganizationMember[] }` antes de representar memberships `ACTIVE` y `SUSPENDED` de la organizacion activa. Cada item SHALL representar membership `id`, `status`, `joinedAt`, `jobTitle`, `roles` y los campos seguros de usuario `id`, `email`, `displayName`, `firstName`, `lastName` y `avatarUrl`. Los memberships `REMOVED` SHALL permanecer fuera de la lista normal.

#### Scenario: Lista de miembros cargada
- **GIVEN** un usuario con `members.read`
- **WHEN** backend responde `200` con miembros
- **THEN** muestra initials o avatar, nombre, email, roles y estado de cada miembro e identifica `ACTIVE` y `SUSPENDED`

#### Scenario: Organizacion con solo el owner
- **GIVEN** la respuesta contiene un unico miembro visible
- **WHEN** la lista se renderiza
- **THEN** informa `Eres el único miembro de esta organización. Invita a tu equipo cuando estés listo.` y muestra invitar solo con `members.manage`

#### Scenario: Carga inicial de miembros
- **GIVEN** la consulta no termina
- **WHEN** la pagina se renderiza
- **THEN** muestra una carga accesible sin datos obsoletos de otra organizacion

#### Scenario: Error al consultar miembros
- **GIVEN** la consulta falla por red, timeout, respuesta inesperada o HTTP
- **WHEN** se representa el fallo
- **THEN** muestra mensaje seguro, reintento y no detalles internos

### Requirement: La pagina debe consultar invitaciones pendientes sin exponer secretos
La aplicacion SHALL consumir `GET /api/organizations/current/invitations` con Bearer, validar `{ invitations: OrganizationInvitation[] }` y representar en `Invitaciones pendientes` solo estados `PENDING`. Cada invitacion visible SHALL incluir email, estado, expiracion, `invitedBy.id`, `invitedBy.displayName` y rol propuesto. `createdAt` SHALL validarse, pero no se requiere mostrarlo. Si `invitedBy.displayName` es null, SHALL usar fallback seguro sin inventar email. La lista SHALL no esperar ni derivar `acceptanceUrl`, token plano, `tokenHash` o IDs internos omitidos por contrato.

#### Scenario: Existen invitaciones pendientes
- **GIVEN** backend devuelve una o mas invitaciones `PENDING`
- **WHEN** la seccion se renderiza
- **THEN** muestra email, estado, expiracion, invitador y `proposedRole.name`, sin token

#### Scenario: No existen invitaciones pendientes
- **GIVEN** no existen invitaciones `PENDING`
- **WHEN** la seccion se renderiza
- **THEN** muestra `No hay invitaciones pendientes.`

#### Scenario: Una invitacion expiro antes de listar
- **GIVEN** backend devuelve una invitacion `EXPIRED`
- **WHEN** se renderiza la seccion pendiente
- **THEN** no la presenta como pendiente ni ofrece revocacion

#### Scenario: Error al consultar invitaciones
- **GIVEN** la consulta falla
- **WHEN** se representa
- **THEN** muestra feedback seguro y permite reintentar

### Requirement: Usuarios con members.manage pueden crear invitaciones
La aplicacion SHALL mostrar `Invitar miembro` solo si `activeMembership.permissions` incluye `members.manage`. El formulario SHALL solicitar solo email y enviar `POST /api/organizations/current/invitations` con `{ email }`. La respuesta SHALL validarse como `{ invitation: OrganizationInvitation, acceptanceUrl: string }`. La confirmacion SHALL comunicar creacion, no envio de email.

#### Scenario: Usuario autorizado abre el formulario
- **GIVEN** un usuario con `members.manage`
- **WHEN** activa `Invitar miembro`
- **THEN** se abre un dialog accesible con email y `Crear invitación`, sin selector de roles

#### Scenario: Email vacio o invalido
- **GIVEN** un email vacio o invalido
- **WHEN** intenta crear la invitacion
- **THEN** muestra validacion asociada y no envia solicitud

#### Scenario: Invitacion creada
- **GIVEN** email valido sin membership ni invitacion pendiente
- **WHEN** backend responde `201` con metadata y `acceptanceUrl`
- **THEN** muestra `Invitación creada. Comparte este enlace seguro con la persona invitada.`, permite copiar el link, actualiza la lista confirmada y no afirma envio de email

#### Scenario: Link copiado
- **GIVEN** la confirmacion conserva `acceptanceUrl`
- **WHEN** el navegador confirma `Copiar enlace de invitación`
- **THEN** anuncia que el link fue copiado

#### Scenario: Falla la copia del link
- **GIVEN** portapapeles no soportado o rechazado
- **WHEN** se intenta copiar
- **THEN** informa el fallo de forma segura y mantiene el link disponible mientras la confirmacion este abierta

#### Scenario: Se cierra la confirmacion
- **GIVEN** `acceptanceUrl` se muestra en la confirmacion
- **WHEN** usuario la cierra
- **THEN** elimina el link de memoria y no lo muestra desde la lista

#### Scenario: Invitacion duplicada o miembro existente
- **GIVEN** backend responde `INVITATION_ALREADY_PENDING` o `MEMBER_ALREADY_EXISTS`
- **WHEN** la creacion falla
- **THEN** el formulario permanece disponible con mensaje seguro y sin invitacion optimista

### Requirement: Usuarios con members.manage pueden revocar invitaciones pendientes
La aplicacion SHALL ofrecer revocacion solo para invitaciones `PENDING` con `members.manage`, requerir confirmacion y ejecutar `DELETE /api/organizations/current/invitations/:invitationId` sin actualizacion optimista.

#### Scenario: Revocar una invitacion pendiente
- **GIVEN** una invitacion `PENDING` y usuario autorizado
- **WHEN** confirma y backend confirma
- **THEN** vuelve a consultar o actualiza desde respuesta autoritativa, la invitacion desaparece y muestra exito

#### Scenario: Cancelar revocacion
- **GIVEN** confirmacion abierta
- **WHEN** usuario cancela
- **THEN** no envia solicitud y la lista no cambia

#### Scenario: Revocacion rechazada
- **GIVEN** backend responde `INVITATION_NOT_FOUND`, `INVITATION_EXPIRED`, `INVITATION_REVOKED` o `INVITATION_ALREADY_ACCEPTED`
- **WHEN** termina la accion
- **THEN** conserva estado hasta recargar datos confirmados y muestra feedback seguro

### Requirement: Usuarios con members.manage pueden administrar estados de membership
La aplicacion SHALL ofrecer `Suspender` para `ACTIVE`, `Reactivar` para `SUSPENDED` y `Eliminar` para ambos, solo con `members.manage`. Suspend/reactivate SHALL usar `PATCH /api/organizations/current/members/:membershipId` con `SUSPENDED`/`ACTIVE`; remove SHALL usar `DELETE /api/organizations/current/members/:membershipId`.

#### Scenario: Suspender miembro activo
- **GIVEN** miembro `ACTIVE` y administrador autorizado
- **WHEN** confirma `Suspender miembro` y backend confirma
- **THEN** recarga datos confirmados y muestra `SUSPENDED`

#### Scenario: Reactivar miembro suspendido
- **GIVEN** miembro `SUSPENDED` y administrador autorizado
- **WHEN** activa `Reactivar` y backend confirma
- **THEN** recarga datos confirmados y muestra `ACTIVE`

#### Scenario: Remover miembro
- **GIVEN** miembro `ACTIVE` o `SUSPENDED`
- **WHEN** administrador confirma `Eliminar miembro` tras ver nombre y organizacion afectados
- **THEN** ejecuta eliminacion logica y, tras confirmacion autoritativa, el miembro deja la lista normal

#### Scenario: Ultimo owner protegido por backend
- **GIVEN** una accion dejaria la organizacion sin owner activo
- **WHEN** backend responde `409 LAST_OWNER_REQUIRED`
- **THEN** conserva el miembro y explica que debe mantenerse un owner activo

#### Scenario: Membership no encontrada o acceso denegado
- **GIVEN** backend responde `MEMBERSHIP_NOT_FOUND` o `MEMBER_ACCESS_DENIED`
- **WHEN** termina la accion
- **THEN** no aplica cambios optimistas, muestra feedback seguro y permite recargar

#### Scenario: Usuario sin permiso de administracion
- **GIVEN** usuario con `members.read` sin `members.manage`
- **WHEN** consulta ambas secciones
- **THEN** puede leerlas pero no ve invitar, revocar, suspender, reactivar o remover

### Requirement: La invitacion publica debe previsualizarse sin tenant activo
La aplicacion SHALL proporcionar `/invite/[token]` sin tenant activo y consumir `GET /api/invitations/:token` sin Bearer. Para invitacion valida SHALL mostrar organizacion, email y expiracion; para errores funcionales SHALL mostrar estado explicito y no redirigir automaticamente a registro.

#### Scenario: Preview valido
- **GIVEN** token `PENDING` no expirado
- **WHEN** backend responde `200`
- **THEN** muestra `Has sido invitado a unirte a`, organizacion y email invitado

#### Scenario: Preview en carga
- **GIVEN** consulta publica pendiente
- **WHEN** la ruta se renderiza
- **THEN** muestra carga accesible sin afirmar validez

#### Scenario: Invitacion invalida, expirada, revocada o aceptada
- **GIVEN** backend responde `INVITATION_NOT_FOUND`, `INVITATION_EXPIRED`, `INVITATION_REVOKED` o `INVITATION_ALREADY_ACCEPTED`
- **WHEN** se maneja la respuesta
- **THEN** explica que no es utilizable, recomienda nueva invitacion cuando corresponde y no muestra controles de registro/aceptacion

#### Scenario: Fallo de red o respuesta inesperada
- **GIVEN** preview falla sin codigo funcional reconocido
- **WHEN** se representa error
- **THEN** muestra mensaje seguro y reintento

### Requirement: Un usuario existente debe aceptar solo su propia invitacion
Una sesion cuyo email normalizado coincide con la invitacion SHALL ejecutar `POST /api/invitations/:token/accept` con Bearer. Tras confirmacion SHALL refrescar `GET /api/auth/me`, resolver la membership con organizacion que coincide con el `slug` validado del preview, reutilizar `POST /api/auth/select-organization` y navegar a `/dashboard`.

#### Scenario: Usuario correcto acepta y entra a la organizacion
- **GIVEN** usuario autenticado con mismo email que invitacion valida
- **WHEN** activa `Unirme a <organización>` y backend acepta
- **THEN** refresca Auth, selecciona la organizacion mediante Auth existente y navega a `/dashboard`

#### Scenario: Aceptacion pendiente
- **GIVEN** aceptacion en curso
- **WHEN** espera backend
- **THEN** deshabilita envios repetidos, anuncia carga y no anticipa la membership

#### Scenario: Email de cuenta diferente
- **GIVEN** email de sesion distinto al invitado
- **WHEN** se muestra invitacion valida
- **THEN** informa ambos emails, no ofrece ni ejecuta aceptacion y permite cerrar sesion para usar la cuenta correcta

#### Scenario: Backend rechaza la aceptacion
- **GIVEN** backend responde `INVITATION_EMAIL_MISMATCH`, `MEMBER_ALREADY_EXISTS` u otro error funcional
- **WHEN** termina la accion
- **THEN** conserva estado anterior y muestra feedback seguro

### Requirement: Una persona anonima debe continuar mediante Auth existente
Para invitacion valida sin sesion, la pagina SHALL ofrecer login o registro y conservar token solo en ruta y `returnTo` interno validado. No SHALL guardar token en localStorage, sessionStorage, cookies propias ni persistencia permanente.

#### Scenario: Usuario existente inicia sesion
- **GIVEN** persona anonima con invitacion valida
- **WHEN** elige `Iniciar sesión`
- **THEN** navega al login con retorno restringido a `/invite/[token]` y vuelve a invitacion tras autenticarse

#### Scenario: Usuario nuevo inicia registro por invitacion
- **GIVEN** persona anonima con invitacion valida
- **WHEN** elige `Crear cuenta y unirme a la organización`
- **THEN** navega al registro en modo invitacion con token en URL, muestra organizacion/email no editable/nombre/apellido/password y no solicita `organizationName`

#### Scenario: Registro por invitacion exitoso
- **GIVEN** invitacion valida y datos de cuenta validos
- **WHEN** `POST /api/auth/register` responde `201` con organizacion invitante activa
- **THEN** adopta sesion Auth y navega a `/dashboard`

### Requirement: La experiencia debe ser responsive y accesible
La pagina de miembros, dialogs y pagina de invitacion SHALL funcionar en mobile y desktop, conservar controles semanticos, foco visible, labels, anuncios de estado y confirmaciones operables por teclado.

#### Scenario: Lista desktop
- **GIVEN** viewport desktop
- **WHEN** se muestran miembros
- **THEN** campos se organizan en tabla semantica legible sin perder acciones

#### Scenario: Lista mobile
- **GIVEN** viewport mobile
- **WHEN** se muestran miembros
- **THEN** cada miembro es card o list item sin tabla horizontal ni scroll accidental, con los mismos permisos y acciones

#### Scenario: Dialog operado con teclado
- **GIVEN** usuario abre formulario o confirmacion con teclado
- **WHEN** interactua con dialog
- **THEN** foco es predecible, Escape cancela cuando corresponde y vuelve al activador

#### Scenario: Accion destructiva en curso
- **GIVEN** accion sensible pendiente
- **WHEN** intenta repetirla
- **THEN** controles permanecen deshabilitados y estado se anuncia accesiblemente

### Requirement: Las mutaciones sensibles deben esperar confirmacion del backend
La aplicacion MUST NOT aplicar actualizaciones optimistas al crear/revocar invitaciones, aceptar invitaciones, suspender, reactivar o remover memberships. Ante fallo SHALL conservar ultimo estado confirmado; ante exito SHALL reconciliar con datos confirmados.

#### Scenario: Mutacion exitosa
- **GIVEN** accion sensible enviada al backend
- **WHEN** backend confirma resultado
- **THEN** actualiza o vuelve a consultar datos visibles

#### Scenario: Mutacion fallida
- **GIVEN** accion sensible enviada al backend
- **WHEN** backend rechaza o no completa operacion
- **THEN** conserva estado visible anterior, muestra error seguro y permite reintentar cuando corresponde
