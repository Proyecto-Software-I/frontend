## 1. Preparación e integración con Auth

- [ ] 1.1 Revisar la feature Auth canónica disponible en la rama base e identificar sus providers, hooks, adapters, tipos y operación de logout sin crear abstracciones equivalentes.
- [ ] 1.2 Confirmar el contrato consumido para restaurar la sesión mediante `GET /api/auth/me`, incluyendo usuario, `activeOrganization`, `requiresOrganizationSelection` y roles.
- [ ] 1.3 Confirmar la estructura App Router vigente y seleccionar el layout del workspace sin modificar rutas de Auth ni crear endpoints del frontend.

## 2. Protección del workspace

- [ ] 2.1 Crear la composición del layout autenticado para que las futuras rutas del workspace hereden la protección común.
- [ ] 2.2 Implementar el estado de bootstrap que evita renderizar información privada mientras Auth restaura la sesión.
- [ ] 2.3 Implementar las redirecciones a `/auth/login` y `/auth/select-organization` según el estado autenticado y la organización activa.
- [ ] 2.4 Manejar errores de restauración con un estado seguro que no exponga detalles técnicos ni datos de otro tenant.
- [ ] 2.5 Verificar que el tenant mostrado provenga únicamente del contexto Auth y no de URL, `localStorage`, `sessionStorage` ni valores hardcodeados.

## 3. App Shell y dashboard

- [ ] 3.1 Componer el App Shell con header, contenido principal, contexto de organización, contexto de usuario y control de logout reutilizando componentes shadcn/ui existentes.
- [ ] 3.2 Implementar el logout mediante la operación Auth existente y verificar la redirección a `/auth/login`.
- [ ] 3.3 Actualizar `/dashboard` para mostrar LegacyLift, saludo al usuario, organización activa y roles del contexto actual, sin habilitar funcionalidades fuera de alcance.
- [ ] 3.4 Mantener Server Components por defecto y aislar en Client Components únicamente los eventos o hooks que requiera Auth o logout.
- [ ] 3.5 Configurar Google Material Symbols sin agregar una biblioteca npm no aprobada y documentar su uso junto con la política de tipos canónicos y `src/features/*/types` en `AGENTS.md`.
- [ ] 3.6 Verificar la interfaz en mobile y desktop usando tokens semánticos, sin navegación funcional no solicitada ni estilos arbitrarios.

## 4. Pruebas y accesibilidad

- [ ] 4.1 Agregar o actualizar pruebas para bootstrap, usuario no autenticado, usuario sin organización activa y usuario autenticado con organización activa, utilizando la infraestructura disponible sin implementar la dependencia de testing.
- [ ] 4.2 Agregar pruebas del contenido visible del dashboard: usuario, organización y roles, incluyendo la ausencia de datos privados obsoletos.
- [ ] 4.3 Agregar pruebas del logout y su redirección, reutilizando los mocks o adapters canónicos de Auth.
- [ ] 4.4 Verificar landmarks semánticos, nombres accesibles, orden de foco, foco visible y uso mediante teclado.
- [ ] 4.5 Verificar estados de carga y error, ausencia de errores de hidratación y ausencia de errores en la consola.
- [ ] 4.6 Adjuntar capturas de las vistas desktop y mobile en el Pull Request de implementación, según la issue.

## 5. Validación final

- [ ] 5.1 Ejecutar `openspec validate 14-authenticated-workspace-shell --strict --no-interactive` y confirmar que las specs coinciden con la implementación.
- [ ] 5.2 Ejecutar `npm run lint`.
- [ ] 5.3 Ejecutar `npm run build`.
