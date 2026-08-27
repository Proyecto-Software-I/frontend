## ADDED Requirements

### Requirement: El App Shell debe exponer navegacion de miembros segun permisos

El workspace SHALL incluir una entrada `Members` hacia `/settings/members` solo cuando el contexto Auth activo contenga `members.read`. La decision visual SHALL usar `activeMembership.permissions` y SHALL no inferir autorizacion desde nombres de roles.

#### Scenario: Usuario con members.read ve la entrada
- **GIVEN** un usuario autenticado con organizacion activa y permiso `members.read`
- **WHEN** se renderiza la navegacion desktop o mobile
- **THEN** aparece una entrada `Members` que navega a `/settings/members`

#### Scenario: Usuario sin members.read no ve la entrada
- **GIVEN** un usuario autenticado sin permiso `members.read`
- **WHEN** se renderiza la navegacion
- **THEN** no se muestra la entrada `Members`
- **AND** la ausencia visual no sustituye la autorizacion del backend

#### Scenario: Ruta de miembros activa
- **GIVEN** el usuario esta en `/settings/members`
- **WHEN** el App Shell se renderiza
- **THEN** la entrada `Members` se identifica como la ubicacion actual
- **AND** `Dashboard` deja de presentarse como activo

### Requirement: La ruta de miembros debe reutilizar el workspace existente

`/settings/members` SHALL renderizarse dentro del mismo App Shell y limite autenticado que `/dashboard`, conservando header, organizacion activa, usuario, navegacion responsive y logout.

#### Scenario: Miembros en desktop
- **GIVEN** una sesion autorizada en viewport desktop
- **WHEN** abre `/settings/members`
- **THEN** la pagina aparece dentro del area principal junto a la navegacion lateral existente
- **AND** conserva contexto de usuario y organizacion

#### Scenario: Miembros en mobile
- **GIVEN** una sesion autorizada en viewport mobile
- **WHEN** abre `/settings/members`
- **THEN** puede acceder a `Members` desde la navegacion movil
- **AND** cerrar la navegacion devuelve el foco y acceso al contenido principal sin scroll horizontal accidental

#### Scenario: Sesion sin tenant activo
- **GIVEN** la sesion requiere seleccionar organizacion
- **WHEN** intenta abrir `/settings/members`
- **THEN** el workspace no muestra datos privados
- **AND** dirige al selector de organizacion existente
