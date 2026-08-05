<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Instrucciones para agentes de IA

## Contexto del repositorio

Este repositorio contiene el frontend de `Proyecto-Software-I`.

Tecnologías principales:

* Node.js 24 LTS.
* Next.js.
* React.
* TypeScript estricto.
* App Router.
* Tailwind CSS.
* shadcn/ui.
* Radix UI.
* Variables CSS y tokens semánticos.
* npm.

El backend se encuentra en un repositorio separado:

```text
Proyecto-Software-I/backend
```

El nombre definitivo, propósito de negocio e identidad visual de la aplicación todavía no han sido establecidos.

No inventes:

* Nombre comercial.
* Logotipo.
* Identidad visual definitiva.
* Navegación no solicitada.
* Funcionalidades de negocio.
* Contenido de producto que no esté definido en una issue.

## Documentación local de Next.js

Antes de utilizar una API, convención o estructura de Next.js:

1. Revisa la versión instalada en `package.json`.

2. Consulta la guía correspondiente en:

   ```text
   node_modules/next/dist/docs/
   ```

3. Respeta las advertencias de deprecación.

4. No asumas que una API recordada de otra versión sigue siendo válida.

La documentación local correspondiente a la versión instalada tiene prioridad sobre conocimiento previo del agente.

## Jerarquía de fuentes de verdad

Utiliza esta jerarquía:

1. La GitHub Issue define la asignación, el alcance y los criterios de aceptación.
2. Los artefactos OpenSpec definen requisitos detallados, escenarios, diseño y tareas aprobadas.
3. Este archivo define las reglas permanentes del repositorio.
4. `.github/CONTRIBUTING.md` define el flujo general de contribución.
5. La documentación local de Next.js define las APIs válidas para la versión instalada.
6. El código, componentes y pruebas existentes muestran los patrones vigentes.
7. El contrato publicado por el backend define la integración HTTP.

No inventes requisitos que no aparezcan en estas fuentes.

Cuando exista ambigüedad que afecte comportamiento, diseño, navegación, contratos, accesibilidad, seguridad o datos:

* No decidas por tu cuenta.
* Detén la implementación.
* Explica la ambigüedad.
* Solicita una decisión.

## Preparación obligatoria

Antes de modificar archivos:

1. Lee la issue asignada.

2. Lee los artefactos OpenSpec, cuando sean obligatorios.

3. Lee `.github/CONTRIBUTING.md`.

4. Revisa los componentes y patrones existentes.

5. Consulta la documentación local de Next.js relevante.

6. Identifica los criterios de aceptación.

7. Comprueba la rama actual:

   ```bash
   git branch --show-current
   ```

8. Comprueba los cambios existentes:

   ```bash
   git status
   ```

9. Presenta un plan breve que indique:

   * Qué entendiste de la issue.
   * Qué comportamiento debe cambiar.
   * Qué comportamiento debe conservarse.
   * Qué rutas, componentes o features esperas modificar.
   * Qué estados de interfaz deben manejarse.
   * Qué contratos del backend se utilizan.
   * Qué validaciones ejecutarás.
   * Qué dudas o suposiciones existen.

No empieces una reestructuración amplia sin justificarla y sin que forme parte del plan aprobado.

# Flujo obligatorio con OpenSpec

## Cuándo es obligatorio

OpenSpec es obligatorio para:

* Funcionalidades nuevas.
* Correcciones que cambien comportamiento observable.
* Cambios en contratos públicos.
* Cambios que afecten frontend y backend.
* Autenticación o autorización.
* Dependencias nuevas.
* Cambios de arquitectura.
* Refactorizaciones importantes.
* Cambios al sistema de diseño.
* Nuevos flujos de navegación.
* Formularios o interacciones relevantes.
* Cambios de accesibilidad con impacto funcional.
* Cambios expresamente marcados como OpenSpec en la issue.

OpenSpec puede omitirse únicamente cuando la issue lo indique expresamente, por ejemplo:

* Correcciones tipográficas.
* Cambios pequeños de documentación.
* Ajustes visuales locales sin cambio de comportamiento.
* Mantenimiento mecánico claramente acotado.

No decidas por tu cuenta que OpenSpec no es necesario.

