## Context

La issue `Proyecto-Software-I/frontend#14` transforma `/dashboard` en la primera ruta del workspace autenticado. El frontend ya utiliza App Router, módulos por feature, un cliente API común en `src/lib/api` y primitivas de shadcn/ui en `src/components/ui`. La motivación y el alcance funcional están definidos en `proposal.md`; los contratos de comportamiento están en `specs/authenticated-workspace-shell/spec.md`.

La implementación se integrará con la feature Auth canónica ya disponible en la PR 13 (`feat/7-frontend-auth-flow`). Este cambio no implementa Auth, no crea un segundo provider de sesión o tenant y no modifica el backend.

## Goals / Non-Goals

**Goals:**

- Encapsular la protección del workspace en el layout autenticado de App Router.
- Preservar una única fuente de verdad para sesión, usuario y organización activa.
- Componer un App Shell reutilizable con contexto visible y logout.
- Mantener `/dashboard` simple, en español, responsive y accesible.
- Reutilizar adapters, tipos canónicos y componentes visuales existentes.
- Definir una integración visual para Google Material Symbols sin agregar una biblioteca de iconos no aprobada.

**Non-Goals:**

- Implementar o corregir el sistema Auth existente.
- Crear endpoints, rutas API del frontend o una estrategia BFF.
- Crear selector de organizaciones, persistencia de tenant o cache compleja.
- Implementar Projects, Legacy Systems, sidebar funcional, RBAC UI, billing o estadísticas reales.
- Introducir otra biblioteca de UI o duplicar tipos de Auth.

## Decisions

### Layout autenticado de App Router

El workspace se organizará mediante un layout de route group anidado dentro del grupo `(session)` ya existente, de modo que herede `AuthProvider` y `SessionBoundary`. La protección se ubicará en la composición del workspace, no en cada página individual, para que futuras rutas hereden las mismas reglas.

**Alternativas consideradas:** proteger únicamente `/dashboard` reduciría el alcance inicial, pero obligaría a repetir la protección al agregar cada ruta. Un middleware global protegería rutas que no pertenecen al workspace y mezclaría responsabilidades de navegación con la resolución del contexto Auth.

### Reutilización del contexto Auth

La sesión, el usuario, `activeOrganization`, `requiresOrganizationSelection`, roles, adapters y operación de logout serán consumidos desde `useAuth`, `AuthProvider`, `SessionBoundary` y `auth-api.ts` de `src/features/auth`. El workspace no mantendrá un estado paralelo de tenant ni reimplementará `me`, refresh o logout.

**Alternativas consideradas:** crear `WorkspaceAuthProvider` o `TenantProvider` aislaría el dashboard, pero produciría dos fuentes de verdad y permitiría datos obsoletos al cambiar de organización. Leer el tenant desde URL o storage contradice el límite de tenant definido por Auth.

### Server Components por defecto

El layout, la página y los componentes puramente visuales permanecerán como Server Components. Solo el control o subárbol que requiera eventos de navegador, estado de Auth interactivo o logout será Client Component, manteniendo el límite lo más pequeño posible.

**Alternativas consideradas:** convertir todo el layout en Client Component simplificaría el acceso a hooks, pero ampliaría el JavaScript del navegador y mezclaría obtención de datos con presentación. Convertir cada control en un Client Component separado aumentaría la complejidad sin un beneficio funcional claro.

### Acceso HTTP fuera de componentes visuales

Cuando la integración requiera obtener o restaurar la sesión, se utilizarán los adapters existentes de `src/features/auth/api/auth-api.ts` y `src/lib/api/api-client.ts`. Los componentes visuales recibirán datos y callbacks tipados, sin construir URLs ni interpretar respuestas HTTP directamente.

**Alternativas consideradas:** llamar `/api/auth/me` desde la página o desde cada componente duplicaría el acceso y podría generar estados inconsistentes. Crear otro cliente API no aporta capacidad y rompería la convención existente.

### UI y Material Symbols

La interfaz utilizará primero `Button`, `Card`, `Badge`, `Separator` y demás primitivas disponibles en `src/components/ui`, junto con tokens semánticos existentes. Los iconos del App Shell serán Google Material Symbols variables, cargados mediante un `<link>` en el `<head>` del layout raíz con `icon_names` y `display=block`, y usados con la familia `Material Symbols Outlined` y los ejes `FILL`, `wght`, `GRAD` y `opsz` configurados en CSS. El sidebar será visible en desktop y se desplegará como un `<aside>` móvil desde el botón hamburguesa; sus opciones futuras serán solo visuales y no habilitarán rutas inexistentes. No se utilizará `lucide-react` para los nuevos iconos ni se agregará una dependencia npm de iconos. La configuración y la convención de uso se documentarán en `AGENTS.md`.

### Estados de navegación

El estado de carga se renderizará antes de mostrar datos privados. Las decisiones de redirección se basarán exclusivamente en el estado de Auth: sesión ausente hacia login, sesión sin tenant hacia selección y sesión con tenant hacia el workspace. El logout reutilizará Auth y finalizará en `/auth/login`.

**Alternativas consideradas:** permitir que la página decida sus propias redirecciones produciría protección incompleta para futuras rutas. Usar un estado local inicial podría mostrar durante un instante datos de otro tenant.

## Risks / Trade-offs

- **[La base Auth de la PR 13 cambia antes de integrarse]** → Mantener el workspace sobre los contratos y exports existentes de `src/features/auth`; detenerse y actualizar el plan si la PR 13 modifica esos límites.
- **[Redirecciones ejecutadas desde el lado incorrecto]** → Mantener la resolución del acceso en el límite apropiado de App Router y aislar la interactividad de navegador en Client Components mínimos.
- **[Datos privados obsoletos durante bootstrap]** → No renderizar el contenido autenticado mientras Auth indique carga y no leer tenant desde storage o URL.
- **[Material Symbols introduce una integración externa]** → No incorporar paquetes nuevos; documentar la configuración elegida y revisar su impacto de carga, fallback y accesibilidad.
- **[El shell crece junto con futuras features]** → Mantenerlo limitado a header, contexto, contenido principal y logout; no incluir navegación funcional de páginas todavía inexistentes.

## Verification Strategy

- Revisar que los estados de Auth no permitan renderizar el shell sin organización activa y que el dashboard consuma únicamente `useAuth`.
- Ejecutar smoke checks de las rutas existentes en Next dev y validar TypeScript, ESLint y OpenSpec estricto.

## Migration Plan

No hay migración de datos, cambios de backend ni cambios de contrato. La implementación se desplegará junto con el frontend después de completar las tareas aprobadas.

Para rollback, revertir el cambio frontend y restaurar la composición previa de `/dashboard`; no se requieren acciones sobre PostgreSQL ni sobre servicios externos.
