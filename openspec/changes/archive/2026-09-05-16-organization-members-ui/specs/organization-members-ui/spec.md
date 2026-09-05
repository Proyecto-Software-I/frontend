## Purpose

Define la experiencia tenant-scoped para consultar y administrar miembros e invitaciones, y el recorrido publico y autenticado para aceptar una invitacion de organizacion.

## ADDED Requirements

### Requirement: La pagina de miembros debe usar el tenant y los permisos autenticados

La aplicacion SHALL proporcionar `/settings/members` dentro del workspace autenticado con el titulo `Miembros` y la explicacion `Gestiona las personas que tienen acceso a esta organización.`. La aplicacion SHALL usar `activeOrganization` como contexto visible y `activeMembership.permissions` como fuente de presentacion. La UI SHALL requerir `members.read` para mostrar el contenido y SHALL tratar al backend como autoridad final de autorizacion.

#### Scenario: Usuario con permiso de lectura abre miembros
- **GIVEN** una sesion autenticada con organizacion activa y `members.read`
- **WHEN** el usuario abre `/settings/members`
- **THEN** la aplicacion muestra el titulo `Miembros` y la explicacion `Gestiona las personas que tienen acceso a esta organización.` para la organizacion activa
- **AND** solicita miembros e invitaciones sin enviar un `organizationId` elegido por el cliente

#### Scenario: Usuario sin permiso de lectura intenta acceso directo
- **GIVEN** una sesion autenticada con organizacion activa pero sin `members.read`
- **WHEN** el usuario abre `/settings/members` directamente
- **THEN** la aplicacion no muestra datos de miembros ni invitaciones
- **AND** muestra un estado seguro de acceso denegado

#### Scenario: Backend rechaza una lectura aparentemente permitida
- **GIVEN** la UI conserva `members.read` en una sesion que ya no tiene autorizacion vigente en backend
- **WHEN** el backend responde `403 MEMBER_ACCESS_DENIED`
- **THEN** la aplicacion muestra feedback seguro de permisos insuficientes
- **AND** no presenta la respuesta tecnica ni datos de otro tenant

### Requirement: La pagina debe consultar y representar miembros actuales

La aplicacion SHALL consumir `GET /api/organizations/current/members` con Bearer y validar el envelope `{ members: OrganizationMember[] }` antes de representar memberships `ACTIVE` y `SUSPENDED` de la organizacion activa. Cada item SHALL representar membership `id`, `status`, `joinedAt`, `jobTitle`, `roles` y los campos seguros del usuario `id`, `email`, `displayName`, `firstName`, `lastName` y `avatarUrl`. Los memberships `REMOVED` SHALL permanecer fuera de la lista normal.

#### Scenario: Lista de miembros cargada
- **GIVEN** un usuario con `members.read`
- **WHEN** el backend responde `200` con miembros
- **THEN** la pagina muestra initials o avatar, nombre, email, roles y estado de cada miembro
- **AND** identifica visualmente los estados `ACTIVE` y `SUSPENDED`

#### Scenario: Organizacion con solo el owner
- **GIVEN** la respuesta contiene un unico miembro visible
- **WHEN** la lista se renderiza
- **THEN** la pagina informa `Eres el único miembro de esta organización. Invita a tu equipo cuando estés listo.`
- **AND** muestra la accion de invitar solo si el usuario tambien tiene `members.manage`

#### Scenario: Carga inicial de miembros
- **GIVEN** la consulta de miembros no ha terminado
- **WHEN** la pagina se renderiza
- **THEN** muestra un estado de carga anunciado de forma accesible
- **AND** no muestra datos obsoletos de otra organizacion

#### Scenario: Error al consultar miembros
- **GIVEN** la consulta falla por red, timeout, respuesta inesperada o error HTTP
- **WHEN** el fallo se representa
- **THEN** la pagina muestra un mensaje seguro y una accion de reintento
- **AND** no muestra detalles internos del backend