## Convención de nombres

El cambio OpenSpec debe seguir:

```text
numero-issue-descripcion-corta
```

Ejemplo:

```text
22-add-login-form
```

La rama correspondiente debe conservar el mismo número y descripción:

```text
feat/22-add-login-form
```

## Etapa de planificación

Antes de implementar código:

1. Lee la issue.
2. Crea o utiliza la rama correspondiente.
3. Explora el código relacionado sin modificarlo cuando sea necesario.
4. Genera:

   * `proposal.md`.
   * Delta specs dentro de `specs/`.
   * `design.md`.
   * `tasks.md`.
5. Incluye la referencia completa a la issue.
6. Define claramente el alcance y lo que queda fuera.
7. Identifica las rutas, componentes y estados afectados.
8. Identifica dependencias con el backend.
9. Define comportamiento móvil, escritorio y accesibilidad cuando corresponda.
10. Valida el cambio en modo estricto.
11. Crea un commit que contenga únicamente la planificación.
12. Abre un Draft Pull Request.

El Draft Pull Request de planificación no debe contener:

* Código de aplicación.
* Componentes nuevos.
* Cambios visuales.
* Dependencias.
* Modificaciones en `package.json`.
* Cambios de configuración no necesarios para la propia planificación.

No implementes código hasta que el responsable publique un comentario que comience exactamente con:

```text
PLAN APPROVED
```

Preguntas, sugerencias, revisiones parciales o ausencia de objeciones no constituyen autorización.

## Revisión del plan

### `proposal.md`

Debe:

* Referenciar la issue.
* Explicar el objetivo.
* Definir el alcance.
* Definir qué queda fuera.
* Identificar rutas y funcionalidades afectadas.
* Identificar impacto en el backend.
* No inventar identidad visual ni requisitos.
* No contener implementación completa.

### Delta specs

Deben:

* Describir comportamiento visible para el usuario.
* Incluir escenarios de éxito.
* Incluir carga.
* Incluir estado vacío cuando corresponda.
* Incluir validaciones.
* Incluir errores.
* Incluir comportamiento móvil y escritorio cuando corresponda.
* Incluir expectativas de accesibilidad.
* Documentar dependencias del contrato del backend.

### `design.md`

Debe:

* Respetar App Router.
* Utilizar Server Components por defecto.
* Justificar cada Client Component.
* Mantener llamadas HTTP fuera de componentes puramente visuales.
* Reutilizar `src/components/ui`.
* Utilizar tokens semánticos.
* Justificar dependencias nuevas.
* No introducir otra biblioteca completa de interfaz.
* Identificar pruebas y verificaciones manuales.

### `tasks.md`

Debe:

* Contener tareas pequeñas y ordenadas.
* Separar acceso a datos, estado y presentación cuando corresponda.
* Incluir loading, error, vacío y éxito.
* Incluir accesibilidad.
* Incluir verificación responsive.
* Incluir lint y build.
* Incluir pruebas automatizadas cuando existan o sean necesarias.

## Implementación

Después de recibir `PLAN APPROVED`:

1. Implementa únicamente lo aprobado.
2. Sigue las tareas en orden.
3. Marca una tarea como completa solo después de verificarla.
4. Mantén OpenSpec sincronizado con la implementación.
5. No amplíes el alcance.
6. No agregues dependencias no aprobadas.
7. No cambies contratos no aprobados.
8. Reutiliza componentes existentes antes de crear otros.
9. Ejecuta validaciones enfocadas durante el desarrollo.
10. Ejecuta todas las verificaciones antes de finalizar.

## Cambios materiales durante la implementación

Detén la implementación y actualiza OpenSpec si se necesita cambiar:

* El alcance.
* Una ruta.
* Un contrato del backend.
* Una dependencia.
* La arquitectura aprobada.
* La separación Server/Client Components.
* La estrategia de estado.
* El sistema de diseño compartido.
* La navegación.
* La autenticación.
* La accesibilidad acordada.
* El comportamiento móvil o escritorio definido.

Después:

1. Actualiza los artefactos.
2. Valida nuevamente.
3. Sube la planificación modificada.
4. Solicita otra revisión.
5. Espera un nuevo `PLAN APPROVED`.

