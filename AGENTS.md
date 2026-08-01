<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Instrucciones para agentes de IA

## Contexto del repositorio

Este repositorio contiene el frontend de Proyecto-Software-I.

Tecnologías principales:

* Node.js 24 LTS.
* Next.js.
* React.
* TypeScript estricto.
* App Router.
* Tailwind CSS.
* npm.

El backend está en un repositorio separado:

* `Proyecto-Software-I/backend`

El nombre definitivo de la aplicación aún no ha sido establecido.

No inventes un nombre comercial, identidad visual definitiva o propósito de negocio que no esté descrito en una issue.

## Fuente de verdad

Antes de modificar código:

1. Lee la issue asignada.
2. Lee `.github/CONTRIBUTING.md`.
3. Revisa los componentes y patrones existentes.
4. Identifica los criterios de aceptación.
5. Comprueba la rama actual con `git branch --show-current`.
6. Comprueba los cambios existentes con `git status`.

La issue asignada define el alcance.

Cuando exista ambigüedad que afecte comportamiento, diseño, navegación, contratos del backend o datos, solicita una decisión antes de inventar una solución.

## Alcance obligatorio

Trabaja únicamente en la issue asignada.

No debes:

* Crear issues o tareas.
* Cambiar responsables, labels, prioridad o estado del Project.
* Ampliar el alcance de la tarea.
* Rediseñar áreas no relacionadas.
* Reemplazar componentes existentes sin necesidad.
* Aplicar un cambio visual global para resolver una pantalla local.
* Modificar directamente `main`.

Cada rama y Pull Request debe corresponder a una sola issue.

## Git

Formato de ramas:

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

Nunca ejecutes sin autorización explícita:

```text
git push origin main
git push --force
git reset --hard
git clean -fd
git rebase sobre una rama de otra persona
```

No elimines ni sobrescribas trabajo local que no hayas creado.

## Dependencias

No agregues, elimines ni actualices dependencias sin que la issue lo requiera.

Antes de agregar una dependencia:

1. Comprueba si Next.js, React, Tailwind o el código existente ya resuelven la necesidad.
2. Explica por qué es necesaria.
3. Evalúa su impacto en el bundle y mantenimiento.
4. Espera aprobación si es una dependencia de producción.

No cambies npm por otro administrador.

No edites manualmente `package-lock.json`.

No agregues una librería para resolver algo pequeño que puede implementarse claramente con las herramientas existentes.

## Next.js y React

Este proyecto utiliza App Router.

Utiliza Server Components por defecto.

Añade `"use client"` solamente cuando el componente necesite alguna de estas capacidades:

* Estado local.
* Efectos.
* Eventos del navegador.
* APIs exclusivas del navegador.
* Hooks que requieren un Client Component.

Mantén los Client Components lo más pequeños posible.

No conviertas una página completa en Client Component cuando solamente una parte necesita interactividad.

No utilices APIs del navegador durante renderizado del servidor.

No introduzcas Pages Router.

No crees rutas API dentro del frontend para duplicar endpoints que ya pertenecen al backend, salvo que la issue defina expresamente un patrón BFF o proxy.

## Componentes

Los componentes deben:

* Tener una responsabilidad clara.
* Utilizar nombres descriptivos.
* Recibir props tipadas.
* Evitar estados duplicados.
* Evitar efectos innecesarios.
* Mantener separada la obtención de datos cuando facilite las pruebas.
* Seguir los patrones existentes del repositorio.

No agregues abstracciones genéricas sin un uso real.

No crees componentes compartidos hasta que exista una necesidad clara de reutilización.

Evita archivos demasiado grandes. Extrae componentes cuando mejore claramente la lectura o reutilización.

## TypeScript

No introduzcas:

```typescript
any
// @ts-ignore
// @ts-nocheck
```

No desactives ESLint para ocultar problemas.

Una excepción debe:

* Tener alcance mínimo.
* Incluir una explicación.
* Ser mencionada en el Pull Request.

Valida datos externos antes de asumir su forma.

No realices conversiones mediante afirmaciones de tipo inseguras solamente para silenciar TypeScript.

## Comunicación con el backend

La dirección base del backend se obtiene mediante:

```text
NEXT_PUBLIC_API_URL
```

No escribas URLs del backend directamente en múltiples componentes.

No cambies unilateralmente:

* Endpoints.
* Métodos HTTP.
* Nombres de propiedades.
* Tipos.
* Códigos de respuesta.
* Formatos de error.
* Autenticación.
* Formato de fechas.
* Campos opcionales.

Los cambios de contrato deben estar definidos en la issue y coordinados con el backend.

Maneja explícitamente:

* Estado de carga.
* Respuesta exitosa.
* Respuesta vacía cuando corresponda.
* Errores HTTP.
* Fallos de red.
* Respuestas inesperadas.

No muestres mensajes técnicos internos al usuario final salvo que la issue lo solicite.

## Variables de entorno

Nunca agregues secretos a variables que comiencen con:

```text
NEXT_PUBLIC_
```

