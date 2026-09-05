# authenticated-workspace-shell Specification

## Purpose

Define el comportamiento del workspace autenticado de LegacyLift para que `/dashboard` sea una entrada segura, reutilizable y coherente con el contexto de usuario y organización activa.

## Requirements

### Requirement: El workspace debe resolver el estado de autenticación

El workspace SHALL resolver el estado de restauración de sesión antes de mostrar información privada.

#### Scenario: Restauración de sesión en curso

- **GIVEN** que Auth está intentando restaurar la sesión
- **WHEN** el usuario solicita una ruta del workspace
- **THEN** se muestra un estado de carga apropiado
- **AND** no se muestra temporalmente información privada de una sesión anterior

#### Scenario: Usuario no autenticado

- **GIVEN** que la restauración terminó y no existe una sesión autenticada
- **WHEN** el usuario solicita `/dashboard`
- **THEN** es redirigido a `/auth/login`

#### Scenario: Error al restaurar la sesión

- **GIVEN** que Auth no puede restaurar la sesión
- **WHEN** el usuario solicita una ruta del workspace
- **THEN** no se muestran datos privados
- **AND** se muestra un estado de error seguro sin detalles técnicos internos

#### Scenario: Usuario autenticado sin organización activa

- **GIVEN** que existe una sesión autenticada
- **AND** el contexto indica que se requiere seleccionar una organización o no existe `activeOrganization`
- **WHEN** el usuario solicita `/dashboard`
- **THEN** es redirigido a `/auth/select-organization`

#### Scenario: Usuario autenticado con organización activa

- **GIVEN** que existe una sesión autenticada
- **AND** existe una organización activa en el contexto restaurado
- **WHEN** el usuario solicita `/dashboard`
- **THEN** puede acceder al workspace

### Requirement: La organización activa debe provenir del contexto autenticado

El workspace SHALL mostrar únicamente la organización activa entregada por el estado de Auth restaurado desde el backend y SHALL evitar conservar una copia independiente del tenant.

#### Scenario: Mostrar la organización activa

- **GIVEN** que `GET /api/auth/me` devuelve una sesión con `activeOrganization`
- **WHEN** se renderiza el workspace
- **THEN** se muestra el nombre de esa organización como organización activa

#### Scenario: No confiar en fuentes alternativas del tenant

- **GIVEN** que una URL, `localStorage`, `sessionStorage` o un valor hardcodeado contiene un identificador de organización diferente
- **WHEN** se renderiza el workspace
- **THEN** esas fuentes no modifican la organización activa mostrada

#### Scenario: Evitar datos obsoletos durante el cambio de contexto

- **GIVEN** que el contexto autenticado se restaura sin una organización activa válida
- **WHEN** se renderiza el workspace
- **THEN** no se muestran datos privados asociados a una organización anterior

### Requirement: El App Shell debe ser reutilizable

El workspace SHALL proporcionar una composición reutilizable que incluya header, contenido principal, contexto de organización, contexto de usuario y logout sin exigir que cada página reconstruya esos elementos.

#### Scenario: Renderizar el shell con un contexto válido

- **GIVEN** que el usuario está autenticado y tiene una organización activa
- **WHEN** accede a `/dashboard`
- **THEN** se renderiza el App Shell
- **AND** el contenido de la ruta aparece dentro del área principal
- **AND** el shell muestra el contexto de usuario y organización

#### Scenario: Mantener el shell preparado para rutas futuras

- **GIVEN** que una futura ruta autenticada se incorpora al workspace
- **WHEN** esa ruta utiliza el layout autenticado
- **THEN** puede reutilizar header, contexto y logout sin duplicar su composición

### Requirement: El dashboard debe mostrar el contexto actual

`/dashboard` SHALL mostrar LegacyLift, un saludo al usuario autenticado, el nombre de la organización activa y los roles disponibles en el contexto actual.

#### Scenario: Mostrar datos del usuario y tenant

- **GIVEN** que el contexto autenticado contiene usuario, organización activa y roles
- **WHEN** `/dashboard` se renderiza
- **THEN** se muestra `LegacyLift`
- **AND** se muestra el nombre del usuario autenticado
- **AND** se muestra el nombre de la organización activa
- **AND** se muestran los roles disponibles

#### Scenario: No adelantar funcionalidades fuera de alcance

- **GIVEN** que el usuario accede al dashboard inicial
- **WHEN** se renderiza el contenido
- **THEN** no se habilitan Projects, Legacy Systems, Organization Switcher ni otras páginas funcionales no definidas

### Requirement: El logout debe reutilizar Auth

El control de logout SHALL utilizar la operación de Auth existente y SHALL dirigir al usuario fuera del workspace después de cerrar la sesión.

#### Scenario: Logout exitoso

- **GIVEN** que el usuario está dentro del workspace
- **WHEN** activa logout y la operación termina correctamente
- **THEN** la sesión se cierra mediante Auth
- **AND** el usuario es redirigido a `/auth/login`

### Requirement: La interfaz debe ser responsive y accesible

El App Shell y el dashboard SHALL funcionar en mobile y desktop, conservar los landmarks semánticos y permitir navegación mediante teclado.

#### Scenario: Visualización en desktop

- **GIVEN** que el viewport corresponde a desktop
- **WHEN** se renderiza el workspace
- **THEN** header, contenido principal y contextos se presentan sin solapamientos ni pérdida de información

#### Scenario: Visualización en mobile

- **GIVEN** que el viewport corresponde a mobile
- **WHEN** se renderiza el workspace
- **THEN** el contenido se adapta al ancho disponible sin scroll horizontal accidental
- **AND** las acciones principales continúan siendo utilizables

#### Scenario: Navegación accesible

- **GIVEN** que el usuario navega usando teclado o tecnologías asistivas
- **WHEN** recorre el App Shell y sus controles
- **THEN** los elementos interactivos tienen nombre accesible
- **AND** el orden de foco es comprensible
- **AND** los estados de foco son visibles

### Requirement: El App Shell debe exponer navegacion de miembros segun permisos

El workspace SHALL incluir una entrada `Miembros` hacia `/settings/members` solo cuando el contexto Auth activo contenga `members.read`. La decision visual SHALL usar `activeMembership.permissions` y SHALL no inferir autorizacion desde nombres de roles.

#### Scenario: Usuario con members.read ve la entrada
- **GIVEN** un usuario autenticado con organizacion activa y permiso `members.read`
- **WHEN** se renderiza la navegacion desktop o mobile
- **THEN** aparece una entrada `Miembros` que navega a `/settings/members`

#### Scenario: Usuario sin members.read no ve la entrada
- **GIVEN** un usuario autenticado sin permiso `members.read`
- **WHEN** se renderiza la navegacion
- **THEN** no se muestra la entrada `Miembros`
- **AND** la ausencia visual no sustituye la autorizacion del backend

#### Scenario: Ruta de miembros activa
- **GIVEN** el usuario esta en `/settings/members`
- **WHEN** el App Shell se renderiza
- **THEN** la entrada `Miembros` se identifica como la ubicacion actual
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
- **THEN** puede acceder a `Miembros` desde la navegacion movil
- **AND** cerrar la navegacion devuelve el foco y acceso al contenido principal sin scroll horizontal accidental

#### Scenario: Sesion sin tenant activo
- **GIVEN** la sesion requiere seleccionar organizacion
- **WHEN** intenta abrir `/settings/members`
- **THEN** el workspace no muestra datos privados
- **AND** dirige al selector de organizacion existente