## Finalización y archivado

Antes de marcar el Pull Request como listo:

1. Confirma que todas las tareas estén terminadas.
2. Comprueba que las specs coincidan con la interfaz final.
3. Valida OpenSpec en modo estricto.
4. Ejecuta lint y build.
5. Ejecuta las pruebas aplicables.
6. Archiva el cambio mediante OpenSpec.
7. Confirma que `openspec/specs/` represente el comportamiento vigente.
8. Confirma que el cambio esté dentro de `openspec/changes/archive/`.
9. Ejecuta nuevamente las validaciones.
10. Actualiza la descripción del Pull Request.
11. Cambia el Draft Pull Request a `Ready for review`.

No archives cambios incompletos.

No elimines cambios archivados.

## Archivos OpenSpec

```text
openspec/specs/
```

Describe el comportamiento vigente del sistema.

```text
openspec/changes/
```

Contiene cambios activos y archivados.

No modifiques directamente una especificación principal para evitar crear un cambio OpenSpec.

No actualices automáticamente workflows, prompts o skills de OpenSpec sin una issue específica.

# Alcance obligatorio

Trabaja únicamente en la issue asignada.

No debes:

* Crear issues o tareas.
* Cambiar responsables.
* Cambiar labels.
* Cambiar prioridad.
* Cambiar el estado del Project.
* Ampliar el alcance.
* Rediseñar áreas no relacionadas.
* Reemplazar componentes existentes sin necesidad.
* Aplicar cambios visuales globales para resolver una necesidad local.
* Modificar directamente `main`.

Cada rama y Pull Request debe corresponder a una sola issue.

# Git

## Ramas

Formato:

```text
tipo/numero-issue-descripcion-corta
```

Ejemplos:

```text
feat/15-login-form
fix/22-mobile-navigation
test/31-health-page-tests
refactor/40-api-client
chore/45-update-eslint
```

## Operaciones prohibidas

Nunca ejecutes sin autorización explícita:

```text
git push origin main
git push --force
git reset --hard
git clean -fd
git rebase sobre una rama de otra persona
git checkout descartando cambios no confirmados
```

`git push --force-with-lease` solo puede utilizarse sobre la rama propia después de un rebase consciente.

No elimines ni sobrescribas trabajo local que no hayas creado.

# Dependencias

No agregues, elimines ni actualices dependencias salvo que la issue y el plan aprobado lo requieran.

Antes de agregar una dependencia:

1. Comprueba si Next.js, React, Tailwind, shadcn/ui o el código existente resuelven la necesidad.
2. Explica por qué es necesaria.
3. Evalúa su impacto en bundle, mantenimiento, seguridad y compatibilidad.
4. Identifica si es de producción o desarrollo.
5. Espera aprobación explícita cuando corresponda.

Este proyecto utiliza npm.

No cambies el administrador de paquetes.

No edites manualmente `package-lock.json`.

No agregues una biblioteca para resolver algo pequeño que pueda implementarse claramente con las herramientas existentes.

# Next.js y React

Este proyecto utiliza App Router.

Utiliza Server Components por defecto.

Añade:

```typescript
"use client";
```

únicamente cuando el componente necesite:

* Estado local.
* Efectos.
* Eventos del navegador.
* APIs exclusivas del navegador.
* Hooks que requieran Client Components.

Mantén los Client Components lo más pequeños posible.

No conviertas una página completa en Client Component cuando solo una parte necesite interactividad.

No utilices APIs del navegador durante el renderizado del servidor.

No introduzcas Pages Router.

No crees rutas API dentro del frontend para duplicar endpoints del backend, salvo que la issue y el plan aprobado definan expresamente un BFF o proxy.

Evita efectos innecesarios.

No almacenes como estado valores que puedan derivarse durante el renderizado.

# Arquitectura de componentes

Los componentes deben:

* Tener una responsabilidad clara.
* Utilizar nombres descriptivos.
* Recibir props tipadas.
* Evitar estados duplicados.
* Evitar efectos innecesarios.
* Mantener separada la obtención de datos cuando mejore claridad o pruebas.
* Seguir los patrones existentes.