### Requirement: La pagina debe consultar invitaciones pendientes sin exponer secretos

La aplicacion SHALL consumir `GET /api/organizations/current/invitations` con Bearer, validar el envelope `{ invitations: OrganizationInvitation[] }` y SHALL representar en `Invitaciones pendientes` las invitaciones cuyo estado actual sea `PENDING`. Cada invitacion visible SHALL incluir email, estado, expiracion, `invitedBy.id`, `invitedBy.displayName` y rol propuesto. `createdAt` SHALL validarse como parte del contrato de `OrganizationInvitation`, pero no se requiere mostrarlo. Si `invitedBy.displayName` es null, la UI SHALL usar un fallback seguro que no invente un email. La lista SHALL no esperar ni derivar `acceptanceUrl`, token plano, `tokenHash` o IDs internos omitidos por el contrato.

#### Scenario: Existen invitaciones pendientes
- **GIVEN** el backend devuelve una o mas invitaciones `PENDING`
- **WHEN** la seccion se renderiza
- **THEN** muestra email, estado, expiracion, `invitedBy.displayName` y `proposedRole.name`
- **AND** no muestra ningun token de invitacion

#### Scenario: No existen invitaciones pendientes
- **GIVEN** la respuesta no contiene invitaciones `PENDING`
- **WHEN** la seccion se renderiza
- **THEN** muestra `No hay invitaciones pendientes.`

#### Scenario: Una invitacion expiro antes de listar
- **GIVEN** el backend devuelve una invitacion con estado `EXPIRED`
- **WHEN** la seccion pendiente se renderiza
- **THEN** esa invitacion no se presenta como pendiente ni ofrece revocacion

#### Scenario: Error al consultar invitaciones
- **GIVEN** la consulta de invitaciones falla
- **WHEN** el fallo se representa
- **THEN** la pagina muestra feedback seguro y permite reintentar la carga

### Requirement: Usuarios con members.manage pueden crear invitaciones

La aplicacion SHALL mostrar `Invitar miembro` solo cuando `activeMembership.permissions` incluya `members.manage`. El formulario SHALL solicitar unicamente email y SHALL enviar `POST /api/organizations/current/invitations` con `{ email }`. La respuesta exitosa SHALL validarse como `{ invitation: OrganizationInvitation, acceptanceUrl: string }`. La confirmacion SHALL comunicar que la invitacion fue creada, no que se envio un email.

#### Scenario: Usuario autorizado abre el formulario
- **GIVEN** un usuario con `members.manage`
- **WHEN** activa `Invitar miembro`
- **THEN** se abre un dialog accesible con un campo email y `Crear invitación`
- **AND** no se muestra un selector de roles

#### Scenario: Email vacio o invalido
- **GIVEN** el formulario contiene un email vacio o invalido
- **WHEN** el usuario intenta crear la invitacion
- **THEN** se muestra validacion asociada al campo
- **AND** no se envia la solicitud

#### Scenario: Invitacion creada
- **GIVEN** un email valido sin membership ni invitacion pendiente
- **WHEN** el backend responde `201` con metadata y `acceptanceUrl`
- **THEN** la UI muestra `Invitación creada. Comparte este enlace seguro con la persona invitada.`
- **AND** permite copiar el link
- **AND** actualiza la lista confirmada por backend
- **AND** no afirma que se envió un email

#### Scenario: Link copiado
- **GIVEN** la confirmacion conserva el `acceptanceUrl` de la respuesta de creacion
- **WHEN** el usuario activa `Copiar enlace de invitación` y el navegador confirma la copia
- **THEN** la UI anuncia que el link fue copiado

#### Scenario: Falla la copia del link
- **GIVEN** el navegador rechaza o no soporta la operacion de portapapeles
- **WHEN** el usuario intenta copiar el link
- **THEN** la UI informa de forma segura que no pudo copiarlo
- **AND** mantiene el link disponible mientras la confirmacion permanezca abierta