Las variables con ese prefijo pueden quedar expuestas al navegador.

No subas:

```text
.env
.env.local
.env.development.local
.env.production.local
```

Cuando agregues una variable necesaria para ejecutar el proyecto, actualiza también `.env.example` con un valor no sensible.

## Interfaz y estilos

Utiliza Tailwind CSS siguiendo el estilo existente.

No introduzcas otra biblioteca visual sin autorización.

No reemplaces la identidad visual completa por iniciativa propia.

Mientras no exista un diseño oficial:

* Mantén una interfaz simple.
* Utiliza jerarquía visual clara.
* Evita colores excesivos.
* Evita animaciones innecesarias.
* Mantén consistencia entre pantallas.
* Prioriza legibilidad y accesibilidad.

La interfaz debe funcionar razonablemente en pantallas móviles y de escritorio.

## Accesibilidad

Todo cambio de interfaz debe considerar:

* HTML semántico.
* Etiquetas asociadas a inputs.
* Navegación con teclado.
* Estados de foco visibles.
* Texto alternativo para imágenes relevantes.
* Botones reales para acciones.
* Enlaces reales para navegación.
* Mensajes de error comprensibles.
* Contraste suficiente.
* Estados `disabled` cuando corresponda.

No utilices un `div` con `onClick` cuando corresponde utilizar un `button`.

## Seguridad

Nunca escribas ni muestres:

* Contraseñas.
* Tokens.
* Secretos.
* Claves privadas.
* Credenciales.
* Contenido real de archivos de entorno.

No almacenes tokens sensibles en `localStorage` sin una decisión arquitectónica explícita.

No renderices HTML no confiable mediante `dangerouslySetInnerHTML`.

No desactives medidas de seguridad para hacer funcionar temporalmente una integración.

## Calidad del código

Realiza el cambio más pequeño que resuelva correctamente la issue.

Prefiere:

* Componentes sencillos.
* Estados previsibles.
* Tipos claros.
* Manejo explícito de errores.
* Código consistente.
* Buenas etiquetas y mensajes.
* Pruebas sobre comportamiento relevante.

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

No reformatees archivos no relacionados.

## Pruebas y validación

Antes de considerar terminada una tarea ejecuta:

```bash
npm run lint
npm run build
```

Si el proyecto tiene pruebas relacionadas con el cambio, ejecútalas también.

No afirmes que una validación pasó si no la ejecutaste.

Si no puedes ejecutar un comando:

1. Indica cuál no pudiste ejecutar.
2. Explica la causa.
3. No declares el cambio completamente verificado.

No elimines pruebas para conseguir que el pipeline pase.

Para cambios visuales, comprueba como mínimo:

* Vista de escritorio.
* Vista móvil.
* Estado de carga.
* Estado de error.
* Estado exitoso.
* Ausencia de errores en la consola.

## Archivos protegidos conceptualmente

No modifiques estos archivos salvo que la issue lo requiera:

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
```

Los cambios en estos archivos deben explicarse en el Pull Request.

No modifiques workflows de GitHub Actions para evitar una validación.

## Antes de editar

Presenta un plan breve con:

* Qué entendiste de la issue.
* Qué archivos esperas modificar.
* Qué comportamiento conservarás.
* Qué estados de interfaz deben manejarse.
* Qué validaciones ejecutarás.
* Qué dudas o suposiciones existen.

No empieces una reestructuración amplia sin justificarla.

## Antes de finalizar

Ejecuta:

```bash
git diff --check
git status
npm run lint
npm run build
```

Comprueba además que:

* Se cumplen los criterios de aceptación.
* No existen secretos.
* No hay código temporal.
* No hay errores en la consola.
* No hay cambios fuera del alcance.
* Los contratos del backend se mantienen.
* La interfaz funciona en móvil y escritorio.
* Los estados de carga y error están cubiertos.
* Las variables nuevas están documentadas.

## Pull Request

El Pull Request debe incluir:

* Resumen del cambio.
* Componentes o rutas modificadas.
* Cómo probarlo.
* Comandos realmente ejecutados.
* Resultados.
* Capturas para cambios visuales.
* Estados de carga y error probados.
* Riesgos o limitaciones.
* Issue relacionada mediante `Closes #NUMERO`.
* Issue del backend relacionada, cuando corresponda.
* Dependencias o variables nuevas.

No ocultes problemas pendientes.

No marques verificaciones que no hayas realizado.

## Uso de IA

El código producido con IA debe revisarse como una propuesta.

Antes de finalizar:

* Comprueba cada archivo modificado.
* Confirma que las APIs utilizadas existan.
* Comprueba las versiones del proyecto.
* Revisa los límites entre Server y Client Components.
* Confirma que los imports sean válidos.
* Elimina funciones, clases o props inventadas.
* Verifica accesibilidad y comportamiento responsive.
* Revisa errores y estados límite.
* Asegúrate de poder explicar la implementación.

No incluyas texto como “generado por IA” en el código.

El autor del Pull Request es responsable de entender y justificar el resultado, independientemente de la herramienta utilizada.