Utiliza estas responsabilidades:

```text
src/app
```

Contiene páginas, layouts y composición de funcionalidades.

```text
src/features/*/components
```

Contiene componentes vinculados a una funcionalidad concreta.

```text
src/components/ui
```

Contiene primitivas visuales genéricas y reutilizables.

```text
src/features/*/api
```

Contiene acceso a endpoints de una funcionalidad.

```text
src/features/*/hooks
```

Contiene lógica de estado reutilizable vinculada a una funcionalidad.

No agregues abstracciones genéricas sin un uso real.

No crees componentes compartidos hasta que exista una necesidad clara de reutilización.

Extrae componentes cuando mejore claramente la lectura, las pruebas o la reutilización.

# TypeScript

No introduzcas:

```typescript
any
// @ts-ignore
// @ts-nocheck
```

No desactives ESLint para ocultar problemas.

No realices afirmaciones de tipo inseguras únicamente para silenciar TypeScript.

Valida datos externos antes de asumir su estructura.

Una excepción debe:

* Ser técnicamente necesaria.
* Tener alcance mínimo.
* Incluir una explicación.
* Estar contemplada por la issue o el plan.
* Ser mencionada en el Pull Request.

Prefiere tipos explícitos en:

* Props exportadas.
* Respuestas de API.
* Funciones exportadas.
* Configuración.
* Límites entre servidor y cliente.
* Datos externos.

# Comunicación con el backend

La dirección base del backend se obtiene mediante:

```text
NEXT_PUBLIC_API_URL
```

No escribas URLs del backend directamente en múltiples componentes.

No modifiques unilateralmente:

* Endpoints.
* Métodos HTTP.
* Nombres de propiedades.
* Tipos.
* Códigos de respuesta.
* Formatos de error.
* Autenticación.
* Formato de fechas.
* Campos opcionales u obligatorios.

Los cambios de contrato deben estar definidos en la issue y OpenSpec, y coordinados con el backend.

Maneja explícitamente:

* Estado inicial.
* Estado de carga.
* Respuesta exitosa.
* Respuesta vacía cuando corresponda.
* Errores HTTP.
* Fallos de red.
* Timeouts.
* Respuestas inesperadas.
* Reintentos cuando estén definidos.

No muestres mensajes técnicos internos al usuario final salvo que la issue lo solicite.

# Variables de entorno

Nunca agregues secretos a variables que comiencen con:

```text
NEXT_PUBLIC_
```

Estas variables pueden quedar expuestas en el navegador.

No confirmes:

```text
.env
.env.local
.env.development.local
.env.production.local
```

Cuando agregues una variable necesaria, actualiza `.env.example` con un valor no sensible.

# Sistema de diseño y shadcn/ui

Este proyecto utiliza:

* Tailwind CSS.
* shadcn/ui.
* Radix UI.
* Variables CSS.
* Tokens semánticos.
* Componentes compartidos en `src/components/ui`.

Configuración:

```text
components.json
```

Tokens globales:

```text
src/app/globals.css
```

Utilidad para combinar clases:

```text
src/lib/utils.ts
```

## Fuente de componentes

Antes de crear un elemento visual:

1. Revisa `src/components/ui`.
2. Reutiliza un componente existente.
3. Comprueba si shadcn/ui ofrece el componente necesario.
4. Revisa patrones existentes.
5. Agrega un componente nuevo únicamente si la issue y el plan lo requieren.

Agrega componentes mediante:

```bash
npx shadcn@latest add nombre-del-componente
```

No copies manualmente componentes desde sitios externos.

No utilices:

```bash
npx shadcn@latest add --all
```

No utilices `--overwrite` o `--force` sin autorización explícita.

## Componentes compartidos

Reutiliza los controles disponibles en:

```text
src/components/ui
```

Ejemplos:

* Botones: `Button`.
* Tarjetas: `Card`.
* Etiquetas de estado: `Badge`.
* Separaciones: `Separator`.
* Campos de texto: `Input`, cuando esté incorporado.
* Diálogos: `Dialog`, cuando esté incorporado.

No recrees controles básicos con HTML y listas extensas de clases cuando ya exista un equivalente compartido.