#### Scenario: Se cierra la confirmacion
- **GIVEN** el `acceptanceUrl` se muestra en la confirmacion de creacion
- **WHEN** el usuario cierra esa confirmacion
- **THEN** la aplicacion elimina el link de su estado en memoria
- **AND** no vuelve a mostrarlo desde la lista de invitaciones

#### Scenario: Invitacion duplicada o miembro existente
- **GIVEN** el backend responde `INVITATION_ALREADY_PENDING` o `MEMBER_ALREADY_EXISTS`
- **WHEN** la creacion falla
- **THEN** el formulario permanece disponible y muestra un mensaje funcional seguro
- **AND** no agrega una invitacion optimista

### Requirement: Usuarios con members.manage pueden revocar invitaciones pendientes

La aplicacion SHALL ofrecer revocacion solo para invitaciones `PENDING` cuando el usuario tenga `members.manage`. La accion SHALL requerir confirmacion y SHALL ejecutar `DELETE /api/organizations/current/invitations/:invitationId` sin actualizacion optimista.

#### Scenario: Revocar una invitacion pendiente
- **GIVEN** una invitacion `PENDING` y un usuario con `members.manage`
- **WHEN** confirma la revocacion y backend confirma el cambio
- **THEN** la aplicacion vuelve a consultar o actualiza desde una respuesta autoritativa
- **AND** la invitacion deja de aparecer como pendiente
- **AND** muestra feedback de exito

#### Scenario: Cancelar revocacion
- **GIVEN** la confirmacion de revocacion esta abierta
- **WHEN** el usuario cancela
- **THEN** no se envia ninguna solicitud
- **AND** la lista permanece sin cambios

#### Scenario: Revocacion rechazada
- **GIVEN** el backend responde `INVITATION_NOT_FOUND`, `INVITATION_EXPIRED`, `INVITATION_REVOKED` o `INVITATION_ALREADY_ACCEPTED`
- **WHEN** la accion termina
- **THEN** la aplicacion conserva el estado anterior hasta volver a cargar datos confirmados
- **AND** muestra feedback funcional seguro

### Requirement: Usuarios con members.manage pueden administrar estados de membership

La aplicacion SHALL ofrecer `Suspender` para memberships `ACTIVE`, `Reactivar` para memberships `SUSPENDED` y `Eliminar` para memberships `ACTIVE` o `SUSPENDED`, unicamente cuando el usuario tenga `members.manage`. Suspend y reactivate SHALL usar `PATCH /api/organizations/current/members/:membershipId` con `status` `SUSPENDED` o `ACTIVE`; remove SHALL usar `DELETE /api/organizations/current/members/:membershipId`.

#### Scenario: Suspender miembro activo
- **GIVEN** un miembro `ACTIVE` y un administrador con `members.manage`
- **WHEN** confirma `Suspender miembro` y backend confirma la transicion
- **THEN** la UI vuelve a cargar datos confirmados y muestra el miembro como `SUSPENDED`

#### Scenario: Reactivar miembro suspendido
- **GIVEN** un miembro `SUSPENDED` y un administrador con `members.manage`
- **WHEN** activa `Reactivar` y backend confirma la transicion
- **THEN** la UI vuelve a cargar datos confirmados y muestra el miembro como `ACTIVE`

#### Scenario: Remover miembro
- **GIVEN** un miembro `ACTIVE` o `SUSPENDED`
- **WHEN** el administrador confirma `Eliminar miembro` despues de ver el nombre y la organizacion afectados
- **THEN** la UI ejecuta la eliminacion logica mediante backend
- **AND** tras la confirmacion autoritativa el miembro deja de aparecer en la lista normal

#### Scenario: Ultimo owner protegido por backend
- **GIVEN** una accion dejaria la organizacion sin owner activo
- **WHEN** backend responde `409 LAST_OWNER_REQUIRED`
- **THEN** la UI conserva al miembro en su estado anterior
- **AND** explica que la organizacion debe mantener al menos un owner activo