## Tokens semánticos

Utiliza tokens que describan una función visual:

```text
background
foreground
card
card-foreground
primary
primary-foreground
secondary
secondary-foreground
muted
muted-foreground
accent
accent-foreground
destructive
border
input
ring
```

Ejemplos permitidos:

```tsx
<div className="bg-background text-foreground" />

<Card className="border-border" />

<p className="text-muted-foreground" />

<Button variant="destructive">
  Eliminar
</Button>
```

No utilices directamente:

* Colores de Tailwind como `blue-*`, `red-*`, `green-*`, `slate-*` o `gray-*`.
* Colores hexadecimales.
* Valores RGB, HSL u OKLCH dentro de componentes.
* Clases como `bg-[#123456]`.
* Estilos inline para decisiones visuales.
* Sombras personalizadas locales.
* Radios arbitrarios.
* Espaciados arbitrarios salvo necesidad técnica explícita.

No nombres tokens según un color concreto.

Permitido:

```text
primary
destructive
muted
surface
```

No permitido:

```text
blue-button
red-error
gray-card
green-success-box
```

## Modificaciones de componentes compartidos

No modifiques `src/components/ui` para resolver una necesidad exclusiva de una pantalla.

Antes de modificar un componente compartido, comprueba:

1. Si la necesidad se resuelve mediante props.
2. Si puede utilizarse `className`.
3. Si corresponde crear un componente de feature que lo componga.
4. Si el cambio afectará otras pantallas.

Los cambios en componentes compartidos deben estar expresamente incluidos en la issue y el plan, y explicarse en el Pull Request.

## Bibliotecas visuales

No agregues otra biblioteca completa de interfaz sin autorización.

No mezcles shadcn/ui con:

* Material UI.
* Chakra UI.
* Mantine.
* Ant Design.
* Bootstrap.
* DaisyUI.
* Otra biblioteca equivalente.

## Estados de interfaz

Los componentes interactivos deben considerar, cuando corresponda:

* Estado normal.
* Hover.
* Foco.
* Disabled.
* Loading.
* Error.
* Vacío.
* Éxito.

No implementes únicamente el caso exitoso.

## Accesibilidad

Conserva las propiedades y estructuras accesibles proporcionadas por shadcn/ui y Radix UI.

No elimines:

* Roles ARIA necesarios.
* Etiquetas accesibles.
* Estados `disabled`.
* Manejo de foco.
* Navegación por teclado.
* Texto alternativo.
* Asociaciones entre labels e inputs.

No reemplaces un elemento semántico por un `div` interactivo.

# Seguridad

Nunca escribas, muestres ni confirmes:

* Contraseñas.
* Tokens.
* Secretos.
* Claves privadas.
* Credenciales.
* Contenido real de archivos de entorno.

No almacenes tokens sensibles en `localStorage` sin una decisión arquitectónica explícita y aprobada.

No renderices HTML no confiable mediante `dangerouslySetInnerHTML`.

No desactives medidas de seguridad, CORS, validaciones o controles del navegador para hacer funcionar temporalmente una integración.

# Calidad del código

Realiza el cambio más pequeño que resuelva correctamente la issue.

Prefiere:

* Componentes sencillos.
* Estados previsibles.
* Tipos claros.
* Manejo explícito de errores.
* Código consistente.
* Buenas etiquetas y mensajes.
* Pruebas sobre comportamiento relevante.
* Reutilización razonable.

Evita:

* Refactorizaciones masivas.
* Cambios visuales no solicitados.
* Código muerto.
* Logs de depuración.
* Componentes duplicados.
* Efectos innecesarios.
* Estados derivados almacenados.
* Comentarios que repiten el código.
* Soluciones excesivamente complejas.
* Reformateo de archivos no relacionados.

# Pruebas y validación

Antes de considerar terminada una tarea ejecuta:

```bash
npm run lint
npm run build
```

Cuando existan pruebas relacionadas con el cambio, ejecútalas también.

Cuando el repositorio tenga configurado `npm run check`, utilízalo como validación completa.

Para cambios OpenSpec, ejecuta también la validación estricta correspondiente.

No afirmes que una validación pasó si no la ejecutaste.

Si no puedes ejecutar un comando:

1. Indica cuál no pudiste ejecutar.
2. Explica la causa.
3. Describe qué parte queda sin verificar.
4. No declares el cambio completamente validado.

No elimines ni debilites pruebas para conseguir que el pipeline pase.

Para cambios visuales, comprueba como mínimo:

* Vista de escritorio.
* Vista móvil.
* Navegación mediante teclado.
* Estado de carga.
* Estado de error.
* Estado vacío cuando corresponda.
* Estado exitoso.
* Ausencia de errores de hidratación.
* Ausencia de errores en la consola.
* Ausencia de colores o estilos arbitrarios.

Para consultar la configuración de shadcn/ui:

```bash
npx shadcn@latest info
```

# Archivos protegidos conceptualmente

No modifiques estos archivos salvo que la issue y el plan aprobado lo requieran:

```text
.github/**
AGENTS.md
CLAUDE.md
CODEOWNERS
package.json
package-lock.json
next.config.ts
tsconfig.json
eslint.config.mjs
postcss.config.mjs
.env.example
components.json
src/app/globals.css
src/components/ui/**
src/lib/utils.ts
openspec/**
.claude/skills/openspec-*/**
.agents/skills/openspec-*/**
.github/prompts/opsx-*
.github/skills/openspec-*/**
```

La lista de carpetas generadas puede variar según los agentes configurados.

Los cambios en archivos protegidos deben explicarse expresamente en el Pull Request.

No modifiques GitHub Actions para evitar una validación fallida.

# Revisión antes de finalizar

Ejecuta:

```bash
git diff --check
git status
npm run lint
npm run build
```

Comprueba además que:

* Se cumplen los criterios de aceptación.
* El código coincide con el plan aprobado.
* Los artefactos OpenSpec están actualizados.
* No quedan tareas OpenSpec pendientes.
* No existen secretos.
* No hay código temporal.
* No hay logs de depuración.
* No hay errores en la consola.
* No hay cambios fuera del alcance.
* Los contratos del backend se mantienen o están documentados.
* La interfaz funciona en móvil y escritorio.
* Los estados de carga, error, vacío y éxito están cubiertos.
* Las variables nuevas están documentadas.
* Las dependencias nuevas fueron aprobadas.
* El cambio está archivado antes de pasar a revisión final.

# Pull Request

## Draft Pull Request de planificación

Debe incluir:

* Referencia a la issue.
* Nombre del cambio OpenSpec.
* `proposal.md`.
* Delta specs.
* `design.md`.
* `tasks.md`.
* Resultado de la validación OpenSpec.
* Confirmación de que todavía no contiene implementación.

No debe presentarse como listo para revisión final.

## Pull Request listo para revisión

Debe incluir:

* Resumen del cambio.
* Componentes, rutas o features modificados.
* Cómo probarlo.
* Comandos realmente ejecutados.
* Resultados.
* Capturas para cambios visuales.
* Estados de carga, error y éxito probados.
* Riesgos o limitaciones.
* Issue relacionada mediante `Closes #NUMERO`.
* Issue del backend relacionada cuando corresponda.
* Enlace al comentario `PLAN APPROVED`.
* Dependencias o variables nuevas.
* Cambios de contrato.
* Confirmación de que OpenSpec fue archivado.

No ocultes problemas pendientes.

No marques verificaciones que no hayas realizado.

# Uso de IA

El código y los documentos producidos con IA deben tratarse como propuestas.

Antes de finalizar:

* Comprueba cada archivo modificado.
* Confirma que las APIs utilizadas existan.
* Comprueba las versiones del proyecto.
* Consulta la documentación local de Next.js.
* Revisa los límites entre Server y Client Components.
* Confirma que los imports sean válidos.
* Elimina funciones, clases, props o dependencias inventadas.
* Verifica accesibilidad y comportamiento responsive.
* Revisa errores y estados límite.
* Comprueba que el código implemente exactamente el plan aprobado.
* Asegúrate de poder explicar la implementación.

No incluyas texto como “generado por IA” en el código.

El autor del Pull Request es responsable de entender y justificar el resultado, independientemente de la herramienta utilizada.