#### Scenario: Membership no encontrada o acceso denegado
- **GIVEN** backend responde `MEMBERSHIP_NOT_FOUND` o `MEMBER_ACCESS_DENIED`
- **WHEN** termina la accion
- **THEN** la UI no aplica cambios optimistas
- **AND** muestra feedback seguro y permite recargar el estado

#### Scenario: Usuario sin permiso de administracion
- **GIVEN** un usuario con `members.read` pero sin `members.manage`
- **WHEN** consulta miembros e invitaciones
- **THEN** puede leer ambas secciones
- **AND** no ve acciones para invitar, revocar, suspender, reactivar o remover

### Requirement: La invitacion publica debe previsualizarse sin tenant activo

La aplicacion SHALL proporcionar `/invite/[token]` sin exigir un tenant activo y SHALL consumir `GET /api/invitations/:token` sin Bearer. Para una invitacion valida SHALL mostrar organizacion, email invitado y expiracion; para errores funcionales SHALL mostrar un estado explicito y no redirigir automaticamente a registro.

#### Scenario: Preview valido
- **GIVEN** un token `PENDING` y no expirado
- **WHEN** backend responde `200`
- **THEN** la pagina muestra `Has sido invitado a unirte a`, el nombre de la organizacion y el email invitado

#### Scenario: Preview en carga
- **GIVEN** la consulta publica no ha terminado
- **WHEN** la ruta se renderiza
- **THEN** se muestra un estado de carga accesible sin afirmar que la invitacion es valida

#### Scenario: Invitacion invalida, expirada, revocada o aceptada
- **GIVEN** backend responde `INVITATION_NOT_FOUND`, `INVITATION_EXPIRED`, `INVITATION_REVOKED` o `INVITATION_ALREADY_ACCEPTED`
- **WHEN** la pagina maneja la respuesta
- **THEN** muestra que la invitacion ya no es valida o utilizable con una explicacion apropiada
- **AND** recomienda solicitar una nueva invitacion cuando corresponda
- **AND** no muestra controles de aceptacion o registro

#### Scenario: Fallo de red o respuesta inesperada
- **GIVEN** el preview falla sin un codigo funcional reconocido
- **WHEN** el error se representa
- **THEN** la pagina muestra un mensaje seguro y permite reintentar

### Requirement: Un usuario existente debe aceptar solo su propia invitacion

Una sesion autenticada cuyo email normalizado coincide con la invitacion SHALL poder ejecutar `POST /api/invitations/:token/accept` con Bearer. Tras una aceptacion confirmada, la aplicacion SHALL refrescar el contexto mediante `GET /api/auth/me`, resolver la membership cuya organizacion coincide con el `slug` validado del preview, reutilizar `POST /api/auth/select-organization` con su ID y navegar a `/dashboard`.

#### Scenario: Usuario correcto acepta y entra a la organizacion
- **GIVEN** el usuario autenticado tiene el mismo email normalizado que la invitacion valida
- **WHEN** activa `Unirme a <organización>` y backend confirma la aceptacion
- **THEN** la aplicacion refresca el contexto Auth
- **AND** selecciona la nueva organizacion mediante el flujo Auth existente
- **AND** navega a `/dashboard` con la nueva organizacion activa

#### Scenario: Aceptacion pendiente
- **GIVEN** la operacion de aceptacion esta en curso
- **WHEN** la pagina espera confirmacion de backend
- **THEN** deshabilita envios repetidos y anuncia el estado de carga
- **AND** no muestra la membership como aceptada anticipadamente

#### Scenario: Email de cuenta diferente
- **GIVEN** el usuario autenticado tiene un email distinto del email invitado
- **WHEN** la invitacion valida se muestra
- **THEN** la pagina informa ambos emails de forma clara
- **AND** no ofrece ni ejecuta la aceptacion
- **AND** permite cerrar sesion para usar la cuenta correcta

#### Scenario: Backend rechaza la aceptacion
- **GIVEN** backend responde `INVITATION_EMAIL_MISMATCH`, `MEMBER_ALREADY_EXISTS` u otro error funcional de invitacion
- **WHEN** la accion termina
- **THEN** la UI mantiene el estado anterior y muestra feedback seguro

### Requirement: Una persona anonima debe continuar mediante Auth existente

Para una invitacion valida sin sesion autenticada, la pagina SHALL ofrecer iniciar sesion o crear cuenta y SHALL conservar el token unicamente en la ruta y en un `returnTo` interno validado. No SHALL guardar el token en localStorage, sessionStorage, cookies propias ni otra persistencia permanente.

#### Scenario: Usuario existente inicia sesion
- **GIVEN** una persona anonima abre una invitacion valida
- **WHEN** elige `Iniciar sesión`
- **THEN** navega al login existente con retorno restringido a `/invite/[token]`
- **AND** despues de autenticarse vuelve a la invitacion para decidir la aceptacion

#### Scenario: Usuario nuevo inicia registro por invitacion
- **GIVEN** una persona anonima abre una invitacion valida
- **WHEN** elige `Crear cuenta y unirme a la organización`
- **THEN** navega al registro existente en modo invitacion conservando el token en URL
- **AND** el registro muestra organizacion invitante, email no editable, nombre, apellido y password
- **AND** no solicita `organizationName`

#### Scenario: Registro por invitacion exitoso
- **GIVEN** una invitacion valida y datos de cuenta validos
- **WHEN** `POST /api/auth/register` responde `201` con la organizacion invitante activa
- **THEN** la aplicacion adopta la sesion Auth devuelta
- **AND** navega a `/dashboard`

### Requirement: La experiencia debe ser responsive y accesible

La pagina de miembros, dialogs y pagina de invitacion SHALL funcionar en mobile y desktop, conservar controles semanticos, foco visible, labels, anuncios de estado y confirmaciones operables por teclado.

#### Scenario: Lista desktop
- **GIVEN** un viewport desktop
- **WHEN** se muestran miembros
- **THEN** los campos se organizan en una tabla semantica legible sin perder acciones

#### Scenario: Lista mobile
- **GIVEN** un viewport mobile
- **WHEN** se muestran miembros
- **THEN** cada miembro se representa como card o list item sin tabla horizontal ni scroll accidental
- **AND** conserva los mismos permisos y acciones disponibles en desktop

#### Scenario: Dialog operado con teclado
- **GIVEN** un usuario abre un formulario o confirmacion mediante teclado
- **WHEN** interactua con el dialog
- **THEN** el foco se administra de forma predecible, Escape permite cancelar cuando corresponde y el foco vuelve al activador

#### Scenario: Accion destructiva en curso
- **GIVEN** una accion sensible esta pendiente
- **WHEN** el usuario intenta repetirla
- **THEN** los controles relevantes permanecen deshabilitados
- **AND** el estado se anuncia mediante texto accesible

### Requirement: Las mutaciones sensibles deben esperar confirmacion del backend

La aplicacion MUST NOT aplicar actualizaciones optimistas a crear o revocar invitaciones, aceptar invitaciones, suspender, reactivar o remover memberships. Ante fallo SHALL conservar el ultimo estado confirmado y ante exito SHALL reconciliar la UI con datos confirmados por backend.

#### Scenario: Mutacion exitosa
- **GIVEN** una accion sensible enviada al backend
- **WHEN** backend confirma el resultado
- **THEN** la aplicacion actualiza o vuelve a consultar los datos visibles

#### Scenario: Mutacion fallida
- **GIVEN** una accion sensible enviada al backend
- **WHEN** backend rechaza o no completa la operacion
- **THEN** la aplicacion conserva el estado visible anterior
- **AND** muestra un error seguro y permite reintentar cuando corresponda
